// types.ts
export type JournalEntry = {
  id: string;
  userId: string;
  created_at: Date;
  updated_at: Date;
  content: string;
  analysis?: 
    AnalysisData
  ;
};

export type AnalysisData = {
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
};

export type Mood = {
  mood: string;
  color: string;
};
