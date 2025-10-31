
export type AppStatus = 'idle' | 'loading' | 'report';

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
    imageSrc: string; // Placeholder image
    skeleton: SkeletonData;
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
