
export type AppStatus = 'idle' | 'loading' | 'report' | 'error';

export interface Point {
  x: number;
  y: number;
}

export interface SkeletonData {
  keypoints: { [key: string]: Point };
  connections: [string, string][];
  highlightedConnections: [string, string][];
}

export interface ReportData {
  title: string;
  error: {
    title: string;
    timestamp: string;
    imageSrc: string; // Placeholder image, will be replaced by data URL
    skeleton: SkeletonData;
    errorFrameIndex?: number; // Used by AI to specify which frame to show
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
}
