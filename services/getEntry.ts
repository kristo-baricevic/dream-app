export const getEntry = async (id: string) => {
  const res = await fetch(`http://127.0.0.1:8000/api/entries/${id}/`, {
    credentials: "include", // if using session cookies
  });
  if (!res.ok) throw new Error("Failed to fetch entry");
  return res.json();
};

