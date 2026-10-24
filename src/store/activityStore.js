import { create } from 'zustand';
import axios from 'axios';

const useActivityStore = create((set) => ({
  activities: [],
  currentActivity: null,
  isLoading: false,
  error: null,

  // Create activity
  createActivity: async (activityData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/activities/', activityData);
      const { activity } = response.data;

      set(state => ({
        activities: [activity, ...state.activities],
        isLoading: false
      }));

      return { success: true, activity };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create activity';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get activities for a specific relationship
  getActivities: async (relationshipId, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/activities/relationship/${relationshipId}?${params}`);
      const { activities } = response.data;

      set({ activities, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch activities';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get all activities for current user across accepted relationships
  getAllActivities: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/activities/mine?${params}`);
      const { activities } = response.data;

      set({ activities, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch activities';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get single activity
  getActivity: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/activities/${id}`);
      const { activity } = response.data;

      set({ currentActivity: activity, isLoading: false });
      return { success: true, activity };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch activity';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update activity
  updateActivity: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/activities/${id}`, updateData);
      const { activity } = response.data;

      set(state => ({
        activities: state.activities.map(a => 
          a._id === id ? activity : a
        ),
        currentActivity: state.currentActivity?._id === id ? activity : state.currentActivity,
        isLoading: false
      }));

      return { success: true, activity };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update activity';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete activity
  deleteActivity: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/activities/${id}`);

      set(state => ({
        activities: state.activities.filter(a => a._id !== id),
        currentActivity: state.currentActivity?._id === id ? null : state.currentActivity,
        isLoading: false
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete activity';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Add reaction
  addReaction: async (id, reactionType) => {
    try {
      const response = await axios.post(`/activities/${id}/reaction`, { type: reactionType });
      const { reactions } = response.data;

      set(state => ({
        activities: state.activities.map(a => 
          a._id === id ? { ...a, reactions } : a
        ),
        currentActivity: state.currentActivity?._id === id 
          ? { ...state.currentActivity, reactions } 
          : state.currentActivity
      }));

      return { success: true, reactions };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add reaction';
      return { success: false, error: errorMessage };
    }
  },

  // Add comment
  addComment: async (id, text) => {
    try {
      const response = await axios.post(`/activities/${id}/comment`, { text });
      const { comments } = response.data;

      set(state => ({
        activities: state.activities.map(a => 
          a._id === id ? { ...a, comments } : a
        ),
        currentActivity: state.currentActivity?._id === id 
          ? { ...state.currentActivity, comments } 
          : state.currentActivity
      }));

      return { success: true, comments };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add comment';
      return { success: false, error: errorMessage };
    }
  },

  // Clear current activity
  clearCurrentActivity: () => set({ currentActivity: null }),

  // Clear error
  clearError: () => set({ error: null })
}));

export default useActivityStore;
