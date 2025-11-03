import { IconSend, IconThumbDown, IconThumbUp } from '@tabler/icons-react';
import React, { useState } from 'react';

const FeedbackWidget = ({
  analysisId,
  analysisType = 'dream',
  feedbackModal,
  setFeedbackModal,
}: any) => {
  const [rating, setRating] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [comment, setComment] = useState('');
  const [details, setDetails] = useState<{
    accuracy: boolean | null;
    relevance: boolean | null;
    helpful: boolean | null;
  }>({
    accuracy: null,
    relevance: null,
    helpful: null,
  });

  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = async () => {
    try {
      const response = await fetch('https://localhost:8000/api/feedback/submit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysisId,
          rating,
          comment,
          details,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setFeedbackModal(false);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        Thank you for your feedback! It helps us improve.
      </div>
    );
  }

  return (
    <div className="feedback-widget mt-6 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="text-sm font-medium">Was this analysis helpful?</span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setRating('good');
              setShowDetails(true);
            }}
            className={`p-2 rounded ${
              rating === 'good' ? 'bg-green-500 text-white' : 'bg-white hover:bg-green-100'
            }`}
          >
            <IconThumbUp size={20} />
          </button>
          <button
            onClick={() => {
              setRating('bad');
              setShowDetails(true);
            }}
            className={`p-2 rounded ${
              rating === 'bad' ? 'bg-red-500 text-white' : 'bg-white hover:bg-red-100'
            }`}
          >
            <IconThumbDown size={20} />
          </button>
        </div>
        {feedbackModal && (
          <button
            onClick={() => {
              setFeedbackModal(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>

      {showDetails && (
        <div className="mt-4 space-y-3">
          <div className="text-sm space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={details.accuracy === true}
                onChange={(e) =>
                  setDetails({
                    ...details,
                    accuracy: e.target.checked,
                  })
                }
              />
              Accurate interpretation
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={details.relevance === true}
                onChange={(e) =>
                  setDetails({
                    ...details,
                    relevance: e.target.checked,
                  })
                }
              />
              Relevant to my dream
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={details.helpful === true}
                onChange={(e) =>
                  setDetails({
                    ...details,
                    helpful: e.target.checked,
                  })
                }
              />
              Provided helpful insights
            </label>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              rating === 'bad' ? 'What could be improved?' : 'What did you like? (optional)'
            }
            className="w-full p-2 border rounded text-sm"
            rows={3}
          />
          <div className="flex flex-row gap-2">
            <button
              onClick={submitFeedback}
              disabled={!rating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <IconSend size={16} />
              Submit Feedback
            </button>
            <button
              onClick={() => {
                setFeedbackModal(false);
              }}
              disabled={!rating}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackWidget;
