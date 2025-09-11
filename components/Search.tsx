'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchEntries } from '@/redux/slices/journalSlice';
import type { AppDispatch } from '@/redux/store';
import { motion, AnimatePresence } from 'framer-motion';

type DreamSearch = {
  entries: string;
  title: string;
  moods: string;
  analysis: string;
};

const searchFields: (keyof DreamSearch)[] = ['entries', 'title', 'moods', 'analysis'];

const Search: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [toggleSearch, setToggleSearch] = useState(false);
  const [activeSearchFields, setActiveSearchFields] = useState<DreamSearch>({
    entries: '',
    title: '',
    moods: '',
    analysis: '',
  });

  // 🔹 Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(fetchEntries(activeSearchFields));
    }, 500);

    return () => clearTimeout(handler);
  }, [activeSearchFields, dispatch]);

  return (
    <div className="w-full">
      {!toggleSearch ? (
        <div
          onClick={() => setToggleSearch(true)}
          className="px-2 bg-slate-50 text-center py-2 border-2 border-gray-300 cursor-pointer rounded-lg w-24 mx-auto"
        >
          Search
        </div>
      ) : (
        <div>
          <div
            className="px-2 bg-slate-50 rounded-lg text-center py-2 border-2 border-gray-300 cursor-pointer w-24 mx-auto mb-4"
            onClick={() => setToggleSearch(false)}
          >
            Close
          </div>

          <AnimatePresence>
            {toggleSearch && (
              <motion.div
                className="flex flex-wrap justify-center gap-6"
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
                      value={activeSearchFields[field]}
                      onChange={(e) =>
                        setActiveSearchFields((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Search;
