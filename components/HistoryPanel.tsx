
import React from 'react';
// FIX: Corrected import path for HistoryReportData. It is defined in FormCheckerPage.tsx.
import type { HistoryReportData } from '../pages/FormCheckerPage';
import { TrashIcon, CloseIcon } from './icons';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  reports: HistoryReportData[];
  onView: (report: HistoryReportData) => void;
  onDelete: (id: number) => void;
}

const HistoryCard: React.FC<{ report: HistoryReportData; onView: () => void; onDelete: (e: React.MouseEvent) => void; }> = ({ report, onView, onDelete }) => {
    const strokeDasharray = 2 * Math.PI * 18;
    const strokeDashoffset = strokeDasharray * (1 - report.formRating.formScore / 100);

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Needs Improvement': return 'text-destructive';
            case 'Good': return 'text-yellow-400';
            case 'Excellent': return 'text-green-400';
            case 'Perfect': return 'text-primary';
            default: return 'text-muted-foreground';
        }
    };
    
    return (
        <div className="relative group bg-card border border-border rounded-lg p-4 flex items-center gap-4 transition-all hover:shadow-md hover:border-primary/50 cursor-pointer" onClick={onView}>
            <img src={report.error.imageSrc} alt={report.title} className="w-20 h-20 rounded-md object-cover flex-shrink-0 bg-muted" />
            <div className="flex-grow overflow-hidden">
                <h4 className="font-bold text-card-foreground truncate text-sm sm:text-base">{report.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                    {new Date(report.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </p>
            </div>
            <div className="flex-shrink-0 relative w-12 h-12 hidden sm:block">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-muted opacity-20" />
                    <circle
                        cx="20"
                        cy="20"
                        r="18"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`${getLevelColor(report.formRating.level)} transition-all duration-1000`}
                    />
                </svg>
                <div className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${getLevelColor(report.formRating.level)}`}>
                    {report.formRating.formScore}
                </div>
            </div>
            <button 
                onClick={onDelete}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-card/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete report"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, reports, onView, onDelete }) => {
    
  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
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
                <h2 className="text-xl font-bold text-foreground">Analysis History</h2>
                <button onClick={onClose} className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" aria-label="Close history panel">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto">
                {reports.length > 0 ? (
                    <div className="space-y-4">
                        {reports.map(report => (
                           <HistoryCard 
                                key={report.id}
                                report={report}
                                onView={() => onView(report)}
                                onDelete={(e) => handleDelete(e, report.id)}
                           />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="font-semibold text-foreground">No History Yet</h3>
                        <p className="text-sm max-w-xs mt-1">Your analyzed reports will appear here. Upload a video to get started!</p>
                    </div>
                )}
            </div>
        </div>
      </aside>
    </>
  );
};