export const getData = async () => {
  const res = await fetch("https://104.236.96.193/api/data/", {
    credentials: "include", 
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

