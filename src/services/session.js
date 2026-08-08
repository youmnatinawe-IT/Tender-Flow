const TOKEN_KEY = 'token';
const SESSION_EXPIRED_EVENT = 'app:session-expired';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const notifySessionExpired = () => {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};

export const onSessionExpired = (handler) => {
  window.addEventListener(SESSION_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
};
