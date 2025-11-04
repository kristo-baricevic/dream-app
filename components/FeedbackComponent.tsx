import FeedbackWidget from './FeedbackWidget';

const FeedbackComponent = ({ analysisId, feedbackModal, setFeedbackModal, analysisType }: any) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <FeedbackWidget
          analysisId={analysisId}
          feedbackModal={feedbackModal}
          setFeedbackModal={setFeedbackModal}
          analysisType={analysisType}
        />
      </div>
    </div>
  );
};

export default FeedbackComponent;
