import { create } from 'zustand';
import axios from 'axios';

const useRelationshipStore = create((set, get) => ({
  relationships: [],
  currentRelationship: null,
  isLoading: false,
  error: null,

  // Create relationship
  createRelationship: async (relationshipData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/relationships', relationshipData);
      const { relationship } = response.data;
      
      set(state => ({
        relationships: [relationship, ...state.relationships],
        isLoading: false
      }));
      
      return { success: true, relationship };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create relationship';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get all relationships
  getRelationships: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/relationships?${params}`);
      const { relationships } = response.data;
      
      set({ relationships, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch relationships';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get single relationship
// In your relationshipStore.js
getRelationship: async (id) => {
  const existing = get().relationships.find(r => r._id === id);
  // Show the cached copy immediately, but always refresh from the server:
  // the cache goes stale after history, type-change and breakup actions
  if (existing) {
    set({ currentRelationship: existing, error: null });
  } else {
    set({ isLoading: true, error: null });
  }
  try {
    const response = await axios.get(`/relationships/${id}`);
    const { relationship } = response.data;
    
    set(state => ({
      currentRelationship: relationship,
      relationships: state.relationships.some(r => r._id === id)
        ? state.relationships.map(r => r._id === id ? relationship : r)
        : [...state.relationships, relationship],
      isLoading: false
    }));
    
    return { success: true, relationship };
  } catch (error) {
    console.error('Error fetching relationship:', error);
    const errorMessage = error.response?.data?.message || 'Failed to fetch relationship';
    set({ error: errorMessage, isLoading: false, currentRelationship: null });
    return { success: false, error: errorMessage };
  }
},

  // Update relationship
  updateRelationship: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/relationships/${id}`, updateData);
      const { relationship } = response.data;
      
      set(state => ({
        relationships: state.relationships.map(r => 
          r._id === id ? relationship : r
        ),
        currentRelationship: state.currentRelationship?._id === id ? relationship : state.currentRelationship,
        isLoading: false
      }));
      
      return { success: true, relationship };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update relationship';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Request history access
  requestHistoryAccess: async (id) => {
    try {
      await axios.post(`/relationships/${id}/request-history-access`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to request history access';
      return { success: false, error: errorMessage };
    }
  },

  // Grant or deny history access
  grantHistoryAccess: async (id, granted = true, durationDays = null) => {
    try {
      await axios.post(`/relationships/${id}/grant-history-access`, { granted, durationDays });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update history access';
      return { success: false, error: errorMessage };
    }
  },

  // Private note: only its author can ever read it
  getPrivateNote: async (id) => {
    try {
      const response = await axios.get(`/relationships/${id}/note`);
      return { success: true, note: response.data.note };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to load the note' };
    }
  },

  savePrivateNote: async (id, text) => {
    try {
      const response = await axios.put(`/relationships/${id}/note`, { text });
      return { success: true, note: response.data.note };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to save the note' };
    }
  },

  // Request breakup
  requestBreakup: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/relationships/${id}/request-breakup`);
      const { relationship } = response.data;

      set(state => ({
        relationships: state.relationships.map(r => 
          r._id === id ? relationship : r
        ),
        currentRelationship: state.currentRelationship?._id === id ? relationship : state.currentRelationship,
        isLoading: false
      }));

      return { success: true, relationship };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to request breakup';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Confirm breakup
  confirmBreakup: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/relationships/${id}/confirm-breakup`);
      const { relationship } = response.data;

      set(state => ({
        relationships: state.relationships.map(r => 
          r._id === id ? relationship : r
        ),
        currentRelationship: state.currentRelationship?._id === id ? relationship : state.currentRelationship,
        isLoading: false
      }));

      return { success: true, relationship };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to confirm breakup';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Take back a breakup request before the other person confirms
  cancelBreakupRequest: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/relationships/${id}/cancel-breakup-request`);
      const { relationship } = response.data;

      set(state => ({
        relationships: state.relationships.map(r =>
          r._id === id ? relationship : r
        ),
        currentRelationship: state.currentRelationship?._id === id ? relationship : state.currentRelationship,
        isLoading: false
      }));

      return { success: true, relationship };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel breakup request';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Request type change
  requestTypeChange: async (id, { newType, message }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/relationships/${id}/request-type-change`, { newType, message });
      const { relationship } = response.data;
      set(state => ({
        relationships: state.relationships.map(r => r._id === id ? relationship : r),
        currentRelationship: state.currentRelationship?._id === id ? relationship : state.currentRelationship,
        isLoading: false
      }));
      return { success: true, relationship };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to request type change';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Accept type change
  acceptTypeChange: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/relationships/${id}/accept-type-change`);
      const { relationship } = response.data;
      set(state => ({
        relationships: state.relationships.map(r => r._id === id ? relationship : r),
        currentRelationship: state.currentRelationship?._id === id ? relationship : state.currentRelationship,
        isLoading: false
      }));
      return { success: true, relationship };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to accept type change';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Decline type change
  declineTypeChange: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/relationships/${id}/decline-type-change`);
      const { relationship } = response.data;
      set(state => ({
        relationships: state.relationships.map(r => r._id === id ? relationship : r),
        currentRelationship: state.currentRelationship?._id === id ? relationship : state.currentRelationship,
        isLoading: false
      }));
      return { success: true, relationship };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to decline type change';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Cancel type change (by requester)
  cancelTypeChange: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/relationships/${id}/cancel-type-change`);
      const { relationship } = response.data;
      set(state => ({
        relationships: state.relationships.map(r => r._id === id ? relationship : r),
        currentRelationship: state.currentRelationship?._id === id ? relationship : state.currentRelationship,
        isLoading: false
      }));
      return { success: true, relationship };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel type change';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Generate relationship certificate
  generateRelationshipCertificate: async (relationshipId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/certificates/relationship/${relationshipId}/generate`);
      const { certificate } = response.data;

      // Update the current relationship with the new certificate ID
      set(state => ({
        currentRelationship: state.currentRelationship?._id === relationshipId
          ? { ...state.currentRelationship, latestCertificate: certificate._id } 
          : state.currentRelationship,
        relationships: state.relationships.map(r => 
          r._id === relationshipId ? { ...r, latestCertificate: certificate._id } : r
        ),
        isLoading: false
      }));

      return { success: true, certificate };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to generate certificate';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get user history
  // getUserHistory: async (userId) => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     const response = await axios.get(`/relationships/history/${userId}`);
  //     const { history } = response.data;
  //     set({ isLoading: false }); // History is not stored in state here, but returned directly
  //     return { success: true, history };
  //   } catch (error) {
  //     const errorMessage = error.response?.data?.message || 'Failed to fetch user history';
  //     set({ error: errorMessage, isLoading: false });
  //     return { success: false, error: errorMessage };
  //   }
  // },

  // Accept relationship
  acceptRelationship: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/relationships/${id}/accept`);
      const { relationship } = response.data;
      
      set(state => ({
        relationships: state.relationships.map(r => 
          r._id === id ? relationship : r
        ),
        currentRelationship: state.currentRelationship?._id === id ? relationship : state.currentRelationship,
        isLoading: false
      }));
      
      return { success: true, relationship };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to accept relationship';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Decline relationship
  declineRelationship: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/relationships/${id}/decline`);
      const { relationship } = response.data;

      set(state => ({
        relationships: state.relationships.map(r => r._id === id ? relationship : r),
        currentRelationship: state.currentRelationship?._id === id ? relationship : state.currentRelationship,
        isLoading: false
      }));
      
      return { success: true, relationship };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to decline relationship';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete relationship
  deleteRelationship: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/relationships/${id}`);
      
      set(state => ({
        relationships: state.relationships.filter(r => r._id !== id),
        currentRelationship: state.currentRelationship?._id === id ? null : state.currentRelationship,
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete relationship';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Clear current relationship
  clearCurrentRelationship: () => set({ currentRelationship: null }),

  // Set current relationship (for direct updates without refetching)
  setCurrentRelationship: (relationship) => set({ currentRelationship: relationship }),

  // Clear error
  clearError: () => set({ error: null }),

  // Get partner
  getPartner: (relationship, currentUserId) => {
    if (relationship.initiator._id === currentUserId) {
      return relationship.partner;
    } else if (relationship.partner._id === currentUserId) {
      return relationship.initiator;
    } else {
      return null; // Should not happen if currentUserId is part of the relationship
    }
  }
}));

export default useRelationshipStore;