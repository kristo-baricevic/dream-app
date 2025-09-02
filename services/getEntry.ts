export const getEntry = async (id: string) => {
  const res = await fetch(`https://104.236.96.193/api/entries/${id}/`, {
    credentials: "include", // if using session cookies
  });
  if (!res.ok) throw new Error("Failed to fetch entry");
  return res.json();
};

