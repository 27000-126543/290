export type UserRole = 'user' | 'maintainer' | 'admin';
export type MemberLevel = 'silver' | 'gold' | 'diamond';
export type StationType = 'solar' | 'wind';
export type StationStatus = 'normal' | 'warning' | 'error';
export type WorkOrderType = 'alarm' | 'maintenance' | 'inspection';
export type WorkOrderStatus = 'pending' | 'assigned' | 'processing' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type BatteryStatus = 'charging' | 'discharging' | 'idle';
export type PricePeriod = 'peak' | 'flat' | 'valley';
export type SellOrderStatus = 'pending' | 'matched' | 'completed' | 'cancelled';
export type TransactionStatus = 'pending' | 'completed';
export type GridApplicationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string;
  role: UserRole;
  avatar: string;
  memberLevel: MemberLevel;
  totalGeneration: number;
  email?: string;
  address?: string;
}

export interface PowerStation {
  id: string;
  userId: string;
  name: string;
  type: StationType;
  capacity: number;
  location: string;
  installDate: string;
  status: StationStatus;
  inverterModel?: string;
  panelCount?: number;
  description?: string;
}

export interface RealtimeData {
  timestamp: string;
  power: number;
  dailyGeneration: number;
  totalGeneration: number;
  temperature: number;
  inverterStatus: string;
  voltage: number;
  current: number;
  efficiency: number;
}

export interface HistoryData {
  date: string;
  generation: number;
  revenue: number;
  carbonReduction: number;
  peakHours: number;
}

export interface OrderHistoryItem {
  time: string;
  action: string;
  operator: string;
  remark?: string;
}

export interface WorkOrder {
  id: string;
  stationId: string;
  stationName: string;
  userId: string;
  userName: string;
  type: WorkOrderType;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: Priority;
  assignee?: string;
  assigneeName?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  history: OrderHistoryItem[];
  images?: string[];
}

export interface Battery {
  stationId: string;
  capacity: number;
  currentCapacity: number;
  soc: number;
  health: number;
  temperature: number;
  status: BatteryStatus;
  chargeRate: number;
  dischargeRate: number;
  cycleCount: number;
}

export interface ChargeStrategy {
  stationId: string;
  mode: 'auto' | 'manual';
  chargeStartTime?: string;
  chargeEndTime?: string;
  dischargeStartTime?: string;
  dischargeEndTime?: string;
  targetSoc?: number;
  minSoc?: number;
}

export interface PriceData {
  time: string;
  price: number;
  period: PricePeriod;
}

export interface SellOrder {
  id: string;
  stationId: string;
  stationName: string;
  userId: string;
  amount: number;
  price: number;
  total: number;
  status: SellOrderStatus;
  createdAt: string;
  matchedAt?: string;
  completedAt?: string;
  buyer?: string;
  buyerName?: string;
  fee?: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  price: number;
  total: number;
  fee: number;
  status: TransactionStatus;
  createdAt: string;
  completedAt?: string;
}

export interface MemberBenefit {
  id: string;
  level: MemberLevel;
  name: string;
  description: string;
  icon: string;
  value?: string;
}

export interface GridApplication {
  id: string;
  userId: string;
  stationId: string;
  stationName: string;
  applicantName: string;
  applicantPhone: string;
  applicantIdCard: string;
  address: string;
  stationCapacity: number;
  stationType: StationType;
  documents: string[];
  status: GridApplicationStatus;
  createdAt: string;
  updatedAt: string;
  reviewRemark?: string;
  contractUrl?: string;
}

export interface Alarm {
  id: string;
  stationId: string;
  stationName: string;
  type: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface Prediction {
  date: string;
  predictedGeneration: number;
  confidence: number;
  weather: string;
  temperature: number;
  suggestion: string;
}

export interface MonthlyReport {
  month: string;
  totalGeneration: number;
  totalRevenue: number;
  maintenanceCost: number;
  transactionFee: number;
  deviceFailureRate: number;
  memberSatisfaction: number;
  stationStats: {
    stationId: string;
    stationName: string;
    generation: number;
    revenue: number;
    efficiency: number;
  }[];
}
