import { serverFetch } from '@/services/serverFetch';
const API_URL = '';

export const getEntry = async (id: string) => {
  const res = await serverFetch(`${API_URL}/api/entries/${id}/`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch entry');
  return res.json();
};
