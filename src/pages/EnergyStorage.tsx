import { useState } from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryFull,
  Thermometer,
  Activity,
  Clock,
  Zap,
  Sun,
  Moon,
  Settings,
  RefreshCw,
  TrendingUp,
  Info,
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
  Cell,
  Legend,
} from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { useStore } from '../store/useStore';
import type { ChargeStrategy } from '../types';

export default function EnergyStorage() {
  const { battery, chargeStrategy, priceData, updateChargeStrategy } = useStore();
  const [activeTab, setActiveTab] = useState<'status' | 'strategy' | 'schedule'>('status');
  const [editingStrategy, setEditingStrategy] = useState(false);
  const [strategyForm, setStrategyForm] = useState<Partial<ChargeStrategy>>(chargeStrategy);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'charging': return 'text-blue-500';
      case 'discharging': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'charging': return '充电中';
      case 'discharging': return '放电中';
      default: return '待机';
    }
  };

  const getPeriodColor = (period: string) => {
    switch (period) {
      case 'peak': return '#EF4444';
      case 'valley': return '#10B981';
      default: return '#F59E0B';
    }
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'peak': return '峰时';
      case 'valley': return '谷时';
      default: return '平时';
    }
  };

  const handleSaveStrategy = () => {
    updateChargeStrategy(strategyForm);
    setEditingStrategy(false);
  };

  const chargeDischargeData = priceData.map((p) => ({
    time: p.time,
    price: p.price,
    charge: p.period === 'valley' ? 5 : 0,
    discharge: p.period === 'peak' ? 5 : 0,
  }));

  const batteryHistory = [
    { time: '00:00', soc: 85, power: 0 },
    { time: '02:00', soc: 90, power: 2.5 },
    { time: '04:00', soc: 95, power: 2.5 },
    { time: '06:00', soc: 92, power: -1.5 },
    { time: '08:00', soc: 85, power: -3.5 },
    { time: '10:00', soc: 78, power: -3.5 },
    { time: '12:00', soc: 72, power: -3 },
    { time: '14:00', soc: 68, power: 2 },
    { time: '16:00', soc: 75, power: 3.5 },
    { time: '18:00', soc: 70, power: -5 },
    { time: '20:00', soc: 60, power: -5 },
    { time: '22:00', soc: 55, power: -2.5 },
  ];

  const scheduleRecommendations = [
    { time: '00:00-06:00', action: '充电', period: '谷时', price: '0.32元/kWh', icon: Moon, reason: '电价最低，适合充电' },
    { time: '08:00-11:00', action: '放电', period: '峰时', price: '1.05元/kWh', icon: Sun, reason: '电价高峰，优先放电' },
    { time: '11:00-18:00', action: '自发自用', period: '平时', price: '0.58元/kWh', icon: Activity, reason: '光伏发电充足，优先自用' },
    { time: '18:00-21:00', action: '放电', period: '峰时', price: '1.05元/kWh', icon: Zap, reason: '用电高峰，放电收益最高' },
    { time: '21:00-24:00', action: '待机', period: '平时', price: '0.58元/kWh', icon: Clock, reason: '电价平稳，保持电量' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">储能管理</h1>
            <p className="text-gray-500 mt-1">监控电池状态，智能调度充放电策略</p>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            刷新数据
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="当前电量"
            value={`${battery.soc}%`}
            icon={BatteryFull}
            color="green"
            trend={`${battery.currentCapacity} / ${battery.capacity} kWh`}
            trendDirection="neutral"
          />
          <StatCard
            title="电池状态"
            value={getStatusText(battery.status)}
            icon={battery.status === 'charging' ? BatteryCharging : Battery}
            color="blue"
            trend={battery.status === 'charging' ? `+${battery.chargeRate} kW` : battery.status === 'discharging' ? `-${battery.dischargeRate} kW` : '0 kW'}
            trendDirection={battery.status === 'charging' ? 'up' : battery.status === 'discharging' ? 'down' : 'neutral'}
          />
          <StatCard
            title="电池温度"
            value={`${battery.temperature}°C`}
            icon={Thermometer}
            color="yellow"
            trend="正常范围"
            trendDirection="neutral"
          />
          <StatCard
            title="健康度"
            value={`${battery.health}%`}
            icon={Activity}
            color="purple"
            trend={`循环次数: ${battery.cycleCount}次`}
            trendDirection="neutral"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b">
            {[
              { id: 'status', label: '实时监控', icon: Activity },
              { id: 'strategy', label: '充放电策略', icon: Settings },
              { id: 'schedule', label: '智能调度', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'status' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">电池SOC变化趋势</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={batteryHistory}>
                          <defs>
                            <linearGradient id="socGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                          <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="soc"
                            stroke="#10B981"
                            strokeWidth={3}
                            fill="url(#socGradient)"
                            name="SOC(%)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">充放电功率</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={batteryHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                          <YAxis stroke="#9CA3AF" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            }}
                          />
                          <Bar dataKey="power" name="功率(kW)" radius={[4, 4, 0, 0]}>
                            {batteryHistory.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.power >= 0 ? '#3B82F6' : '#10B981'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">今日电价与充放电计划</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chargeDischargeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="price"
                          stroke="#F59E0B"
                          strokeWidth={3}
                          dot={false}
                          name="电价(元/kWh)"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="charge"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={false}
                          name="充电功率(kW)"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="discharge"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={false}
                          name="放电功率(kW)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    {['peak', 'flat', 'valley'].map((period) => (
                      <div key={period} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getPeriodColor(period) }}
                        />
                        <span className="text-sm text-gray-600">{getPeriodText(period)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'strategy' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">充放电策略设置</h3>
                    {!editingStrategy && (
                      <button
                        onClick={() => setEditingStrategy(true)}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        编辑策略
                      </button>
                    )}
                  </div>

                  {editingStrategy ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">运行模式</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setStrategyForm({ ...strategyForm, mode: 'auto' })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              strategyForm.mode === 'auto'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Zap className={`w-8 h-8 mx-auto mb-2 ${strategyForm.mode === 'auto' ? 'text-primary-600' : 'text-gray-400'}`} />
                            <div className={`font-medium ${strategyForm.mode === 'auto' ? 'text-primary-600' : 'text-gray-700'}`}>智能模式</div>
                            <div className="text-xs text-gray-500 mt-1">系统自动优化充放电</div>
                          </button>
                          <button
                            onClick={() => setStrategyForm({ ...strategyForm, mode: 'manual' })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              strategyForm.mode === 'manual'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Settings className={`w-8 h-8 mx-auto mb-2 ${strategyForm.mode === 'manual' ? 'text-primary-600' : 'text-gray-400'}`} />
                            <div className={`font-medium ${strategyForm.mode === 'manual' ? 'text-primary-600' : 'text-gray-700'}`}>手动模式</div>
                            <div className="text-xs text-gray-500 mt-1">自定义充放电时段</div>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">目标SOC (%)</label>
                          <input
                            type="number"
                            value={strategyForm.targetSoc || 90}
                            onChange={(e) => setStrategyForm({ ...strategyForm, targetSoc: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">最低SOC (%)</label>
                          <input
                            type="number"
                            value={strategyForm.minSoc || 20}
                            onChange={(e) => setStrategyForm({ ...strategyForm, minSoc: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>

                      {strategyForm.mode === 'manual' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">充电开始时间</label>
                            <input
                              type="time"
                              value={strategyForm.chargeStartTime || '00:00'}
                              onChange={(e) => setStrategyForm({ ...strategyForm, chargeStartTime: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">充电结束时间</label>
                            <input
                              type="time"
                              value={strategyForm.chargeEndTime || '06:00'}
                              onChange={(e) => setStrategyForm({ ...strategyForm, chargeEndTime: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">放电开始时间</label>
                            <input
                              type="time"
                              value={strategyForm.dischargeStartTime || '18:00'}
                              onChange={(e) => setStrategyForm({ ...strategyForm, dischargeStartTime: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">放电结束时间</label>
                            <input
                              type="time"
                              value={strategyForm.dischargeEndTime || '22:00'}
                              onChange={(e) => setStrategyForm({ ...strategyForm, dischargeEndTime: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button
                          onClick={handleSaveStrategy}
                          className="btn-primary flex-1"
                        >
                          保存策略
                        </button>
                        <button
                          onClick={() => {
                            setStrategyForm(chargeStrategy);
                            setEditingStrategy(false);
                          }}
                          className="btn-secondary flex-1"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4">
                          <div className="text-sm text-gray-500 mb-1">运行模式</div>
                          <div className="text-lg font-semibold text-gray-800">
                            {chargeStrategy.mode === 'auto' ? '智能模式' : '手动模式'}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4">
                          <div className="text-sm text-gray-500 mb-1">目标SOC</div>
                          <div className="text-lg font-semibold text-gray-800">{chargeStrategy.targetSoc}%</div>
                        </div>
                        <div className="bg-white rounded-xl p-4">
                          <div className="text-sm text-gray-500 mb-1">最低SOC</div>
                          <div className="text-lg font-semibold text-gray-800">{chargeStrategy.minSoc}%</div>
                        </div>
                        <div className="bg-white rounded-xl p-4">
                          <div className="text-sm text-gray-500 mb-1">预计今日收益</div>
                          <div className="text-lg font-semibold text-green-600">¥12.50</div>
                        </div>
                      </div>

                      {chargeStrategy.mode === 'auto' && (
                        <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-blue-800">智能模式运行中</div>
                            <div className="text-sm text-blue-600 mt-1">
                              系统将根据实时电价峰谷和天气预报自动调度充放电时段，优化您的收益。预计今日通过峰谷套利可增加约12.50元收益。
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <TrendingUp className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">智能调度建议</h3>
                      <p className="text-gray-600 mt-1">
                        基于今日电价和天气预报，系统为您推荐以下充放电方案，预计可增加 15.2% 的收益
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {scheduleRecommendations.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-100 transition-all"
                    >
                      <div className={`p-3 rounded-xl ${
                        item.action === '充电' ? 'bg-blue-100' :
                        item.action === '放电' ? 'bg-green-100' :
                        'bg-gray-100'
                      }`}>
                        <item.icon className={`w-6 h-6 ${
                          item.action === '充电' ? 'text-blue-600' :
                          item.action === '放电' ? 'text-green-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-800">{item.time}</span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            item.action === '充电' ? 'bg-blue-100 text-blue-700' :
                            item.action === '放电' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.action}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            item.period === '峰时' ? 'bg-red-100 text-red-700' :
                            item.period === '谷时' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.period}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          电价: {item.price} · {item.reason}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">明日天气预报与发电预测</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { day: '明天', weather: '晴', temp: '28°C', prediction: '45.2 kWh' },
                      { day: '周四', weather: '多云', temp: '26°C', prediction: '38.5 kWh' },
                      { day: '周五', weather: '阴', temp: '24°C', prediction: '25.8 kWh' },
                      { day: '周六', weather: '小雨', temp: '22°C', prediction: '15.3 kWh' },
                    ].map((day, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 text-center">
                        <div className="text-sm text-gray-500">{day.day}</div>
                        <div className="text-3xl my-2">
                          {day.weather === '晴' ? '☀️' : day.weather === '多云' ? '⛅' : day.weather === '阴' ? '☁️' : '🌧️'}
                        </div>
                        <div className="font-medium text-gray-800">{day.weather}</div>
                        <div className="text-sm text-gray-500 mt-1">{day.temp}</div>
                        <div className="text-sm text-primary-600 font-medium mt-2">预计发电: {day.prediction}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
