import api from './client';

export const createRequest = (param) => {
  const payload = typeof param === 'object' && param !== null ? param : { tripId: param };
  return api.post('/requests', payload).then((r) => r.data);
};
export const acceptRequest = (id) => api.put(`/requests/${id}/accept`).then((r) => r.data);
export const declineRequest = (id) => api.put(`/requests/${id}/decline`).then((r) => r.data);
export const cancelRequest = (id) => api.put(`/requests/${id}/cancel`).then((r) => r.data);
export const getIncomingRequests = () => api.get('/requests/incoming').then((r) => r.data);
export const getMyRequests = () => api.get('/requests/mine').then((r) => r.data);