import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const escapeHtml = (str = '') =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TYPE_MAP = {
  new_discussion: 'announcement',
  new_report: 'announcement',
  report_comment: 'comment',
  points_awarded: 'reward',
  reply: 'comment',
  mention: 'comment',
  highlight: 'reward',
  best_suggestion: 'reward',
};

const TITLE_MAP = {
  new_discussion: 'New Official Discussion',
  new_report: 'New Issue Reported',
  report_comment: 'New Comment on Your Report',
  points_awarded: 'Points Earned! 🎉',
  reply: 'New Reply',
  mention: 'You Were Mentioned',
  highlight: 'Comment Highlighted',
  best_suggestion: 'Best Suggestion! 🎉',
};

const dateGroupOf = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const startOfWeek = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);

  if (date >= startOfToday) return 'Today';
  if (date >= startOfYesterday) return 'Yesterday';
  if (date >= startOfWeek) return 'This Week';
  return 'Older';
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const group = dateGroupOf(dateStr);
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (group === 'Today') return time;
  if (group === 'Yesterday') return `Yesterday, ${time}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const toUiNotification = (n) => ({
  id: n._id,
  title: TITLE_MAP[n.type] || 'Notification',
  message: escapeHtml(n.message),
  type: TYPE_MAP[n.type] || 'comment',
  link: n.link || '',
  time: formatTime(n.createdAt),
  dateGroup: dateGroupOf(n.createdAt),
  read: n.read,
});

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications.map(toUiNotification));
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
    if (!isAuthenticated) return;
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refresh]);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.markAllNotificationsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error.message);
    }
  };

  const markAsRead = async (id) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.read) return;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.markNotificationRead(id);
    } catch (error) {
      console.error('Failed to mark as read:', error.message);
    }
  };

  const removeNotification = async (id) => {
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.read) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error.message);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAllAsRead,
      markAsRead,
      removeNotification,
      refresh,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
