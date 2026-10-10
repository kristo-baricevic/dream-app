import { apiFetch } from '@/services/apiFetch';
const API_URL = '';

export const getData = async () => {
  const res = await apiFetch(`${API_URL}/api/data/`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};
