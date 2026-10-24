import { create } from 'zustand';
import axios from 'axios';

const useTermStore = create((set) => ({
  terms: [],
  currentTerm: null,
  isLoading: false,
  error: null,

  // Create term
  createTerm: async (termData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/terms', termData);
      const { term } = response.data;
      
      set(state => ({
        terms: [term, ...state.terms],
        isLoading: false
      }));
      
      return { success: true, term };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create term';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get terms
  getTerms: async (relationshipId, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/terms/relationship/${relationshipId}?${params}`);
      const { terms } = response.data;
      
      set({ terms, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch terms';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get all terms (for main terms page)
  getAllTerms: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/terms?${params}`);
      const { terms } = response.data;
      
      set({ terms, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch terms';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get single term
  getTerm: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/terms/${id}`);
      const { term } = response.data;
      
      set({ currentTerm: term, isLoading: false });
      return { success: true, term };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch term';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Agree to term
  agreeTerm: async (id, signature) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/terms/${id}/agree`, { signature });
      const { term } = response.data;
      
      set(state => ({
        terms: state.terms.map(t => 
          t._id === id ? term : t
        ),
        currentTerm: state.currentTerm?._id === id ? term : state.currentTerm,
        isLoading: false
      }));
      
      return { success: true, term };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to agree to term';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update term
  updateTerm: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/terms/${id}`, updateData);
      const { term } = response.data;
      
      set(state => ({
        terms: state.terms.map(t => 
          t._id === id ? term : t
        ),
        currentTerm: state.currentTerm?._id === id ? term : state.currentTerm,
        isLoading: false
      }));
      
      return { success: true, term };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update term';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete term
  deleteTerm: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/terms/${id}`);
      
      set(state => ({
        terms: state.terms.filter(t => t._id !== id),
        currentTerm: state.currentTerm?._id === id ? null : state.currentTerm,
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete term';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Report violation
  reportViolation: async (id, violationData) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`/terms/${id}/violation`, violationData);
      
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to report violation';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Clear current term
  clearCurrentTerm: () => set({ currentTerm: null }),

  // Clear error
  clearError: () => set({ error: null })
}));

export default useTermStore;