import React, { useState, useEffect } from 'react';
import type { Page } from '../App';
import { FormCheckIcon, BookOpenIcon, PlusIcon } from '../components/icons';
import { getAllDailyUpdates } from '../lib/db';
import type { DailyUpdate } from '../types';

// A sub-component for the activity graph, redesigned to mimic GitHub's contribution chart
const ContributionGraph: React.FC<{ updates: DailyUpdate[] }> = ({ updates }) => {
    const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const WEEKS = 27; // Show last ~6 months

    const activityDates = new Set(updates.map(u => toYMD(new Date(u.date))));

    // Calculate the start date for the grid. It should be ~27 weeks ago, aligned to a Sunday.
    const lastSunday = new Date(today);
    lastSunday.setDate(lastSunday.getDate() - today.getDay());
    
    const startDate = new Date(lastSunday);
    startDate.setDate(startDate.getDate() - (WEEKS - 1) * 7);

    // Create an array of day objects for the last 27 weeks.
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
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div className="inline-block align-top">
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
                    <div className="flex flex-col gap-1">
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
                                          isFuture ? 'bg-transparent' : hasActivity ? 'bg-primary' : 'bg-secondary'
                                        }`}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>
                 <div className="text-xs text-muted-foreground mt-2 flex justify-end items-center gap-2">
                    Less
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-secondary"></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-primary"></div>
                    More
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
            <div className="space-y-8 max-w-4xl mx-auto">
                <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6">
                    <ContributionGraph updates={updates} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <button
                        onClick={() => onNavigate('daily-update')}
                        className="w-full bg-card rounded-xl border border-border shadow-sm p-6 text-left flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    >
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <PlusIcon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-card-foreground">Log Today's Progress</h3>
                            <p className="text-muted-foreground text-sm">Add a new entry to your journal.</p>
                        </div>
                    </button>
                     <button
                        onClick={() => onNavigate('progress-book')}
                        className="w-full bg-card rounded-xl border border-border shadow-sm p-6 text-left flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    >
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpenIcon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-card-foreground">Open Progress Book</h3>
                            <p className="text-muted-foreground text-sm">Review your fitness journey.</p>
                        </div>
                    </button>
                     <button
                        onClick={() => onNavigate('form-checker')}
                        className="w-full bg-primary text-primary-foreground rounded-xl border border-primary shadow-lg p-6 text-left flex items-center gap-4 transition-all duration-300 hover:shadow-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background md:col-span-2"
                    >
                        <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FormCheckIcon className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Analyze Your Form</h3>
                            <p className="opacity-80 text-sm">Get instant, AI-powered feedback on your exercise technique.</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};