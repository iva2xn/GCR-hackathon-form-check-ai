

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { getAllDailyUpdates } from '../lib/db';
import type { DailyUpdate } from '../types';
import { BookOpenIcon } from '../components/icons';

const PageCover = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => {
    return (
        <div className="bg-primary text-primary-foreground p-6 flex flex-col items-center justify-center text-center shadow-lg" ref={ref}>
            {children}
        </div>
    );
});


const Page = forwardRef<HTMLDivElement, { children: React.ReactNode, number: number }>(({ children, number }, ref) => {
    return (
        <div 
            className="bg-[#ffffe0] text-gray-800 p-8 flex flex-col relative [--page-line-color:#60a5fa] dark:[--page-line-color:#64748b]" 
            ref={ref}
        >
            <div 
                className="absolute inset-0 pointer-events-none" 
                style={{
                    backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 27px, var(--page-line-color) 28px)',
                    backgroundSize: '100% 28px',
                }}
            ></div>
            
            <div className="relative z-10 flex-grow flex flex-col">{children}</div>
            <div className={`relative z-10 text-xs text-gray-500 font-mono pt-2 ${number % 2 === 0 ? 'text-right' : 'text-left'}`}>{number}</div>
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
                const width = Math.min(containerWidth * 0.95, 800);
                const height = width * 1.35; 
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
            {/* FIX: Explicitly set the `size` prop to "fixed" to satisfy the component's strict TypeScript props validation, which incorrectly flags missing optional props. */}
            <HTMLFlipBook 
                width={bookSize.width} 
                height={bookSize.height}
                size="fixed"
                showCover={true}
                className="shadow-2xl"
                flippingTime={600}
            >
                <PageCover>
                    <div>
                        <BookOpenIcon className="w-16 h-16 mb-4 mx-auto text-primary-foreground" />
                        <h1 className="text-3xl font-bold font-serif">My Progress Book</h1>
                        <p className="mt-2 text-sm opacity-80">A journey of a thousand miles begins with a single step.</p>
                    </div>
                </PageCover>

                {updates.map((update, index) => (
                    <Page key={update.id} number={index + 1}>
                       <div className="h-full w-full flex flex-col">
                            <div className="flex-grow flex justify-center items-center py-4">
                                <div className="transform -rotate-2 hover:rotate-1 transition-transform duration-300 ease-in-out">
                                    <div className="bg-white dark:bg-gray-100 p-3 rounded-sm shadow-lg">
                                        <img 
                                            src={update.imageBase64} 
                                            alt={`Progress on ${update.date}`} 
                                            className="object-cover border border-gray-200"
                                            style={{ width: '220px', height: '220px' }}
                                        />
                                        <p className="w-full text-center font-serif text-base text-gray-800 mt-3">
                                            {new Date(update.date).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full text-center font-mono text-sm space-y-1 text-gray-800">
                                <p><span className="font-semibold">Weight:</span> {update.weight} kg/lbs</p>
                                {update.protein != null && (
                                     <p><span className="font-semibold">Protein:</span> {update.protein}g</p>
                                )}
                            </div>
                       </div>
                    </Page>
                ))}
                
                <PageCover>
                    <div>
                        <h2 className="text-2xl font-bold font-serif">To Be Continued...</h2>
                    </div>
                </PageCover>
            </HTMLFlipBook>
        </div>
    );
};
