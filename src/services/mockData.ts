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

export const mockUsers: User[] = [
  {
    id: '1',
    name: '张明',
    phone: '13800138000',
    password: '123456',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangming',
    memberLevel: 'gold',
    totalGeneration: 52340,
    email: 'zhangming@example.com',
    address: '北京市朝阳区阳光花园1号楼',
  },
  {
    id: '2',
    name: '李工',
    phone: '13900139000',
    password: '123456',
    role: 'maintainer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ligong',
    memberLevel: 'silver',
    totalGeneration: 0,
    email: 'ligong@example.com',
  },
  {
    id: '3',
    name: '管理员',
    phone: 'admin',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    memberLevel: 'diamond',
    totalGeneration: 0,
    email: 'admin@greenenergy.com',
  },
];

export const mockStations: PowerStation[] = [
  {
    id: 's1',
    userId: '1',
    name: '家用光伏电站',
    type: 'solar',
    capacity: 10,
    location: '北京市朝阳区阳光花园1号楼楼顶',
    installDate: '2023-06-15',
    status: 'normal',
    inverterModel: '华为SUN2000-10KTL',
    panelCount: 30,
    description: '10kW屋顶分布式光伏系统，采用单晶高效组件',
  },
  {
    id: 's2',
    userId: '1',
    name: '小型风力发电站',
    type: 'wind',
    capacity: 5,
    location: '北京市怀柔区别墅庭院',
    installDate: '2024-03-20',
    status: 'warning',
    inverterModel: '阳光电源SG5KTL',
    panelCount: 0,
    description: '5kW小型风力发电机组',
  },
];

export function generateRealtimeData(stationId: string): RealtimeData {
  const now = new Date();
  const hour = now.getHours();
  const isDaytime = hour >= 6 && hour <= 18;
  const basePower = isDaytime ? Math.random() * 6 + 2 : Math.random() * 0.5;
  
  return {
    timestamp: now.toISOString(),
    power: Math.round(basePower * 100) / 100,
    dailyGeneration: Math.round((Math.random() * 30 + 20) * 100) / 100,
    totalGeneration: 52340 + Math.random() * 100,
    temperature: Math.round((Math.random() * 20 + 35) * 10) / 10,
    inverterStatus: '正常运行',
    voltage: Math.round((Math.random() * 20 + 220) * 10) / 10,
    current: Math.round((Math.random() * 10 + 15) * 10) / 10,
    efficiency: Math.round((Math.random() * 10 + 85) * 10) / 10,
  };
}

export function generateHistoryData(days: number = 30): HistoryData[] {
  const data: HistoryData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseGeneration = isWeekend ? 45 : 35;
    
    data.push({
      date: date.toISOString().split('T')[0],
      generation: Math.round((baseGeneration + Math.random() * 15) * 100) / 100,
      revenue: Math.round((baseGeneration + Math.random() * 15) * 0.58 * 100) / 100,
      carbonReduction: Math.round((baseGeneration + Math.random() * 15) * 0.785 * 100) / 100,
      peakHours: Math.round(Math.random() * 4 + 2),
    });
  }
  
  return data;
}

export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo1',
    stationId: 's1',
    stationName: '家用光伏电站',
    userId: '1',
    userName: '张明',
    type: 'maintenance',
    title: '季度常规巡检',
    description: '按照服务协议，进行每季度一次的常规巡检，包括组件清洁、连接检查、性能测试等。',
    status: 'processing',
    priority: 'medium',
    assignee: '2',
    assigneeName: '李工',
    createdAt: '2025-06-01T09:00:00Z',
    updatedAt: '2025-06-03T14:30:00Z',
    history: [
      { time: '2025-06-01T09:00:00Z', action: '工单创建', operator: '系统' },
      { time: '2025-06-01T09:05:00Z', action: '分配工单', operator: '系统', remark: '分配给最近的运维人员李工' },
      { time: '2025-06-03T14:30:00Z', action: '开始处理', operator: '李工', remark: '已到达现场，开始巡检工作' },
    ],
  },
  {
    id: 'wo2',
    stationId: 's2',
    stationName: '小型风力发电站',
    userId: '1',
    userName: '张明',
    type: 'alarm',
    title: '设备温度异常告警',
    description: '逆变器温度超过安全阈值（65°C），当前温度72°C，请及时处理。',
    status: 'assigned',
    priority: 'high',
    assignee: '2',
    assigneeName: '李工',
    createdAt: '2025-06-05T11:20:00Z',
    updatedAt: '2025-06-05T11:22:00Z',
    history: [
      { time: '2025-06-05T11:20:00Z', action: '自动告警', operator: '系统', remark: '温度传感器检测到异常' },
      { time: '2025-06-05T11:22:00Z', action: '生成工单', operator: '系统', remark: '自动分配给运维人员' },
    ],
  },
  {
    id: 'wo3',
    stationId: 's1',
    stationName: '家用光伏电站',
    userId: '1',
    userName: '张明',
    type: 'inspection',
    title: '并网验收检查',
    description: '并网申请已通过，需要现场检查设备符合并网标准。',
    status: 'completed',
    priority: 'high',
    assignee: '2',
    assigneeName: '李工',
    createdAt: '2025-05-10T08:00:00Z',
    updatedAt: '2025-05-12T16:00:00Z',
    completedAt: '2025-05-12T16:00:00Z',
    history: [
      { time: '2025-05-10T08:00:00Z', action: '工单创建', operator: '系统' },
      { time: '2025-05-10T08:10:00Z', action: '分配工单', operator: '系统' },
      { time: '2025-05-11T09:00:00Z', action: '开始处理', operator: '李工' },
      { time: '2025-05-12T16:00:00Z', action: '验收完成', operator: '李工', remark: '设备符合并网标准，同意并网' },
    ],
  },
];

export const mockBattery: Battery = {
  stationId: 's1',
  capacity: 20,
  currentCapacity: 14.5,
  soc: 72.5,
  health: 96,
  temperature: 28,
  status: 'idle',
  chargeRate: 0,
  dischargeRate: 0,
  cycleCount: 156,
};

export const mockChargeStrategy: ChargeStrategy = {
  stationId: 's1',
  mode: 'auto',
  targetSoc: 90,
  minSoc: 20,
};

export function generatePriceData(): PriceData[] {
  const data: PriceData[] = [];
  for (let i = 0; i < 24; i++) {
    let period: 'peak' | 'flat' | 'valley' = 'flat';
    let price = 0.58;
    
    if (i >= 8 && i < 11) {
      period = 'peak';
      price = 1.05;
    } else if (i >= 18 && i < 21) {
      period = 'peak';
      price = 1.05;
    } else if (i >= 23 || i < 6) {
      period = 'valley';
      price = 0.32;
    }
    
    data.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      price,
      period,
    });
  }
  return data;
}

export const mockSellOrders: SellOrder[] = [
  {
    id: 'so1',
    stationId: 's1',
    stationName: '家用光伏电站',
    userId: '1',
    amount: 100,
    price: 0.65,
    total: 65,
    status: 'completed',
    createdAt: '2025-06-02T10:30:00Z',
    matchedAt: '2025-06-02T10:35:00Z',
    completedAt: '2025-06-02T12:00:00Z',
    buyer: 'buyer1',
    buyerName: '绿电科技有限公司',
    fee: 1.3,
  },
  {
    id: 'so2',
    stationId: 's1',
    stationName: '家用光伏电站',
    userId: '1',
    amount: 150,
    price: 0.68,
    total: 102,
    status: 'matched',
    createdAt: '2025-06-04T09:15:00Z',
    matchedAt: '2025-06-04T09:20:00Z',
    buyer: 'buyer2',
    buyerName: '阳光社区物业公司',
    fee: 2.04,
  },
  {
    id: 'so3',
    stationId: 's1',
    stationName: '家用光伏电站',
    userId: '1',
    amount: 200,
    price: 0.62,
    total: 124,
    status: 'pending',
    createdAt: '2025-06-06T08:00:00Z',
    fee: 2.48,
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    orderId: 'so1',
    sellerId: '1',
    sellerName: '张明',
    buyerId: 'buyer1',
    buyerName: '绿电科技有限公司',
    amount: 100,
    price: 0.65,
    total: 65,
    fee: 1.3,
    status: 'completed',
    createdAt: '2025-06-02T12:00:00Z',
    completedAt: '2025-06-02T12:30:00Z',
  },
  {
    id: 't2',
    orderId: 'so2',
    sellerId: '1',
    sellerName: '张明',
    buyerId: 'buyer2',
    buyerName: '阳光社区物业公司',
    amount: 150,
    price: 0.68,
    total: 102,
    fee: 2.04,
    status: 'pending',
    createdAt: '2025-06-04T09:20:00Z',
  },
];

export const mockMemberBenefits: MemberBenefit[] = [
  { id: 'b1', level: 'silver', name: '基础维修服务', description: '免费基础维修，配件费用自理', icon: 'Wrench', value: '免费' },
  { id: 'b2', level: 'silver', name: '季度巡检', description: '每季度一次免费设备巡检', icon: 'ClipboardCheck', value: '4次/年' },
  { id: 'b3', level: 'silver', name: '发电收益加成', description: '基础发电收益加成', icon: 'TrendingUp', value: '+2%' },
  { id: 'b4', level: 'gold', name: '优先维修响应', description: '工单优先处理，4小时内响应', icon: 'Zap', value: '4小时' },
  { id: 'b5', level: 'gold', name: '免费配件', description: '每年200元以内配件免费', icon: 'Package', value: '￥200/年' },
  { id: 'b6', level: 'gold', name: '月度巡检', description: '每月一次免费设备巡检', icon: 'Calendar', value: '12次/年' },
  { id: 'b7', level: 'gold', name: '发电收益加成', description: '高级发电收益加成', icon: 'TrendingUp', value: '+5%' },
  { id: 'b8', level: 'diamond', name: 'VIP专属客服', description: '一对一专属客服经理服务', icon: 'Headphones', value: '专属' },
  { id: 'b9', level: 'diamond', name: '免费配件额度', description: '每年500元以内配件免费', icon: 'Gift', value: '￥500/年' },
  { id: 'b10', level: 'diamond', name: '双周巡检', description: '每两周一次深度设备巡检', icon: 'ShieldCheck', value: '26次/年' },
  { id: 'b11', level: 'diamond', name: '发电收益加成', description: '最高级发电收益加成', icon: 'Award', value: '+8%' },
  { id: 'b12', level: 'diamond', name: '交易手续费减免', description: '电力交易手续费50%减免', icon: 'CreditCard', value: '50%减免' },
];

export const mockGridApplications: GridApplication[] = [
  {
    id: 'ga1',
    userId: '1',
    stationId: 's1',
    stationName: '家用光伏电站',
    applicantName: '张明',
    applicantPhone: '13800138000',
    applicantIdCard: '110101199001011234',
    address: '北京市朝阳区阳光花园1号楼',
    stationCapacity: 10,
    stationType: 'solar',
    documents: ['身份证照片', '房产证明', '设备合格证明', '设计方案'],
    status: 'approved',
    createdAt: '2025-04-15T10:00:00Z',
    updatedAt: '2025-05-12T16:00:00Z',
    reviewRemark: '申请材料齐全，设备符合标准，同意并网',
    contractUrl: '#',
  },
];

export const mockAlarms: Alarm[] = [
  {
    id: 'a1',
    stationId: 's2',
    stationName: '小型风力发电站',
    type: 'temperature',
    level: 'error',
    message: '逆变器温度过高，当前温度72°C，超过安全阈值65°C',
    timestamp: '2025-06-05T11:20:00Z',
    resolved: false,
  },
  {
    id: 'a2',
    stationId: 's1',
    stationName: '家用光伏电站',
    type: 'efficiency',
    level: 'warning',
    message: '发电效率略低于预期，建议清洁光伏组件',
    timestamp: '2025-06-04T15:30:00Z',
    resolved: false,
  },
  {
    id: 'a3',
    stationId: 's1',
    stationName: '家用光伏电站',
    type: 'maintenance',
    level: 'info',
    message: '距离上次巡检已超过90天，建议安排巡检',
    timestamp: '2025-06-03T09:00:00Z',
    resolved: false,
  },
  {
    id: 'a4',
    stationId: 's1',
    stationName: '家用光伏电站',
    type: 'connection',
    level: 'error',
    message: '数据通信中断，已自动恢复',
    timestamp: '2025-06-02T08:15:00Z',
    resolved: true,
    resolvedAt: '2025-06-02T08:17:00Z',
  },
];

export function generatePredictions(): Prediction[] {
  const predictions: Prediction[] = [];
  const today = new Date();
  const weathers = ['晴', '多云', '阴', '小雨', '晴', '晴', '多云'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const weather = weathers[i];
    let baseGeneration = 40;
    let confidence = 85;
    
    if (weather === '晴') {
      baseGeneration = 45;
      confidence = 92;
    } else if (weather === '多云') {
      baseGeneration = 35;
      confidence = 80;
    } else if (weather === '阴') {
      baseGeneration = 25;
      confidence = 70;
    } else if (weather === '小雨') {
      baseGeneration = 15;
      confidence = 60;
    }
    
    predictions.push({
      date: date.toISOString().split('T')[0],
      predictedGeneration: Math.round((baseGeneration + Math.random() * 5) * 10) / 10,
      confidence,
      weather,
      temperature: Math.round(Math.random() * 10 + 25),
      suggestion: weather === '晴' ? '天气晴好，建议增加放电时间获取更高收益' : 
                  weather === '小雨' ? '预计有雨，建议减少放电，保留电池电量' : '天气平稳，按常规策略运行',
    });
  }
  
  return predictions;
}

export function generateMonthlyReport(): MonthlyReport {
  return {
    month: '2025-05',
    totalGeneration: 1256.8,
    totalRevenue: 729.34,
    maintenanceCost: 150,
    transactionFee: 12.68,
    deviceFailureRate: 1.2,
    memberSatisfaction: 4.8,
    stationStats: [
      {
        stationId: 's1',
        stationName: '家用光伏电站',
        generation: 856.8,
        revenue: 497.34,
        efficiency: 87.5,
      },
      {
        stationId: 's2',
        stationName: '小型风力发电站',
        generation: 400,
        revenue: 232,
        efficiency: 82.3,
      },
    ],
  };
}
