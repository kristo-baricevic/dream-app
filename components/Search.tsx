'use client';

import { useState } from 'react';

type SearchProps = {};

type DreamSearch = {
  entries: string;
  title: string;
  moods: string;
  analysis: string;
};

const searchFields: (keyof DreamSearch)[] = ['entries', 'title', 'moods', 'analysis'];

const Search: React.FC<SearchProps> = () => {
  const [toggleSearch, setToggleSearch] = useState<Boolean>(false);
  const [activeSearchFields, setActiveSearchFields] = useState<DreamSearch>({
    entries: '',
    title: '',
    moods: '',
    analysis: '',
  });

  return (
    <>
      {!toggleSearch ? (
        <div>
          <div
            onClick={() => {
              setToggleSearch(true);
            }}
            className="px-2 bg-slate-50 text-center py-2 border-2 border-gray-300 cursor-pointer rounded-lg w-24"
          >
            Search
          </div>
        </div>
      ) : (
        <div className="flex justify-center mb-24 space-x-6">
          <div
            className="px-2 bg-slate-50 rounded-lg text-center py-2 border-2 border-gray-300 cursor-pointer"
            onClick={() => {
              setToggleSearch(false);
            }}
          >
            Close
          </div>
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
        </div>
      )}
    </>
  );
};

export default Search;
