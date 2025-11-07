import React, { useState, useEffect, useRef, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { getAllDailyUpdates, deleteDailyUpdate } from '../lib/db';
import type { DailyUpdate } from '../types';
import { BookJournalIcon, PlusIcon } from '../components/icons';
import { DailyUpdateHistoryPanel } from '../components/DailyUpdateHistoryPanel';
import type { Page as AppPage } from '../App';

const PageCover = forwardRef<HTMLDivElement, { children: React.ReactNode, position: 'front' | 'back' }>(({ children, position }, ref) => {
    const radiusClasses = position === 'front' ? 'rounded-tr-[0.375rem] rounded-br-[0.375rem]' : 'rounded-tl-[0.375rem] rounded-bl-[0.375rem]';
    return (
        <div className={`bg-primary text-primary-foreground p-6 h-full flex flex-col items-center text-center shadow-lg space-y-4 pt-48 ${radiusClasses}`} ref={ref}>
            {children}
        </div>
    );
});

const Page = forwardRef<HTMLDivElement, { children: React.ReactNode, number: number }>(({ children, number }, ref) => {
    const isRightPage = number % 2 === 0;
    const radiusClasses = isRightPage ? 'rounded-tr-[0.375rem] rounded-br-[0.375rem]' : 'rounded-tl-[0.375rem] rounded-bl-[0.375rem]';
    return (
        <div 
            className={`bg-[#ffff6c] text-gray-800 flex flex-col relative overflow-hidden ${isRightPage ? 'border-l-2 border-gray-800' : ''} ${radiusClasses}`} 
            ref={ref}
            style={{
                backgroundImage: `
                    repeating-linear-gradient(
                        to bottom,
                        transparent,
                        transparent 29px,
                        rgba(173, 216, 230, 0.6) 29px,
                        rgba(173, 216, 230, 0.6) 30px
                    )
                `,
                backgroundSize: '100% 30px',
            }}
        >
            <div className="relative z-10 flex-grow flex flex-col">{children}</div>
            <div className={`absolute bottom-4 z-10 text-xs text-gray-500 font-mono ${isRightPage ? 'right-4' : 'left-4'}`}>{number}</div>
        </div>
    );
});

interface ProgressBookPageProps {
  isHistoryOpen: boolean;
  onToggleHistory: () => void;
  onNavigate: (page: AppPage) => void;
}

export const ProgressBookPage: React.FC<ProgressBookPageProps> = ({ isHistoryOpen, onToggleHistory, onNavigate }) => {
    const [updates, setUpdates] = useState<DailyUpdate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<any>(null);
    const [bookSize, setBookSize] = useState({ width: 350, height: 500 });

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const allUpdates = await getAllDailyUpdates();
                const sortedUpdates = allUpdates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setUpdates(sortedUpdates);
            } catch (error) {
                console.error("Failed to load progress updates:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUpdates();
    }, []);

    useEffect(() => {
        const updateBookSize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const viewportHeight = window.innerHeight;
                
                const width = Math.min(containerWidth * 0.9, 800);
                const height = Math.min(width * 1.3, viewportHeight * 0.8);
                
                setBookSize({ width: width / 2, height });
            }
        };

        window.addEventListener('resize', updateBookSize);
        updateBookSize(); 
        
        const timer = setTimeout(updateBookSize, 100);

        return () => {
            window.removeEventListener('resize', updateBookSize);
            clearTimeout(timer);
        };
    }, []);

    const handleViewUpdate = (update: DailyUpdate) => {
        if (typeof update.id !== 'number') return;
        const updateIndex = updates.findIndex(u => u.id === update.id);
        if (updateIndex !== -1 && bookRef.current) {
            // Page numbering: 0=cover, 1=update1_left, 2=update1_right, etc.
            const pageNumber = updateIndex * 2 + 1;
            bookRef.current.pageFlip().turnToPage(pageNumber);
            onToggleHistory(); // Close panel after flipping
        }
    };

    const handleDeleteUpdate = async (id: number) => {
        await deleteDailyUpdate(id);
        setUpdates(prev => prev.filter(update => update.id !== id));
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">Opening your progress book...</p>
            </div>
        );
    }

    if (updates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-card rounded-xl shadow">
                <BookJournalIcon className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold text-card-foreground">Your Progress Book is Empty</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Start by logging your daily progress. Each entry you create will become a new page in this journal.
                </p>
                 <button
                    onClick={() => onNavigate('daily-update')}
                    className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-md shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>Log Your First Update</span>
                </button>
            </div>
        );
    }
    
    // The react-pageflip library has incorrect TypeScript definitions, marking optional props as required.
    // Casting to `any` to bypass the type checking for this component and avoid compilation errors.
    const AnyHTMLFlipBook = HTMLFlipBook as any;

    const sortedUpdatesForPanel = [...updates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <>
            <div ref={containerRef} className="w-full flex justify-center items-center animate-fade-in" style={{ minHeight: `${bookSize.height}px` }}>
                <AnyHTMLFlipBook
                    ref={bookRef}
                    width={bookSize.width} 
                    height={bookSize.height}
                    size="fixed"
                    showCover={true}
                    className="shadow-2xl"
                    flippingTime={600}
                >
                    <PageCover position="front">
                        <h1 className="text-3xl font-bold font-serif">My Progress Book</h1>
                        <p className="text-sm opacity-80">A journey of a thousand miles begins with a single step.</p>
                    </PageCover>

                    {updates.flatMap((update, index) => [
                        <Page key={`${update.id}-left`} number={index * 2 + 1}>
                           <div className="h-full w-full flex flex-col items-center justify-between pt-8 px-8 pb-8">
                                <div className="transform -rotate-2 hover:rotate-1 transition-transform duration-300 ease-in-out w-full max-w-[280px] mx-auto">
                                    <div className="bg-white p-3 rounded-sm shadow-lg">
                                        <div className="aspect-[3/4] bg-gray-100">
                                            <img 
                                                src={update.imageBase64} 
                                                alt={`Progress on ${new Date(update.date).toLocaleDateString()}`} 
                                                className="w-full h-full object-cover border border-gray-200"
                                            />
                                        </div>
                                        <p className="w-full text-left font-digital text-lg text-gray-500 mt-2 px-1">
                                            {new Date(update.date).toLocaleDateString('en-US', {
                                                year: '2-digit', month: '2-digit', day: '2-digit' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="font-doodle text-2xl text-gray-800 transform -rotate-1 text-center">
                                    {typeof update.weight === 'number' && (
                                        <p className="font-bold" style={{ lineHeight: '60px' }}>Weight: {update.weight} kg/lbs</p>
                                    )}
                                </div>
                           </div>
                        </Page>,
                        <Page key={`${update.id}-right`} number={index * 2 + 2}>
                            <div className="h-full w-full flex flex-col font-doodle text-gray-800" style={{ padding: '45px 32px 32px 32px' }}>
                                <h2 className="text-3xl font-bold" style={{ lineHeight: '60px' }}>
                                    {update.title}
                                </h2>
                                <p className="text-xl whitespace-pre-wrap flex-grow" style={{ lineHeight: '30px' }}>
                                    {update.description}
                                </p>
                            </div>
                        </Page>
                    ])}
                    
                    <PageCover position="back">
                        <h2 className="text-2xl font-bold font-serif">To Be Continued...</h2>
                    </PageCover>
                </AnyHTMLFlipBook>
            </div>
            <DailyUpdateHistoryPanel
                isOpen={isHistoryOpen}
                onClose={onToggleHistory}
                updates={sortedUpdatesForPanel}
                onView={handleViewUpdate}
                onDelete={handleDeleteUpdate}
            />
        </>
    );
};
