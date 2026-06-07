import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Leaf,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Wallet,
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
  Legend,
} from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { useStore } from '../store/useStore';

export default function Revenue() {
  const { historyData, currentUser, monthlyReport } = useStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'year'>('30d');

  const displayData = historyData.slice(-parseInt(timeRange === 'year' ? '365' : timeRange));
  const totalGeneration = displayData.reduce((sum, d) => sum + d.generation, 0);
  const totalRevenue = displayData.reduce((sum, d) => sum + d.revenue, 0);
  const totalCarbon = displayData.reduce((sum, d) => sum + d.carbonReduction, 0);

  const pieData = [
    { name: '自发自用', value: 45, color: '#10B981' },
    { name: '余电上网', value: 35, color: '#3B82F6' },
    { name: '电力交易', value: 20, color: '#F59E0B' },
  ];

  const revenueBreakdown = [
    { month: '1月', 发电收益: 480, 补贴: 120, 交易: 150 },
    { month: '2月', 发电收益: 420, 补贴: 105, 交易: 130 },
    { month: '3月', 发电收益: 510, 补贴: 128, 交易: 180 },
    { month: '4月', 发电收益: 560, 补贴: 140, 交易: 200 },
    { month: '5月', 发电收益: 620, 补贴: 155, 交易: 220 },
    { month: '6月', 发电收益: 680, 补贴: 170, 交易: 250 },
  ];

  const handleExport = () => {
    alert('报表导出功能：已生成月度运营报表，包含发电收入、运维成本、交易手续费、设备故障率和会员满意度');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">收益中心</h1>
            <p className="text-gray-500 mt-1">查看您的发电收益和碳排放减少数据</p>
          </div>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            导出报表
          </button>
        </div>

        <div className="flex gap-2 bg-gray-100 rounded-xl p-1 w-fit">
          {[
            { id: '7d', label: '7天' },
            { id: '30d', label: '30天' },
            { id: '90d', label: '90天' },
            { id: 'year', label: '全年' },
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id as typeof timeRange)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="总发电量"
            value={totalGeneration.toFixed(0)}
            unit="kWh"
            icon={BarChart3}
            color="green"
            trend={{ value: 12.3, isUp: true }}
          />
          <StatCard
            title="总收益"
            value={totalRevenue.toFixed(0)}
            unit="元"
            icon={DollarSign}
            color="yellow"
            trend={{ value: 8.5, isUp: true }}
          />
          <StatCard
            title="碳减排"
            value={(totalCarbon / 1000).toFixed(2)}
            unit="吨CO₂"
            icon={Leaf}
            color="green"
            description={`相当于种树 ${Math.round(totalCarbon / 18)} 棵`}
          />
          <StatCard
            title="账户余额"
            value="1,256.80"
            unit="元"
            icon={Wallet}
            color="blue"
            description="可提现金额"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">发电收益趋势</h3>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary-500" />
                  发电量(kWh)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-secondary-500" />
                  收益(元)
                </span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayData}>
                  <defs>
                    <linearGradient id="genGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(v) => v.slice(5)} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="generation"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#genGradient)"
                    name="发电量"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#revGradient)"
                    name="收益"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">收益构成</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">月度收益构成</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Bar dataKey="发电收益" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="补贴" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="交易" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">收益明细</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              2025年6月
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">日期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">发电量(kWh)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">发电收益(元)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">补贴(元)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">碳减排(kg)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">合计(元)</th>
                </tr>
              </thead>
              <tbody>
                {displayData.slice(-10).reverse().map((item, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-600">{item.date}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">{item.generation.toFixed(1)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{(item.revenue * 0.8).toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{(item.revenue * 0.2).toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.carbonReduction.toFixed(1)}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-primary-600">{item.revenue.toFixed(2)}</td>
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
