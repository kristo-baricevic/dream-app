'use client';

import { generateDream } from '@/utils/api/clientApi';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { deleteEntry } from '@/utils/api/clientApi';
import { EmotionType } from '@/utils/parameters/emotions';
import { moodObject } from '@/constants/moodObject';
import { dreamTopics } from '@/constants/dreamTopic';
import { fetchEntries, updateEntryThunk } from '@/redux/slices/journalSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { IconChevronLeft, IconChevronRight, IconSparkles, IconTrash } from '@tabler/icons-react';
import { RootState } from '@/redux/rootReducer';
import BasicModal from './BasicModal';
import ReactDOM from 'react-dom';

const Editor = ({ entry }: any) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [value, setValue] = useState(entry?.content);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(entry?.analysis || {});
  const [mood, setMood] = useState<EmotionType>('Joy');
  const settings = useSelector((state: RootState) => state.settings);
  const {
    mood: analysisMood,
    summary,
    color,
    interpretation,
    symbols,
    subject,
    negative,
  } = analysis || {};

  console.log('entry is ', entry);

  const normalizeSymbolText = (symbols: any) => (Array.isArray(symbols) ? symbols.join(', ') : '');

  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const { entries, loading } = useSelector((s: RootState) => s.journal);

  useEffect(() => {
    if (!entries || entries.length === 0) {
      dispatch(fetchEntries({ pageSize: 100 }));
    }
  }, [dispatch, entries?.length]);

  const { currentIndex, prevEntry, nextEntry } = useMemo(() => {
    const idx = entries?.findIndex((e) => e.id === entry?.id) ?? -1;
    if (!entries || entries.length === 0 || idx === -1) {
      return { currentIndex: -1, prevEntry: null, nextEntry: null };
    }
    const prev = entries[(idx - 1 + entries.length) % entries.length];
    const next = entries[(idx + 1) % entries.length];
    return { currentIndex: idx, prevEntry: prev, nextEntry: next };
  }, [entries, entry?.id]);

  const goPrev = () => {
    if (prevEntry) router.replace(`/journal/${prevEntry.id}`);
  };

  const goNext = () => {
    if (nextEntry) router.replace(`/journal/${nextEntry.id}`);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const data = await dispatch(
        updateEntryThunk({
          id: entry.id,
          content: value,
          mood,
          settings,
        })
      ).unwrap();

      if (data && data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Failed to save entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    const randomNumber2 = Math.floor(Math.random() * 100) + 1;
    const randomNumber3 = Math.floor(Math.random() * 100) + 1;
    const randomNumber4 = Math.floor(Math.random() * 100) + 1;
    const selectedMood = moodObject[randomNumber];
    const selectedMood2 = moodObject[randomNumber2];
    const selectedTopic = dreamTopics[randomNumber3];
    const selectedTopic2 = dreamTopics[randomNumber4];

    const prompt = `Please make up a dream. Imagine you are a person who has been experiencing moods like ${selectedMood} and ${selectedMood2}. Based on the value of ${randomNumber}, decide whether it will be a good dream or bad dream. If ${randomNumber} is greater than or equal to 70, it will be a good dream. It ${randomNumber} is less than 70 it will be a bad dream. The dream should be about the topics ${selectedTopic} and ${selectedTopic2}. Use the moods ${selectedMood} and ${selectedMood2} to guide you in how you incorporate the topics. If the moods are opposite, write about the conflict. Try to let the mood really come through in the writing. You are a human that is having these moods bubble to the surface through their dream. Use modern references! When you respond with the dream, do not respond by acknowledging this prompt. Just begin writing the dream immediately. But do not write "dear journal" or any introduction at all. Just start writing. Be action-oriented in your writing. You are a just trying to get it all down. Write 4 or 5 paragraphs. Don't be overly decorative in your word choice.`;

    try {
      const res = await generateDream(prompt);
      setValue(res);
    } catch (error) {
      console.error('Failed to generate dream:', error);
      setValue('There has been an error!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEntry(entry.id);
      router.push('/journal');
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  return (
    <div className="w-full h-full px-4 py-8 flex flex-col items-center">
      {/* Card Container */}
      <div className="relative w-full max-w-4xl mb-8">
        {/* Background shadow cards for visual depth */}
        <div
          className="absolute w-full transition-all duration-300"
          style={{
            transform: 'translateX(20px) translateY(20px) scale(0.95)',
            zIndex: 1,
            opacity: 0.3,
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 h-[700px]" />
        </div>

        <div
          className="absolute w-full transition-all duration-300"
          style={{
            transform: 'translateX(10px) translateY(10px) scale(0.975)',
            zIndex: 2,
            opacity: 0.5,
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 h-[700px]" />
        </div>

        {/* Main Card */}
        <div className="relative z-10 bg-white rounded-xl shadow-2xl p-6 border border-gray-200 h-[700px] overflow-y-auto">
          {/* Header */}
          <div className="flex sm:flex-row flex-col justify-between items-start mb-6 pb-4 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500">
                {new Date(entry?.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {subject && <h2 className="text-2xl font-semibold text-gray-900 mt-2">{subject}</h2>}
            </div>
            <div className="flex flex-col">
              <div className="flex gap-2 sm:mt-0 mt-2">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-gray-900 rounded-lg hover:bg-pink-500 hover:text-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconSparkles size={18} />
                  Generate Dream
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-400 text-gray-900 rounded-lg hover:bg-green-500 hover:text-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Analyze
                </button>
              </div>{' '}
              <div className="flex border-none sm:justify-end justify-start items-start mt-2 border-b border-gray-200">
                <span className="text-xs text-gray-500 mr-2 mt-[2px]">Doctor:</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {entry?.analysis?.doctor_personality || 'Academic'}
                </span>
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20 rounded-xl">
              <Image src="/spinner.gif" alt="Loading..." height="100" width="100" />
            </div>
          )}

          {/* Content Area */}
          <div className="space-y-6">
            {/* Text Editor */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Dream Entry</h3>
              <textarea
                className="w-full h-[350px] px-4 py-3 bg-slate-50 text-base resize-none border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Write or generate your dream here..."
              />
            </div>

            {/* Analysis Results */}
            {analysis && Object.keys(analysis).length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Dream Analysis</h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Color Analysis */}
                  {color && (
                    <div className="col-span-2 flex items-center gap-4 p-4 rounded-lg border-2 bg-slate-100 border-gray-200">
                      <div
                        className="w-16 h-16 flex-shrink-0 rounded-full shadow-md border-2 border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700">Color Analysis</p>
                        <p className="text-xs text-gray-500">Emotional tone represented by color</p>
                      </div>
                    </div>
                  )}

                  {/* Mood */}
                  {analysisMood && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Mood</p>
                      <p className="text-sm text-blue-800">{analysisMood}</p>
                    </div>
                  )}

                  {/* Dream Type */}
                  {negative !== undefined && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs font-semibold text-purple-900 mb-1">Dream Type</p>
                      <p className="text-sm text-purple-800">{negative ? 'Bad 😔' : 'Good 🙂'}</p>
                    </div>
                  )}

                  {/* Summary */}
                  {summary && (
                    <div className="col-span-2 p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Summary</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
                    </div>
                  )}

                  {/* Symbols */}
                  {symbols && normalizeSymbolText(symbols) && (
                    <div className="col-span-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs font-semibold text-amber-900 mb-2">Symbols</p>
                      <p className="text-sm text-amber-800">{normalizeSymbolText(symbols)}</p>
                    </div>
                  )}

                  {/* Interpretation */}
                  {interpretation && (
                    <div className="col-span-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-semibold text-slate-900 mb-2">Interpretation</p>
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {interpretation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delete Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setDeleteModal(true)}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconTrash size={18} />
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={goPrev}
          disabled={!prevEntry || loading}
          className="p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous entry"
        >
          <IconChevronLeft size={24} />
        </button>

        <div className="text-gray-600 font-medium min-w-[100px] text-center">
          {currentIndex >= 0 ? `${currentIndex + 1} / ${entries?.length || 0}` : '- / -'}
        </div>

        <button
          onClick={goNext}
          disabled={!nextEntry || loading}
          className="p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next entry"
        >
          <IconChevronRight size={24} />
        </button>

        {deleteModal &&
          ReactDOM.createPortal(
            <BasicModal handleConfirm={handleDelete} setDeleteModal={setDeleteModal} />,
            document.body
          )}
      </div>
    </div>
  );
};

export default Editor;
