import React from 'react';

interface LoadingSpinnerProps {
  message: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-bold text-white mb-2">Analyzing Video...</h2>
       <div className="text-gray-400 max-w-sm h-12 flex items-center justify-center transition-all duration-500">
        <span key={message} className="animate-fade-in text-cyan-300">
            {message}
        </span>
      </div>
    </div>
  );
};