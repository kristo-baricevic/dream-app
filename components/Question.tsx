// components/Question.tsx

'use client';

import { SetStateAction, useState } from 'react';
import PersonalitySelection from './PersonalityDropdown';
import Image from 'next/image';
import { JournalEntry } from '@/types';
import { RootState } from '@/redux/rootReducer';
import { useDispatch, useSelector } from 'react-redux';
import { setSettings } from '@/redux/slices/settingsSlice';
import { AppDispatch } from '@/redux/store';
import { WorkflowViewer } from './WorkflowViewer';
import { useWorkflowPolling } from '@/utils/hooks/useWorkflowPolling';
import {
  analyzeDreamsWithWorkflow,
  askCustomQuestionWithWorkflow,
  clearCurrentWorkflow,
} from '@/redux/slices/workflowSlice';

type QuestionProps = {
  entries: JournalEntry[];
};

const Question: React.FC<QuestionProps> = ({ entries }) => {
  const [value, setValue] = useState('Ask the dream doctor a question!');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState('Academic');
  const [workflowId, setWorkflowId] = useState<string | null>(null);

  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch<AppDispatch>();

  // Auto-poll workflow when workflowId is set
  useWorkflowPolling(workflowId, (result) => {
    setResponse(result);
    setLoading(false);
  });

  const onChange = (e: { target: { value: SetStateAction<string> } }) => {
    setValue(e.target.value);
  };

  const handlePersonalitySelect = (personality: string) => {
    setSelectedPersonality(personality);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');
    setWorkflowId(null);
    dispatch(clearCurrentWorkflow());

    const newSettings = {
      astrology: { sun: 'Leo', moon: 'Pisces', rising: 'Virgo' },
      occupation: 'Developer',
      medicalHistory: { psychological: ['anxiety'], physical: ['asthma'] },
      personality: 'INTJ',
      doctorPersonality: selectedPersonality,
    };

    dispatch(setSettings(newSettings));

    try {
      const result = await dispatch(
        analyzeDreamsWithWorkflow({
          entries,
          personality: selectedPersonality,
          settings: newSettings,
        })
      ).unwrap();

      console.log('🆕 RECEIVED WORKFLOW RESULT:', result);
      console.log('🆔 NEW Workflow ID:', result.workflow_id);

      setWorkflowId(result.workflow_id);

      console.log('✅ Workflow ID SET to:', result.workflow_id);
    } catch (error) {
      console.error('Analysis failed:', error);
      setLoading(false);
      setResponse('Analysis failed. Please try again.');
    }
  };

  const handleAskQuestion = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsQuestion(!isQuestion);
  };

  const handleSubmitQuestion = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');
    setWorkflowId(null); // Clear previous workflow
    dispatch(clearCurrentWorkflow());

    const newSettings = {
      astrology: { sun: 'Leo', moon: 'Pisces', rising: 'Virgo' },
      occupation: 'Developer',
      medicalHistory: { psychological: ['anxiety'], physical: ['asthma'] },
      personality: 'INTJ',
      doctorPersonality: selectedPersonality,
    };

    dispatch(setSettings(newSettings));

    try {
      const result = await dispatch(
        askCustomQuestionWithWorkflow({
          question: value,
          entries,
          personality: selectedPersonality,
          settings: newSettings,
        })
      ).unwrap();

      setWorkflowId(result.workflow_id); // This will trigger WorkflowViewer to show
      setValue('');
    } catch (error) {
      console.error('Question failed:', error);
      setLoading(false);
      setResponse('Question failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col py-4 justify-center align-middle">
      <div className="flex justify-center mb-4">
        <PersonalitySelection onSelect={handlePersonalitySelect} />
      </div>

      <div className="flex flex-wrap justify-center align-middle">
        <div className="flex flex-wrap px-2 py-2">
          <form onSubmit={handleSubmit}>
            <div className="flex px-2">
              <button
                disabled={loading}
                type="submit"
                className="bg-pink-400 px-4 py-2 rounded-2xl text-lg ml-5 shadow-xl border-solid border-2 border-black transition duration-300 ease-in-out hover:bg-pink-500 hover:text-white disabled:opacity-50"
              >
                Get your analysis!
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col px-2 py-2">
          <form onSubmit={handleAskQuestion}>
            <div className="flex px-2">
              <button
                disabled={loading}
                type="submit"
                className="bg-purple-400 px-4 py-2 rounded-2xl text-lg ml-5 shadow-xl border-solid border-2 border-black transition duration-300 ease-in-out hover:bg-purple-500 hover:text-white disabled:opacity-50"
              >
                Ask a question!
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="flex py-2 align-middle justify-center">
        {isQuestion && (
          <div className="flex flex-wrap justify-start">
            <form onSubmit={handleSubmitQuestion}>
              <div className="flex py-2 align-middle justify-center">
                <input
                  disabled={loading}
                  onChange={onChange}
                  value={value}
                  type="text"
                  placeholder="ask a question"
                  className="border border-black/20 px-4 py-2 text-lg rounded-lg shadow-lg"
                />
              </div>
              <div className="flex py-2 align-middle justify-center">
                <button
                  disabled={loading}
                  type="submit"
                  className="bg-purple-300 px-4 py-2 rounded-2xl text-lg ml-5 shadow-xl border-solid border-2 border-black transition duration-300 ease-in-out hover:bg-purple-500 hover:text-white disabled:opacity-50"
                >
                  Submit!
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="py-2">
        {/* {loading && (
          <div className="spinner-overlay">
            <Image
              src="/spinner.gif"
              alt="Loading..."
              height="100"
              width="100"
              unoptimized={true}
            />
            <p>...The doctor is thinking. This may take a moment!</p>
          </div>
        )} */}

        {/* Show workflow viewer when we have a workflowId */}
        {workflowId && (
          <div className="px-2 py-4">
            <div className="bg-white p-4 rounded-2xl border-solid border-2 border-blue-300 shadow-lg">
              <WorkflowViewer />
            </div>
          </div>
        )}

        {/* Show final response */}
        <div className="px-2 py-6 font-serif">
          {response && (
            <div className="bg-slate-100 p-4 rounded-2xl border-solid border-2 border-blue-300 shadow-lg">
              <p>{response}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Question;
