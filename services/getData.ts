const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getData = async () => {
  const res = await fetch(`${API_URL}/api/data/`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};
