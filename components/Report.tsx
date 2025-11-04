
import React from 'react';
import type { ReportData } from '../types';
import { AlertIcon, CheckIcon, GaugeIcon, InfoIcon, RestartIcon, TrophyIcon, ClockIcon, FormCheckIcon } from './icons';
import { AccordionItem } from './Accordion';

interface ReportProps {
  data: ReportData;
  onReset: () => void;
}

const ReportCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-card rounded-xl border border-border shadow-sm overflow-hidden ${className}`}>
        <div className="p-6">
            <div className="flex items-center mb-4">
                {icon}
                <h3 className="text-xl font-bold ml-3 text-card-foreground">{title}</h3>
            </div>
            {children}
        </div>
    </div>
);


export const Report: React.FC<ReportProps> = ({ data, onReset }) => {
    
  const getRatingStyles = (level: string) => {
    switch (level) {
      case 'Needs Improvement': return 'text-destructive';
      case 'Good': return 'text-yellow-400';
      case 'Excellent': return 'text-green-400';
      case 'Perfect': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };
    
  const getFeedbackStyles = (feedbackType: 'error' | 'refinement' | 'optimization') => {
    switch (feedbackType) {
      case 'error': return {
          text: 'text-destructive',
          icon: <AlertIcon className="w-6 h-6 text-destructive" />,
          findingsText: 'text-destructive'
        };
      case 'refinement': return {
          text: 'text-yellow-400',
          icon: <InfoIcon className="w-6 h-6 text-yellow-500" />,
          findingsText: 'text-yellow-400'
        };
      case 'optimization': return {
          text: 'text-primary',
          icon: <TrophyIcon className="w-6 h-6 text-primary" />,
          findingsText: 'text-primary'
        };
      default: return {
          text: 'text-destructive',
          icon: <AlertIcon className="w-6 h-6 text-destructive" />,
          findingsText: 'text-destructive'
        };
    }
  };

  const ratingColor = getRatingStyles(data.formRating.level);
  const feedbackStyles = getFeedbackStyles(data.error.feedbackType);
  
  const circleRadius = 74;
  const circleStrokeWidth = 12;
  const strokeDasharray = 2 * Math.PI * circleRadius;
  const strokeDashoffset = strokeDasharray * (1 - data.formRating.formScore / 100);

  return (
    <div className="w-full mx-auto animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2 sm:mb-0">{data.title}</h1>
             <button
                onClick={onReset}
                className="flex items-center px-4 py-2 text-sm font-medium text-secondary-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors duration-200 shadow-sm"
                >
                <RestartIcon className="w-4 h-4 mr-2" />
                Analyze Another Video
            </button>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6 lg:items-start">
        
        {/* Main Analysis Content (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2 order-1 space-y-6">
            <ReportCard title={data.error.title} icon={feedbackStyles.icon}>
              <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden border border-border bg-black flex justify-center items-center mb-4">
                      <img src={data.error.imageSrc} alt="Exercise frame with feedback" className="max-w-full max-h-[45vh] object-contain" />
                      <span className={`absolute top-2 right-2 text-xs font-mono px-2 py-1 rounded flex items-center bg-card/80 backdrop-blur-sm ${feedbackStyles.text}`}>
                          <ClockIcon className="w-3 h-3 mr-1.5" />
                          {data.error.timestamp}
                      </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                          <p className="text-sm text-muted-foreground font-medium">Finding</p>
                          <p className={`font-semibold text-lg ${feedbackStyles.findingsText}`}>{data.findings.errorName}</p>
                      </div>
                       <div>
                          <p className="text-sm text-muted-foreground font-medium">Analysis Confidence</p>
                          <p className="font-mono text-lg text-green-500">{data.findings.confidence}</p>
                      </div>
                      <div className="md:col-span-2">
                          <p className="text-sm text-muted-foreground font-medium">Description</p>
                          <p className="text-sm text-foreground">{data.findings.description}</p>
                      </div>
                      <div className="md:col-span-2">
                          <p className="text-sm text-muted-foreground font-medium">Affected Joints</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                              {data.findings.affectedJoints.map((joint) => (
                                  <span key={joint} className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{joint}</span>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
            </ReportCard>
            
            <AccordionItem title={data.correctionPlan.title} icon={<CheckIcon className="w-6 h-6 text-green-500" />} defaultOpen>
              <div className="space-y-6">
                {data.correctionPlan.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">{index + 1}</div>
                        <div>
                            <p className="font-semibold text-card-foreground">{step.title}</p>
                            <p className="text-muted-foreground text-sm">{step.description}</p>
                        </div>
                    </div>
                ))}
              </div>
            </AccordionItem>

            <AccordionItem title={data.rationale.title} icon={<InfoIcon className="w-6 h-6 text-yellow-500" />}>
                <p className="text-muted-foreground text-sm">{data.rationale.text}</p>
            </AccordionItem>

            <AccordionItem title={data.positiveReinforcement.title} icon={<FormCheckIcon className="w-6 h-6 text-primary" />}>
                <p className="text-muted-foreground text-sm">{data.positiveReinforcement.text}</p>
            </AccordionItem>
        </div>

        {/* Sidebar Content (1 column on desktop) */}
        <div className="lg:col-span-1 order-2 space-y-6">
             <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col items-center text-center">
                <h3 className="text-xl font-bold text-card-foreground mb-4">Overall Score</h3>
                <div className="relative">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r={circleRadius} stroke="currentColor" strokeWidth={circleStrokeWidth} fill="transparent" className="text-muted opacity-10" />
                        <circle
                            cx="80"
                            cy="80"
                            r={circleRadius}
                            stroke="currentColor"
                            strokeWidth={circleStrokeWidth}
                            fill="transparent"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className={`${ratingColor} transition-all duration-1000 ease-out`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-5xl font-bold ${ratingColor}`}>{data.formRating.formScore}</span>
                    </div>
                </div>
                <h2 className={`text-3xl font-bold mt-4 ${ratingColor}`}>
                    {data.formRating.level}
                </h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">{data.formRating.justification}</p>
            </div>
            
            <ReportCard title="Detailed Breakdown" icon={<GaugeIcon className="w-6 h-6 text-primary" />}>
                 <div className="space-y-5">
                    {data.formRating.detailedScores.map((item, index) => (
                        <div key={index}>
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-semibold text-foreground">{item.metric}</p>
                                <p className="font-mono text-lg font-bold text-primary">{item.score}<span className="text-sm font-normal text-muted-foreground">/10</span></p>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${item.score * 10}%`, transition: 'width 1s ease-out' }}></div>
                            </div>
                            <p className="text-muted-foreground text-xs mt-1.5">{item.justification}</p>
                        </div>
                    ))}
                </div>
            </ReportCard>
        </div>

      </div>
    </div>
  );
};
