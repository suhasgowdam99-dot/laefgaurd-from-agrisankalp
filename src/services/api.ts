import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('voltflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('voltflow_token', response.data.token);
      localStorage.setItem('voltflow_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('voltflow_token');
    localStorage.removeItem('voltflow_user');
  },
  getCurrentUser: () => JSON.parse(localStorage.getItem('voltflow_user')),
};

export const jobService = {
  getAll: () => api.get('/jobs').then(res => res.data),
  create: (data) => api.post('/jobs', data).then(res => res.data),
  update: (id, data) => api.patch(`/jobs/${id}`, data).then(res => res.data),
  getStats: () => api.get('/stats').then(res => res.data),
};

export default api;
