'use client';

import { RootState } from '@/redux/rootReducer';
import { fetchAllAnalyses } from '@/redux/slices/analysisSlice';
import { AppDispatch } from '@/redux/store';
import { IconChevronLeft, IconChevronRight, IconSearch } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Analysis = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((state: RootState) => state.analysis);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchAllAnalyses({ page: 1, pageSize: 100 }));
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(fetchAllAnalyses({ page: 1, pageSize: 100, search: searchQuery }));
    setCurrentIndex(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const nextCard = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading analyses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">No analyses found</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4 py-8 flex flex-col items-center">
      {/* Search Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Search analyses..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
          >
            <IconSearch size={20} />
          </button>
        </div>
      </div>

      {/* Card Stack Container */}
      <div className="relative w-full max-w-2xl h-[600px] mb-8">
        {items.map((item, index) => {
          const offset = index - currentIndex;
          const isVisible = Math.abs(offset) <= 2;

          if (!isVisible) return null;

          return (
            <div
              key={item.id}
              className="absolute w-full transition-all duration-300 ease-out"
              style={{
                transform: `
                  translateX(${offset * 20}px) 
                  translateY(${Math.abs(offset) * 20}px) 
                  scale(${1 - Math.abs(offset) * 0.05})
                `,
                zIndex: 100 - Math.abs(offset),
                opacity: offset === 0 ? 1 : 0.5,
                pointerEvents: offset === 0 ? 'auto' : 'none',
              }}
            >
              <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-200 h-[600px] overflow-y-auto">
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {item.doctor_personality || 'General'}
                    </span>
                  </div>
                  {/* <h2 className="text-2xl font-bold text-gray-900">Dream Analysis</h2> */}
                </div>

                {/* Analysis Content - Only show on topmost card */}
                {offset === 0 && (
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {item.analysis}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <IconChevronLeft size={24} />
        </button>

        <div className="text-gray-600 font-medium min-w-[100px] text-center">
          {currentIndex + 1} / {items.length}
        </div>

        <button
          onClick={nextCard}
          disabled={currentIndex === items.length - 1}
          className="p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <IconChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Analysis;
