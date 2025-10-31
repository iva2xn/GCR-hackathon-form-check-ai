
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="p-4 sm:p-6 w-full mt-8">
      <div className="mx-auto max-w-4xl text-center text-xs text-gray-600">
        <p>&copy; {new Date().getFullYear()} FormCheck AI. All Rights Reserved.</p>
        <p className="mt-1">
          This is a simulated analysis. Always consult with a qualified professional for personal fitness advice.
        </p>
      </div>
    </footer>
  );
};
