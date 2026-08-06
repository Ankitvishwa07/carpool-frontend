import api from './client';

export const getAdminUsers = (params) => api.get('/admin/users', { params }).then((r) => r.data);
export const flagUser = (id, reason) => api.put(`/admin/users/${id}/flag`, { reason }).then((r) => r.data);
export const unflagUser = (id) => api.put(`/admin/users/${id}/unflag`).then((r) => r.data);
export const disableUser = (id) => api.put(`/admin/users/${id}/disable`).then((r) => r.data);
export const enableUser = (id) => api.put(`/admin/users/${id}/enable`).then((r) => r.data);
export const getAdminAnalytics = () => api.get('/admin/analytics').then((r) => r.data);