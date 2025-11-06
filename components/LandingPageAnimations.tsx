import React from 'react';

export const FormAnalysisAnimation: React.FC = () => {
    const chartData = [
        { name: 'Tempo', value: 100, color: 'var(--chart-5)', radius: 32 },
        { name: 'Depth', value: 95, color: 'var(--chart-4)', radius: 42 },
        { name: 'Stability', value: 75, color: 'var(--chart-3)', radius: 52 },
        { name: 'Alignment', value: 80, color: 'var(--chart-2)', radius: 62 },
        { name: 'Consistency', value: 100, color: 'var(--chart-1)', radius: 72 },
    ];
    const totalScore = 90;

    const centerX = 80;
    const centerY = 80;
    const maxAngleDegrees = 240; // Max sweep for a bar at 100%

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
        const sweepFlag = endAngle < startAngle ? '0' : '1';
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
    };
    
    const gridRadii = [32, 42, 52, 62, 72];
    const numRadialLines = 12;
    const radialLines = Array.from({ length: numRadialLines }).map((_, i) => {
        const angle = (i / numRadialLines) * 360;
        const outerPoint = polarToCartesian(angle, 72);
        return { x2: outerPoint.x, y2: outerPoint.y };
    });

    return (
        <div className="w-full h-40 flex flex-col items-center justify-center" aria-hidden="true">
            <style>{`
                @keyframes count-up { 
                    from { opacity: 0; transform: translateY(5px) scale(0.95); } 
                    to { opacity: 1; transform: translateY(0) scale(1); } 
                }
                .count-up-text { animation: count-up 1s 0.5s ease-out forwards; opacity: 0; }
                ${chartData.map((item, index) => {
                    const endAngle = -((item.value / 100) * maxAngleDegrees);
                    const angleInRadians = (Math.abs(endAngle) * Math.PI) / 180.0;
                    const arcLength = angleInRadians * item.radius;
                    return `
                        @keyframes draw-arc-${index} { from { stroke-dashoffset: ${arcLength}; } to { stroke-dashoffset: 0; } }
                        .arc-path-${index} { 
                            stroke-dasharray: ${arcLength}; 
                            stroke-dashoffset: ${arcLength}; 
                            animation: draw-arc-${index} 1.5s 0.2s ease-out forwards; 
                        }
                    `;
                }).join('')}
            `}</style>
            <svg viewBox="0 0 160 160" className="h-36 w-36 -mt-2">
                <g stroke="var(--border)" strokeWidth="0.5" opacity="0.3">
                    {gridRadii.map(r => <circle key={`c-${r}`} cx={centerX} cy={centerY} r={r} fill="none" />)}
                    {radialLines.map((line, i) => <line key={`l-${i}`} x1={centerX} y1={centerY} x2={line.x2} y2={line.y2} />)}
                </g>

                <g>
                    {chartData.map((item, index) => {
                        const startAngle = 0;
                        const endAngle = -((item.value / 100) * maxAngleDegrees);
                        const arcPath = describeArc(item.radius, startAngle, endAngle);
                        
                        return (
                             <g key={item.name}>
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
                    <tspan x="80" dy="-0.2em" fontSize="22" fontWeight="bold" fill="var(--foreground)">{totalScore}</tspan>
                    <tspan x="80" dy="1.2em" fontSize="9" fill="var(--muted-foreground)">Overall</tspan>
                </text>
            </svg>
             <div className="text-center text-xs text-foreground -mt-2">
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
