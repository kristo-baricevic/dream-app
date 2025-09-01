export const getData = async () => {
  const res = await fetch("http://localhost:8000/api/data/", {
    credentials: "include", 
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

