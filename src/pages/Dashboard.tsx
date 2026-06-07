import { useEffect, useState } from 'react';
import {
  Sun,
  Zap,
  DollarSign,
  Leaf,
  Thermometer,
  Activity,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowRight,
  Battery,
  Wind,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { useStore } from '../store/useStore';

export default function Dashboard() {
  const { currentUser, currentStation, historyData, workOrders, alarms, updateRealtimeData, realtimeData, battery, predictions } = useStore();
  const [currentPower, setCurrentPower] = useState(0);
  const [dailyGen, setDailyGen] = useState(0);

  useEffect(() => {
    if (currentStation) {
      updateRealtimeData(currentStation.id);
      const interval = setInterval(() => {
        updateRealtimeData(currentStation.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentStation, updateRealtimeData]);

  useEffect(() => {
    if (currentStation && realtimeData[currentStation.id]) {
      const data = realtimeData[currentStation.id];
      setCurrentPower(data.power);
      setDailyGen(data.dailyGeneration);
    }
  }, [currentStation, realtimeData]);

  const pendingOrders = workOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const activeAlarms = alarms.filter((a) => !a.resolved);
  const recentData = historyData.slice(-7);
  const todayPrediction = predictions[0];

  const quickActions = [
    { label: '查看监控', icon: Activity, path: '/monitor', color: 'green' },
    { label: '运维工单', icon: AlertTriangle, path: '/workorders', color: 'yellow' },
    { label: '储能管理', icon: Battery, path: '/energy-storage', color: 'blue' },
    { label: '电力交易', icon: Zap, path: '/trading', color: 'purple' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              您好，{currentUser?.name}！
            </h1>
            <p className="text-gray-500 mt-1">
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
              <p className="text-sm font-medium text-primary-700">
                {currentUser?.memberLevel === 'diamond' ? '💎 钻石会员' :
                 currentUser?.memberLevel === 'gold' ? '🥇 黄金会员' : '🥈 白银会员'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="实时功率"
            value={currentPower.toFixed(2)}
            unit="kW"
            icon={Zap}
            color="green"
            trend={{ value: 12.5, isUp: true }}
            description="当前发电功率"
          />
          <StatCard
            title="今日发电量"
            value={dailyGen.toFixed(1)}
            unit="kWh"
            icon={currentStation?.type === 'solar' ? Sun : Wind}
            color="blue"
            trend={{ value: 8.3, isUp: true }}
            description="较昨日同期"
          />
          <StatCard
            title="今日收益"
            value={(dailyGen * 0.58).toFixed(2)}
            unit="元"
            icon={DollarSign}
            color="yellow"
            trend={{ value: 5.2, isUp: true }}
            description="预计今日收益"
          />
          <StatCard
            title="累计减排"
            value={((currentUser?.totalGeneration || 0) * 0.785 / 1000).toFixed(1)}
            unit="吨CO₂"
            icon={Leaf}
            color="green"
            description={`相当于种树${Math.round((currentUser?.totalGeneration || 0) * 0.785 / 18)}棵`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">近7天发电趋势</h3>
              <Link to="/revenue" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                查看详情 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recentData}>
                  <defs>
                    <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)} kWh`, '发电量']}
                  />
                  <Area
                    type="monotone"
                    dataKey="generation"
                    stroke="#10B981"
                    strokeWidth={3}
                    fill="url(#colorGen)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">快捷操作</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.path}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-${action.color === 'green' ? 'emerald' : action.color === 'blue' ? 'blue' : action.color === 'yellow' ? 'amber' : 'violet'}-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-5 h-5 text-${action.color === 'green' ? 'emerald' : action.color === 'blue' ? 'blue' : action.color === 'yellow' ? 'amber' : 'violet'}-600`} />
                  </div>
                  <p className="font-medium text-gray-700 text-sm">{action.label}</p>
                </Link>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">发电预测</p>
                  <p className="text-xs text-gray-500 mt-1">
                    明日预计发电 <span className="font-semibold text-primary-600">{todayPrediction?.predictedGeneration} kWh</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    天气：{todayPrediction?.weather}，{todayPrediction?.temperature}°C
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">设备状态</h3>
              <span className="flex items-center gap-1 text-sm text-emerald-600">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                运行正常
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 text-sm">设备温度</p>
                    <p className="text-xs text-gray-500">逆变器温度</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {realtimeData[currentStation?.id || '']?.temperature.toFixed(1) || 42.5}°C
                </p>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 text-sm">逆变器状态</p>
                    <p className="text-xs text-gray-500">MPPT跟踪效率</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-emerald-600">正常运行</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                    <Battery className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 text-sm">蓄电池SOC</p>
                    <p className="text-xs text-gray-500">当前电量</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-800">{battery.soc}%</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">最新告警</h3>
              <Link to="/monitor" className="text-sm text-primary-600 hover:text-primary-700">
                查看全部
              </Link>
            </div>
            <div className="space-y-3">
              {activeAlarms.slice(0, 3).map((alarm) => (
                <div
                  key={alarm.id}
                  className={`p-3 rounded-xl border ${
                    alarm.level === 'error'
                      ? 'bg-red-50 border-red-100'
                      : alarm.level === 'warning'
                      ? 'bg-amber-50 border-amber-100'
                      : 'bg-blue-50 border-blue-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`w-5 h-5 mt-0.5 ${
                        alarm.level === 'error'
                          ? 'text-red-500'
                          : alarm.level === 'warning'
                          ? 'text-amber-500'
                          : 'text-blue-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">{alarm.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(alarm.timestamp).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {activeAlarms.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p>暂无告警，设备运行正常</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">待处理工单</h3>
            <Link to="/workorders" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">工单号</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">标题</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">电站</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">优先级</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.slice(0, 3).map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-mono text-gray-600">{order.id}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">{order.title}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{order.stationName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.priority === 'urgent'
                            ? 'bg-red-100 text-red-700'
                            : order.priority === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : order.priority === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {order.priority === 'urgent' ? '紧急' : order.priority === 'high' ? '高' : order.priority === 'medium' ? '中' : '低'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'pending'
                            ? 'bg-gray-100 text-gray-700'
                            : order.status === 'assigned'
                            ? 'bg-blue-100 text-blue-700'
                            : order.status === 'processing'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {order.status === 'pending' ? '待分配' : order.status === 'assigned' ? '已分配' : order.status === 'processing' ? '处理中' : '已完成'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
