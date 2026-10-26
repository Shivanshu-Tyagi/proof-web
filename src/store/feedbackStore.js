import { create } from 'zustand';
import axios from 'axios';

const messageOf = (error, fallback) => error.response?.data?.message || fallback;
const paramsFor = (filters, page) => {
  const params = { sort: filters.sort, page };
  if (filters.type) params.type = filters.type;
  if (filters.q?.trim()) params.q = filters.q.trim();
  if (filters.mine) params.mine = 'true';
  return params;
};
const replaceItem = (items, id, patch) => items.map((i) => (i.id === id ? { ...i, ...patch } : i));

const useFeedbackStore = create((set, get) => ({
  items: [],
  total: 0,
  hasMore: false,
  canModerate: false,
  filters: { sort: 'top', type: '', q: '', mine: false },
  page: 1,
  isLoading: false,
  error: null,

  // A new list for these filters (the first page)
  load: async (filters = get().filters) => {
    set({ filters, isLoading: true, error: null, page: 1 });
    try {
      const { data } = await axios.get('/feedback', { params: paramsFor(filters, 1) });
      // Ignore an answer to an older search if the person has already changed it
      if (get().filters !== filters) return { success: true };
      set({ items: data.feedback, total: data.total, hasMore: data.hasMore, canModerate: data.canModerate, isLoading: false });
      return { success: true };
    } catch (error) {
      if (get().filters === filters) set({ isLoading: false, error: messageOf(error, 'Could not load feedback') });
      return { success: false };
    }
  },

  loadMore: async () => {
    const { filters, page, hasMore, isLoading } = get();
    if (!hasMore || isLoading) return;
    set({ isLoading: true });
    try {
      const { data } = await axios.get('/feedback', { params: paramsFor(filters, page + 1) });
      set((s) => ({ items: [...s.items, ...data.feedback.filter((n) => !s.items.some((i) => i.id === n.id))], hasMore: data.hasMore, page: page + 1, isLoading: false }));
    } catch (error) {
      set({ isLoading: false, error: messageOf(error, 'Could not load more') });
    }
  },

  // Similar posts while someone is typing a title, so they can say "me too" instead of repeating it. Does not touch the list.
  findSimilar: async (q) => {
    try {
      const { data } = await axios.get('/feedback', { params: { q, sort: 'top', match: 'any' } });
      return data.feedback.slice(0, 3);
    } catch {
      return [];
    }
  },

  create: async (payload) => {
    try {
      const { data } = await axios.post('/feedback', payload);
      set((s) => ({ items: [data.feedback, ...s.items], total: s.total + 1 }));
      return { success: true, feedback: data.feedback };
    } catch (error) {
      return { success: false, error: messageOf(error, 'Could not send your feedback. Please try again.') };
    }
  },

  // Shows the change at once, then confirms it with the server and puts it back if that fails
  toggleSupport: async (id) => {
    const before = get().items.find((i) => i.id === id);
    if (!before) return { success: false };
    const optimistic = { supported: !before.supported, supportCount: before.supportCount + (before.supported ? -1 : 1) };
    set((s) => ({ items: replaceItem(s.items, id, optimistic) }));
    try {
      const { data } = await axios.post(`/feedback/${id}/support`);
      set((s) => ({ items: replaceItem(s.items, id, { supported: data.supported, supportCount: data.supportCount }) }));
      return { success: true };
    } catch (error) {
      set((s) => ({ items: replaceItem(s.items, id, { supported: before.supported, supportCount: before.supportCount }) }));
      return { success: false, error: messageOf(error, 'Could not save that. Please try again.') };
    }
  },

  // Says "me too" on any post, whether or not it is in the list on screen (used by the "already said" hints)
  support: async (id) => {
    try {
      const { data } = await axios.post(`/feedback/${id}/support`);
      set((s) => ({ items: replaceItem(s.items, id, { supported: data.supported, supportCount: data.supportCount }) }));
      return { success: true, supported: data.supported, supportCount: data.supportCount };
    } catch (error) {
      return { success: false, error: messageOf(error, 'Could not save that. Please try again.') };
    }
  },

  remove: async (id) => {
    try {
      await axios.delete(`/feedback/${id}`);
      set((s) => ({ items: s.items.filter((i) => i.id !== id), total: Math.max(0, s.total - 1) }));
      return { success: true };
    } catch (error) {
      return { success: false, error: messageOf(error, 'Could not remove that.') };
    }
  },

  setStatus: async (id, patch) => {
    try {
      const { data } = await axios.patch(`/feedback/${id}`, patch);
      set((s) => ({ items: replaceItem(s.items, id, data.feedback) }));
      return { success: true };
    } catch (error) {
      return { success: false, error: messageOf(error, 'Could not update that.') };
    }
  },
}));

export default useFeedbackStore;
