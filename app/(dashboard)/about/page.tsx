const About = async () => {
  return (
    <div className="w-full h-full px-4 py-4">
      <div className="flex flex-col space-y-4">
        <div className="text-lg font-semibold text-gray-800">About The Dream Journal App</div>
        <div className="text-gray-700 leading-relaxed">
          This dream journal application tracks your moods and themes over time using a
          sophisticated analysis pipeline. The system implements a two-phase LLM architecture that
          cross-references classical dream interpretation texts from Project Gutenberg's public
          domain collection.
        </div>
        <div className="text-gray-700 leading-relaxed">
          <strong>Technical Architecture:</strong> The backend runs on a containerized Django +
          FastAPI microservices architecture deployed on Digital Ocean. The analysis pipeline uses
          OpenAI's GPT models combined with vector embeddings (FAISS) for semantic search across the
          knowledge base of dream interpretation literature.
        </div>
        <div className="text-gray-700 leading-relaxed">
          <strong>Personalization Engine:</strong> The second phase incorporates user-specific
          preferences and historical patterns to generate personalized interpretations, moving
          beyond generic dream analysis to provide contextually relevant insights.
        </div>
        <div className="text-gray-700 leading-relaxed">
          The frontend leverages modern React with a responsive design, while the backend handles
          real-time analysis through asynchronous processing and maintains data persistence with
          PostgreSQL.
        </div>
      </div>
    </div>
  );
};

export default About;
