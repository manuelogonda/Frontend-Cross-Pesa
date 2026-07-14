import { useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { Bell, Check, Loader2 } from "lucide-react";

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, loading, markAsRead } = useNotifications();

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-red-500 rounded-full border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-20 transition-all transform origin-top-right">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <span className="font-semibold text-slate-700 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
              {loading && notifications.length === 0 ? (
                <div className="p-6 flex justify-center text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (!notifications || notifications.length === 0) ? (
                <div className="p-6 text-center text-sm text-slate-400">
                  No notifications yet.
                </div>
              )

              : (
                (notifications || []).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 flex gap-3 transition-colors ${
                      notification.status === 'UNREAD' ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className={`h-2 w-2 rounded-full ${
                        notification.status === 'UNREAD' ? 'bg-indigo-600' : 'bg-transparent'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 whitespace-normal break-words leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {notification.status === 'UNREAD' && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                        className="flex-shrink-0 p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-white border border-transparent hover:border-slate-200 transition-all self-start"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;