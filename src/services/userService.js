import API from './api';
import { normalizeError } from './errorHandler';

// 1. جلب كل المستخدمين
export const getUsers = async () => {
  const response = await API.get('/api/users');
  return response.data;
};

// 2. جلب مستخدم بواسطة الـ ID (GET /api/users/{id})
export const getUserById = async (id) => {
  try {
    const response = await API.get(`/api/users/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    const parsedError = normalizeError(error);
    return { success: false, error: parsedError };
  }
};

// 3. تعديل مستخدم بواسطة الـ ID (PUT /api/users/{id})
export const updateUser = async (id, userData) => {
  try {
    const response = await API.put(`/api/users/${id}`, userData);
    return { success: true, data: response.data };
  } catch (error) {
    const parsedError = normalizeError(error);
    return { success: false, error: parsedError };
  }
};
// قبول المستخدم وتغيير حالته إلى ACTIVE
export const acceptUser = async (id) => {
  try {
    const response = await API.put(`/api/users/accept/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    const parsedError = normalizeError(error);
    return { success: false, error: parsedError };
  }
};

// حظر المستخدم وتغيير حالته إلى BANNED مع إرسال سبب الحظر
export const banUser = async (id, message) => {
  try {
    const response = await API.put(`/api/users/ban/${id}`, {
      bann_message: message // 👈 التعديل هنا: إرسال bann_message للباك إند
    });
    return { success: true, data: response.data };
  } catch (error) {
    const parsedError = normalizeError(error);
    return { success: false, error: parsedError };
  }
};
// تعليق الحساب / إرجاع الحالة إلى معلق (PUT /api/users/resend/:id)
export const resendPendingUser = async (id) => {
  try {
    const response = await API.put(`/api/users/resend/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    const parsedError = normalizeError(error);
    return { success: false, error: parsedError };
  }
};

 
// رفض المستخدم وتغيير حالته إلى REJECTED مع إرسال سبب الرفض
export const rejectUser = async (id, reason) => {
  try {
    const response = await API.put(`/api/users/reject/${id}`, {
      reject_message: reason // 👈 التعديل هنا: استخدام reject_message
    });
    return { success: true, data: response.data };
  } catch (error) {
    const parsedError = normalizeError(error);
    return { success: false, error: parsedError };
  }
};
