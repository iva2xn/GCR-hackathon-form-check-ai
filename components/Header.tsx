import React from 'react';
import { FormCheckIcon, HistoryIcon, ArrowLeftIcon } from './icons';

interface HeaderProps {
    onHomeClick: () => void;
    showHistoryButton?: boolean;
    onToggleHistory?: () => void;
    showBackButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onHomeClick, showHistoryButton = false, onToggleHistory, showBackButton = false }) => {
  
  const Logo = () => (
    <div className="flex items-center">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3 shadow-md">
            <FormCheckIcon className="w-7 h-7 text-primary-foreground" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">FitTrack AI</h1>
    </div>
  );
  
  return (
    <header className="p-4 sm:p-6 w-full">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
                {showBackButton ? (
                    <>
                        <button
                            onClick={onHomeClick}
                            className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            aria-label="Go back to home"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <Logo />
                    </>
                ) : (
                    <button onClick={onHomeClick} className="flex items-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-md">
                       <Logo />
                    </button>
                )}
            </div>

            {showHistoryButton && onToggleHistory && (
                <button
                    onClick={onToggleHistory}
                    className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    aria-label="View analysis history"
                >
                    <HistoryIcon className="w-6 h-6" />
                </button>
            )}
        </div>
      </div>
    </header>
  );
};