import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HttpServer } from 'http';
import db from '../db/index.js';
import { verifyToken } from '../utils/jwt.js';

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  role: string;
  stationIds: string[];
  userStationIds: string[];
}

const clients = new Map<string, ConnectedClient>();
let wss: WebSocketServer | null = null;

const STATION_REALTIME_RE = /^\/api\/stations\/([^/]+)\/realtime$/;

export function initWebSocket(server: HttpServer): void {
  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url?.split('?')[0] || '';

    const match = pathname.match(STATION_REALTIME_RE);
    if (match) {
      const stationId = match[1];
      const url = new URL(request.url || '', 'http://localhost');
      const token = url.searchParams.get('token');

      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      const userStations: any[] = decoded.role === 'admin'
        ? db.prepare('SELECT id FROM power_stations').all()
        : db.prepare('SELECT id FROM power_stations WHERE user_id = ?').all(decoded.id);
      const userStationIds = userStations.map((s: any) => s.id);

      if (decoded.role !== 'admin' && !userStationIds.includes(stationId)) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
      }

      wss!.handleUpgrade(request, socket, head, (ws) => {
        const clientId = decoded.id + '_' + stationId + '_' + Date.now();
        clients.set(clientId, {
          ws,
          userId: decoded.id,
          role: decoded.role,
          stationIds: [stationId],
          userStationIds,
        });

        console.log(`WS connected: ${clientId}, role: ${decoded.role}, station: ${stationId}`);

        ws.send(JSON.stringify({
          type: 'connected',
          stationId,
          message: `Subscribed to station ${stationId}`,
        }));

        wss!.emit('connection', ws, request, clientId);
      });
      return;
    }

    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
  });

  wss.on('connection', (ws: WebSocket, _req: any, clientId: string) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        const client = clients.get(clientId);
        if (!client) return;

        if (data.type === 'subscribe_station') {
          const sid = data.stationId;
          if (!sid) return;
          const allowed = client.role === 'admin' || client.userStationIds.includes(sid);
          if (!allowed) {
            ws.send(JSON.stringify({ type: 'error', message: `No permission for station ${sid}` }));
            return;
          }
          if (!client.stationIds.includes(sid)) {
            client.stationIds.push(sid);
          }
          ws.send(JSON.stringify({ type: 'subscribed', stationId: sid }));
        }

        if (data.type === 'unsubscribe_station') {
          client.stationIds = client.stationIds.filter((s) => s !== data.stationId);
          ws.send(JSON.stringify({ type: 'unsubscribed', stationId: data.stationId }));
        }
      } catch (e) {
        console.error('Error parsing WS message:', e);
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
    });

    ws.on('error', (error) => {
      console.error('WS error:', error);
    });
  });

  console.log('WebSocket server initialized on /api/stations/:id/realtime');
}

export function broadcastRealtimeData(stationId: string, data: any): void {
  if (!wss) return;

  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      if (client.stationIds.includes(stationId)) {
        client.ws.send(JSON.stringify({
          type: 'realtime_data',
          stationId,
          data,
          timestamp: new Date().toISOString(),
        }));
      }
    }
  });
}

export function broadcastNotification(userId: string, notification: any): void {
  if (!wss) return;

  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN && client.userId === userId) {
      client.ws.send(JSON.stringify({
        type: 'notification',
        notification,
        timestamp: new Date().toISOString(),
      }));
    }
  });
}

export function broadcastToRole(role: string, message: any): void {
  if (!wss) return;

  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN && client.role === role) {
      client.ws.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
      }));
    }
  });
}

export function startRealtimeDataPush(): void {
  setInterval(() => {
    const stations: any[] = db.prepare('SELECT * FROM power_stations').all();

    stations.forEach((station) => {
      const power = station.type === 'photovoltaic'
        ? 2 + Math.random() * 5
        : 1 + Math.random() * 3;

      const data = {
        power: Math.round(power * 100) / 100,
        dailyGeneration: Math.round((20 + Math.random() * 20) * 100) / 100,
        totalGeneration: Math.round((5000 + Math.random() * 2000) * 100) / 100,
        temperature: Math.round((30 + Math.random() * 20) * 10) / 10,
        inverterStatus: '正常运行',
        voltage: Math.round((215 + Math.random() * 10) * 10) / 10,
        current: Math.round((power / 220) * 1000 * 10) / 10,
        efficiency: Math.round((80 + Math.random() * 15) * 10) / 10,
      };

      broadcastRealtimeData(station.id, data);
    });
  }, 5000);
}

export default {
  initWebSocket,
  broadcastRealtimeData,
  broadcastNotification,
  broadcastToRole,
  startRealtimeDataPush,
};
