import React from 'react';

export const FormAnalysisAnimation: React.FC = () => {
    return (
        <div className="w-full h-32 flex items-center justify-center" aria-hidden="true">
            <svg viewBox="0 0 100 100" className="h-full w-auto text-foreground overflow-visible">
                {/* Ground */}
                <line x1="10" y1="90" x2="90" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" opacity="0.5" />

                {/* Animated Skeleton Group */}
                <g className="animate-squat-descent">
                    {/* Hips/Pelvis (the root of legs and torso) */}
                    <g transform="translate(50, 50)">
                        {/* Torso, Head, and Arms */}
                        <g className="animate-torso-lean">
                            <path d="M0,0 C-2,-10 -2,-20 0,-30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" className="animate-spine-wink" />
                            <circle cx="0" cy="-35" r="5" fill="currentColor" />
                            {/* Arms */}
                            <g transform="translate(0, -25)" className="animate-arm-raise">
                                <line x1="0" y1="0" x2="20" y2="-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                <line x1="20" y1="-5" x2="35" y2="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </g>
                        </g>

                        {/* Left Leg */}
                        <g className="animate-femur-bend">
                            <line x1="0" y1="0" x2="-20" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            <g transform="translate(-20, 20)" className="animate-tibia-bend">
                                <line x1="0" y1="0" x2="5" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                <line x1="5" y1="20" x2="-10" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </g>
                        </g>
                        
                        {/* Right Leg */}
                        <g className="animate-femur-bend">
                            <line x1="0" y1="0" x2="20" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            <g transform="translate(20, 20)" className="animate-tibia-bend">
                                <line x1="0" y1="0" x2="-5" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                <line x1="-5" y1="20" x2="10" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </g>
                        </g>
                    </g>
                </g>
                
                <style>{`
                    @keyframes squat-descent {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(20px); }
                    }
                    .animate-squat-descent {
                        animation: squat-descent 3s ease-in-out infinite;
                    }

                    @keyframes torso-lean {
                        0%, 100% { transform: rotate(0deg); }
                        50% { transform: rotate(-30deg); }
                    }
                    .animate-torso-lean {
                        animation: torso-lean 3s ease-in-out infinite;
                        transform-origin: 0 0;
                    }
                    
                    @keyframes arm-raise {
                        0%, 100% { transform: rotate(0deg); }
                        50% { transform: rotate(40deg); }
                    }
                    .animate-arm-raise {
                        animation: arm-raise 3s ease-in-out infinite;
                        transform-origin: 0 0;
                    }

                    @keyframes femur-bend {
                        0%, 100% { transform: rotate(0deg); }
                        50% { transform: rotate(45deg); }
                    }
                    .animate-femur-bend {
                        animation: femur-bend 3s ease-in-out infinite;
                        transform-origin: 0 0;
                    }

                    @keyframes tibia-bend {
                        0%, 100% { transform: rotate(0deg); }
                        50% { transform: rotate(-75deg); }
                    }
                    .animate-tibia-bend {
                        animation: tibia-bend 3s ease-in-out infinite;
                        transform-origin: 0 0;
                    }
                    
                    @keyframes spine-wink {
                        0%, 40%, 60%, 100% {
                            d: path("M0,0 C-2,-10 -2,-20 0,-30");
                            stroke: var(--primary);
                        }
                        50% {
                            d: path("M0,0 C5,-10 5,-20 0,-30");
                            stroke: var(--destructive);
                        }
                    }
                    .animate-spine-wink {
                        animation: spine-wink 3s ease-in-out infinite;
                        transition: d 0.3s;
                    }
                `}</style>
            </svg>
        </div>
    );
};


export const ProgressBookAnimation: React.FC = () => {
    return (
        <div className="w-full h-32 flex items-center justify-center p-4" aria-hidden="true">
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
                    50% { transform: translate(-45px, 0) rotate(-15deg); z-index: 10;}
                }
                .animate-pola-1 {
                    animation: fan-out-1 3s ease-in-out infinite;
                }

                 @keyframes fan-out-2 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); z-index: 20; }
                    50% { transform: translate(0, -5px) rotate(2deg); z-index: 20;}
                }
                .animate-pola-2 {
                    animation: fan-out-2 3s ease-in-out infinite;
                }

                @keyframes fan-out-3 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); z-index: 30; }
                    50% { transform: translate(45px, 0) rotate(16deg); z-index: 30;}
                }
                .animate-pola-3 {
                    animation: fan-out-3 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};