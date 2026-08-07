import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Medal, CheckCircle, MessageSquare, Megaphone, Trash2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const Notifications = () => {
  const { notifications, unreadCount, markAllAsRead, markAsRead, removeNotification } = useNotifications();
  const navigate = useNavigate();

  const handleRemove = (id, e) => {
    e.stopPropagation();
    removeNotification(id);
  };

  // Clicking a notification marks it read and, if it has a link
  // (e.g. a new discussion), takes the user straight there.
  const handleClick = (notif) => {
    markAsRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ai_insight': return <BrainCircuit className="w-5 h-5" />;
      case 'reward': return <Medal className="w-5 h-5" />;
      case 'resolved': return <CheckCircle className="w-5 h-5" />;
      case 'comment': return <MessageSquare className="w-5 h-5" />;
      case 'announcement': return <Megaphone className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getIconStyles = (type) => {
    switch (type) {
      case 'ai_insight': return 'bg-primary-container text-primary';
      case 'reward': return 'bg-secondary-container text-on-secondary-container';
      case 'resolved': return 'bg-emerald-100 text-emerald-700';
      case 'comment': return 'bg-surface-variant text-on-surface-variant';
      case 'announcement': return 'bg-surface-variant text-on-surface-variant';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const groupedNotifications = notifications.reduce((acc, notif) => {
    if (!acc[notif.dateGroup]) acc[notif.dateGroup] = [];
    acc[notif.dateGroup].push(notif);
    return acc;
  }, {});

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
            <h1 className="font-display-lg text-3xl font-bold tracking-tight text-on-surface">Notifications</h1>
            {unreadCount > 0 && (
                <span className="bg-primary text-on-primary text-sm font-bold px-3 py-1 rounded-full">
                    {unreadCount} new
                </span>
            )}
        </div>
        <button 
          onClick={markAllAsRead}
          className={`font-medium px-4 py-2 rounded-lg transition-colors duration-150 ${
            unreadCount > 0 
              ? 'text-primary hover:bg-surface-container-low active:scale-95' 
              : 'text-on-surface-variant opacity-50 cursor-not-allowed'
          }`}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-12">
        {Object.keys(groupedNotifications).length === 0 && (
            <div className="text-center text-on-surface-variant py-12">
                No notifications to display.
            </div>
        )}
        {['Today', 'Yesterday', 'This Week', 'Older'].map(group => {
          if (!groupedNotifications[group] || groupedNotifications[group].length === 0) return null;
          return (
            <section key={group} className="space-y-4">
              <h2 className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider pl-2 font-bold">{group}</h2>
              <div className="space-y-3">
                {groupedNotifications[group].map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`border rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer relative group ${
                      notif.read ? 'bg-surface-container-lowest border-outline-variant/50 opacity-70' : 
                      notif.type === 'ai_insight' ? 'bg-gradient-to-br from-[#F0F7FF] to-white border-primary/20' : 
                      'bg-surface-container-lowest border-outline-variant/50'
                    }`}
                  >
                    {!notif.read && notif.type === 'ai_insight' && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl"></div>
                    )}
                    {!notif.read && notif.type !== 'ai_insight' && (
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary"></div>
                    )}
                    
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconStyles(notif.type)}`}>
                      {getIcon(notif.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-base font-semibold text-on-surface truncate">{notif.title}</h3>
                        <span className="text-xs font-semibold text-on-surface-variant flex-shrink-0 ml-2">{notif.time}</span>
                      </div>
                      <p 
                        className="text-sm text-on-surface-variant line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: notif.message }}
                      ></p>
                      {notif.type === 'resolved' && (
                        <div className="mt-2 flex gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            Resolved
                          </span>
                        </div>
                      )}
                    </div>

                    <button 
                        onClick={(e) => handleRemove(notif.id, e)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-on-surface-variant opacity-0 group-hover:opacity-100 hover:bg-surface-variant hover:text-error transition-all"
                        aria-label="Remove notification"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
