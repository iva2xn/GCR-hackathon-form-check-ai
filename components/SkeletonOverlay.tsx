import React from 'react';
// FIX: Add Point to type import to be used in the component.
import type { Point, SkeletonData } from '../types';

interface SkeletonOverlayProps {
  skeleton: SkeletonData;
}

export const SkeletonOverlay: React.FC<SkeletonOverlayProps> = ({ skeleton }) => {
  const { keypoints, connections, highlightedConnections } = skeleton;

  return (
    <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1 1" preserveAspectRatio="none">
      {/* Draw standard connections */}
      {connections.map(([startKey, endKey], index) => {
        const start = keypoints[startKey];
        const end = keypoints[endKey];
        if (!start || !end) return null;
        return (
          <line
            key={`conn-${index}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="rgba(0, 255, 255, 0.7)"
            strokeWidth="0.005"
            strokeLinecap="round"
          />
        );
      })}

      {/* Draw highlighted connections */}
      {highlightedConnections.map(([startKey, endKey], index) => {
        const start = keypoints[startKey];
        const end = keypoints[endKey];
        if (!start || !end) return null;
        return (
          <line
            key={`highlight-${index}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="rgba(239, 68, 68, 1)" // red-500
            strokeWidth="0.012"
            strokeLinecap="round"
          />
        );
      })}

      {/* Draw keypoints */}
      {/* FIX: Explicitly type `point` as `Point` to resolve error where it was inferred as `unknown`. */}
      {Object.values(keypoints).map((point: Point, index) => (
        <circle
          key={`point-${index}`}
          cx={point.x}
          cy={point.y}
          r="0.008"
          fill="rgba(255, 255, 255, 0.9)"
        />
      ))}
    </svg>
  );
};
