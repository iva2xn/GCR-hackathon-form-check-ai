export type AppStatus = 'idle' | 'loading' | 'report' | 'error';

export interface ScoreDetail {
  metric: string;
  score: number; // Score out of 10
  justification: string;
}

export interface ReportData {
  title: string;
  error: {
    title: string;
    timestamp: string;
    imageSrc: string; 
    errorFrameIndex: number;
    feedbackType: 'error' | 'refinement' | 'optimization';
  };
  findings: {
    errorName: string;
    description: string;
    confidence: string;
    affectedJoints: string[];
  };
  correctionPlan: {
    title: string;
    steps: {
      title: string;
      description: string;
    }[];
  };
  rationale: {
    title: string;
    text: string;
  };
  positiveReinforcement: {
    title: string;
    text: string;
  };
  formRating: {
    formScore: number; // Overall score 0-100, calculated on client
    level: string;
    justification: string; // Overall justification from AI
    detailedScores: ScoreDetail[];
  };
}

export interface DailyUpdate {
    id?: number;
    date: string;
    imageBase64: string;
    weight?: number;
    title: string;
    description: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface SkeletonData {
  keypoints: { [key: string]: Point };
  connections: [string, string][];
  highlightedConnections: [string, string][];
}

export interface StarterFormData {
  goal: 'Lose Weight' | 'Build Muscle' | 'Improve Endurance' | null;
  gender: 'male' | 'female' | 'other' | null;
  age: string;
  height: string;
  weight: string;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | null;
  workoutDays: string;
  equipment: 'bodyweight' | 'home-gym' | 'full-gym' | null;
}

export interface StarterPlan {
  planTitle: string;
  summary: string;
  nutrition: {
    dailyCalories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    explanation: string;
  };
  workoutPlan: {
    weeklySplit: {
      day: string;
      exercises: string[];
      notes: string;
    }[];
  };
  lifestyleTips: string[];
  disclaimer: string;
}
