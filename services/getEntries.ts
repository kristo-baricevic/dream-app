export const getEntries = async () => {
    const res = await fetch("https://104.236.96.193/api/entries/", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch entries");
    return res.json();
  };