import { useState } from 'react';
import {
  FileText,
  Plus,
  Filter,
  Clock,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  X,
} from 'lucide-react';
import Layout from '../components/Layout';
import { useStore } from '../store/useStore';
import type { WorkOrder, Priority, WorkOrderType } from '../types';

export default function WorkOrders() {
  const { workOrders, currentUser, currentStation, addWorkOrder, updateWorkOrderStatus } = useStore();
  const [showNewModal, setShowNewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  const [newOrder, setNewOrder] = useState({
    title: '',
    description: '',
    type: 'maintenance' as WorkOrderType,
    priority: 'medium' as Priority,
  });

  const userOrders = currentUser?.role === 'user'
    ? workOrders.filter((o) => o.userId === currentUser.id)
    : currentUser?.role === 'maintainer'
    ? workOrders.filter((o) => o.assignee === currentUser.id)
    : workOrders;

  const filteredOrders = filterStatus === 'all'
    ? userOrders
    : userOrders.filter((o) => o.status === filterStatus);

  const handleCreateOrder = () => {
    if (!newOrder.title || !newOrder.description) return;
    if (currentUser && currentStation) {
      addWorkOrder({
        stationId: currentStation.id,
        stationName: currentStation.name,
        userId: currentUser.id,
        userName: currentUser.name,
        type: newOrder.type,
        title: newOrder.title,
        description: newOrder.description,
        status: 'pending',
        priority: newOrder.priority,
      });
      setShowNewModal(false);
      setNewOrder({ title: '', description: '', type: 'maintenance', priority: 'medium' });
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待分配',
      assigned: '已分配',
      processing: '处理中',
      completed: '已完成',
      cancelled: '已取消',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700',
      assigned: 'bg-blue-100 text-blue-700',
      processing: 'bg-amber-100 text-amber-700',
      completed: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = {
      low: 'bg-emerald-100 text-emerald-700',
      medium: 'bg-amber-100 text-amber-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return map[priority] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityText = (priority: string) => {
    const map: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急',
    };
    return map[priority] || priority;
  };

  const getTypeText = (type: string) => {
    const map: Record<string, string> = {
      alarm: '告警工单',
      maintenance: '维修工单',
      inspection: '巡检工单',
    };
    return map[type] || type;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">运维工单</h1>
            <p className="text-gray-500 mt-1">管理您的设备维修和巡检工单</p>
          </div>
          {currentUser?.role === 'user' && (
            <button
              onClick={() => setShowNewModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              创建工单
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '全部', value: userOrders.length, status: 'all' },
            { label: '待分配', value: userOrders.filter((o) => o.status === 'pending').length, status: 'pending' },
            { label: '处理中', value: userOrders.filter((o) => o.status === 'processing' || o.status === 'assigned').length, status: 'processing' },
            { label: '已完成', value: userOrders.filter((o) => o.status === 'completed').length, status: 'completed' },
          ].map((item) => (
            <button
              key={item.status}
              onClick={() => setFilterStatus(item.status)}
              className={`p-4 rounded-xl text-left transition-all ${
                filterStatus === item.status
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white border border-gray-100 hover:border-primary-200'
              }`}
            >
              <p className={`text-sm ${filterStatus === item.status ? 'text-white/80' : 'text-gray-500'}`}>
                {item.label}
              </p>
              <p className={`text-2xl font-bold mt-1 ${filterStatus === item.status ? 'text-white' : 'text-gray-800'}`}>
                {item.value}
              </p>
            </button>
          ))}
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">工单号</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">标题</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">类型</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">优先级</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">负责人</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">创建时间</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-4 px-6 text-sm font-mono text-gray-600">{order.id}</td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-800">{order.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{order.description}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">{getTypeText(order.type)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                        {getPriorityText(order.priority)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {order.assigneeName || '待分配'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-4 px-6">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                        详情 <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无工单</p>
            </div>
          )}
        </div>

        {showNewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg animate-slide-up">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">创建工单</h3>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">工单标题</label>
                  <input
                    type="text"
                    value={newOrder.title}
                    onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })}
                    placeholder="请输入工单标题"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">问题描述</label>
                  <textarea
                    value={newOrder.description}
                    onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                    placeholder="请详细描述您遇到的问题"
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">工单类型</label>
                    <select
                      value={newOrder.type}
                      onChange={(e) => setNewOrder({ ...newOrder, type: e.target.value as WorkOrderType })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    >
                      <option value="maintenance">维修工单</option>
                      <option value="inspection">巡检工单</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">优先级</label>
                    <select
                      value={newOrder.priority}
                      onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value as Priority })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                      <option value="urgent">紧急</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateOrder}
                  className="flex-1 btn-primary"
                >
                  提交工单
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                <h3 className="text-lg font-semibold text-gray-800">工单详情</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-xl font-bold text-gray-800">{selectedOrder.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedOrder.priority)}`}>
                      {getPriorityText(selectedOrder.priority)}
                    </span>
                  </div>
                  <p className="text-gray-600">{selectedOrder.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <FileText className="w-4 h-4" />
                      工单号
                    </div>
                    <p className="font-mono text-gray-800">{selectedOrder.id}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <MapPin className="w-4 h-4" />
                      关联电站
                    </div>
                    <p className="font-medium text-gray-800">{selectedOrder.stationName}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <User className="w-4 h-4" />
                      申请人
                    </div>
                    <p className="font-medium text-gray-800">{selectedOrder.userName}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      创建时间
                    </div>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedOrder.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">处理进度</h5>
                  <div className="space-y-4">
                    {selectedOrder.history.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            index === selectedOrder.history.length - 1
                              ? 'bg-primary-500'
                              : 'bg-gray-300'
                          }`} />
                          {index < selectedOrder.history.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-gray-800">{item.action}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.operator} · {new Date(item.time).toLocaleString('zh-CN')}
                          </p>
                          {item.remark && (
                            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-xl">
                              {item.remark}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-100">
                {currentUser?.role === 'maintainer' && selectedOrder.status === 'assigned' && (
                  <button
                    onClick={() => {
                      updateWorkOrderStatus(selectedOrder.id, 'processing', '已到达现场开始处理');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 btn-primary"
                  >
                    开始处理
                  </button>
                )}
                {currentUser?.role === 'maintainer' && selectedOrder.status === 'processing' && (
                  <button
                    onClick={() => {
                      updateWorkOrderStatus(selectedOrder.id, 'completed', '维修完成，设备恢复正常');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 btn-primary"
                  >
                    完成工单
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 btn-secondary"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
