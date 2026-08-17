import API from './api';

export const getAllTenders = async () => {
  const response = await API.get('/api/tenders/all');
  return Array.isArray(response.data) ? response.data : response.data.data || [];
};