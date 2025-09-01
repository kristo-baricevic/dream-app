'use client'

import { redirect } from "next/navigation";
import DreamMain from "@/components/DreamMain";
import { getEntries } from "@/services/getEntries";
import { useEffect, useState } from "react";
// import { getUserByClerkID } from "@/app/api/auth/getUserByClerkID";

export default function JournalPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchEntries = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/entries/`,
            { credentials: 'include' }
          );
          if (!res.ok) throw new Error('Failed to fetch entries');
          const data = await res.json();
          setEntries(data);
        } catch (err: any) {
          console.error(err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
    //   fetchEntries();
    }, []);
  
    // if (loading) return <p>Loading entries...</p>;
    // if (error) return <p className="text-red-500">Error: {error}</p>;
  
    return (
        <div className="px-10">
            <div className="flex flex-col">
                <DreamMain initialEntries={entries} />
            </div>
        </div>
    );
  }
  