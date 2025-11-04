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
    weight: number;
    title: string;
    description: string;
}

// FIX: Add missing Point and SkeletonData types for SkeletonOverlay component.
export interface Point {
  x: number;
  y: number;
}

export interface SkeletonData {
  keypoints: { [key: string]: Point };
  connections: [string, string][];
  highlightedConnections: [string, string][];
}