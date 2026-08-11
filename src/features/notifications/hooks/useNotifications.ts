import { useCallback, useEffect, useState } from "react";
import { fetchNotificationsApi, markNotificationAsReadApi } from "../api/notificationsApi";
import type { AppNotification } from "../validation/notificationSchema";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchNotificationsApi();
      
      // Safely extract the array, whether it comes back as paginated (.content) or a flat array
      const notificationsArray = Array.isArray(data) ? data : ((data as any)?.content || []);
      
      setNotifications(notificationsArray);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load notifications", err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    loadNotifications();
    const intervalId = setInterval(loadNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [loadNotifications]);

  const markAsRead = async (id: string) => {
    try {
      // Optimistic UI update: instantly mark read on frontend for snappy UX
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'READ' } : n))
      );
      
      // Fire backend request
      await markNotificationAsReadApi(id);
    } catch (err) {
      console.error("Failed to mark as read", err);
      // If backend fails, revert the optimistic update by reloading
      loadNotifications();
    }
  };


  const unreadCount = notifications?.filter(n => n.status === 'UNREAD') || [];

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    refresh: loadNotifications
  };
};