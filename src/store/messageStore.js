import { create } from 'zustand';
import axios from 'axios';

const messageOf = (error, fallback) => error.response?.data?.message || fallback;

const useMessageStore = create((set, get) => ({
  threads: [],
  unreadTotal: 0,
  thread: null, // { relationship, messages, hasMore } for the open conversation
  isLoading: false,
  sending: false,
  error: null,

  loadThreads: async () => {
    try {
      const { data } = await axios.get('/messages');
      set({ threads: data.threads, unreadTotal: data.unreadTotal });
      return { success: true };
    } catch (error) {
      set({ error: messageOf(error, 'Could not load your messages') });
      return { success: false };
    }
  },

  // quiet = background refresh: no spinner, and a failure keeps what is on screen
  openThread: async (relationshipId, { quiet = false } = {}) => {
    if (!quiet) set({ isLoading: true, error: null, thread: null });
    try {
      const { data } = await axios.get(`/messages/${relationshipId}`);
      const previous = get().thread;
      // Keep older pages that were already loaded
      const older = previous?.relationship?.id === data.relationship.id
        ? previous.messages.filter((m) => new Date(m.createdAt) < new Date(data.messages[0]?.createdAt ?? 0))
        : [];
      set({ thread: { relationship: data.relationship, messages: [...older, ...data.messages], hasMore: older.length ? previous.hasMore : data.hasMore }, isLoading: false });
      return { success: true };
    } catch (error) {
      if (!quiet) set({ isLoading: false, thread: null, error: messageOf(error, 'Could not open this conversation') });
      return { success: false };
    }
  },

  loadOlder: async (relationshipId) => {
    const { thread } = get();
    if (!thread?.hasMore || !thread.messages.length) return;
    try {
      const { data } = await axios.get(`/messages/${relationshipId}`, { params: { before: thread.messages[0].createdAt } });
      set({ thread: { ...thread, messages: [...data.messages, ...thread.messages], hasMore: data.hasMore } });
    } catch { /* leave the button so they can try again */ }
  },

  markRead: async (relationshipId) => {
    try {
      await axios.post(`/messages/${relationshipId}/read`);
      get().loadThreads();
    } catch { /* the badge will catch up on the next refresh */ }
  },

  sendMessage: async (relationshipId, text) => {
    if (get().sending) return { success: false, ignored: true };
    set({ sending: true });
    try {
      const { data } = await axios.post(`/messages/${relationshipId}`, { text });
      set((s) => ({ sending: false, thread: s.thread ? { ...s.thread, messages: [...s.thread.messages, data.message] } : s.thread }));
      get().loadThreads();
      return { success: true };
    } catch (error) {
      set({ sending: false });
      return { success: false, error: messageOf(error, 'Could not send. Check your connection and try again.') };
    }
  },
}));

export default useMessageStore;
