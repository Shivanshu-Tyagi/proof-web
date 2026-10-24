import { create } from 'zustand';
import axios from 'axios';

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Get notifications
  getNotifications: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/notifications?${params}`);
      const { notifications, unreadCount } = response.data;
      
      set({ notifications, unreadCount, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch notifications';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await axios.get('/notifications/unread-count');
      const { unreadCount } = response.data;
      
      set({ unreadCount });
      return { success: true, unreadCount };
    } catch {
      return { success: false, error: 'Failed to fetch unread count' };
    }
  },

  // Mark as read
  markAsRead: async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      
      set(state => ({
        notifications: state.notifications.map(n => 
          n._id === id ? { ...n, status: 'read', readAt: new Date() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to mark as read';
      return { success: false, error: errorMessage };
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      await axios.put('/notifications/mark-all-read');
      
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, status: 'read', readAt: new Date() })),
        unreadCount: 0
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to mark all as read';
      return { success: false, error: errorMessage };
    }
  },

  // Delete notification
  deleteNotification: async (id) => {
    try {
      await axios.delete(`/notifications/${id}`);
      
      set(state => {
        const notification = state.notifications.find(n => n._id === id);
        const wasUnread = notification?.status === 'unread';
        
        return {
          notifications: state.notifications.filter(n => n._id !== id),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete notification';
      return { success: false, error: errorMessage };
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useNotificationStore;