const About = async () => {
  return (
    <div className="w-full h-full px-4 py-4">
      <div className="flex flex-col space-y-4">
        <div className="text-lg font-semibold text-gray-800">About The Dream Journal App</div>
        <div className="text-gray-700 leading-relaxed">
          This dream journal application tracks your moods and themes over time using a
          sophisticated, transparent analysis pipeline. The system features real-time workflow
          tracking that shows you exactly how your dreams are being analyzed, step by step.
        </div>
        <div className="text-gray-700 leading-relaxed">
          <span className="font-bold">Transparent Analysis Pipeline:</span> Every dream analysis
          runs through a visible 6-step workflow that you can watch in real-time. The system
          performs vector search across classical dream interpretation texts, analyzes Jungian
          symbolism, considers your astrological chart, and incorporates your personality type—all
          while showing you the confidence scores and sources behind each step.
        </div>
        <div className="text-gray-700 leading-relaxed">
          <span className="font-bold">Technical Architecture: </span>The backend runs on a
          containerized Django + FastAPI microservices architecture deployed on Digital Ocean. The
          analysis pipeline uses OpenAI's GPT models combined with vector embeddings (FAISS) for
          semantic search across a knowledge base of dream interpretation literature from Project
          Gutenberg's public domain collection. Each analysis step is tracked and stored in
          PostgreSQL, allowing full traceability of how interpretations are generated.
        </div>
        <div className="text-gray-700 leading-relaxed">
          <span className="font-bold"> Citation & Confidence Tracking:</span> Every claim in your
          dream analysis is backed by specific sources—whether from dream science papers, Jungian
          symbol databases, or astrological interpretations. The system tracks confidence scores for
          each reasoning step, giving you transparency into the reliability of the analysis.{' '}
        </div>
        <div className="text-gray-700 leading-relaxed">
          <span className="font-bold"> Personalization Engine:</span> The workflow incorporates
          user-specific preferences, astrological data, personality types (MBTI), and historical
          patterns to generate personalized interpretations that go beyond generic dream analysis to
          provide contextually relevant insights tailored to you.
        </div>
        <div className="text-gray-700 leading-relaxed">
          The frontend leverages modern React with Redux state management and real-time polling to
          show you the analysis as it happens, while the backend handles asynchronous processing
          through FastAPI background tasks.
        </div>
        <div className="text-gray-700 leading-relaxed">
          Credit: Owl images were sourced from www.freevector.com
        </div>
        <div className="text-blue-700 leading-relaxed">
          <a href="https://github.com/kristo-baricevic/dream-app" className="mr-4">
            Frontend Code{' '}
          </a>
          <a href="https://github.com/kristo-baricevic/django_backend_dream">Backend Code </a>
        </div>
      </div>
    </div>
  );
};

export default About;
