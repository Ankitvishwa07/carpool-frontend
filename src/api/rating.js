import api from './client';

export const submitRating = (payload) => api.post('/ratings', payload).then((r) => r.data);
export const getUserRatings = (userId) => api.get(`/ratings/user/${userId}`).then((r) => r.data);