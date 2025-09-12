'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { AppDispatch } from '@/redux/store';
import { fetchEntries, deleteEntryThunk, createEntryThunk } from '@/redux/slices/journalSlice';
import NewEntryCard from '@/components/NewEntryCard';
import Question from '@/components/Question';
import DreamCatcher from '@/components/DreamCatcher';
import Search from './Search';
import {
  IconLayoutDistributeHorizontalFilled,
  IconLayoutGridFilled,
  IconLayoutListFilled,
} from '@tabler/icons-react';
import { RootState } from '@/redux/rootReducer';
import MainHeader from './MainHeader';

const DreamMain: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { entries, loading, pagination } = useSelector((state: RootState) => state.journal);
  const [isLoadingNewEntry, setIsLoadingNewEntry] = useState(false);
  const [layout, setLayout] = useState<string>('horizontal');

  console.log('entries from Dream Main ', entries);

  const userId = 33333;

  useEffect(() => {
    if (userId) {
      dispatch(fetchEntries({}));
    }
  }, [userId, dispatch]);

  const handleOnClick = async () => {
    setIsLoadingNewEntry(true);
    try {
      const entry = await dispatch(createEntryThunk()).unwrap();
      router.replace(`/journal/${entry.id}`);
    } finally {
      setIsLoadingNewEntry(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      dispatch(deleteEntryThunk(id));
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  return (
    <div className="flex flex-col">
      <>
        <div className="flex justify-center mb-4">
          <Question entries={entries} />
        </div>

        <MainHeader
          layout={layout}
          setLayout={setLayout}
          handleOnClick={handleOnClick}
          isLoadingNewEntry={isLoadingNewEntry}
        />

        <div className="flex flex-row justify-center py-0 mt-8">
          <DreamCatcher entries={entries} onDeleteEntry={handleDeleteEntry} layout={layout} />
        </div>
      </>
    </div>
  );
};

export default DreamMain;
