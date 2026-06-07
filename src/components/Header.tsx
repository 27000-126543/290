import { Bell, Search, Settings, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState } from 'react';

export default function Header() {
  const { currentUser, currentStation, stations, setCurrentStation, alarms } = useStore();
  const [showStationSelector, setShowStationSelector] = useState(false);

  const userStations = stations.filter((s) => s.userId === currentUser?.id);
  const unreadAlarms = alarms.filter((a) => !a.resolved).length;

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowStationSelector(!showStationSelector)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">
                {currentStation?.name || '选择电站'}
              </p>
              <p className="text-xs text-gray-500">
                {currentStation?.capacity}kW ·{' '}
                {currentStation?.type === 'solar' ? '光伏发电' : '风力发电'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showStationSelector && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="p-2">
                {userStations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => {
                      setCurrentStation(station.id);
                      setShowStationSelector(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentStation?.id === station.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-medium">{station.name}</p>
                    <p className="text-xs text-gray-500">
                      {station.capacity}kW · {station.location}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索..."
            className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-64"
          />
        </div>

        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          {unreadAlarms > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadAlarms}
            </span>
          )}
        </button>

        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
