import api from './client';

export const createTrip = (payload) => api.post('/trips', payload).then((r) => r.data);
export const searchTrips = (params) => api.get('/trips', { params }).then((r) => r.data);
export const getMyTrips = () => api.get('/trips/mine').then((r) => r.data);
export const getTrip = (id) => api.get(`/trips/${id}`).then((r) => r.data);
export const updateTrip = (id, payload) => api.put(`/trips/${id}`, payload).then((r) => r.data);
export const cancelTrip = (id) => api.delete(`/trips/${id}`).then((r) => r.data);
export const completeTrip = (id) => api.put(`/trips/${id}/complete`).then((r) => r.data);
export const getTripMessages = (id) => api.get(`/trips/${id}/messages`).then((r) => r.data);