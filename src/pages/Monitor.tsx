import { useEffect, useState } from 'react';
import {
  Activity,
  Thermometer,
  Zap,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sun,
  Wind,
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
} from 'recharts';
import Layout from '../components/Layout';
import { useStore } from '../store/useStore';

export default function Monitor() {
  const { currentStation, realtimeData, updateRealtimeData, alarms, resolveAlarm, historyData } = useStore();
  const [activeTab, setActiveTab] = useState<'realtime' | 'alarms' | 'params'>('realtime');

  useEffect(() => {
    if (currentStation) {
      updateRealtimeData(currentStation.id);
      const interval = setInterval(() => {
        updateRealtimeData(currentStation.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentStation, updateRealtimeData]);

  const data = currentStation ? realtimeData[currentStation.id] : null;
  const hourlyData = historyData.slice(-24).map((d, i) => ({
    ...d,
    hour: `${i}:00`,
  }));

  const paramList = data
    ? [
        { label: '实时功率', value: data.power.toFixed(2), unit: 'kW', icon: Zap, color: 'emerald' },
        { label: '日发电量', value: data.dailyGeneration.toFixed(1), unit: 'kWh', icon: Sun, color: 'amber' },
        { label: '设备温度', value: data.temperature.toFixed(1), unit: '°C', icon: Thermometer, color: 'red' },
        { label: '发电效率', value: data.efficiency.toFixed(1), unit: '%', icon: Gauge, color: 'blue' },
        { label: '电压', value: data.voltage.toFixed(1), unit: 'V', icon: Activity, color: 'violet' },
        { label: '电流', value: data.current.toFixed(1), unit: 'A', icon: Zap, color: 'indigo' },
      ]
    : [];

  const activeAlarms = alarms.filter((a) => !a.resolved);
  const resolvedAlarms = alarms.filter((a) => a.resolved);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">电站监控</h1>
            <p className="text-gray-500 mt-1">实时监控 {currentStation?.name} 的运行状态</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
              currentStation?.status === 'normal'
                ? 'bg-emerald-50 text-emerald-700'
                : currentStation?.status === 'warning'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-red-50 text-red-700'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                currentStation?.status === 'normal'
                  ? 'bg-emerald-500'
                  : currentStation?.status === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                {currentStation?.status === 'normal'
                  ? '运行正常'
                  : currentStation?.status === 'warning'
                  ? '存在告警'
                  : '设备故障'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {paramList.map((param, index) => (
            <div key={index} className="card p-4">
              <div className={`w-10 h-10 rounded-lg bg-${param.color}-100 flex items-center justify-center mb-3`}>
                <param.icon className={`w-5 h-5 text-${param.color}-600`} />
              </div>
              <p className="text-sm text-gray-500">{param.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {param.value}
                <span className="text-sm font-normal text-gray-500 ml-1">{param.unit}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'realtime', label: '实时曲线' },
            { id: 'alarms', label: '告警信息' },
            { id: 'params', label: '设备参数' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.id === 'alarms' && activeAlarms.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                  {activeAlarms.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'realtime' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">24小时功率曲线</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="generation"
                      stroke="#10B981"
                      strokeWidth={2}
                      fill="url(#powerGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">温度趋势</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" domain={[30, 60]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={() => 35 + Math.random() * 15}
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={false}
                      name="温度(°C)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alarms' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">未处理告警</h3>
              <div className="space-y-3">
                {activeAlarms.length > 0 ? (
                  activeAlarms.map((alarm) => (
                    <div
                      key={alarm.id}
                      className={`p-4 rounded-xl border flex items-start justify-between ${
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
                        <div>
                          <p className="font-medium text-gray-800">{alarm.message}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(alarm.timestamp).toLocaleString('zh-CN')}
                            </span>
                            <span className="text-sm text-gray-500">{alarm.stationName}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => resolveAlarm(alarm.id)}
                        className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        标记已处理
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <p className="text-gray-500">暂无未处理告警</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">历史告警</h3>
              <div className="space-y-3">
                {resolvedAlarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3 opacity-70"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700 line-through">{alarm.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(alarm.timestamp).toLocaleString('zh-CN')}
                        </span>
                        <span className="text-sm text-emerald-600">已处理</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'params' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">设备详细参数</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-500" />
                  光伏组件
                </h4>
                <div className="space-y-3">
                  {[
                    { label: '组件类型', value: '单晶PERC' },
                    { label: '组件数量', value: '30块' },
                    { label: '单块功率', value: '330W' },
                    { label: '总装机容量', value: '9.9kW' },
                    { label: '安装角度', value: '30°' },
                    { label: '安装方位', value: '正南' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">{item.label}</span>
                      <span className="font-medium text-gray-800 text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  逆变器
                </h4>
                <div className="space-y-3">
                  {[
                    { label: '型号', value: currentStation?.inverterModel || '华为SUN2000' },
                    { label: '额定功率', value: '10kW' },
                    { label: '最大效率', value: '98.6%' },
                    { label: 'MPPT路数', value: '2路' },
                    { label: '工作温度', value: '-25°C ~ 60°C' },
                    { label: '防护等级', value: 'IP65' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">{item.label}</span>
                      <span className="font-medium text-gray-800 text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  系统信息
                </h4>
                <div className="space-y-3">
                  {[
                    { label: '并网时间', value: currentStation?.installDate || '2023-06-15' },
                    { label: '所属地区', value: currentStation?.location || '北京市朝阳区' },
                    { label: '系统类型', value: '户用光伏系统' },
                    { label: '并网方式', value: '自发自用，余电上网' },
                    { label: '上网电价', value: '0.58元/kWh' },
                    { label: '补贴电价', value: '0.03元/kWh' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">{item.label}</span>
                      <span className="font-medium text-gray-800 text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
