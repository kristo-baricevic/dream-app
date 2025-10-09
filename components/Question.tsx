'use client';

import { SetStateAction, useState } from 'react';
import Image from 'next/image';
import { JournalEntry } from '@/types';
import { RootState } from '@/redux/rootReducer';
import { useDispatch, useSelector } from 'react-redux';
import { setDoctorPersonality } from '@/redux/slices/settingsSlice';
import { AppDispatch } from '@/redux/store';
import { WorkflowViewer } from './WorkflowViewer';
import { useWorkflowPolling } from '@/utils/hooks/useWorkflowPolling';
import {
  analyzeDreamsWithWorkflow,
  askCustomQuestionWithWorkflow,
  clearCurrentWorkflow,
} from '@/redux/slices/workflowSlice';
import TypewriterText from './TypewriterText';
import { set } from 'date-fns';
import useIsSmallScreen from '@/utils/isSmallScreen';

type QuestionProps = {
  entries: JournalEntry[];
};

const Question: React.FC<QuestionProps> = ({ entries }) => {
  const [value, setValue] = useState('Ask the dream doctor a question!');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [questionSubmitted, setQuestionSubmitted] = useState<boolean>(false);
  const isSmallScreen = useIsSmallScreen();

  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch<AppDispatch>();

  useWorkflowPolling(workflowId, (result) => {
    setResponse(result);
    setLoading(false);
  });

  const handleImageClick = () => {
    setShowButtons(!showButtons);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionSubmitted(true);
    setLoading(true);
    setResponse('');
    setWorkflowId(null);
    dispatch(clearCurrentWorkflow());

    try {
      const result = await dispatch(
        analyzeDreamsWithWorkflow({
          entries,
          personality: settings.doctorPersonality,
          settings,
        })
      ).unwrap();

      setWorkflowId(result.workflow_id);
    } catch (error) {
      console.error('Analysis failed:', error);
      setLoading(false);
      setResponse('Analysis failed. Please try again.');
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setIsQuestion(!isQuestion);
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionSubmitted(true);
    setLoading(true);
    setResponse('');
    setWorkflowId(null);
    dispatch(clearCurrentWorkflow());

    try {
      const result = await dispatch(
        askCustomQuestionWithWorkflow({
          question: value,
          entries,
          personality: settings.doctorPersonality,
          settings,
        })
      ).unwrap();

      setWorkflowId(result.workflow_id);
      setValue('');
    } catch (error) {
      console.error('Question failed:', error);
      setLoading(false);
      setResponse('Question failed. Please try again.');
    }
  };

  const onChange = (e: { target: { value: SetStateAction<string> } }) => {
    setValue(e.target.value);
  };

  return (
    <div className="flex justify-center items-center flex-col py-6 w-full">
      {settings.doctorImage ? (
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col">
            <div
              className="relative flex flex-col sm:flex-row items-center cursor-pointer group"
              onClick={handleImageClick}
            >
              <>
                <Image
                  src={settings.doctorImage}
                  alt={settings.doctorPersonality}
                  height={220}
                  width={220}
                  className="flex object-cover rounded-lg transition-transform group-hover:scale-105"
                />
              </>
              {!showButtons && !questionSubmitted && (
                <div className="flex mt-4 justify-center top-10 bg-white min-h-[130px] w-[300px] border-2 border-black rounded-2xl sm:h-[100px] p-4 shadow-lg">
                  <p className="mt-2 font-medium text-gray-800 text-sm leading-snug">
                    <TypewriterText text="Welcome to the Dream App! Click on me to have your dreams analyzed, or add a dream to log your sleepy adventures." />
                  </p>
                </div>
              )}
            </div>

            <style jsx>{`
              @keyframes typing {
                from {
                  width: 0;
                }
                to {
                  width: 100%;
                }
              }

              .animate-typing {
                animation: typing 4s steps(100, end) 1;
              }
            `}</style>
          </div>

          {showButtons && !isQuestion && !questionSubmitted && (
            <div className="flex justify-center items-center mt-6 w-full">
              <form onSubmit={handleSubmit}>
                <button
                  disabled={loading}
                  type="submit"
                  className="bg-pink-400 w-[180px] px-4 py-2 rounded-2xl text-lg mx-2 shadow-xl border-2 border-black transition duration-300 hover:bg-pink-500 hover:text-white disabled:opacity-50"
                >
                  Get your analysis!
                </button>
              </form>
              <form onSubmit={handleAskQuestion}>
                <button
                  disabled={loading}
                  type="submit"
                  className="bg-purple-400 w-[180px] px-4 py-2 rounded-2xl text-lg mx-2 shadow-xl border-2 border-black transition duration-300 hover:bg-purple-500 hover:text-white disabled:opacity-50"
                >
                  Ask a question!
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500 italic">Select your doctor first.</p>
      )}

      {isQuestion && !questionSubmitted && (
        <div className="flex justify-center items-center mt-6">
          <form onSubmit={handleSubmitQuestion} className="flex flex-col items-center gap-2">
            <input
              disabled={loading}
              onChange={onChange}
              value={value}
              type="text"
              placeholder="ask a question"
              className="flex border border-black/20 px-4 py-2 text-lg rounded-lg shadow-lg w-[300px]"
            />
            <div className="flex flex-row">
              <button
                disabled={loading}
                onClick={() => setIsQuestion(false)}
                type="button"
                className="bg-red-400 px-4 py-2 mr-4 rounded-2xl text-lg shadow-xl border-2 border-black transition duration-300 hover:bg-red-500 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                type="submit"
                className="bg-purple-300 px-4 py-2 rounded-2xl text-lg shadow-xl border-2 border-black transition duration-300 hover:bg-purple-500 hover:text-white disabled:opacity-50"
              >
                Submit!
              </button>
            </div>
          </form>
        </div>
      )}

      {questionSubmitted && (
        <div className="flex flex-col items-center justify-center">
          {workflowId && (
            <div className="flex px-2 py-4 w-full max-w-3xl">
              <div className="bg-slate-100 p-4 w-full rounded-2xl border-2 border-blue-300 shadow-lg">
                <WorkflowViewer response={response} />
              </div>
            </div>
          )}

          {response && (
            <div className="flex px-2 py-6 font-serif max-w-3xl max-h-[500px] ">
              <div className="bg-slate-100 p-4 rounded-2xl border-2 border-blue-300 shadow-lg overflow-y-auto">
                <p>{response}</p>
              </div>
            </div>
          )}
          <button
            disabled={loading}
            onClick={() => setQuestionSubmitted(false)}
            type="button"
            className="bg-red-400 px-4 py-2 mr-4 rounded-2xl text-lg shadow-xl border-2 border-black transition duration-300 hover:bg-red-500 hover:text-white disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default Question;
