import { useState } from 'react';
import {
  Zap,
  FileText,
  CheckCircle,
  Clock,
  Upload,
  X,
  Eye,
  Download,
  Plus,
} from 'lucide-react';
import Layout from '../components/Layout';
import { useStore } from '../store/useStore';

export default function GridConnection() {
  const { gridApplications, currentUser, currentStation } = useStore();
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  const userApplications = gridApplications.filter((a) => a.userId === currentUser?.id);

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待审核',
      reviewing: '审核中',
      approved: '已通过',
      rejected: '已拒绝',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      reviewing: 'bg-blue-100 text-blue-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">并网申请</h1>
            <p className="text-gray-500 mt-1">在线申请电站并网，自动审核资质</p>
          </div>
          {userApplications.length === 0 && (
            <button
              onClick={() => setShowNewModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              新建申请
            </button>
          )}
        </div>

        {userApplications.length > 0 ? (
          <div className="space-y-6">
            {userApplications.map((app) => (
              <div key={app.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      app.status === 'approved' ? 'bg-emerald-100' :
                      app.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                      {app.status === 'approved' ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      ) : app.status === 'rejected' ? (
                        <X className="w-6 h-6 text-red-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-800">{app.stationName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        申请编号：{app.id} · 提交时间：{new Date(app.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    查看详情
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">装机容量</p>
                    <p className="font-semibold text-gray-800 mt-1">{app.stationCapacity} kW</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">电站类型</p>
                    <p className="font-semibold text-gray-800 mt-1">
                      {app.stationType === 'solar' ? '光伏发电' : '风力发电'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">申请人</p>
                    <p className="font-semibold text-gray-800 mt-1">{app.applicantName}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">联系电话</p>
                    <p className="font-semibold text-gray-800 mt-1">{app.applicantPhone}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">申请进度</p>
                  <div className="flex items-center">
                    {[
                      { step: 1, label: '提交申请', done: true },
                      { step: 2, label: '资质审核', done: app.status !== 'pending' },
                      { step: 3, label: '现场核验', done: app.status === 'approved' },
                      { step: 4, label: '并网完成', done: app.status === 'approved' },
                    ].map((item, index, arr) => (
                      <div key={item.step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.done ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {item.done ? <CheckCircle className="w-4 h-4" /> : item.step}
                          </div>
                          <span className={`text-xs mt-2 ${item.done ? 'text-primary-600' : 'text-gray-500'}`}>
                            {item.label}
                          </span>
                        </div>
                        {index < arr.length - 1 && (
                          <div className={`flex-1 h-1 mx-2 ${
                            arr[index + 1].done ? 'bg-primary-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {app.status === 'approved' && app.contractUrl && (
                  <div className="mt-6 p-4 bg-emerald-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-emerald-600" />
                      <div>
                        <p className="font-medium text-emerald-800">电子并网合同已生成</p>
                        <p className="text-sm text-emerald-600">点击查看并下载合同文件</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
                        <Eye className="w-4 h-4" />
                        查看
                      </button>
                      <button className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
                        <Download className="w-4 h-4" />
                        下载
                      </button>
                    </div>
                  </div>
                )}

                {app.reviewRemark && (
                  <div className={`mt-4 p-4 rounded-xl ${
                    app.status === 'approved' ? 'bg-emerald-50' : 'bg-red-50'
                  }`}>
                    <p className={`text-sm font-medium ${
                      app.status === 'approved' ? 'text-emerald-800' : 'text-red-800'
                    }`}>
                      审核意见：{app.reviewRemark}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无并网申请</h3>
            <p className="text-gray-500 mb-6">您还没有提交过并网申请，点击下方按钮开始申请</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              新建并网申请
            </button>
          </div>
        )}

        {showNewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                <h3 className="text-lg font-semibold text-gray-800">新建并网申请</h3>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">申请人姓名</label>
                    <input
                      type="text"
                      defaultValue={currentUser?.name}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">联系电话</label>
                    <input
                      type="tel"
                      defaultValue={currentUser?.phone}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">身份证号</label>
                  <input
                    type="text"
                    placeholder="请输入身份证号"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">安装地址</label>
                  <input
                    type="text"
                    defaultValue={currentStation?.location}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">装机容量(kW)</label>
                    <input
                      type="number"
                      defaultValue={currentStation?.capacity}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">电站类型</label>
                    <select
                      defaultValue={currentStation?.type}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    >
                      <option value="solar">光伏发电</option>
                      <option value="wind">风力发电</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">上传资料</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">点击或拖拽上传文件</p>
                    <p className="text-xs text-gray-400 mt-1">支持身份证、房产证明、设备合格证等</p>
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
                  onClick={() => {
                    setShowNewModal(false);
                    alert('申请已提交，预计1-3个工作日内完成审核');
                  }}
                  className="flex-1 btn-primary"
                >
                  提交申请
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
