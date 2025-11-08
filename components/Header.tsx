


import React from 'react';
import { CloudIcon, HistoryIcon, ArrowLeftIcon } from './icons';

interface HeaderProps {
    onHomeClick: () => void;
    showHistoryButton?: boolean;
    onToggleHistory?: () => void;
    showBackButton?: boolean;
    showAddUpdateButton?: boolean;
    onAddUpdateClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onHomeClick, 
  showHistoryButton = false, 
  onToggleHistory, 
  showBackButton = false,
  showAddUpdateButton = false,
  onAddUpdateClick
}) => {
  
  const Logo = () => (
    <div className="flex items-center">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3 shadow-md">
            <CloudIcon className="w-7 h-7 text-primary-foreground" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">CloudFitness</h1>
    </div>
  );
  
  return (
    <header className="px-4 sm:px-6 py-3 w-full border-b border-border">
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

            {(showHistoryButton || showAddUpdateButton) && (
              <div className="flex items-center gap-2 sm:gap-4">
                {showAddUpdateButton && onAddUpdateClick && (
                  <button
                      onClick={onAddUpdateClick}
                      className="px-4 py-1.5 text-sm font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                      aria-label="Add daily update"
                  >
                     Add Update
                  </button>
                )}
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
            )}
        </div>
      </div>
    </header>
  );
};