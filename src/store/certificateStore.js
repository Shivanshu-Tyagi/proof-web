import { create } from 'zustand';
import axios from 'axios';

const useCertificateStore = create((set) => ({
  certificate: null,
  certificates: [],
  isLoading: false,
  error: null,

  getCertificate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/certificates/${id}`);
      set({ certificate: response.data.certificate, isLoading: false });
      return { success: true, certificate: response.data.certificate };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch certificate';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchAllCertificates: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/certificates?${params}`);
      set({ certificates: response.data.certificates, isLoading: false });
      return { success: true, certificates: response.data.certificates };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch all certificates';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  getCertificates: async (relationshipId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/certificates/relationship/${relationshipId}`);
      set({ certificates: response.data.certificates, isLoading: false });
      return { success: true, certificates: response.data.certificates };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch certificates';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  downloadCertificate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/certificates/${id}/download`, { responseType: 'blob' }); // Important for file downloads
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${id}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Clean up

      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to download certificate';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  shareCertificate: async (id, platform) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/certificates/${id}/share`, { platform });
      set({ isLoading: false });
      return { success: true, shareUrl: response.data.shareUrl };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to share certificate';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Switch the public verify link on or off
  setCertificateSharing: async (id, isPublic) => {
    try {
      await axios.put(`/certificates/${id}/sharing`, { isPublic });
      set((state) => ({
        certificate: state.certificate?._id === id ? { ...state.certificate, sharing: { ...state.certificate.sharing, isPublic } } : state.certificate,
        certificates: state.certificates.map((c) => (c._id === id ? { ...c, sharing: { ...c.sharing, isPublic } } : c)),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update the verify link' };
    }
  },

  clearError: () => set({ error: null }),
  clearCertificate: () => set({ certificate: null }),
}));

export default useCertificateStore;