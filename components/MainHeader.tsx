'use client';

import { AnalysisData, JournalEntry } from '@/types';
import { lightenColor } from '@/utils/colorUtilities';
import {
  IconEdit,
  IconLayoutDistributeHorizontalFilled,
  IconLayoutGridFilled,
  IconLayoutListFilled,
} from '@tabler/icons-react';
// import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Search from './Search';
import NewEntryCard from './NewEntryCard';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { fetchEntries, setSearchParams } from '@/redux/slices/journalSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { DateRangePickerDisabledAfterTodayExample } from './DateRangePickerDisabledAfterTodayExample';
import { RootState } from '@/redux/rootReducer';
import useIsSmallScreen from '@/utils/isSmallScreen';

type MainHeaderProps = {
  layout: string;
  setLayout: any;
  handleOnClick: any;
  isLoadingNewEntry: boolean;
};

type DreamSearch = {
  entries: string;
  title: string;
  moods: string;
  analysis: string;
};

const searchFields: (keyof DreamSearch)[] = ['entries', 'title', 'moods', 'analysis'];

const MainHeader = ({ layout, setLayout, handleOnClick, isLoadingNewEntry }: MainHeaderProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [toggleSearch, setToggleSearch] = useState(false);

  const searchParams = useSelector((state: RootState) => state.journal.searchParams);

  const [hasInteracted, setHasInteracted] = useState(false);
  const isSmallScreen = useIsSmallScreen();

  useEffect(() => {
    if (!toggleSearch || !hasInteracted) return;

    const handler = setTimeout(() => {
      dispatch(fetchEntries(searchParams));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchParams, dispatch, toggleSearch, hasInteracted]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top row */}
      <div className="flex w-full items-center justify-between gap-2">
        {/* Left → Search toggle */}
        {!toggleSearch ? (
          <div
            onClick={() => setToggleSearch(true)}
            className="px-2 bg-slate-50 shadow-md text-center py-2 border-2 border-gray-300 cursor-pointer rounded-lg w-24"
          >
            Search
          </div>
        ) : (
          <div
            className="px-2 bg-slate-100 rounded-lg text-center py-2 border-2 border-gray-300 cursor-pointer w-24"
            onClick={() => setToggleSearch(false)}
          >
            Close
          </div>
        )}

        {/* Center → New Entry */}
        <div onClick={handleOnClick} className="cursor-pointer">
          {isLoadingNewEntry ? (
            <div className="spinner-overlay">
              <Image src="/spinner.gif" alt="Loading..." height="40" width="40" />
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <NewEntryCard />
            </div>
          )}
        </div>

        {/* Right → Layout icons */}
        <div className="flex flex-row gap-2">
          <div
            className={`shadow-md flex items-center justify-center h-12 w-12 rounded-full cursor-pointer ${
              layout === 'horizontal' ? 'bg-slate-200' : 'bg-slate-50'
            }`}
            onClick={() => setLayout('horizontal')}
          >
            <IconLayoutDistributeHorizontalFilled className="w-6 h-6" />
          </div>
          <div
            className={`shadow-md flex items-center justify-center h-12 w-12 rounded-full cursor-pointer ${
              layout === 'list' ? 'bg-slate-200' : 'bg-slate-50'
            }`}
            onClick={() => setLayout('list')}
          >
            <IconLayoutListFilled className="w-6 h-6" />
          </div>
          {!isSmallScreen && (
            <div
              className={`shadow-md flex items-center justify-center h-12 w-12 rounded-full cursor-pointer ${
                layout === 'grid' ? 'bg-slate-200' : 'bg-slate-50'
              }`}
              onClick={() => setLayout('grid')}
            >
              <IconLayoutGridFilled className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>

      {/* Animated search fields appear below */}
      <AnimatePresence>
        {toggleSearch && (
          <motion.div
            className="flex flex-wrap justify-center gap-6 mt-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {searchFields.map((field) => (
              <div key={field} className="relative">
                <label className="absolute -top-[12.5px] left-3 px-1 text-xs text-gray-600 border border-gray-300 rounded-md bg-white">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  className="rounded-lg bg-gray-200 px-2 border border-gray-300 h-10"
                  value={searchParams[field] || ''}
                  onChange={(e) => {
                    setHasInteracted(true);
                    dispatch(setSearchParams({ [field]: e.target.value }));
                  }}
                />
              </div>
            ))}

            {/* Date Picker */}
            <div className="cursor-pointer">
              <DateRangePickerDisabledAfterTodayExample />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainHeader;
