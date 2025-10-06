// src/services/authService.js
import { api } from '../api/client';

export const authService = {
  async register(payload) {
    const { data } = await api.post('/auth/register', payload);
    // { message, accessToken, refreshToken, user }
    return data;
  },
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    // { accessToken, refreshToken, user }
    return data;
  },
  async logout() {
    const { data } = await api.post('/auth/logout');
    return data;
  },
  async refresh(refreshToken) {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    // { accessToken }
    return data;
  },
  async getCurrentUser() {
    const { data } = await api.get('/auth/me');
    // { user }
    return data;
  },
};