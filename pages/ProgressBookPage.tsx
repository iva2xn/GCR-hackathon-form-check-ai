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
            className="bg-[#ffff6c] text-gray-800 p-8 flex flex-col relative overflow-hidden" 
            ref={ref}
            style={{
                backgroundImage: `
                    repeating-linear-gradient(
                        to bottom,
                        transparent,
                        transparent 27px,
                        #d4d4d4 27px,
                        #d4d4d4 28px
                    )
                `,
                backgroundSize: '100% 28px',
                backgroundPosition: '0 8px',
            }}
        >
            <div className="relative z-10 flex-grow flex flex-col">{children}</div>
            <div className={`absolute bottom-4 z-10 text-xs text-gray-500 font-mono ${number % 2 === 0 ? 'right-4' : 'left-4'}`}>{number}</div>
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
                const sortedUpdates = allUpdates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setUpdates(sortedUpdates.slice(-15));
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
    
    // FIX: The react-pageflip library has incorrect TypeScript definitions, marking optional props as required.
    // Casting to `any` to bypass the type checking for this component and avoid compilation errors.
    const AnyHTMLFlipBook = HTMLFlipBook as any;

    return (
        <div ref={containerRef} className="w-full flex justify-center items-center animate-fade-in" style={{ minHeight: `${bookSize.height}px` }}>
            <AnyHTMLFlipBook
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

                {updates.flatMap((update, index) => [
                    <Page key={`${update.id}-left`} number={index * 2 + 1}>
                       <div className="h-full w-full flex flex-col items-center justify-center">
                            <div className="transform -rotate-2 hover:rotate-1 transition-transform duration-300 ease-in-out">
                                <div className="bg-white p-3 rounded-sm shadow-lg">
                                    <img 
                                        src={update.imageBase64} 
                                        alt={`Progress on ${new Date(update.date).toLocaleDateString()}`} 
                                        className="object-cover border border-gray-200"
                                        style={{ width: '280px', height: '280px' }}
                                    />
                                    <p className="w-full text-left font-digital text-lg text-gray-500 mt-2 px-1">
                                        {new Date(update.date).toLocaleDateString('en-US', {
                                            year: '2-digit', month: '2-digit', day: '2-digit' 
                                        })}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-6 font-doodle text-2xl text-gray-800 transform -rotate-1 text-center">
                                <p className="font-bold pt-[3px]" style={{ lineHeight: '56px' }}>Weight: {update.weight} kg/lbs</p>
                            </div>
                       </div>
                    </Page>,
                    <Page key={`${update.id}-right`} number={index * 2 + 2}>
                        <div className="h-full w-full flex flex-col font-doodle text-gray-800">
                            <h2 className="text-3xl font-bold mb-4" style={{ paddingTop: '3px', lineHeight: '56px' }}>
                                {update.title}
                            </h2>
                            <p className="text-xl whitespace-pre-wrap flex-grow" style={{ lineHeight: '28px', paddingTop: '3px' }}>
                                {update.description}
                            </p>
                        </div>
                    </Page>
                ])}
                
                <PageCover>
                    <div>
                        <h2 className="text-2xl font-bold font-serif">To Be Continued...</h2>
                    </div>
                </PageCover>
            </AnyHTMLFlipBook>
        </div>
    );
};
