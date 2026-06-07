import { useState } from 'react';
import {
  LayoutDashboard,
  Zap,
  Activity,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  FileText,
  Settings,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { useStore } from '../store/useStore';

export default function Admin() {
  const { stations, workOrders, monthlyReport, predictions } = useStore();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  const [showExportModal, setShowExportModal] = useState(false);

  const regions = [
    { id: 'all', name: '全部区域' },
    { id: 'beijing', name: '北京市' },
    { id: 'shanghai', name: '上海市' },
    { id: 'guangdong', name: '广东省' },
    { id: 'jiangsu', name: '江苏省' },
  ];

  const overviewStats = [
    { title: '总发电量', value: '12,568', unit: 'kWh', icon: Zap, color: 'green', trend: '+12.5%', trendDirection: 'up' },
    { title: '设备健康度', value: '94.2', unit: '%', icon: Activity, color: 'blue', trend: '+2.1%', trendDirection: 'up' },
    { title: '待处理工单', value: '23', unit: '个', icon: Clock, color: 'yellow', trend: '-5', trendDirection: 'down' },
    { title: '交易总额', value: '¥85,420', unit: '', icon: DollarSign, color: 'purple', trend: '+18.3%', trendDirection: 'up' },
    { title: '活跃用户', value: '1,256', unit: '人', icon: Users, color: 'blue', trend: '+8.7%', trendDirection: 'up' },
    { title: '会员活跃度', value: '89.6', unit: '%', icon: TrendingUp, color: 'green', trend: '+3.2%', trendDirection: 'up' },
  ];

  const generationByRegion = [
    { region: '北京市', generation: 4520, stations: 156, users: 320 },
    { region: '上海市', generation: 3890, stations: 128, users: 256 },
    { region: '广东省', generation: 5230, stations: 189, users: 412 },
    { region: '江苏省', generation: 3650, stations: 112, users: 218 },
    { region: '浙江省', generation: 3120, stations: 98, users: 186 },
  ];

  const stationEfficiencyData = stations.map((s, index) => ({
    name: s.name,
    efficiency: 82 + index * 3,
    health: 88 + index * 2,
    generation: 300 + index * 50,
  }));

  const workOrderTrend = [
    { month: '1月', 新增: 45, 完成: 42, 待处理: 8 },
    { month: '2月', 新增: 38, 完成: 40, 待处理: 6 },
    { month: '3月', 新增: 52, 完成: 48, 待处理: 10 },
    { month: '4月', 新增: 61, 完成: 58, 待处理: 13 },
    { month: '5月', 新增: 55, 完成: 56, 待处理: 12 },
    { month: '6月', 新增: 48, 完成: 45, 待处理: 15 },
  ];

  const memberDistribution = [
    { name: '银卡会员', value: 680, color: '#9CA3AF' },
    { name: '金卡会员', value: 420, color: '#F59E0B' },
    { name: '钻石会员', value: 156, color: '#3B82F6' },
  ];

  const healthRadarData = [
    { subject: '发电效率', A: 85, fullMark: 100 },
    { subject: '设备健康', A: 92, fullMark: 100 },
    { subject: '通信稳定', A: 88, fullMark: 100 },
    { subject: '安全性能', A: 95, fullMark: 100 },
    { subject: '环境适应', A: 80, fullMark: 100 },
    { subject: '运维响应', A: 90, fullMark: 100 },
  ];

  const recentAlarms = [
    { id: 1, station: '阳光家园光伏', level: 'error', message: '逆变器温度过高', time: '10分钟前', region: '北京市' },
    { id: 2, station: '绿城小区风电', level: 'warning', message: '发电效率低于预期', time: '25分钟前', region: '上海市' },
    { id: 3, station: '幸福村光伏阵列', level: 'warning', message: '通信信号不稳定', time: '1小时前', region: '广东省' },
    { id: 4, station: '科技园分布式光伏', level: 'info', message: '即将到达巡检周期', time: '2小时前', region: '江苏省' },
  ];

  const handleExportReport = () => {
    setShowExportModal(false);
    alert('月度运营报表已生成，包含：各电站发电收入、运维成本、交易手续费、设备故障率和会员满意度');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">管理员看板</h1>
            <p className="text-gray-500 mt-1">实时监控平台运营数据，管理电站和用户</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent outline-none text-sm text-gray-700"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent outline-none text-sm text-gray-700"
              >
                <option value="day">今日</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
                <option value="year">本年</option>
              </select>
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              导出报表
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {overviewStats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={`${stat.value}${stat.unit}`}
              icon={stat.icon}
              color={stat.color as any}
              trend={stat.trend}
              trendDirection={stat.trendDirection as any}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">发电量趋势</h3>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { date: '6/1', 光伏发电: 3200, 风力发电: 1200, 总发电量: 4400 },
                    { date: '6/2', 光伏发电: 3500, 风力发电: 1100, 总发电量: 4600 },
                    { date: '6/3', 光伏发电: 2800, 风力发电: 1500, 总发电量: 4300 },
                    { date: '6/4', 光伏发电: 3800, 风力发电: 1300, 总发电量: 5100 },
                    { date: '6/5', 光伏发电: 4200, 风力发电: 1400, 总发电量: 5600 },
                    { date: '6/6', 光伏发电: 3900, 风力发电: 1600, 总发电量: 5500 },
                    { date: '6/7', 光伏发电: 4500, 风力发电: 1200, 总发电量: 5700 },
                  ]}
                >
                  <defs>
                    <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="光伏发电" stroke="#10B981" strokeWidth={2} fill="url(#solarGradient)" />
                  <Area type="monotone" dataKey="风力发电" stroke="#3B82F6" strokeWidth={2} fill="url(#windGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">会员等级分布</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={memberDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {memberDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {memberDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-800">{item.value}人</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">设备健康度雷达图</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={healthRadarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Radar
                    name="健康指标"
                    dataKey="A"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">工单处理趋势</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workOrderTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="新增" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="完成" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="待处理" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">最新告警</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                查看全部
              </button>
            </div>
            <div className="space-y-4">
              {recentAlarms.map((alarm) => (
                <div key={alarm.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    alarm.level === 'error' ? 'bg-red-100' :
                    alarm.level === 'warning' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    <AlertTriangle className={`w-4 h-4 ${
                      alarm.level === 'error' ? 'text-red-600' :
                      alarm.level === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 truncate">{alarm.station}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">{alarm.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{alarm.message}</p>
                    <span className="text-xs text-gray-400">{alarm.region}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">各区域发电统计</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">区域</th>
                  <th className="pb-3 font-medium">电站数量</th>
                  <th className="pb-3 font-medium">用户数</th>
                  <th className="pb-3 font-medium">总发电量(kWh)</th>
                  <th className="pb-3 font-medium">平均效率</th>
                  <th className="pb-3 font-medium">设备故障率</th>
                  <th className="pb-3 font-medium">交易收入(元)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {generationByRegion.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium text-gray-800">{item.region}</td>
                    <td className="py-4 text-gray-600">{item.stations}</td>
                    <td className="py-4 text-gray-600">{item.users}</td>
                    <td className="py-4 text-primary-600 font-medium">{item.generation.toLocaleString()}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${82 + index * 2}%` }} />
                        </div>
                        <span className="text-sm text-gray-600">{82 + index * 2}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        index < 2 ? 'bg-green-100 text-green-700' :
                        index < 4 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {(0.8 + index * 0.3).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 text-gray-800 font-medium">¥{(item.generation * 0.58).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">发电预测与策略建议</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {predictions.slice(0, 7).map((pred, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
                <div className="text-sm text-gray-500">
                  {new Date(pred.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-3xl my-3">
                  {pred.weather === '晴' ? '☀️' : pred.weather === '多云' ? '⛅' : pred.weather === '阴' ? '☁️' : '🌧️'}
                </div>
                <div className="font-medium text-gray-800">{pred.weather}</div>
                <div className="text-sm text-gray-500 mt-1">{pred.temperature}°C</div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-lg font-bold text-primary-600">{pred.predictedGeneration}</div>
                  <div className="text-xs text-gray-500">kWh</div>
                </div>
                <div className="mt-2">
                  <span className="text-xs text-gray-400">置信度 {pred.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-primary-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Settings className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">系统策略建议</h4>
                <p className="text-sm text-gray-600 mt-1">
                  未来一周天气整体晴好，建议：1) 增加储能放电比例，尤其是电价高峰时段；
                  2) 安排下周二进行设备巡检，避开阴雨天气；
                  3) 可适当增加电力挂售量，预计市场需求旺盛。
                </p>
              </div>
            </div>
          </div>
        </div>

        {showExportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">导出运营报表</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <FileText className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择月份</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all">
                    <option>2025年6月</option>
                    <option>2025年5月</option>
                    <option>2025年4月</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">报表内容</label>
                  <div className="space-y-2">
                    {[
                      { label: '各电站发电收入', checked: true },
                      { label: '运维成本统计', checked: true },
                      { label: '交易手续费明细', checked: true },
                      { label: '设备故障率分析', checked: true },
                      { label: '会员满意度调查', checked: true },
                    ].map((item, index) => (
                      <label key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <input type="checkbox" defaultChecked={item.checked} className="w-5 h-5 text-primary-600 rounded" />
                        <span className="text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleExportReport}
                    className="btn-primary flex-1"
                  >
                    确认导出
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
