import API from './api'; // أو المسار الصحيح لملف axios عندك

export const getUsers = async () => {
  const response = await API.get('/api/users');
  return response.data;
};