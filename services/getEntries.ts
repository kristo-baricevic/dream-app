export const getEntries = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/entries/", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch entries");
    return res.json();
  };