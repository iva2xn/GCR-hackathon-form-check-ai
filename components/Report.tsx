import React from 'react';
import type { ReportData } from '../types';
import { AlertIcon, GaugeIcon, InfoIcon, RestartIcon, TrophyIcon, ClockIcon, ClipboardListIcon, LightbulbIcon, SparklesIcon } from './icons';

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


const ScoreBreakdownCard: React.FC<{ formRating: ReportData['formRating'] }> = ({ formRating }) => {
  const chartColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
  const numMetrics = formRating.detailedScores.length;
  // Reverse a slice of the colors so the last metric (largest radius) gets the primary color (--chart-1).
  const metricColors = [...chartColors].slice(0, numMetrics).reverse();
  const baseRadius = 42;
  const radiusIncrement = 10;

  // Map scores to chart data. The first metric gets the smallest radius.
  // The final .reverse() is to process the largest arc first for rendering.
  const chartData = formRating.detailedScores.map((item, index) => ({
    name: item.metric,
    score: item.score, // The original score for text display
    visualValue: item.score + 49, // Inflate score to make arcs appear longer.
    color: metricColors[index],
    radius: baseRadius + (index * radiusIncrement),
  })).reverse();

  const centerX = 80;
  const centerY = 80;
  const maxAngleDegrees = 240;
  const chartStartAngle = 0; // Starts at 3 o'clock

  const polarToCartesian = (angleInDegrees: number, radius: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);
    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';
    const sweepFlag = endAngle < startAngle ? '0' : '1'; // 0 for counter-clockwise
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
  };
    
  const getRatingStyles = (level: string) => {
    switch (level) {
      case 'Needs Improvement': return 'text-chart-4';
      case 'Good': return 'text-chart-3';
      case 'Excellent': return 'text-chart-2';
      case 'Perfect': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };
  const ratingColor = getRatingStyles(formRating.level);

  const gridRadii = [42, 52, 62, 72, 85];
  const numRadialLines = 12;
  const radialLines = Array.from({ length: numRadialLines }).map((_, i) => {
    const angle = (i / numRadialLines) * 360;
    const outerPoint = polarToCartesian(angle, 82);
    return { x2: outerPoint.x, y2: outerPoint.y };
  });

  return (
    <ReportCard title="Score Breakdown" icon={<GaugeIcon className="w-6 h-6 text-primary" />}>
      <style>{`
        @keyframes count-up { 
            from { opacity: 0; transform: translateY(5px); } 
            to { opacity: 1; transform: translateY(0); } 
        }
        .count-up-text { animation: count-up 1s 0.5s ease-out forwards; opacity: 0; }
        ${chartData.map((item, index) => {
            const sweepAngle = (item.visualValue / 100) * maxAngleDegrees;
            const angleInRadians = (sweepAngle * Math.PI) / 180.0;
            const arcLength = angleInRadians * item.radius;
            return `
                @keyframes draw-arc-${index} { from { stroke-dashoffset: ${arcLength}; } to { stroke-dashoffset: 0; } }
                .arc-path-${index} { 
                    stroke-dasharray: ${arcLength}; 
                    stroke-dashoffset: ${arcLength}; 
                    animation: draw-arc-${index} 1.5s ${0.2 + index * 0.1}s ease-out forwards; 
                }
            `;
        }).join('')}
      `}</style>
      
      <div className="relative flex flex-col items-center">
        <svg viewBox="0 0 160 160" className="w-48 h-48">
            <g>
                <g stroke="var(--border)" strokeWidth="0.5" opacity="0.2">
                    {gridRadii.slice(0, chartData.length).map(r => <circle key={`c-${r}`} cx={centerX} cy={centerY} r={r} fill="none" />)}
                    {radialLines.map((line, i) => <line key={`l-${i}`} x1={centerX} y1={centerY} x2={line.x2} y2={line.y2} />)}
                </g>
                
                {chartData.map((item, index) => {
                    const sweepAngle = (item.visualValue / 100) * maxAngleDegrees;
                    const endAngle = chartStartAngle - sweepAngle;
                    const arcPath = describeArc(item.radius, chartStartAngle, endAngle);
                    
                    return (
                        <g key={item.name}>
                             <path
                                d={describeArc(item.radius, chartStartAngle, chartStartAngle - maxAngleDegrees)}
                                fill="none"
                                stroke="var(--muted)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                opacity="0.1"
                            />
                            <path
                                className={`arc-path-${index}`}
                                d={arcPath}
                                fill="none"
                                stroke={item.color}
                                strokeWidth="8"
                                strokeLinecap="round"
                            />
                        </g>
                    );
                })}
            </g>
            <text x="80" y="80" textAnchor="middle" dominantBaseline="middle" className="count-up-text">
                <tspan x="80" dy="-0.2em" fontSize="28" fontWeight="bold" fill="var(--foreground)">{formRating.formScore}</tspan>
                <tspan x="80" dy="1.4em" fontSize="10" fill="var(--muted-foreground)">Overall</tspan>
            </text>
        </svg>

        <h3 className={`text-2xl font-bold mt-2 count-up-text ${ratingColor}`}>{formRating.level}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs text-center">{formRating.justification}</p>
      </div>
      
      <hr className="my-6 border-border" />

      <div className="space-y-5">
        {formRating.detailedScores.map((item, index) => (
            <div key={index}>
                <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: metricColors[index] }}></span>
                        <p className="font-semibold text-foreground">{item.metric}</p>
                    </div>
                    <p className="font-mono text-lg font-bold" style={{ color: metricColors[index] }}>
                        {item.score}<span className="text-sm font-normal text-muted-foreground">/100</span>
                    </p>
                </div>
                <p className="text-muted-foreground text-xs pl-6">{item.justification}</p>
            </div>
        ))}
      </div>
    </ReportCard>
  );
};


export const Report: React.FC<ReportProps> = ({ data, onReset }) => {
    
  const getFeedbackStyles = (feedbackType: 'error' | 'refinement' | 'optimization') => {
    switch (feedbackType) {
      case 'error': return {
          text: 'text-chart-4',
          icon: <AlertIcon className="w-6 h-6 text-chart-4" />,
          findingsText: 'text-chart-4'
        };
      case 'refinement': return {
          text: 'text-chart-3',
          icon: <InfoIcon className="w-6 h-6 text-chart-3" />,
          findingsText: 'text-chart-3'
        };
      case 'optimization': return {
          text: 'text-primary',
          icon: <TrophyIcon className="w-6 h-6 text-primary" />,
          findingsText: 'text-primary'
        };
      default: return {
          text: 'text-chart-4',
          icon: <AlertIcon className="w-6 h-6 text-chart-4" />,
          findingsText: 'text-chart-4'
        };
    }
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:items-start">
        
        {/* Main error card */}
        <div className="order-1">
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
                        <p className="font-mono text-lg text-chart-2">{data.findings.confidence}</p>
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
        </div>
        
        {/* Consolidated AI Feedback Card */}
        <div className="order-3 lg:order-2">
            <ReportCard title="AI-Coach Feedback" icon={<ClipboardListIcon className="w-6 h-6 text-primary" />}>
                <div className="space-y-8">
                {/* Correction Plan Stepper */}
                <div>
                    <h4 className="font-semibold text-lg text-card-foreground mb-4">{data.correctionPlan.title}</h4>
                    <ol className="relative border-l border-border/50 ml-4">
                    {data.correctionPlan.steps.map((step, index) => (
                        <li key={index} className="mb-6 ml-8 last:mb-0">
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-secondary rounded-full -left-4 ring-4 ring-card text-sm font-bold text-secondary-foreground">
                            {index + 1}
                        </span>
                        <h5 className="font-semibold text-card-foreground">{step.title}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        </li>
                    ))}
                    </ol>
                </div>
                
                {/* Key Insight */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-secondary rounded-lg">
                            <LightbulbIcon className="w-5 h-5 text-chart-3" />
                        </div>
                        <h4 className="text-lg font-semibold text-card-foreground">{data.rationale.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground pl-11">{data.rationale.text}</p>
                </div>
                
                {/* Strengths */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-secondary rounded-lg">
                            <SparklesIcon className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="text-lg font-semibold text-card-foreground">{data.positiveReinforcement.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground pl-11">{data.positiveReinforcement.text}</p>
                </div>
                </div>
            </ReportCard>
        </div>
        
        {/* Score breakdown, positioned correctly for both mobile and desktop */}
        <div className="order-2 lg:order-3 lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <ScoreBreakdownCard formRating={data.formRating} />
        </div>

      </div>
    </div>
  );
};