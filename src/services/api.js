import axios from 'axios';
import { normalizeError, logError } from './errorHandler';
import { getToken, clearToken, notifySessionExpired } from './session';

const API = axios.create({
  baseURL: 'https://unprotractive-hyperpyretic-zonia.ngrok-free.dev',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '1',
  },
  timeout: 30000,
});

API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const isLoginRequest = (config) =>
  Boolean(config?.url?.includes('/auth/web/login'));

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeError(error);

    if (normalized.status === 401 && !isLoginRequest(error?.config)) {
      clearToken();
      notifySessionExpired();
    }

    if (!normalized.status || normalized.status >= 500) {
      logError(error);
    }

    return Promise.reject(normalized);
  }
);

export default API;
