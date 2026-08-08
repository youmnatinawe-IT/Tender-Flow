import axios from 'axios';

const API = axios.create({
  baseURL: 'https://unprotractive-hyperpyretic-zonia.ngrok-free.dev',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '1',
  },
});

// إضافة interceptor لإرفاق التوكن تلقائياً قبل إرسال أي طلب
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // أو اسم المفتاح المخزن لديكِ
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;