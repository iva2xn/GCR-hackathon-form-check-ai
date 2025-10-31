
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="p-4 sm:p-6 w-full">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center">
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center font-bold text-gray-900 text-lg mr-3 shadow-lg">
                AI
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">FormCheck AI</h1>
        </div>
      </div>
    </header>
  );
};
