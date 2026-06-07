import { useState } from 'react';
import {
  Crown,
  Award,
  Zap,
  Wrench,
  ClipboardCheck,
  TrendingUp,
  Headphones,
  Package,
  Gift,
  ShieldCheck,
  CreditCard,
  Calendar,
  ChevronRight,
  Star,
  Bell,
  BarChart3,
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

const iconMap: Record<string, any> = {
  Wrench,
  ClipboardCheck,
  TrendingUp,
  Zap,
  Package,
  Calendar,
  Headphones,
  Gift,
  ShieldCheck,
  CreditCard,
};

export default function Membership() {
  const { currentUser, memberBenefits } = useStore();
  const [activeTab, setActiveTab] = useState<'benefits' | 'history' | 'upgrade'>('benefits');

  const levelConfig = {
    silver: { name: '银卡', color: 'from-gray-400 to-gray-500', textColor: 'text-gray-600', bgColor: 'bg-gray-100', minGeneration: 0, maxGeneration: 50000 },
    gold: { name: '金卡', color: 'from-yellow-400 to-yellow-600', textColor: 'text-yellow-600', bgColor: 'bg-yellow-100', minGeneration: 50000, maxGeneration: 200000 },
    diamond: { name: '钻石卡', color: 'from-cyan-400 to-blue-600', textColor: 'text-blue-600', bgColor: 'bg-blue-100', minGeneration: 200000, maxGeneration: Infinity },
  };

  const currentLevel = currentUser?.memberLevel || 'silver';
  const currentConfig = levelConfig[currentLevel as keyof typeof levelConfig];
  const totalGeneration = currentUser?.totalGeneration || 0;

  const nextLevel = currentLevel === 'silver' ? 'gold' : currentLevel === 'gold' ? 'diamond' : null;
  const nextConfig = nextLevel ? levelConfig[nextLevel as keyof typeof levelConfig] : null;
  const progressToNext = nextConfig
    ? Math.min(100, ((totalGeneration - currentConfig.minGeneration) / (nextConfig.minGeneration - currentConfig.minGeneration)) * 100)
    : 100;

  const myBenefits = memberBenefits.filter((b) => b.level === currentLevel);
  const silverBenefits = memberBenefits.filter((b) => b.level === 'silver');
  const goldBenefits = memberBenefits.filter((b) => b.level === 'gold');
  const diamondBenefits = memberBenefits.filter((b) => b.level === 'diamond');

  const growthData = [
    { month: '1月', generation: 800, cumulative: 800 },
    { month: '2月', generation: 750, cumulative: 1550 },
    { month: '3月', generation: 920, cumulative: 2470 },
    { month: '4月', generation: 1100, cumulative: 3570 },
    { month: '5月', generation: 1250, cumulative: 4820 },
    { month: '6月', generation: 1380, cumulative: 6200 },
  ];

  const membershipHistory = [
    { date: '2025-01-15', event: '加入会员', level: 'silver', description: '注册并绑定首个电站，成为银卡会员' },
    { date: '2025-02-20', event: '获得权益', level: 'silver', description: '完成首次季度巡检服务' },
    { date: '2025-03-10', event: '收益加成', level: 'silver', description: '本月发电收益获得2%加成，共增加¥32.50' },
    { date: '2025-04-05', event: '维修服务', level: 'silver', description: '享受免费基础维修服务，节省¥150' },
    { date: '2025-05-18', event: '升级预告', level: 'silver', description: '距金卡还需43,800 kWh发电量' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">会员中心</h1>
          <p className="text-gray-500 mt-1">查看您的会员等级、专属权益和升级进度</p>
        </div>

        <div className={`bg-gradient-to-r ${currentConfig.color} rounded-3xl p-8 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 opacity-10">
            <Crown className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="w-8 h-8" />
                  <span className="text-2xl font-bold">{currentConfig.name}会员</span>
                </div>
                <div className="mt-2 text-white/80">
                  {currentUser?.name} · 累计发电 {totalGeneration.toLocaleString()} kWh
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-sm">会员编号</div>
                <div className="font-mono text-lg">GE{currentUser?.id.padStart(8, '0')}</div>
              </div>
            </div>

            {nextConfig && (
              <div className="mt-8">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>升级到{nextConfig.name}</span>
                  <span>还需 {(nextConfig.minGeneration - totalGeneration).toLocaleString()} kWh</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-2 text-white/70">
                  <span>{totalGeneration.toLocaleString()} kWh</span>
                  <span>{nextConfig.minGeneration.toLocaleString()} kWh</span>
                </div>
              </div>
            )}

            {!nextConfig && (
              <div className="mt-8 flex items-center gap-3 bg-white/20 rounded-xl p-4">
                <Star className="w-6 h-6" />
                <div>
                  <div className="font-medium">恭喜！您已达到最高会员等级</div>
                  <div className="text-sm text-white/80">享受所有专属权益，感谢您的支持</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-3">+5%</div>
            <div className="text-sm text-gray-500 mt-1">发电收益加成</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-3">12次</div>
            <div className="text-sm text-gray-500 mt-1">年度免费巡检</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-3">4小时</div>
            <div className="text-sm text-gray-500 mt-1">优先维修响应</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b">
            {[
              { id: 'benefits', label: '我的权益', icon: Award },
              { id: 'upgrade', label: '等级对比', icon: BarChart3 },
              { id: 'history', label: '会员记录', icon: Calendar },
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
            {activeTab === 'benefits' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{currentConfig.name}专属权益</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myBenefits.map((benefit) => {
                    const IconComponent = iconMap[benefit.icon] || Star;
                    return (
                      <div
                        key={benefit.id}
                        className="bg-gray-50 rounded-xl p-5 flex items-start gap-4 hover:bg-gray-100 transition-all"
                      >
                        <div className={`p-3 rounded-xl ${currentConfig.bgColor}`}>
                          <IconComponent className={`w-6 h-6 ${currentConfig.textColor}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">{benefit.name}</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${currentConfig.bgColor} ${currentConfig.textColor}`}>
                              {benefit.value}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{benefit.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 bg-primary-50 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-100 rounded-xl">
                      <Bell className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">本月权益使用情况</h4>
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">免费巡检</div>
                          <div className="text-lg font-semibold text-gray-800 mt-1">5 / 12次</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">免费配件</div>
                          <div className="text-lg font-semibold text-gray-800 mt-1">¥80 / ¥200</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">收益加成</div>
                          <div className="text-lg font-semibold text-green-600 mt-1">+¥125.80</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">手续费减免</div>
                          <div className="text-lg font-semibold text-green-600 mt-1">-¥35.20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'upgrade' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">会员等级权益对比</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-4 text-left text-sm font-medium text-gray-500">权益项目</th>
                        {['silver', 'gold', 'diamond'].map((level) => {
                          const config = levelConfig[level as keyof typeof levelConfig];
                          return (
                            <th
                              key={level}
                              className={`pb-4 text-center text-sm font-medium ${currentLevel === level ? 'text-primary-600' : 'text-gray-500'}`}
                            >
                              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
                                {config.name}
                                {currentLevel === level && <span className="text-xs">(当前)</span>}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        { label: '发电收益加成', silver: '+2%', gold: '+5%', diamond: '+8%' },
                        { label: '年度巡检次数', silver: '4次', gold: '12次', diamond: '26次' },
                        { label: '维修响应时间', silver: '24小时', gold: '4小时', diamond: '2小时' },
                        { label: '免费配件额度', silver: '¥0', gold: '¥200/年', diamond: '¥500/年' },
                        { label: '交易手续费', silver: '2%', gold: '2%', diamond: '1%' },
                        { label: '专属客服', silver: '否', gold: '否', diamond: '是' },
                        { label: '升级门槛', silver: '0 kWh', gold: '50,000 kWh', diamond: '200,000 kWh' },
                      ].map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-4 text-gray-700">{row.label}</td>
                          <td className="py-4 text-center text-gray-600">{row.silver}</td>
                          <td className="py-4 text-center text-gray-600">{row.gold}</td>
                          <td className="py-4 text-center text-gray-600">{row.diamond}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">发电量增长趋势</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData}>
                        <defs>
                          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
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
                        <Area
                          type="monotone"
                          dataKey="cumulative"
                          stroke="#10B981"
                          strokeWidth={3}
                          fill="url(#growthGradient)"
                          name="累计发电量(kWh)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">会员动态</h3>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                  {membershipHistory.map((item, index) => (
                    <div key={index} className="relative flex gap-6 pb-8 last:pb-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        levelConfig[item.level as keyof typeof levelConfig].bgColor
                      }`}>
                        <Award className={`w-5 h-5 ${levelConfig[item.level as keyof typeof levelConfig].textColor}`} />
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{item.event}</span>
                          <span className="text-sm text-gray-500">{item.date}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">加速升级小贴士</h3>
              <p className="text-gray-600 mt-1">提升发电量，更快解锁高级会员权益</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  '定期清洁光伏组件',
                  '优化设备朝向角度',
                  '及时处理设备告警',
                  '使用智能储能策略',
                ].map((tip, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-sm text-gray-600">
                    <ChevronRight className="w-4 h-4 text-primary-500" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
