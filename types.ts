// types.ts
export type JournalEntry = {
  id: string;
  userId: string;
  created_at: Date;
  updated_at: Date;
  content: string;
  source_preimage: { entry_id: string; content_hash: string; updated_at: string };
  analysis_status?: string;
  analysis?: 
    AnalysisData
  ;
};

export type AnalysisData = {
  source_validation?: 'current' | 'historical_unvalidated';
  id: string;
  createdAt: Date;
  updatedAt: Date;
  entryId: string;
  userId: string;
  mood: string;
  summary: string;
  color: string;
  interpretation: string;
  negative: boolean;
  subject: string;
  sentimentScore: number;
  doctor_personality: string;
  weights: {
    astrology: number;
    personality: number;
    medicalHistory: number;
    theory: number;
  };
  symbols: string[];
};

export type Symbols = {
  symbols: string[];
}

export type CumulativeAnalysisData = {
  source_validation?: 'current' | 'historical_unvalidated';
  id: string;
  created_at: Date;
  updated_at: Date;
  analysis: string;
  doctor_personality: string;
  weights: {
    astrology: number;
    personality: number;
    medicalHistory: number;
    theory: number;
  };
};

export type CustomQuestionData = {
  source_validation?: 'current' | 'historical_unvalidated';
  id: string;
  created_at: Date;
  updated_at: Date;
  question: string;
  answer: string;
  doctor_personality: string;
  weights: {
    astrology: number;
    personality: number;
    medicalHistory: number;
    theory: number;
  };
};


export type Mood = {
  mood: string;
  color: string;
};
