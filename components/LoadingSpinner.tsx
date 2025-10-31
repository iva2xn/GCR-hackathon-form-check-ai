
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-bold text-white mb-2">Analyzing Video...</h2>
      <p className="text-gray-400 max-w-sm">
        Our AI is examining your form frame by frame. This may take a moment.
      </p>
    </div>
  );
};
