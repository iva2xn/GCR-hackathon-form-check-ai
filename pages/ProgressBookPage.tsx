import React, { useState, useEffect, useRef, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { getAllDailyUpdates } from '../lib/db';
import type { DailyUpdate } from '../types';
import { BookOpenIcon } from '../components/icons';

const PageCover = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => {
    return (
        <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground p-6 flex flex-col items-center justify-center text-center shadow-lg" ref={ref}>
            {children}
        </div>
    );
});

const Page = forwardRef<HTMLDivElement, { children: React.ReactNode, number: number }>(({ children, number }, ref) => {
    return (
        <div className="bg-card text-card-foreground border border-border/50 p-6 flex flex-col" ref={ref}>
            <div className="flex-grow">{children}</div>
            <div className="text-right text-xs text-muted-foreground mt-4">{number}</div>
        </div>
    );
});


export const ProgressBookPage: React.FC = () => {
    const [updates, setUpdates] = useState<DailyUpdate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const [bookSize, setBookSize] = useState({ width: 350, height: 500 });

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const allUpdates = await getAllDailyUpdates();
                setUpdates(allUpdates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
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
                const width = Math.min(containerWidth * 0.9, 800);
                const height = width * 1.414; // A4-ish aspect ratio
                setBookSize({ width: width / 2, height });
            }
        };

        window.addEventListener('resize', updateBookSize);
        updateBookSize(); 
        
        // A timeout to ensure layout is stable before measuring
        const timer = setTimeout(updateBookSize, 100);

        return () => {
            window.removeEventListener('resize', updateBookSize);
            clearTimeout(timer);
        };
    }, []);

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
                <BookOpenIcon className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold text-card-foreground">Your Progress Book is Empty</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Start by logging your daily progress. Each entry you create will become a new page in this journal.
                </p>
            </div>
        );
    }
    
    return (
        <div ref={containerRef} className="w-full flex justify-center items-center animate-fade-in" style={{ minHeight: `${bookSize.height + 40}px` }}>
            <HTMLFlipBook 
                width={bookSize.width} 
                height={bookSize.height}
                showCover={true}
                className="shadow-2xl"
            >
                <PageCover>
                    <BookOpenIcon className="w-16 h-16 mb-4" />
                    <h1 className="text-3xl font-bold">My Progress Book</h1>
                    <p className="mt-2 text-sm opacity-80">A journey of a thousand miles begins with a single step.</p>
                </PageCover>

                {updates.map((update, index) => (
                    <Page key={update.id} number={index + 1}>
                       <div className="h-full flex flex-col">
                            <h3 className="text-lg font-bold mb-2 text-primary">
                                {new Date(update.date).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric' 
                                })}
                            </h3>
                            <div className="bg-muted/50 rounded-lg overflow-hidden flex-shrink-0 mb-4 border border-border">
                                <img src={update.imageBase64} alt={`Progress on ${update.date}`} className="w-full aspect-video object-contain" />
                            </div>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-semibold">Weight:</span> {update.weight} kg/lbs</p>
                                {update.protein && (
                                     <p><span className="font-semibold">Protein Intake:</span> {update.protein}g</p>
                                )}
                            </div>
                       </div>
                    </Page>
                ))}
                
                <PageCover>
                    <h2 className="text-2xl font-bold">To Be Continued...</h2>
                </PageCover>
            </HTMLFlipBook>
        </div>
    );
};