'use client';

import { useState } from 'react';
import Link from 'next/link';
import EntryCard from './EntryCard';
import { JournalEntry } from '@/types';
import ExpandedEntryCard from './ExpandedEntryCard';

type DreamCatcherProps = {
  entries: JournalEntry[];
  onDeleteEntry: (id: string) => void;
};

const DreamCatcher: React.FC<DreamCatcherProps> = ({ entries, onDeleteEntry }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!entries || entries.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-gray-500">No entries to display</p>
      </div>
    );
  }

  const getDisplayItems = () => {
    const totalEntries = entries.length;

    if (totalEntries === 1) {
      return [{ entry: entries[0], position: 'current', index: 0 }];
    }

    if (totalEntries === 2) {
      const prevIndex = currentIndex === 0 ? 1 : 0;
      return [
        { entry: entries[prevIndex], position: 'previous', index: prevIndex },
        { entry: entries[currentIndex], position: 'current', index: currentIndex },
      ];
    }

    // For 3 or more entries
    const prevIndex = currentIndex === 0 ? totalEntries - 1 : currentIndex - 1;
    const nextIndex = currentIndex === totalEntries - 1 ? 0 : currentIndex + 1;

    return [
      { entry: entries[prevIndex], position: 'previous', index: prevIndex },
      { entry: entries[currentIndex], position: 'current', index: currentIndex },
      { entry: entries[nextIndex], position: 'next', index: nextIndex },
    ];
  };

  const handleItemClick = (index: number, position: string) => {
    if (position === 'current') {
      // Navigate to the entry page when clicking current item
      return;
    }

    // Move the clicked item to center
    setCurrentIndex(index);
  };

  const displayItems = getDisplayItems();

  return (
    <div className="flex justify-center items-center p-4 gap-8 min-h-[400px]">
      {/* Left Arrow */}
      {entries.length > 1 && (
        <button
          onClick={() =>
            setCurrentIndex(currentIndex === 0 ? entries.length - 1 : currentIndex - 1)
          }
          className="bg-white/80 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110 z-20"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Entries */}
      <div className="flex justify-center items-center gap-4">
        {displayItems.map(({ entry, position, index }) => (
          <div
            key={`${entry.id}-${position}`}
            className={`transition-all duration-300 ease-in-out ${
              position === 'current'
                ? 'scale-110 z-10 transform'
                : 'scale-75 opacity-70 hover:opacity-90 cursor-pointer'
            }`}
            onClick={() => {
              if (position !== 'current') {
                handleItemClick(index, position);
              }
            }}
          >
            {position === 'current' ? (
              <div className="transition-transform hover:scale-105">
                <ExpandedEntryCard
                  entry={entry}
                  onDelete={onDeleteEntry}
                  href={`/journal/${entry.id}`}
                  isExpanded={isExpanded}
                  onToggleExpand={() => setIsExpanded(!isExpanded)}
                  analysis={{
                    id: '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    entryId: '',
                    userId: '',
                    mood: '',
                    summary: '',
                    color: '',
                    interpretation: '',
                    negative: false,
                    subject: '',
                    sentimentScore: 0,
                  }}
                />
              </div>
            ) : (
              <div className="transition-transform hover:scale-105">
                <EntryCard
                  entry={entry}
                  onDelete={onDeleteEntry}
                  href={`/journal/${entry.id}`}
                  analysis={{
                    id: '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    entryId: '',
                    userId: '',
                    mood: '',
                    summary: '',
                    color: '',
                    interpretation: '',
                    negative: false,
                    subject: '',
                    sentimentScore: 0,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {entries.length > 1 && (
        <button
          onClick={() =>
            setCurrentIndex(currentIndex === entries.length - 1 ? 0 : currentIndex + 1)
          }
          className="bg-white/80 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110 z-20"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default DreamCatcher;
