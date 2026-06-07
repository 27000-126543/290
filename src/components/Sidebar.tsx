import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Activity,
  FileText,
  TrendingUp,
  Zap,
  Battery,
  ArrowLeftRight,
  Crown,
  LayoutDashboard,
  LogOut,
  Leaf,
} from 'lucide-react';
import { useStore } from '../store/useStore';

const menuItems = [
  { path: '/dashboard', label: '首页概览', icon: Home, roles: ['user', 'maintainer', 'admin'] },
  { path: '/monitor', label: '电站监控', icon: Activity, roles: ['user', 'maintainer', 'admin'] },
  { path: '/workorders', label: '运维工单', icon: FileText, roles: ['user', 'maintainer', 'admin'] },
  { path: '/revenue', label: '收益中心', icon: TrendingUp, roles: ['user', 'admin'] },
  { path: '/grid-connection', label: '并网申请', icon: Zap, roles: ['user', 'admin'] },
  { path: '/energy-storage', label: '储能管理', icon: Battery, roles: ['user', 'admin'] },
  { path: '/trading', label: '电力交易', icon: ArrowLeftRight, roles: ['user', 'admin'] },
  { path: '/membership', label: '会员中心', icon: Crown, roles: ['user', 'admin'] },
  { path: '/admin', label: '管理看板', icon: LayoutDashboard, roles: ['admin'] },
];

export default function Sidebar() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();

  const filteredItems = menuItems.filter(
    (item) => currentUser && item.roles.includes(currentUser.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-800">绿能管家</h1>
            <p className="text-xs text-gray-500">Green Energy Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {filteredItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        {currentUser && (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser.role === 'admin'
                    ? '系统管理员'
                    : currentUser.role === 'maintainer'
                    ? '运维人员'
                    : currentUser.memberLevel === 'diamond'
                    ? '钻石会员'
                    : currentUser.memberLevel === 'gold'
                    ? '黄金会员'
                    : '白银会员'}
                </p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">退出登录</span>
        </button>
      </div>
    </div>
  );
}
