import React from 'react';
import type { DailyUpdate } from '../types';
import { TrashIcon, CloseIcon } from './icons';

interface DailyUpdateHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  updates: DailyUpdate[];
  onView: (update: DailyUpdate) => void;
  onDelete: (id: number) => void;
}

const UpdateHistoryCard: React.FC<{ update: DailyUpdate; onView: () => void; onDelete: (e: React.MouseEvent) => void; }> = ({ update, onView, onDelete }) => {
    return (
        <div className="relative group bg-card border border-border rounded-lg p-4 flex items-center gap-4 transition-all hover:shadow-md hover:border-primary/50 cursor-pointer" onClick={onView}>
            <img src={update.imageBase64} alt={update.title} className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover flex-shrink-0 bg-muted" />
            <div className="flex-grow overflow-hidden">
                <h4 className="font-bold text-card-foreground truncate text-sm sm:text-base">{update.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                    {new Date(update.date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </p>
                {typeof update.weight === 'number' && (
                    <p className="text-xs text-muted-foreground mt-0.5">Weight: {update.weight}</p>
                )}
            </div>
            <button 
                onClick={onDelete}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-card/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete update"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export const DailyUpdateHistoryPanel: React.FC<DailyUpdateHistoryPanelProps> = ({ isOpen, onClose, updates, onView, onDelete }) => {
    
  const handleDelete = (e: React.MouseEvent, id: number | undefined) => {
    e.stopPropagation();
    if (typeof id !== 'number') {
        console.error("Delete failed: update ID is missing or invalid.");
        return;
    }
    if (window.confirm('Are you sure you want to delete this daily update? This action cannot be undone.')) {
        onDelete(id);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                <h2 className="text-xl font-bold text-foreground">Progress History</h2>
                <button onClick={onClose} className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" aria-label="Close history panel">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto">
                {updates.length > 0 ? (
                    <div className="space-y-4">
                        {updates.map(update => (
                            <UpdateHistoryCard 
                                key={update.id}
                                update={update}
                                onView={() => onView(update)}
                                onDelete={(e) => handleDelete(e, update.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                           </svg>
                        </div>
                        <h3 className="font-semibold text-foreground">No History Yet</h3>
                        <p className="text-sm max-w-xs mt-1">Your saved daily updates will appear here. Add a new one to get started!</p>
                    </div>
                )}
            </div>
        </div>
      </aside>
    </>
  );
};