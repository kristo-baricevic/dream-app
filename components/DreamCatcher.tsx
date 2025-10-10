'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import EntryCard from './EntryCard';
import { AnalysisData, JournalEntry } from '@/types';
import ExpandedEntryCard from './ExpandedEntryCard';
import useIsSmallScreen from '@/utils/isSmallScreen';
import useIsMobile from '@/utils/isMobile';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { fetchNextEntries } from '@/redux/slices/journalSlice';
import { AppDispatch } from '@/redux/store';
import LoadSentinel from './LoadSentinel';

type DreamCatcherProps = {
  entries: JournalEntry[];
  onDeleteEntry: (id: string) => void;
  layout: string;
};

const initAnalysis: AnalysisData = {
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
  doctor_personality: '',
  weights: {
    astrology: 0,
    personality: 0,
    medicalHistory: 0,
    theory: 0,
  },
  symbols: [],
};

const DreamCatcher: React.FC<DreamCatcherProps> = ({ entries, onDeleteEntry, layout }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { pagination, loading } = useSelector((s: RootState) => s.journal);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isSmallScreen = useIsSmallScreen();
  const isMobile = useIsMobile();

  const [isPrefetching, setIsPrefetching] = useState(false);

  useEffect(() => {
    const nearEnd = entries.length > 0 && currentIndex >= entries.length - 2;
    if (nearEnd && pagination.hasNext && !isPrefetching && !loading) {
      setIsPrefetching(true);
      dispatch(fetchNextEntries())
        .unwrap()
        .catch(() => {})
        .finally(() => setIsPrefetching(false));
    }
  }, [currentIndex, entries.length, pagination.hasNext, loading, dispatch, isPrefetching]);

  if (!entries || entries.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-gray-500">No entries to display</p>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="flex flex-col gap-4 p-4 mt-[60px]">
        {entries.map((entry) => (
          <ExpandedEntryCard
            key={entry.id}
            entry={entry}
            onDelete={onDeleteEntry}
            href={`/journal/${entry.id}`}
            isExpanded={expandedIds.has(entry.id)}
            onToggleExpand={() => toggleExpand(entry.id)}
            analysis={initAnalysis}
          />
        ))}

        <LoadSentinel
          hasNext={pagination.hasNext}
          onLoadMore={async () => {
            await dispatch(fetchNextEntries()).unwrap();
          }}
        />
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className="flex flex-wrap gap-4 p-4 mt-[60px] justify-center">
        {entries.map((entry) => (
          <ExpandedEntryCard
            key={entry.id}
            entry={entry}
            onDelete={onDeleteEntry}
            href={`/journal/${entry.id}`}
            isExpanded={expandedIds.has(entry.id)}
            onToggleExpand={() => toggleExpand(entry.id)}
            analysis={initAnalysis}
          />
        ))}

        <LoadSentinel
          hasNext={pagination.hasNext}
          onLoadMore={async () => {
            await dispatch(fetchNextEntries()).unwrap();
          }}
        />
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
      return;
    }
    setCurrentIndex(index);
  };

  const displayItems = getDisplayItems();

  return (
    <div
      className={`${isMobile ? '' : 'gap-8 p-4'} flex justify-center items-center min-h-[400px] mt-6`}
    >
      {/* Left Arrow */}
      {entries.length > 1 && (
        <div className={`${isMobile ? '' : ''} flex items-center justify-center h-full`}>
          <button
            onClick={() =>
              setCurrentIndex(currentIndex === 0 ? entries.length - 1 : currentIndex - 1)
            }
            className="bg-white/80 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110 z-20 mb-24"
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
        </div>
      )}

      {/* Entries */}
      <div className={`flex justify-center items-center gap-4 ${isExpanded ? 'mt-6' : ''} `}>
        {isSmallScreen ? (
          <div
            className="w-full"
            onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
            onTouchEnd={async (e) => {
              if (touchStart === null) return;
              const diff = e.changedTouches[0].clientX - touchStart;

              if (diff > 50) {
                // swipe right (previous)
                setCurrentIndex(currentIndex === 0 ? entries.length - 1 : currentIndex - 1);
              } else if (diff < -50) {
                // swipe left (next)
                const atLast = currentIndex === entries.length - 1;

                if (atLast && pagination.hasNext && !isLoadingMore && !loading) {
                  try {
                    setIsLoadingMore(true);
                    await dispatch(fetchNextEntries()).unwrap();
                    setCurrentIndex((prev) => prev + 1);
                  } catch (err) {
                    console.error('Failed to load next page:', err);
                    setCurrentIndex(0);
                  } finally {
                    setIsLoadingMore(false);
                  }
                } else {
                  setCurrentIndex(currentIndex === entries.length - 1 ? 0 : currentIndex + 1);
                }
              }
              setTouchStart(null);
            }}
          >
            <ExpandedEntryCard
              key={entries[currentIndex].id}
              entry={entries[currentIndex]}
              onDelete={onDeleteEntry}
              href={`/journal/${entries[currentIndex].id}`}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(!isExpanded)}
              analysis={initAnalysis}
            />
          </div>
        ) : (
          displayItems.map(({ entry, position, index }) => (
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
                    analysis={initAnalysis}
                  />
                </div>
              ) : (
                <div className="transition-transform hover:scale-105">
                  <EntryCard
                    entry={entry}
                    onDelete={onDeleteEntry}
                    href={`/journal/${entry.id}`}
                    analysis={initAnalysis}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Right Arrow */}
      {entries.length > 1 && (
        <button
          onClick={async () => {
            const atLast = currentIndex === entries.length - 1;

            if (!atLast) {
              setCurrentIndex((i) => i + 1);
              return;
            }

            // at end:
            if (pagination.hasNext) {
              // if prefetch already appended, just move forward
              if (!isPrefetching && entries.length > currentIndex + 1) {
                setCurrentIndex((i) => i + 1);
                return;
              }
              // fallback: fetch now if prefetch didn't land yet
              try {
                await dispatch(fetchNextEntries()).unwrap();
                setCurrentIndex((i) => i + 1);
              } catch {
                // optional: wrap if fetch fails
                setCurrentIndex(0);
              }
            } else {
              // no more pages: keep your wrap behavior
              setCurrentIndex(0);
            }
          }}
          className="bg-white/80 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110 z-20 mb-24"
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
