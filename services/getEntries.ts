import { apiFetch } from '@/services/apiFetch';
const API_URL = '';

export const getEntries = async () => {
  const res = await apiFetch(`${API_URL}/api/entries/`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch entries');
  return res.json();
};
