import React from 'react';
import type { ReportData } from '../types';
import { AlertIcon, CheckIcon, GaugeIcon, InfoIcon, RestartIcon, TrophyIcon, ClockIcon, FormCheckIcon } from './icons';
import { AccordionItem } from './Accordion';

interface ReportProps {
  data: ReportData;
  onReset: () => void;
}

export const Report: React.FC<ReportProps> = ({ data, onReset }) => {
    
  const getRatingStyles = (level: string) => {
    switch (level) {
      case 'Needs Improvement':
        return {
          container: 'bg-destructive/10 border-destructive/30 text-destructive',
          iconColor: 'text-destructive',
        };
      case 'Good':
        return {
          container: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
          iconColor: 'text-yellow-400',
        };
      case 'Excellent':
        return {
          container: 'bg-green-500/10 border-green-500/30 text-green-300',
          iconColor: 'text-green-400',
        };
      case 'Perfect':
        return {
          container: 'bg-primary/10 border-primary/30 text-primary',
          iconColor: 'text-primary',
        };
      default:
        return {
          container: 'bg-card border-border text-foreground',
          iconColor: 'text-muted-foreground',
        };
    }
  };
    
  const getFeedbackStyles = (feedbackType: 'error' | 'refinement' | 'optimization') => {
    switch (feedbackType) {
      case 'error':
        return {
          text: 'text-destructive',
          icon: <AlertIcon className="w-6 h-6 text-destructive" />,
          findingsText: 'text-destructive'
        };
      case 'refinement':
        return {
          text: 'text-yellow-400',
          icon: <InfoIcon className="w-6 h-6 text-yellow-500" />,
          findingsText: 'text-yellow-400'
        };
      case 'optimization':
        return {
          text: 'text-primary',
          icon: <TrophyIcon className="w-6 h-6 text-primary" />,
          findingsText: 'text-primary'
        };
      default:
          return {
          text: 'text-destructive',
          icon: <AlertIcon className="w-6 h-6 text-destructive" />,
          findingsText: 'text-destructive'
        };
    }
  };

  const ratingStyles = getRatingStyles(data.formRating.level);
  const feedbackStyles = getFeedbackStyles(data.error.feedbackType);
  const strokeDasharray = 2 * Math.PI * 44;
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

        <div className={`rounded-xl p-6 shadow-md my-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border ${ratingStyles.container}`}>
            <div className="flex-shrink-0 relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="opacity-20" />
                    <circle
                        cx="50"
                        cy="50"
                        r="44"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${ratingStyles.iconColor}`}>{data.formRating.formScore}</span>
                </div>
            </div>
            <div className="text-center sm:text-left">
                <p className={`text-sm font-medium uppercase tracking-wider ${ratingStyles.iconColor} opacity-80`}>Overall Form Score</p>
                <h2 className="text-3xl font-bold mt-1">
                    {data.formRating.level}
                </h2>
                <p className={`text-sm opacity-80 mt-2 max-w-md ${ratingStyles.iconColor}`}>{data.formRating.justification}</p>
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          <AccordionItem title="Primary Feedback" icon={feedbackStyles.icon} defaultOpen={true}>
              <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden border border-border bg-black flex justify-center items-center mb-4">
                      <img src={data.error.imageSrc} alt="Exercise frame with feedback" className="max-w-full max-h-[40vh] object-contain" />
                      <span className={`absolute top-2 right-2 text-xs font-mono px-2 py-1 rounded flex items-center bg-card/80 backdrop-blur-sm ${feedbackStyles.text}`}>
                          <ClockIcon className="w-3 h-3 mr-1.5" />
                          {data.error.timestamp}
                      </span>
                  </div>

                  <div>
                      <p className="text-sm text-muted-foreground font-medium">Finding</p>
                      <p className={`font-semibold ${feedbackStyles.findingsText}`}>{data.findings.errorName}</p>
                  </div>
                  <div>
                      <p className="text-sm text-muted-foreground font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">{data.findings.description}</p>
                  </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Analysis Confidence</p>
                      <p className="font-mono text-lg text-green-500">{data.findings.confidence}</p>
                  </div>
                  <div>
                      <p className="text-sm text-muted-foreground font-medium">Affected Joints</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                          {data.findings.affectedJoints.map((joint) => (
                              <span key={joint} className="text-xs font-medium bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full">{joint}</span>
                          ))}
                      </div>
                  </div>
              </div>
          </AccordionItem>
          
          <AccordionItem title={data.correctionPlan.title} icon={<CheckIcon className="w-6 h-6 text-green-500" />} defaultOpen={true}>
                <div className="space-y-4">
                  {data.correctionPlan.steps.map((step, index) => (
                      <div key={index}>
                          <p className="font-semibold text-primary">{step.title}</p>
                          <p className="text-muted-foreground text-sm">{step.description}</p>
                      </div>
                  ))}
              </div>
          </AccordionItem>

          <AccordionItem title={data.rationale.title} icon={<InfoIcon className="w-6 h-6 text-yellow-500" />}>
              <p className="text-muted-foreground text-sm">{data.rationale.text}</p>
          </AccordionItem>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
            <AccordionItem title="Performance Breakdown" icon={<GaugeIcon className="w-6 h-6 text-primary" />}>
                <div className="space-y-5">
                    {data.formRating.detailedScores.map((item, index) => (
                        <div key={index}>
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-semibold text-foreground">{item.metric}</p>
                                <p className="font-mono text-lg font-bold text-primary">{item.score}<span className="text-sm font-normal text-muted-foreground">/10</span></p>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${item.score * 10}%` }}></div>
                            </div>
                            <p className="text-muted-foreground text-xs mt-1.5">{item.justification}</p>
                        </div>
                    ))}
                </div>
            </AccordionItem>

            <AccordionItem title={data.positiveReinforcement.title} icon={<FormCheckIcon className="w-6 h-6 text-primary" />}>
                <p className="text-muted-foreground text-sm">{data.positiveReinforcement.text}</p>
            </AccordionItem>
        </div>
      </div>
    </div>
  );
};