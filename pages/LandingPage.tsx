
import React, { useState, useEffect, useRef } from 'react';
import type { Page } from '../App';
import { FormCheckIcon, BookOpenIcon, PlusIcon } from '../components/icons';
import { getAllDailyUpdates } from '../lib/db';
import type { DailyUpdate } from '../types';

// A sub-component for the activity graph, redesigned to mimic GitHub's contribution chart
const ContributionGraph: React.FC<{ updates: DailyUpdate[] }> = ({ updates }) => {
    const graphContainerRef = useRef<HTMLDivElement>(null);
    const [weeksToDisplay, setWeeksToDisplay] = useState(27);

    useEffect(() => {
        const calculateWeeks = () => {
            if (graphContainerRef.current) {
                // Day labels are roughly 24px wide + 12px gap
                const fixedWidthElements = 36;
                // Each week column is 10px wide (w-2.5) + 4px gap (gap-1)
                const weekColumnWidth = 14;
                const availableWidth = graphContainerRef.current.offsetWidth;
                
                if (availableWidth > 0) {
                    const numWeeks = Math.floor((availableWidth - fixedWidthElements) / weekColumnWidth);
                    // Set a minimum of 12 weeks, max of 52 (a full year)
                    setWeeksToDisplay(Math.max(12, Math.min(52, numWeeks)));
                }
            }
        };

        const currentRef = graphContainerRef.current;
        if (!currentRef) return;

        // Use ResizeObserver for efficient resize detection
        const resizeObserver = new ResizeObserver(calculateWeeks);
        resizeObserver.observe(currentRef);

        return () => {
            if (currentRef) {
                resizeObserver.unobserve(currentRef);
            }
        };
    }, []);

    const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const WEEKS = weeksToDisplay;

    const activityDates = new Set(updates.map(u => toYMD(new Date(u.date))));

    // Calculate the start date for the grid. It should be ~WEEKS ago, aligned to a Sunday.
    const lastSunday = new Date(today);
    lastSunday.setDate(lastSunday.getDate() - today.getDay());
    
    const startDate = new Date(lastSunday);
    startDate.setDate(startDate.getDate() - (WEEKS - 1) * 7);

    // Create an array of day objects.
    const dayCells = Array.from({ length: WEEKS * 7 }).map((_, index) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + index);
        return {
            date,
            hasActivity: activityDates.has(toYMD(date))
        };
    });
    
    // Generate month labels that appear at the start of a new month.
    const monthLabels = Array.from({ length: WEEKS }).map((_, weekIndex) => {
        const firstDayOfWeek = dayCells[weekIndex * 7]?.date;
        if (!firstDayOfWeek) return null;

        const month = firstDayOfWeek.toLocaleString('default', { month: 'short' });

        // Show label only for the first week of a new month shown on the chart.
        if (weekIndex === 0) return month;
        
        const firstDayOfPrevWeek = dayCells[(weekIndex - 1) * 7]?.date;
        if (!firstDayOfPrevWeek || firstDayOfWeek.getMonth() !== firstDayOfPrevWeek.getMonth()) {
            return month;
        }
        return null;
    });

    return (
        <div ref={graphContainerRef} className="pb-2">
            <div className="flex gap-3">
                {/* Day labels (Mon, Wed, Fri) */}
                <div className="grid grid-rows-7 gap-1 text-xs text-muted-foreground shrink-0" style={{ paddingTop: '1.25rem' }}>
                    <div className="h-2.5"></div>
                    <div className="h-2.5 flex items-center">Mon</div>
                    <div className="h-2.5"></div>
                    <div className="h-2.5 flex items-center">Wed</div>
                    <div className="h-2.5"></div>
                    <div className="h-2.5 flex items-center">Fri</div>
                    <div className="h-2.5"></div>
                </div>
                
                {/* Graph itself */}
                <div className="flex flex-col gap-1 w-full">
                    {/* Month labels */}
                    <div className="grid h-4" style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }}>
                       {monthLabels.map((month, index) => (
                           <div key={index} className="text-xs text-muted-foreground overflow-visible whitespace-nowrap">
                               {month}
                           </div>
                       ))}
                    </div>

                    {/* Grid of activity squares */}
                    <div className="grid grid-rows-7 grid-flow-col gap-1">
                        {dayCells.map(({ date, hasActivity }, index) => {
                            const tooltipText = `${date.toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}: ${hasActivity ? 'Update logged' : 'No update'}`;
                            const isFuture = date > today;
                            return (
                                 <div
                                    key={index}
                                    title={tooltipText}
                                    className={`w-2.5 h-2.5 rounded-[2px] ${
                                      isFuture ? 'bg-transparent border border-dashed border-border' : hasActivity ? 'bg-primary' : 'bg-secondary'
                                    }`}
                                />
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}


// The new LandingPage, acting as a dashboard
export const LandingPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
    const [updates, setUpdates] = useState<DailyUpdate[]>([]);
    
    useEffect(() => {
        const fetchUpdates = async () => {
            const allUpdates = await getAllDailyUpdates();
            setUpdates(allUpdates);
        };
        fetchUpdates();
    }, []);

    return (
        <div className="w-full text-center animate-fade-in">
            <div className="space-y-4 max-w-4xl mx-auto">
                <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6">
                    <ContributionGraph updates={updates} />
                    <div className="mt-4 flex justify-between items-start">
                        <button
                            onClick={() => onNavigate('daily-update')}
                            className="inline-flex items-center justify-center gap-2 bg-secondary rounded-lg border border-border shadow-sm px-4 py-2 text-left transition-all duration-300 hover:shadow-md hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                        >
                            <PlusIcon className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-semibold text-card-foreground">Log Progress</h3>
                        </button>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                            Less
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-secondary"></div>
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-primary"></div>
                            More
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <button
                        onClick={() => onNavigate('form-checker')}
                        className="w-full bg-card rounded-xl border border-border shadow-sm px-6 pt-3 pb-6 text-left flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    >
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FormCheckIcon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-card-foreground">Analyze Your Form</h3>
                            <p className="text-muted-foreground text-sm">Get instant feedback on your form.</p>
                        </div>
                    </button>
                     <button
                        onClick={() => onNavigate('progress-book')}
                        className="w-full bg-card rounded-xl border border-border shadow-sm px-6 pt-3 pb-6 text-left flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    >
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpenIcon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-card-foreground">Open Progress Book</h3>
                            <p className="text-muted-foreground text-sm">Review your fitness journey.</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};