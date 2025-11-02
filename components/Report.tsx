
import React from 'react';
import type { ReportData } from '../types';
import { AlertIcon, CheckIcon, GaugeIcon, InfoIcon, RestartIcon, TrophyIcon, ClockIcon } from './icons';

interface ReportProps {
  data: ReportData;
  onReset: () => void;
}

const ReportCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex items-center mb-4">
            {icon}
            <h3 className="text-xl font-bold ml-3 text-card-foreground">{title}</h3>
        </div>
        {children}
    </div>
);

export const Report: React.FC<ReportProps> = ({ data, onReset }) => {
    
  const getRatingStyles = (level: string) => {
    switch (level) {
      case 'Needs Improvement':
        return {
          container: 'bg-destructive/10 border-destructive/30 text-destructive',
          iconBg: 'bg-destructive/10',
          iconColor: 'text-destructive',
        };
      case 'Good':
        return {
          container: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
          iconBg: 'bg-yellow-500/10',
          iconColor: 'text-yellow-400',
        };
      case 'Excellent':
        return {
          container: 'bg-green-500/10 border-green-500/30 text-green-300',
          iconBg: 'bg-green-500/10',
          iconColor: 'text-green-400',
        };
      case 'Perfect':
        return {
          container: 'bg-primary/10 border-primary/30 text-primary',
          iconBg: 'bg-primary/10',
          iconColor: 'text-primary',
        };
      default:
        return {
          container: 'bg-card border-border text-foreground',
          iconBg: 'bg-muted',
          iconColor: 'text-muted-foreground',
        };
    }
  };
    
  const getFeedbackStyles = (feedbackType: 'error' | 'refinement' | 'optimization') => {
    switch (feedbackType) {
      case 'error':
        return {
          container: 'border-destructive/50 shadow-destructive/10',
          text: 'text-destructive',
          iconBg: 'bg-destructive/10',
          icon: <AlertIcon className="w-7 h-7 text-destructive" />,
          border: 'border-destructive/30',
          findingsText: 'text-destructive'
        };
      case 'refinement':
        return {
          container: 'border-yellow-500/50 shadow-yellow-500/10',
          text: 'text-yellow-400',
          iconBg: 'bg-yellow-500/10',
          icon: <InfoIcon className="w-7 h-7 text-yellow-500" />,
          border: 'border-yellow-500/30',
          findingsText: 'text-yellow-400'
        };
      case 'optimization':
        return {
          container: 'border-primary/50 shadow-primary/10',
          text: 'text-primary',
          iconBg: 'bg-primary/10',
          icon: <TrophyIcon className="w-7 h-7 text-primary" />,
          border: 'border-primary/30',
          findingsText: 'text-primary'
        };
      default:
          return {
          container: 'border-destructive/50 shadow-destructive/10',
          text: 'text-destructive',
          iconBg: 'bg-destructive/10',
          icon: <AlertIcon className="w-7 h-7 text-destructive" />,
          border: 'border-destructive/30',
          findingsText: 'text-destructive'
        };
    }
  };

  const ratingStyles = getRatingStyles(data.formRating.level);
  const feedbackStyles = getFeedbackStyles(data.error.feedbackType);


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

        <div className={`rounded-lg p-4 sm:p-5 shadow-md my-6 flex items-start sm:items-center gap-4 border ${ratingStyles.container}`}>
            <div className={`p-3 rounded-full ${ratingStyles.iconBg}`}>
                <GaugeIcon className={`w-8 h-8 ${ratingStyles.iconColor}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Form Rating</p>
                <h2 className="text-2xl font-bold">
                    {data.formRating.level}
                    <span className="text-muted-foreground font-normal text-lg ml-2">({data.formRating.formScore}/100)</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{data.formRating.justification}</p>
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
            <div className={`bg-card border rounded-xl p-4 sm:p-6 shadow-md ${feedbackStyles.container}`}>
                <div className={`flex items-center mb-3 ${feedbackStyles.text}`}>
                    {feedbackStyles.icon}
                    <h2 className="text-2xl font-bold ml-3">{data.error.title}</h2>
                    <span className={`ml-auto text-sm font-mono px-2 py-1 rounded flex items-center ${feedbackStyles.iconBg} ${feedbackStyles.text}`}>
                        <ClockIcon className="w-4 h-4 mr-1.5" />
                        {data.error.timestamp}
                    </span>
                </div>
                <div className={`relative rounded-lg overflow-hidden border-2 ${feedbackStyles.border}`}>
                    <img src={data.error.imageSrc} alt="Exercise frame with feedback" className="w-full h-auto" />
                </div>
            </div>

            <ReportCard title="Performance Breakdown" icon={<GaugeIcon className="w-6 h-6 text-primary" />}>
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
            </ReportCard>

            <ReportCard title={data.correctionPlan.title} icon={<CheckIcon className="w-6 h-6 text-green-500" />}>
                 <div className="space-y-4">
                    {data.correctionPlan.steps.map((step, index) => (
                        <div key={index}>
                            <p className="font-semibold text-primary">{step.title}</p>
                            <p className="text-muted-foreground text-sm">{step.description}</p>
                        </div>
                    ))}
                </div>
            </ReportCard>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
            <ReportCard title={data.positiveReinforcement.title} icon={<TrophyIcon className="w-6 h-6 text-primary" />}>
                <p className="text-muted-foreground text-sm">{data.positiveReinforcement.text}</p>
            </ReportCard>
            <ReportCard title="Specific Findings" icon={<InfoIcon className="w-6 h-6 text-yellow-500" />}>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Feedback</p>
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
            </ReportCard>
            
             <ReportCard title={data.rationale.title} icon={<AlertIcon className="w-6 h-6 text-destructive" />}>
                <p className="text-muted-foreground text-sm">{data.rationale.text}</p>
            </ReportCard>
        </div>
      </div>
    </div>
  );
};