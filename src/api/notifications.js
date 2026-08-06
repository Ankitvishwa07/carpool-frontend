import api from './client';

export const getMyNotifications = (params) => api.get('/notifications/mine', { params }).then((r) => r.data);
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`).then((r) => r.data);
export const markAllNotificationsRead = () => api.put('/notifications/read-all').then((r) => r.data);