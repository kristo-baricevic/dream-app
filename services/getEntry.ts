const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getEntry = async (id: string) => {
  const res = await fetch(`${API_URL}/api/entries/${id}/`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch entry');
  return res.json();
};
