import React from 'react';

export const FormAnalysisAnimation: React.FC = () => {
    const chartData = [
        { name: 'Spinal Alignment', value: 85, color: 'var(--chart-1)', radius: 55 },
        { name: 'Joint Stability', value: 90, color: 'var(--chart-2)', radius: 45 },
        { name: 'Range of Motion', value: 75, color: 'var(--chart-3)', radius: 35 },
        { name: 'Tempo & Control', value: 95, color: 'var(--chart-4)', radius: 25 },
    ];
    const totalScore = Math.round(chartData.reduce((acc, item) => acc + item.value, 0) / chartData.length);

    return (
        <div className="w-full h-40 flex flex-col items-center justify-center" aria-hidden="true">
            <svg viewBox="0 0 120 120" className="h-32 w-32">
                <defs>
                    {chartData.map((item, index) => {
                        const circumference = 2 * Math.PI * item.radius;
                        const offset = circumference * (1 - item.value / 100);
                        return (
                            <style key={`anim-${index}`}>{`
                                @keyframes progress-${index} {
                                    from { stroke-dashoffset: ${circumference}; }
                                    to { stroke-dashoffset: ${offset}; }
                                }
                                .progress-bar-${index} {
                                    animation: progress-${index} 1.5s 0.2s ease-out forwards;
                                }
                            `}</style>
                        );
                    })}
                    <style>{`
                        @keyframes count-up {
                            from { opacity: 0; transform: translateY(5px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        .count-up-text {
                            animation: count-up 1s ease-out forwards;
                        }
                    `}</style>
                </defs>
                
                {/* Grid Lines */}
                <circle cx="60" cy="60" r="25" fill="none" stroke="var(--border)" strokeWidth="0.5" />
                <circle cx="60" cy="60" r="35" fill="none" stroke="var(--border)" strokeWidth="0.5" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="var(--border)" strokeWidth="0.5" />
                <circle cx="60" cy="60" r="55" fill="none" stroke="var(--border)" strokeWidth="0.5" />

                {/* Data Bars */}
                {chartData.map((item, index) => {
                     const circumference = 2 * Math.PI * item.radius;
                     return (
                         <circle
                             key={item.name}
                             className={`progress-bar-${index}`}
                             cx="60"
                             cy="60"
                             r={item.radius}
                             fill="none"
                             stroke={item.color}
                             strokeWidth="8"
                             strokeLinecap="round"
                             strokeDasharray={circumference}
                             strokeDashoffset={circumference} /* Initial state */
                             transform="rotate(-90 60 60)"
                         />
                     );
                })}

                {/* Center Text */}
                <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" className="count-up-text">
                    <tspan x="60" dy="-0.2em" fontSize="18" fontWeight="bold" fill="var(--foreground)">{totalScore}</tspan>
                    <tspan x="60" dy="1.2em" fontSize="8" fill="var(--muted-foreground)">Overall</tspan>
                </text>
            </svg>
            <div className="text-center text-xs text-muted-foreground -mt-2">
                AI-powered analysis of key metrics.
            </div>
        </div>
    );
};

export const ProgressBookAnimation: React.FC = () => {
    return (
        <div className="w-full h-40 flex items-center justify-center p-4" aria-hidden="true">
            <div className="relative w-36 h-28">
                {/* Create 3 polaroid-style cards */}
                <div className="absolute w-full h-full bg-card border border-border rounded-md shadow-lg p-1.5 animate-pola-3">
                    <div className="bg-secondary h-4/5 w-full rounded-sm"></div>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">Day 21</p>
                </div>
                <div className="absolute w-full h-full bg-card border border-border rounded-md shadow-lg p-1.5 animate-pola-2">
                    <div className="bg-secondary h-4/5 w-full rounded-sm"></div>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">Day 14</p>
                </div>
                <div className="absolute w-full h-full bg-card border border-border rounded-md shadow-lg p-1.5 animate-pola-1">
                    <div className="bg-secondary h-4/5 w-full rounded-sm"></div>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">Day 1</p>
                </div>
            </div>
             <style>{`
                @keyframes fan-out-1 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); z-index: 10; }
                    50% { transform: translate(-65px, 0) rotate(-20deg); z-index: 10;}
                }
                .animate-pola-1 {
                    animation: fan-out-1 3s ease-in-out infinite;
                }

                 @keyframes fan-out-2 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); z-index: 20; }
                    50% { transform: translate(0, -10px) rotate(3deg); z-index: 20;}
                }
                .animate-pola-2 {
                    animation: fan-out-2 3s ease-in-out infinite;
                }

                @keyframes fan-out-3 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); z-index: 30; }
                    50% { transform: translate(65px, 0) rotate(20deg); z-index: 30;}
                }
                .animate-pola-3 {
                    animation: fan-out-3 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
