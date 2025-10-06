'use client';

import { generateDream } from '@/utils/api/clientApi';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { deleteEntry } from '@/utils/api/clientApi';
import PersonalitySelection from './PersonalityDropdown';
import { getPersonality } from '@/utils/parameters/personalities';
import { EmotionType } from '@/utils/parameters/emotions';
import { moodObject } from '@/constants/moodObject';
import { dreamTopics } from '@/constants/dreamTopic';
import { fetchEntries, updateEntryThunk } from '@/redux/slices/journalSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { RootState } from '@/redux/rootReducer';

const Editor = ({ entry }: any) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [value, setValue] = useState(entry?.content);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(entry?.analysis || {});
  const [personality, setPersonality] = useState('academic');
  const [mood, setMood] = useState<EmotionType>('Joy');

  const { mood: analysisMood, summary, color, interpretation, subject, negative } = analysis || {};
  const analysisData =
    analysis && Object.keys(analysis).length > 0
      ? [
          { name: 'Summary', value: summary },
          { name: 'Title', value: subject },
          { name: 'Mood', value: analysisMood },
          { name: 'Good or Bad Dream', value: negative ? 'Good 🙂' : 'Bad 😔' },
          { name: 'Analysis', value: interpretation },
        ]
      : [];

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
          personality,
          mood,
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
      const res = await deleteEntry(entry.id);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  return (
    <div className="px-4 py-4">
      <div className="flex flex-col">
        <div className="col-span-3 px-4">
          <div className="py-4">
            <form>
              <div className="relative flex items-center w-full py-2">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={!prevEntry || loading}
                  className="absolute left-0 p-2 rounded-full border bg-pink-300 border-black/50 hover:bg-pink-500 hover:text-white disabled:opacity-40"
                  aria-label="Previous entry"
                  title="Previous entry"
                >
                  <IconArrowLeft />
                </button>

                <div className="mx-auto flex items-center">
                  <button
                    onClick={handleSubmit}
                    type="submit"
                    className="bg-pink-400 px-4 py-2 rounded-2xl text-md shadow-xl border-2 border-black transition duration-300 ease-in-out hover:bg-pink-500 hover:text-white"
                  >
                    Generate
                    <br />a Dream!
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={handleSave}
                    type="button"
                    className="ml-4 bg-green-400 px-4 py-2 rounded-2xl text-md shadow-xl border-2 border-black transition duration-300 ease-in-out hover:bg-green-500 hover:text-white disabled:opacity-50"
                  >
                    Analyze
                  </button>
                </div>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={!nextEntry || loading}
                  className="absolute right-0 p-2 rounded-full border bg-pink-300 border-black/50 hover:bg-pink-500 hover:text-white disabled:opacity-40"
                  aria-label="Next entry"
                  title="Next entry"
                >
                  <IconArrowRight />
                </button>
              </div>
            </form>
          </div>
          {isLoading && (
            <div className="spinner-overlay">
              <Image src="/spinner.gif" alt="Loading..." height="100" width="100" />
            </div>
          )}
          <div className="flex flew-grow h-96">
            <textarea
              className="w-full h-full min-h-full px-4 py-4 text-xl resize-none border-solid border-2 border-black/60 rounded-lg shadow-md"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-center items-center">
          <div className="flex">
            <div className="flex">
              {analysisData.length > 0 ? (
                <ul className="flex flex-wrap items-center justify-center px-4 py-4 gap-4">
                  <li>
                    <div
                      className="py-12 shadow-lg border-solid border-2 border-black/60 rounded-full"
                      style={{ backgroundColor: color || 'white' }}
                    >
                      <h2 className="px-3 text-sm text-center">Color Analysis</h2>
                    </div>
                  </li>
                  {analysisData.map((item) => (
                    <li
                      key={item.name}
                      className="flex flex-col items-center justify-between shadow-lg bg-slate-100 px-4 py-2 rounded-lg border-solid border-2 border-black/60"
                    >
                      <span className="flex text-lg font-semibold px-2 py-2">{item.name}</span>
                      <span className="py-2 font-serif max-h-72 overflow-scroll">
                        {item.value || 'No analysis yet!'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">
                  No analysis yet! Click **Analyze** above.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-10">
        <button
          onClick={handleDelete}
          disabled={isLoading}
          type="submit"
          className="bg-red-500 px-4 py-2 rounded-2xl text-lg ml-5 shadow-xl border-solid border-2 border-black transition duration-300 ease-in-out hover:bg-red-900 hover:text-white"
        >
          DELETE!
        </button>
      </div>
    </div>
  );
};

export default Editor;
