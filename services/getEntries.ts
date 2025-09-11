const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getEntries = async () => {
  const res = await fetch(`${API_URL}/api/entries/`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch entries');
  return res.json();
};
