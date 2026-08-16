import API from './api';
import { normalizeError } from './errorHandler';

/**
 * 1. إنشاء مؤسسة ناشرة جديدة (Multipart Form-Data)
 * POST /api/orgs/publisher
 */
export const createPublisherOrg = async (formData) => {
  try {
    const response = await API.post('/api/orgs/publisher', formData, {
      headers: { 'Content-Type': undefined },
    });
    return { success: true, data: response.data };
  } catch (error) {
    const parsedError = normalizeError(error);
    return { success: false, error: parsedError };
  }
};

/**
 * 2. جلب كافة المنظمات الناشرة
 * GET /api/orgs/publishers
 */
export const getPublisherOrgs = async () => {
  try {
    const response = await API.get('/api/orgs/publishers');
    return { success: true, data: response.data };
  } catch (error) {
    const parsedError = normalizeError(error);
    return { success: false, error: parsedError };
  }
};

/**
 * 3. جلب كافة المنظمات المنفذة
 * GET /api/orgs/executors
 */
export const getExecutorOrgs = async () => {
  try {
    const response = await API.get('/api/orgs/executors');
    return { success: true, data: response.data };
  } catch (error) {
    const parsedError = normalizeError(error);
    return { success: false, error: parsedError };
  }
};

/**
 * 4. إنشاء حساب أدمن للمؤسسة (JSON)
 * POST /api/users
 */
export const createAdminUser = async (userData) => {
  try {
    const response = await API.post("/api/users", userData);
    return { success: true, data: response.data };
  } catch (error) {
    const parsedError = normalizeError(error);
    return { success: false, error: parsedError };
  }
};
/**
 * جلب تفاصيل منظمة محددة بواسطة المعرّف (id)
 * GET /api/orgs/:id
 */
export const getOrgById = async (id) => {
  try {
    const response = await API.get(`/api/orgs/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    const parsedError = normalizeError(error);
    return { success: false, error: parsedError };
  }
};
/**
 * جلب كل المستخدمين التابعين لمنظمة محددة بواسطة الـ ID
 * GET /api/orgs/:id/users
 */
export const getOrgUsers = async (id) => {
  try {
    const response = await API.get(`/api/orgs/${id}/users`);
    return { success: true, data: response.data };
  } catch (error) {
    const parsedError = normalizeError(error);
    return { success: false, error: parsedError };
  }
};
