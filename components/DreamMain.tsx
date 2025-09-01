'use client';

// import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// import { JournalEntry } from '@prisma/client';
import NewEntryCard from '@/components/NewEntryCard';
import Question from '@/components/Question';
import DreamCatcher from '@/components/DreamCatcher';
import { createNewEntry, deleteEntry } from '@/utils/api/clientApi';
import { getEntries } from '@/services/getEntries';
import Image from 'next/image';
import { JournalEntry } from '@/types';

interface DreamMainProps {
  initialEntries?: JournalEntry[];
}

const DreamMain: React.FC<DreamMainProps> = ({ initialEntries = [] }) => {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(false);
  // const { isLoaded, userId } = useAuth();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const userId = 33333;

  useEffect(() => {
    if (isLoaded && !userId) {
      router.replace('/sign-up');
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    const fetchEntries = async () => {
      if (userId) {
        try {
          const updatedEntries = await getEntries();
          setEntries(updatedEntries);
        } catch (error) {
          console.error('Failed to fetch entries:', error);
        }
      }
    };

    fetchEntries();
  }, [userId]);

  const handleOnClick = async () => {
    setIsLoading(true);
    try {
      const data = await createNewEntry();
      // const updatedEntries = await getEntries();
      // setEntries(updatedEntries);
      router.replace(`/journal/${data.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteEntry(id);
      const updatedEntries = entries.filter((entry) => entry?.id !== id);
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Failed to delete entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4">
        <Question entries={entries} />
      </div>
      <div className="flex justify-center" onClick={handleOnClick}>
        <div>
          {isLoading ? (
            <div className="spinner-overlay">
              <Image src="/spinner.gif" alt="Loading..." height="100" width="100" />
            </div>
          ) : (
            <NewEntryCard />
          )}
        </div>
      </div>
      <div className="flex justify-center">
        <DreamCatcher entries={entries} onDeleteEntry={handleDeleteEntry} />
      </div>
    </>
  );
};

export default DreamMain;