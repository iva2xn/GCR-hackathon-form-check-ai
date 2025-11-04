import React from 'react';
import { FormCheckIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="p-4 sm:p-6 w-full">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3 shadow-md">
                <FormCheckIcon className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">FormCheck AI</h1>
        </div>
      </div>
    </header>
  );
};