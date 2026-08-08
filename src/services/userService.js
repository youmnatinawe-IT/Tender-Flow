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

// حظر المستخدم وتغيير حالته إلى BANNED
export const banUser = async (id) => {
  try {
    const response = await API.put(`/api/users/ban/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    const parsedError = normalizeError(error);
    return { success: false, error: parsedError };
  }
};