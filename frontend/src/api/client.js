// src/api/client.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // set true only if you use cookies
});

// Token helpers (localStorage for now)
const getAccessToken = () => window.localStorage.getItem('accessToken');
const getRefreshToken = () => window.localStorage.getItem('refreshToken');
const setAccessToken = (t) => window.localStorage.setItem('accessToken', t);
const clearTokens = () => {
  window.localStorage.removeItem('accessToken');
  window.localStorage.removeItem('refreshToken');
};

// Attach Authorization header
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let queued = [];
const queue = (cb) => queued.push(cb);
const flush = (newToken) => {
  queued.forEach((cb) => cb(newToken));
  queued = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // wait until refresh completes
        return new Promise((resolve, reject) => {
          queue((newToken) => {
            if (!newToken) return reject(error);
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(original));
          });
        });
      }

      try {
        isRefreshing = true;
        // use raw axios to avoid interceptor recursion
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const newAccess = data?.accessToken;
        if (!newAccess) throw new Error('No access token from refresh');

        setAccessToken(newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        flush(newAccess);
        return api(original);
      } catch (e) {
        clearTokens();
        flush(null);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);