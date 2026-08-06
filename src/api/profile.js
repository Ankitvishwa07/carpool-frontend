import api from './client';

// homeLocation/workLocation: { lat, lng, address }
// car: { hasCar, seatsAvailable, make, model, color }
export const updateProfile = (payload) => api.put('/auth/profile', payload).then((r) => r.data);
export const getUserProfile = (id) => api.get(`/users/${id}`).then((r) => r.data);