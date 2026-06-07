import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  PowerStation,
  RealtimeData,
  HistoryData,
  WorkOrder,
  Battery,
  ChargeStrategy,
  PriceData,
  SellOrder,
  Transaction,
  MemberBenefit,
  GridApplication,
  Alarm,
  Prediction,
  MonthlyReport,
} from '../types';
import {
  mockUsers,
  mockStations,
  generateRealtimeData,
  generateHistoryData,
  mockWorkOrders,
  mockBattery,
  mockChargeStrategy,
  generatePriceData,
  mockSellOrders,
  mockTransactions,
  mockMemberBenefits,
  mockGridApplications,
  mockAlarms,
  generatePredictions,
  generateMonthlyReport,
} from '../services/mockData';

interface AppState {
  currentUser: User | null;
  users: User[];
  stations: PowerStation[];
  currentStation: PowerStation | null;
  realtimeData: Record<string, RealtimeData>;
  historyData: HistoryData[];
  workOrders: WorkOrder[];
  battery: Battery;
  chargeStrategy: ChargeStrategy;
  priceData: PriceData[];
  sellOrders: SellOrder[];
  transactions: Transaction[];
  memberBenefits: MemberBenefit[];
  gridApplications: GridApplication[];
  alarms: Alarm[];
  predictions: Prediction[];
  monthlyReport: MonthlyReport;
  isLoggedIn: boolean;
  
  login: (phone: string, password: string) => boolean;
  logout: () => void;
  setCurrentStation: (stationId: string) => void;
  updateRealtimeData: (stationId: string) => void;
  addWorkOrder: (order: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => void;
  updateWorkOrderStatus: (orderId: string, status: WorkOrder['status'], remark?: string) => void;
  addSellOrder: (order: Omit<SellOrder, 'id' | 'createdAt' | 'status' | 'total' | 'fee'>) => void;
  resolveAlarm: (alarmId: string) => void;
  updateChargeStrategy: (strategy: Partial<ChargeStrategy>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: mockUsers,
      stations: mockStations,
      currentStation: mockStations[0] || null,
      realtimeData: {},
      historyData: generateHistoryData(30),
      workOrders: mockWorkOrders,
      battery: mockBattery,
      chargeStrategy: mockChargeStrategy,
      priceData: generatePriceData(),
      sellOrders: mockSellOrders,
      transactions: mockTransactions,
      memberBenefits: mockMemberBenefits,
      gridApplications: mockGridApplications,
      alarms: mockAlarms,
      predictions: generatePredictions(),
      monthlyReport: generateMonthlyReport(),
      isLoggedIn: false,

      login: (phone: string, password: string) => {
        const user = get().users.find(u => u.phone === phone && u.password === password);
        if (user) {
          const userStations = get().stations.filter(s => s.userId === user.id);
          set({
            currentUser: user,
            currentStation: userStations[0] || null,
            isLoggedIn: true,
            historyData: generateHistoryData(30),
            predictions: generatePredictions(),
            priceData: generatePriceData(),
            monthlyReport: generateMonthlyReport(),
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          currentUser: null,
          isLoggedIn: false,
          currentStation: null,
        });
      },

      setCurrentStation: (stationId: string) => {
        const station = get().stations.find(s => s.id === stationId);
        if (station) {
          set({ currentStation: station });
        }
      },

      updateRealtimeData: (stationId: string) => {
        set(state => ({
          realtimeData: {
            ...state.realtimeData,
            [stationId]: generateRealtimeData(stationId),
          },
        }));
      },

      addWorkOrder: (order) => {
        const newOrder: WorkOrder = {
          ...order,
          id: `wo${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [
            {
              time: new Date().toISOString(),
              action: '工单创建',
              operator: get().currentUser?.name || '用户',
            },
          ],
        };
        set(state => ({
          workOrders: [newOrder, ...state.workOrders],
        }));
      },

      updateWorkOrderStatus: (orderId: string, status: WorkOrder['status'], remark?: string) => {
        set(state => ({
          workOrders: state.workOrders.map(order => {
            if (order.id === orderId) {
              const updatedOrder = {
                ...order,
                status,
                updatedAt: new Date().toISOString(),
                history: [
                  ...order.history,
                  {
                    time: new Date().toISOString(),
                    action: `状态更新为${status}`,
                    operator: get().currentUser?.name || '系统',
                    remark,
                  },
                ],
              };
              if (status === 'completed') {
                (updatedOrder as WorkOrder).completedAt = new Date().toISOString();
              }
              return updatedOrder;
            }
            return order;
          }),
        }));
      },

      addSellOrder: (order) => {
        const newOrder: SellOrder = {
          ...order,
          id: `so${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'pending',
          total: Math.round(order.amount * order.price * 100) / 100,
          fee: Math.round(order.amount * order.price * 0.02 * 100) / 100,
        };
        set(state => ({
          sellOrders: [newOrder, ...state.sellOrders],
        }));
      },

      resolveAlarm: (alarmId: string) => {
        set(state => ({
          alarms: state.alarms.map(alarm => {
            if (alarm.id === alarmId) {
              return {
                ...alarm,
                resolved: true,
                resolvedAt: new Date().toISOString(),
              };
            }
            return alarm;
          }),
        }));
      },

      updateChargeStrategy: (strategy: Partial<ChargeStrategy>) => {
        set(state => ({
          chargeStrategy: {
            ...state.chargeStrategy,
            ...strategy,
          },
        }));
      },
    }),
    {
      name: 'green-energy-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isLoggedIn: state.isLoggedIn,
        currentStation: state.currentStation,
      }),
    }
  )
);
