'use client';

import { RootState } from '@/redux/rootReducer';
import { fetchAllAnalyses } from '@/redux/slices/analysisSlice';
import { fetchAllCustomQuestions } from '@/redux/slices/customQuestionSlice';
import { AppDispatch } from '@/redux/store';
import { IconChevronLeft, IconChevronRight, IconSearch } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type ViewMode = 'analysis' | 'questions';

const Analysis = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: analysisItems,
    loading: analysisLoading,
    error: analysisError,
  } = useSelector((state: RootState) => state.analysis);

  const {
    items: questionItems,
    loading: questionLoading,
    error: questionError,
  } = useSelector((state: RootState) => state.customQuestion);

  const [viewMode, setViewMode] = useState<ViewMode>('analysis');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Get current data based on view mode
  const currentItems = viewMode === 'analysis' ? analysisItems : questionItems;
  const loading = viewMode === 'analysis' ? analysisLoading : questionLoading;
  const error = viewMode === 'analysis' ? analysisError : questionError;

  useEffect(() => {
    dispatch(fetchAllAnalyses({ page: 1, pageSize: 100 }));
    dispatch(fetchAllCustomQuestions({ page: 1, pageSize: 100 }));
  }, [dispatch]);

  const handleSearch = () => {
    if (viewMode === 'analysis') {
      dispatch(fetchAllAnalyses({ page: 1, pageSize: 100, search: searchQuery }));
    } else {
      dispatch(fetchAllCustomQuestions({ page: 1, pageSize: 100, search: searchQuery }));
    }
    setCurrentIndex(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    setCurrentIndex(0);
    setSearchQuery('');
  };

  const nextCard = () => {
    if (currentIndex < currentItems.length - 1) {
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
        <div className="text-gray-500">
          Loading {viewMode === 'analysis' ? 'analyses' : 'questions'}...
        </div>
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

  if (currentItems.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="text-gray-500">
          No {viewMode === 'analysis' ? 'analyses' : 'questions'} found
        </div>
        {/* View Toggle Buttons */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleViewChange('analysis')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              viewMode === 'analysis'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Analyses
          </button>
          <button
            onClick={() => handleViewChange('questions')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              viewMode === 'questions'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Questions
          </button>
        </div>
      </div>
    );
  }

  console.log('analysisItems', analysisItems);

  return (
    <div className="w-full h-full px-4 py-8 flex flex-col items-center">
      {/* View Toggle Buttons */}
      <div className="mb-6">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleViewChange('analysis')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              viewMode === 'analysis'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Analyses ({analysisItems.length})
          </button>
          <button
            onClick={() => handleViewChange('questions')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              viewMode === 'questions'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Questions ({questionItems.length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {/* <div className="w-full max-w-2xl mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Search ${viewMode === 'analysis' ? 'analyses' : 'questions'}...`}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
          >
            <IconSearch size={20} />
          </button>
        </div>
      </div> */}

      {/* Card Stack Container */}
      <div className="relative w-full max-w-2xl h-[600px] mb-8">
        {currentItems.map((item, index) => {
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
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Doctor:</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {item.doctor_personality || 'General'}
                      </span>
                    </div>

                    <div className="flex flex-wrap justify-end gap-1">
                      {[
                        ['Theory', item.weights.theory],
                        ['Astrology', item.weights.astrology],
                        ['Personality', item.weights.personality],
                        ['Medical', item.weights.medicalHistory],
                      ].map(([label, value]) => (
                        <span
                          key={label}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[10px] font-medium"
                        >
                          {label}: {Number(value).toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content - Only show on topmost card */}
                {offset === 0 && (
                  <div className="prose prose-gray max-w-none">
                    {viewMode === 'analysis' ? (
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {'analysis' in item && item.analysis}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Question</h3>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {'question' in item && item.question}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Answer</h3>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {'answer' in item && item.answer}
                          </p>
                        </div>
                      </div>
                    )}
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
          {currentIndex + 1} / {currentItems.length}
        </div>

        <button
          onClick={nextCard}
          disabled={currentIndex === currentItems.length - 1}
          className="p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <IconChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Analysis;
