import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  ExternalLink,
  Sparkles,
  Truck,
  Store,
  Building,
  Sprout,
  Shield,
  Clock,
  CheckCircle2,
  ShoppingBag,
  Inbox
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export default function NotificationDrawer({ setActivePage }) {
  const {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const { user } = useAuth();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const getIconForNotification = (title = '', link = '') => {
    const text = (title + ' ' + link).toLowerCase();
    if (text.includes('pickup') || text.includes('delivery') || text.includes('van') || text.includes('dispatch')) {
      return <Truck className="w-4 h-4 text-emerald-700" />;
    }
    if (text.includes('waste') || text.includes('tomato') || text.includes('shopkeeper')) {
      return <Store className="w-4 h-4 text-orange-600" />;
    }
    if (text.includes('compost') || text.includes('batch') || text.includes('producer')) {
      return <Building className="w-4 h-4 text-amber-700" />;
    }
    if (text.includes('order') || text.includes('bought') || text.includes('purchased')) {
      return <ShoppingBag className="w-4 h-4 text-green-700" />;
    }
    if (text.includes('farm') || text.includes('microbe') || text.includes('soil')) {
      return <Sprout className="w-4 h-4 text-emerald-600" />;
    }
    return <Bell className="w-4 h-4 text-emerald-800" />;
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.link && setActivePage) {
      setActivePage(notification.link);
      setIsOpen(false);
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString();
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#faf8f5] h-full shadow-2xl flex flex-col justify-between border-l border-emerald-900/10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header (Theme forest green) */}
        <div className="bg-gradient-to-r from-[#14532d] to-[#0f3d21] p-5 text-white flex flex-col gap-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bell className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white tracking-tight flex items-center gap-2">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-emerald-950 font-bold text-xs shadow-xs animate-pulse">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-emerald-200">
                  Live updates for {user?.name || 'Agri Platform'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Pills & Mark All Read */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filter === 'unread'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-yellow-300 hover:text-yellow-200 flex items-center gap-1 hover:underline transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notification Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && notifications.length === 0 ? (
            <div className="text-center py-12 text-stone-500 space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs">Fetching latest updates...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
                <Inbox className="w-8 h-8 opacity-70" />
              </div>
              <h4 className="font-bold text-stone-800 text-sm">
                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                {filter === 'unread'
                  ? 'You have read all pending notifications. We will notify you when new waste is posted or compost orders arrive.'
                  : 'New collection alerts, batch updates, and farmer orders will appear here automatically.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const icon = getIconForNotification(n.title, n.link);
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group relative shadow-2xs ${
                    n.is_read
                      ? 'bg-white border-stone-200/90 text-stone-700 hover:border-emerald-300'
                      : 'bg-emerald-50/70 border-emerald-300 text-stone-900 hover:bg-emerald-50 ring-1 ring-emerald-400/30'
                  }`}
                >
                  {/* Unread indicator dot */}
                  {!n.is_read && (
                    <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-emerald-600 shadow-xs" />
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                        n.is_read
                          ? 'bg-stone-100 border-stone-200 text-stone-600'
                          : 'bg-emerald-100 border-emerald-200 text-emerald-800 shadow-2xs'
                      }`}
                    >
                      {icon}
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4
                          className={`text-xs ${
                            n.is_read ? 'font-semibold text-stone-900' : 'font-black text-emerald-950'
                          }`}
                        >
                          {n.title}
                        </h4>
                      </div>

                      <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-200/60 text-[10px] text-stone-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimestamp(n.created_at)}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          {n.link && (
                            <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-0.5">
                              <span>Open</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n.id);
                            }}
                            className="p-1 text-stone-400 hover:text-red-600 rounded transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer with Quick Tip */}
        <div className="p-4 border-t border-stone-200 bg-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Theme: Forest & Earth Circular Sync</span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
