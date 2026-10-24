import { create } from 'zustand';
import axios from 'axios';

const useMilestoneStore = create((set) => ({
  milestones: [],
  currentMilestone: null,
  isLoading: false,
  error: null,

  // Create milestone
  createMilestone: async (milestoneData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/milestones', milestoneData);
      const { milestone } = response.data;
      
      set(state => ({
        milestones: [milestone, ...state.milestones],
        isLoading: false
      }));
      
      return { success: true, milestone };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create milestone';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get milestones
  getAllMilestones: async (relationshipId, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/milestones/relationship/${relationshipId}?${params}`);
      const { milestones } = response.data;
      
      set({ milestones, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch milestones';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get single milestone
  getMilestone: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/milestones/${id}`);
      const { milestone } = response.data;
      
      set({ currentMilestone: milestone, isLoading: false });
      return { success: true, milestone };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch milestone';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Complete milestone
  completeMilestone: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/milestones/${id}/complete`);
      const { milestone } = response.data;
      
      set(state => ({
        milestones: state.milestones.map(m => 
          m._id === id ? milestone : m
        ),
        currentMilestone: state.currentMilestone?._id === id ? milestone : state.currentMilestone,
        isLoading: false
      }));
      
      return { success: true, milestone };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to complete milestone';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update milestone
  updateMilestone: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/milestones/${id}`, updateData);
      const { milestone } = response.data;
      
      set(state => ({
        milestones: state.milestones.map(m => 
          m._id === id ? milestone : m
        ),
        currentMilestone: state.currentMilestone?._id === id ? milestone : state.currentMilestone,
        isLoading: false
      }));
      
      return { success: true, milestone };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update milestone';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete milestone
  deleteMilestone: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/milestones/${id}`);
      
      set(state => ({
        milestones: state.milestones.filter(m => m._id !== id),
        currentMilestone: state.currentMilestone?._id === id ? null : state.currentMilestone,
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete milestone';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Add evidence
  addEvidence: async (id, evidenceData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/milestones/${id}/evidence`, evidenceData);
      const { milestone } = response.data;
      
      set(state => ({
        milestones: state.milestones.map(m => 
          m._id === id ? milestone : m
        ),
        currentMilestone: state.currentMilestone?._id === id ? milestone : state.currentMilestone,
        isLoading: false
      }));
      
      return { success: true, milestone };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add evidence';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Clear current milestone
  clearCurrentMilestone: () => set({ currentMilestone: null }),

  // Clear error
  clearError: () => set({ error: null })
}));

export default useMilestoneStore;