export const getData = async () => {
  const res = await fetch("http://127.0.0.1:8000/api/data/", {
    credentials: "include", 
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};
