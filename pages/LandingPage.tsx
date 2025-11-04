import React from 'react';
import type { Page } from '../App';
import { FormCheckIcon, DumbbellIcon } from '../components/icons';

interface LandingPageProps {
    onNavigate: (page: Page) => void;
}

const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="w-full bg-card rounded-xl border border-border shadow-sm p-6 text-left flex flex-col items-start transition-all duration-300 hover:shadow-lg hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
    >
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-card-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground flex-grow">{description}</p>
        <div className="mt-4 text-sm font-semibold text-primary">
            Get Started &rarr;
        </div>
    </button>
);


export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
    return (
        <div className="w-full text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
                Unlock Your Peak Fitness
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
                Your personal AI-powered companion for smarter training, precise form correction, and consistent progress tracking.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
                <FeatureCard
                    icon={<FormCheckIcon className="w-7 h-7 text-primary" />}
                    title="Analyze Your Form"
                    description="Get instant, AI-powered feedback on your exercise technique to maximize gains and prevent injury. Upload a video and let our AI do the rest."
                    onClick={() => onNavigate('form-checker')}
                />
                <FeatureCard
                    icon={<DumbbellIcon className="w-7 h-7 text-primary" />}
                    title="Track Your Progress"
                    description="Log your daily wins, from nutrition to workouts. Upload a progress photo and record your protein intake and muscle group trained."
                    onClick={() => onNavigate('daily-update')}
                />
            </div>
        </div>
    );
};