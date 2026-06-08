/**
 * local server entry file, for local development
 */
import { createServer } from 'http';
import app from './app.js';
import { initWebSocket, startRealtimeDataPush } from './services/websocket.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3002;

const server = createServer(app);

initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
  console.log(`WebSocket: ws://localhost:${PORT}/api/stations/{stationId}/realtime?token={jwt}`);
  startRealtimeDataPush();
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;