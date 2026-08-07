import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const initialNotifications = [
  {
    id: 1,
    title: 'AI Insight: Critical Issue Detected',
    time: '10:45 AM',
    message: 'Our predictive model has flagged a high probability of localized flooding in Ward 12 based on recent drainage blockage reports. Pre-emptive action recommended.',
    type: 'ai_insight',
    dateGroup: 'Today',
    read: false,
  },
  {
    id: 2,
    title: 'Reward Earned',
    time: '9:12 AM',
    message: 'Congratulations! You earned <strong class="text-primary font-semibold">+50 XP</strong> for your verified report on pothole repairs.',
    type: 'reward',
    dateGroup: 'Today',
    read: false,
  },
  {
    id: 3,
    title: 'Issue Resolved',
    time: 'Yesterday, 3:30 PM',
    message: 'Your report regarding the broken street light on Main St has been marked as resolved by the municipal authority.',
    type: 'resolved',
    dateGroup: 'Yesterday',
    read: false,
  },
  {
    id: 4,
    title: 'New Comment',
    time: 'Yesterday, 11:05 AM',
    message: '<strong>Sarah K.</strong> commented on your post "Community Clean-up Drive": "I\'ll be there with extra trash bags!"',
    type: 'comment',
    dateGroup: 'Yesterday',
    read: true,
  },
  {
    id: 5,
    title: 'Community Announcement',
    time: 'Mon, 9:00 AM',
    message: 'Town hall meeting scheduled for this Friday. Topic: Upcoming smart city infrastructure developments.',
    type: 'announcement',
    dateGroup: 'This Week',
    read: true,
  }
];

export const NotificationProvider = ({ children }) => {
  // Load from local storage or use initial
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('nagarbondhu_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialNotifications;
      }
    }
    return initialNotifications;
  });

  // Save to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('nagarbondhu_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)));
  };
  
  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const addNotification = (notif) => {
    setNotifications(prev => [{
      id: Date.now(), // Generate unique ID
      dateGroup: 'Today',
      read: false,
      ...notif
    }, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAllAsRead,
      markAsRead,
      removeNotification,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
