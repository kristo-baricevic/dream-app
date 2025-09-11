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
import Search from './Search';
import {
  IconLayoutDistributeHorizontalFilled,
  IconLayoutGridFilled,
  IconLayoutListFilled,
} from '@tabler/icons-react';

interface DreamMainProps {
  initialEntries?: JournalEntry[];
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: JournalEntry[];
}

const DreamMain: React.FC<DreamMainProps> = ({ initialEntries = [] }) => {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(false);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [paginationInfo, setPaginationInfo] = useState({
    count: 0,
    next: null,
    previous: null,
    hasNext: false,
    hasPrevious: false,
  });
  const userId = 33333;

  useEffect(() => {
    if (isLoaded && !userId) {
      router.replace('/sign-up');
    }
  }, [isLoaded, userId, router]);

  const fetchEntries = async (page = 1, pageSize = 10) => {
    try {
      const data = await getEntries();
      setEntries(data.results);

      // Store pagination info for navigation
      setPaginationInfo({
        count: data.count,
        next: data.next,
        previous: data.previous,
        hasNext: !!data.next,
        hasPrevious: !!data.previous,
      });
    } catch (error) {
      console.error('Failed to fetch entries:', error);
      setEntries([]);
    }
  };

  useEffect(() => {
    if (userId) {
      try {
        fetchEntries();
      } catch (error) {
        console.error('Failed to fetch entries:', error);
      }
    }
  }, [userId]);

  const handleOnClick = async () => {
    setIsLoading(true);
    try {
      const data = await createNewEntry();

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
    <div className="flex flex-col">
      <div className="flex justify-center mb-4">
        <Question entries={entries} />
      </div>

      <div className="flex justify-center" onClick={handleOnClick}>
        <div className="flex">
          {isLoading ? (
            <div className="spinner-overlay">
              <Image src="/spinner.gif" alt="Loading..." height="100" width="100" />
            </div>
          ) : (
            <div className="flex justify-center">
              <NewEntryCard />
            </div>
          )}
        </div>{' '}
      </div>

      <div className="flex justify-center">
        <Search />
      </div>
      <div className="flex flex-row gap-2">
        <div className="flex bg-slate-50 p-2 rounded-full cursor-pointer">
          <IconLayoutDistributeHorizontalFilled />
        </div>
        <div className="flex bg-slate-50 p-2 rounded-full cursor-pointer">
          <IconLayoutListFilled />
        </div>

        <div className="flex bg-slate-50 p-2 rounded-full cursor-pointer">
          <IconLayoutGridFilled />
        </div>
      </div>
      <div className="flex flex-row justify-center py-8">
        <DreamCatcher entries={entries} onDeleteEntry={handleDeleteEntry} />
      </div>
    </div>
  );
};

export default DreamMain;
