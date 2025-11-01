import React from 'react';

interface LoadingSpinnerProps {
  message: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing Video...</h2>
       <div className="text-muted-foreground max-w-sm h-12 flex items-center justify-center transition-all duration-500">
        <span key={message} className="animate-fade-in">
            {message}
        </span>
      </div>
    </div>
  );
};