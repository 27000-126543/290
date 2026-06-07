import { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Zap,
  ShoppingCart,
  History,
  FileText,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRightLeft,
  Wallet,
  BarChart3,
  Users,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { useStore } from '../store/useStore';

export default function Trading() {
  const { sellOrders, transactions, currentUser, addSellOrder } = useStore();
  const [activeTab, setActiveTab] = useState<'market' | 'orders' | 'history'>('market');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orderForm, setOrderForm] = useState({ amount: 50, price: 0.65 });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'matched': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'matched': return '已匹配';
      case 'pending': return '挂售中';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  const handleCreateOrder = () => {
    addSellOrder({
      stationId: 's1',
      stationName: '家用光伏电站',
      userId: currentUser?.id || '1',
      amount: orderForm.amount,
      price: orderForm.price,
    });
    setShowCreateModal(false);
    setOrderForm({ amount: 50, price: 0.65 });
  };

  const marketPriceData = [
    { time: '08:00', price: 0.58, volume: 1200 },
    { time: '09:00', price: 0.62, volume: 1800 },
    { time: '10:00', price: 0.68, volume: 2500 },
    { time: '11:00', price: 0.72, volume: 3200 },
    { time: '12:00', price: 0.65, volume: 2800 },
    { time: '13:00', price: 0.60, volume: 2000 },
    { time: '14:00', price: 0.63, volume: 2200 },
    { time: '15:00', price: 0.70, volume: 2900 },
    { time: '16:00', price: 0.75, volume: 3500 },
    { time: '17:00', price: 0.80, volume: 4000 },
    { time: '18:00', price: 0.85, volume: 4500 },
    { time: '19:00', price: 0.78, volume: 3800 },
  ];

  const marketStats = [
    { label: '当前市场价', value: '0.68', unit: '元/kWh', trend: '+2.5%', up: true },
    { label: '今日成交量', value: '12,580', unit: 'kWh', trend: '+15.3%', up: true },
    { label: '挂售总量', value: '3,420', unit: 'kWh', trend: '-8.2%', up: false },
    { label: '需求总量', value: '5,680', unit: 'kWh', trend: '+12.1%', up: true },
  ];

  const tradeDistribution = [
    { name: '工业用户', value: 45, color: '#10B981' },
    { name: '商业用户', value: 30, color: '#3B82F6' },
    { name: '居民用户', value: 15, color: '#F59E0B' },
    { name: '储能电站', value: 10, color: '#8B5CF6' },
  ];

  const pendingOrders = sellOrders.filter(o => o.status === 'pending');
  const matchedOrders = sellOrders.filter(o => o.status === 'matched');
  const completedOrders = sellOrders.filter(o => o.status === 'completed');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">电力交易</h1>
            <p className="text-gray-500 mt-1">挂售多余电力，匹配买家，获取额外收益</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            发布挂售
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="text-sm text-gray-500">{stat.label}</div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
                <span className="text-sm text-gray-500">{stat.unit}</span>
              </div>
              <div className={`text-sm mt-2 ${stat.up ? 'text-green-600' : 'text-red-500'}`}>
                {stat.up ? '↑' : '↓'} {stat.trend} 较昨日
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b">
            {[
              { id: 'market', label: '交易市场', icon: BarChart3 },
              { id: 'orders', label: '我的挂售', icon: ShoppingCart },
              { id: 'history', label: '交易记录', icon: History },
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
            {activeTab === 'market' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">今日电价走势</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={marketPriceData}>
                          <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                          <YAxis stroke="#9CA3AF" fontSize={12} domain={[0.4, 1]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            }}
                            formatter={(value: number) => [`${value.toFixed(2)} 元/kWh`, '电价']}
                          />
                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#10B981"
                            strokeWidth={3}
                            fill="url(#priceGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">买家类型分布</h3>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={tradeDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {tradeDistribution.map((entry, index) => (
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
                            formatter={(value: number) => [`${value}%`, '占比']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {tradeDistribution.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-gray-600">{item.name} {item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">市场挂售列表</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-3 font-medium">电站名称</th>
                          <th className="pb-3 font-medium">卖家</th>
                          <th className="pb-3 font-medium">电量(kWh)</th>
                          <th className="pb-3 font-medium">单价(元/kWh)</th>
                          <th className="pb-3 font-medium">总价(元)</th>
                          <th className="pb-3 font-medium">发布时间</th>
                          <th className="pb-3 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {[
                          { station: '阳光家园光伏', seller: '李先生', amount: 200, price: 0.66, total: 132, time: '10分钟前' },
                          { station: '绿城小区风电', seller: '王女士', amount: 150, price: 0.64, total: 96, time: '25分钟前' },
                          { station: '幸福村光伏阵列', seller: '张村', amount: 500, price: 0.62, total: 310, time: '1小时前' },
                          { station: '科技园分布式光伏', seller: '科技公司', amount: 800, price: 0.68, total: 544, time: '2小时前' },
                        ].map((order, index) => (
                          <tr key={index} className="hover:bg-white/50 transition-colors">
                            <td className="py-4 font-medium text-gray-800">{order.station}</td>
                            <td className="py-4 text-gray-600">{order.seller}</td>
                            <td className="py-4 text-gray-800">{order.amount}</td>
                            <td className="py-4 text-primary-600 font-medium">{order.price.toFixed(2)}</td>
                            <td className="py-4 text-gray-800 font-medium">¥{order.total}</td>
                            <td className="py-4 text-gray-500">{order.time}</td>
                            <td className="py-4">
                              <button className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors">
                                购买
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-yellow-50 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-xl">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm text-yellow-600">挂售中</div>
                      <div className="text-2xl font-bold text-yellow-700">{pendingOrders.length}</div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-600">已匹配</div>
                      <div className="text-2xl font-bold text-blue-700">{matchedOrders.length}</div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-green-600">已完成</div>
                      <div className="text-2xl font-bold text-green-700">{completedOrders.length}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {sellOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${
                            order.status === 'completed' ? 'bg-green-100' :
                            order.status === 'matched' ? 'bg-blue-100' :
                            'bg-yellow-100'
                          }`}>
                            <Zap className={`w-6 h-6 ${
                              order.status === 'completed' ? 'text-green-600' :
                              order.status === 'matched' ? 'text-blue-600' :
                              'text-yellow-600'
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{order.stationName}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              电量: {order.amount} kWh · 单价: ¥{order.price}/kWh
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="grid grid-cols-3 gap-6 text-sm">
                          <div>
                            <div className="text-gray-500">总价</div>
                            <div className="font-medium text-gray-800">¥{order.total}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">手续费</div>
                            <div className="font-medium text-gray-800">¥{order.fee}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">发布时间</div>
                            <div className="font-medium text-gray-800">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {order.status === 'pending' && (
                          <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                            取消挂售
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">交易记录</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-3 font-medium">交易编号</th>
                          <th className="pb-3 font-medium">类型</th>
                          <th className="pb-3 font-medium">电量(kWh)</th>
                          <th className="pb-3 font-medium">单价(元/kWh)</th>
                          <th className="pb-3 font-medium">总价(元)</th>
                          <th className="pb-3 font-medium">对方</th>
                          <th className="pb-3 font-medium">状态</th>
                          <th className="pb-3 font-medium">时间</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-white/50 transition-colors">
                            <td className="py-4 font-mono text-sm text-gray-600">{tx.id.toUpperCase()}</td>
                            <td className="py-4">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                                卖出
                              </span>
                            </td>
                            <td className="py-4 text-gray-800">{tx.amount}</td>
                            <td className="py-4 text-primary-600 font-medium">{tx.price.toFixed(2)}</td>
                            <td className="py-4 text-gray-800 font-medium">¥{tx.total}</td>
                            <td className="py-4 text-gray-600">{tx.buyerName}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {tx.status === 'completed' ? '已完成' : '结算中'}
                              </span>
                            </td>
                            <td className="py-4 text-gray-500">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">月度交易统计</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { month: '1月', 卖出: 320, 收入: 208 },
                          { month: '2月', 卖出: 280, 收入: 182 },
                          { month: '3月', 卖出: 420, 收入: 273 },
                          { month: '4月', 卖出: 520, 收入: 338 },
                          { month: '5月', 卖出: 650, 收入: 423 },
                          { month: '6月', 卖出: 780, 收入: 507 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
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
                        <Bar yAxisId="left" dataKey="卖出" name="电量(kWh)" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="收入" name="收入(元)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">发布电力挂售</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择电站</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all">
                    <option>家用光伏电站 (剩余可售: 280 kWh)</option>
                    <option>小型风力发电站 (剩余可售: 120 kWh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    挂售电量 (kWh)
                    <span className="text-gray-400 font-normal ml-2">当前市场价: ¥0.68/kWh</span>
                  </label>
                  <input
                    type="number"
                    value={orderForm.amount}
                    onChange={(e) => setOrderForm({ ...orderForm, amount: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    min="1"
                  />
                  <div className="flex gap-2 mt-2">
                    {[50, 100, 200, 500].map((val) => (
                      <button
                        key={val}
                        onClick={() => setOrderForm({ ...orderForm, amount: val })}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    挂售单价 (元/kWh)
                  </label>
                  <input
                    type="number"
                    value={orderForm.price}
                    onChange={(e) => setOrderForm({ ...orderForm, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    step="0.01"
                    min="0.3"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setOrderForm({ ...orderForm, price: 0.68 })}
                      className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      市场价
                    </button>
                    <button
                      onClick={() => setOrderForm({ ...orderForm, price: 0.65 })}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
                    >
                      低于市价5%
                    </button>
                  </div>
                </div>

                <div className="bg-primary-50 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">预计总价</span>
                    <span className="font-semibold text-primary-700">¥{(orderForm.amount * orderForm.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">手续费 (2%)</span>
                    <span className="text-gray-600">¥{(orderForm.amount * orderForm.price * 0.02).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2 pt-2 border-t border-primary-200">
                    <span className="font-medium text-gray-800">预计到账</span>
                    <span className="font-bold text-primary-700">¥{(orderForm.amount * orderForm.price * 0.98).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleCreateOrder}
                    className="btn-primary flex-1"
                  >
                    确认发布
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
