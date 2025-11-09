


import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { GoogleGenAI, Type } from "@google/genai";
import type { StarterFormData, StarterPlan } from '../types';
import { ScaleIcon, DumbbellIcon, HeartIcon, CloseIcon, CheckIcon, RestartIcon, InfoIcon, AlertIcon, ArrowLeftIcon, ArrowRightIcon, RocketIcon, StreakIcon, TargetIcon, CalendarIcon, CloudIcon } from './icons';

interface PlanInfo {
    plan: StarterPlan;
    formData: StarterFormData;
    startDate: string;
}

const initialFormData: StarterFormData = {
  goal: null,
  gender: null,
  age: '',
  height: '',
  weight: '',
  activityLevel: null,
  workoutDays: '',
  equipment: null,
};

const starterPlanSchema = {
    type: Type.OBJECT,
    properties: {
        planTitle: { type: Type.STRING, description: "A catchy and encouraging title for the user's plan." },
        summary: { type: Type.STRING, description: "A brief, 2-3 sentence summary of the plan's approach, tailored to the user's goal." },
        nutrition: {
            type: Type.OBJECT,
            properties: {
                dailyCalories: { type: Type.INTEGER, description: "Recommended daily caloric intake as a whole number." },
                proteinGrams: { type: Type.INTEGER, description: "Recommended daily protein intake in grams." },
                carbsGrams: { type: Type.INTEGER, description: "Recommended daily carbohydrate intake in grams." },
                fatGrams: { type: Type.INTEGER, description: "Recommended daily fat intake in grams." },
                explanation: { type: Type.STRING, description: "A short explanation of why these macronutrient targets were chosen for the user's goal." },
            },
            required: ['dailyCalories', 'proteinGrams', 'carbsGrams', 'fatGrams', 'explanation'],
        },
        workoutPlan: {
            type: Type.OBJECT,
            properties: {
                weeklySplit: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            day: { type: Type.STRING, description: "The focus for the workout day, e.g., 'Day 1: Full Body Strength' or 'Day 3: Cardio & Core'." },
                            exercises: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description: "List of exercises for the day, including sets and reps, e.g., 'Squats: 3 sets of 8-12 reps'."
                            },
                            notes: { type: Type.STRING, description: "A brief note for the day's workout, e.g., 'Focus on controlled movements and proper form.'" },
                        },
                        required: ['day', 'exercises', 'notes'],
                    },
                },
            },
            required: ['weeklySplit'],
        },
        lifestyleTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3-5 general, actionable lifestyle tips (e.g., hydration, sleep, consistency)."
        },
        disclaimer: { type: Type.STRING, description: "A standard disclaimer stating this is AI-generated advice and a professional should be consulted." },
    },
    required: ['planTitle', 'summary', 'nutrition', 'workoutPlan', 'lifestyleTips', 'disclaimer'],
};


export const StarterProgram: React.FC<{ totalUpdates: number }> = ({ totalUpdates }) => {
    const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formStep, setFormStep] = useState(0); // 0: goal, 1: details, 2: lifestyle
    const [status, setStatus] = useState<'form' | 'loading' | 'plan' | 'error'>('form');
    const [formData, setFormData] = useState<StarterFormData>(initialFormData);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        try {
            const savedPlan = localStorage.getItem('starterPlan');
            const savedFormData = localStorage.getItem('starterFormData');
            const savedStartDate = localStorage.getItem('starterPlanStartDate');
            if (savedPlan && savedFormData && savedStartDate) {
                setPlanInfo({
                    plan: JSON.parse(savedPlan),
                    formData: JSON.parse(savedFormData),
                    startDate: savedStartDate,
                });
            }
        } catch (e) {
            console.error("Failed to load starter plan from storage", e);
            localStorage.removeItem('starterPlan');
            localStorage.removeItem('starterFormData');
            localStorage.removeItem('starterPlanStartDate');
        }
    }, []);
    
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);

    const handleStart = () => {
        setFormData(initialFormData);
        setFormStep(0);
        setStatus('form');
        setErrorMessage('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleUpdateForm = (field: keyof StarterFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGeneratePlan = async () => {
        setStatus('loading');
        setErrorMessage('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `You are an expert personal trainer and certified nutritionist. Create a personalized, actionable, and encouraging fitness and nutrition starter plan based on this data. Be realistic and prioritize safety for a beginner.
            
            User Data:
            - Goal: ${formData.goal}
            - Gender: ${formData.gender}
            - Age: ${formData.age}
            - Height: ${formData.height} cm
            - Weight: ${formData.weight} kg
            - Activity Level: ${formData.activityLevel}
            - Workout Days Per Week: ${formData.workoutDays}
            - Equipment Access: ${formData.equipment}

            Your response must be a JSON object adhering to the provided schema.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                  responseMimeType: "application/json",
                  responseSchema: starterPlanSchema,
                },
            });
            
            const cleanedText = response.text.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
            const plan = JSON.parse(cleanedText);
            
            const startDate = new Date().toISOString();
            const newPlanInfo = { plan, formData, startDate };

            localStorage.setItem('starterPlan', JSON.stringify(plan));
            localStorage.setItem('starterFormData', JSON.stringify(formData));
            localStorage.setItem('starterPlanStartDate', startDate);

            setPlanInfo(newPlanInfo);
            setStatus('plan');

        } catch (err) {
            console.error("Error generating plan:", err);
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setErrorMessage(`Failed to generate your plan. ${message}`);
            setStatus('error');
        }
    };
    
    const isStep1Valid = useMemo(() => formData.goal, [formData.goal]);
    const isStep2Valid = useMemo(() => formData.gender && formData.age && formData.height && formData.weight, [formData]);
    const isStep3Valid = useMemo(() => formData.activityLevel && formData.workoutDays && formData.equipment, [formData]);

    const getTodaysWorkout = () => {
        if (!planInfo) return "Rest Day";
        const { plan, startDate } = planInfo;
        const today = new Date();
        const start = new Date(startDate);
        const daysPassed = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysPassed < 0 || !plan.workoutPlan.weeklySplit || plan.workoutPlan.weeklySplit.length === 0) {
            return "Plan Starts Soon";
        }

        const workoutIndex = daysPassed % plan.workoutPlan.weeklySplit.length;
        const workoutDay = plan.workoutPlan.weeklySplit[workoutIndex]?.day || "Rest Day";
        return workoutDay.replace(/^Day\s*\d+:\s*/, '');
    };

    const renderModalContent = () => {
        const contentMap = {
            loading: (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Generating Your Plan...</h2>
                    <p className="text-muted-foreground">Our AI coach is creating a personalized plan just for you.</p>
                </div>
            ),
            error: (
                 <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                        <AlertIcon className="w-8 h-8 text-destructive" />
                    </div>
                    <h2 className="text-xl font-bold text-destructive mb-2">Generation Failed</h2>
                    <p className="text-muted-foreground text-sm max-w-sm mb-6">{errorMessage}</p>
                    <button
                      onClick={() => setStatus('form')}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-secondary-foreground bg-secondary rounded-md shadow-sm transition-colors hover:bg-secondary/80"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      Back to Form
                    </button>
                </div>
            ),
            plan: planInfo ? (
                <div className="p-4 sm:p-6 h-full flex flex-col">
                    <div className="text-center flex-shrink-0">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{planInfo.plan.planTitle}</h2>
                        <p className="text-muted-foreground mt-2 mb-6 text-sm max-w-3xl mx-auto">{planInfo.plan.summary}</p>
                    </div>
                    
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                       {/* Left Column */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-secondary/50 p-4 rounded-lg flex-shrink-0">
                                <h3 className="font-bold text-secondary-foreground mb-3">Daily Nutrition Targets</h3>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div><p className="text-xl font-bold text-primary">{planInfo.plan.nutrition.dailyCalories}</p><p className="text-xs text-muted-foreground">Calories</p></div>
                                    <div><p className="text-xl font-bold text-primary">{planInfo.plan.nutrition.proteinGrams}g</p><p className="text-xs text-muted-foreground">Protein</p></div>
                                    <div><p className="text-xl font-bold text-primary">{planInfo.plan.nutrition.carbsGrams}g</p><p className="text-xs text-muted-foreground">Carbs</p></div>
                                    <div><p className="text-xl font-bold text-primary">{planInfo.plan.nutrition.fatGrams}g</p><p className="text-xs text-muted-foreground">Fat</p></div>
                                </div>
                            </div>
                            <div className="bg-card p-4 rounded-lg">
                                <h3 className="font-bold text-card-foreground mb-3">Lifestyle Tips</h3>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
                                    {planInfo.plan.lifestyleTips.map(tip => <li key={tip}>{tip}</li>)}
                                </ul>
                            </div>
                        </div>
                        {/* Right Column */}
                        <div className="bg-card p-4 rounded-lg">
                           <h3 className="font-bold text-card-foreground mb-3">Weekly Workout Split</h3>
                            <div className="space-y-3">
                                {planInfo.plan.workoutPlan.weeklySplit.map(day => (
                                    <div key={day.day}>
                                        <h4 className="font-semibold text-card-foreground text-sm">{day.day}</h4>
                                        <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-1 pl-2">
                                            {day.exercises.map(ex => <li key={ex}>{ex}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-shrink-0 mt-4">
                        <div className="flex items-start gap-3 p-3 text-xs text-muted-foreground bg-muted/50 rounded-lg">
                            <InfoIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>{planInfo.plan.disclaimer}</p>
                        </div>
                    </div>
                </div>
            ) : null,
            form: (
                <div className="p-6 flex flex-col h-full">
                    <div className="text-center flex-shrink-0">
                        <h2 className="text-2xl font-bold text-foreground">Create Your Personalized Plan</h2>
                        <p className="text-muted-foreground mt-1 text-sm">Step {formStep + 1} of 3</p>
                    </div>

                    <div className="flex-grow flex items-center justify-center my-6">
                        <div className="w-full">
                            {formStep === 0 && (
                                <div className="w-full max-w-md mx-auto space-y-4">
                                    <h3 className="text-lg font-semibold text-center text-foreground">What is your primary goal?</h3>
                                    <button onClick={() => { handleUpdateForm('goal', 'Lose Weight'); setFormStep(1); }} className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-all flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0 flex items-center justify-center"><ScaleIcon className="w-5 h-5"/></div><div><h4 className="font-bold text-card-foreground">Lose Weight</h4><p className="text-xs text-muted-foreground">Build a sustainable calorie deficit.</p></div></button>
                                    <button onClick={() => { handleUpdateForm('goal', 'Build Muscle'); setFormStep(1); }} className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-all flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0 flex items-center justify-center"><DumbbellIcon className="w-5 h-5"/></div><div><h4 className="font-bold text-card-foreground">Build Muscle</h4><p className="text-xs text-muted-foreground">Optimize for strength and hypertrophy.</p></div></button>
                                    <button onClick={() => { handleUpdateForm('goal', 'Improve Endurance'); setFormStep(1); }} className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-all flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0 flex items-center justify-center"><HeartIcon className="w-5 h-5"/></div><div><h4 className="font-bold text-card-foreground">Improve Endurance</h4><p className="text-xs text-muted-foreground">Boost your cardiovascular fitness.</p></div></button>
                                </div>
                            )}
                            {formStep === 1 && (
                                <div className="w-full max-w-md mx-auto space-y-4">
                                    <div><label className="block text-sm font-medium text-foreground mb-2 text-center">Tell us about yourself</label><div className="grid grid-cols-3 gap-2">{(['male', 'female', 'other'] as const).map(g => (<button key={g} onClick={() => handleUpdateForm('gender', g)} className={`px-4 py-2 rounded-md text-sm capitalize border ${formData.gender === g ? 'bg-primary text-primary-foreground border-primary' : 'bg-input hover:bg-secondary border-border'}`}>{g}</button>))}</div></div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div><label htmlFor="age" className="block text-xs font-medium text-muted-foreground mb-1">Age</label><input id="age" type="number" value={formData.age} onChange={e => handleUpdateForm('age', e.target.value)} placeholder="25" className="w-full px-3 py-2 bg-input border border-border rounded-md" /></div>
                                        <div><label htmlFor="height" className="block text-xs font-medium text-muted-foreground mb-1">Height (cm)</label><input id="height" type="number" value={formData.height} onChange={e => handleUpdateForm('height', e.target.value)} placeholder="180" className="w-full px-3 py-2 bg-input border border-border rounded-md" /></div>
                                        <div><label htmlFor="weight" className="block text-xs font-medium text-muted-foreground mb-1">Weight (kg)</label><input id="weight" type="number" value={formData.weight} onChange={e => handleUpdateForm('weight', e.target.value)} placeholder="75" className="w-full px-3 py-2 bg-input border border-border rounded-md" /></div>
                                    </div>
                                </div>
                            )}
                            {formStep === 2 && (
                                <div className="w-full max-w-md mx-auto space-y-4">
                                    <label className="block text-sm font-medium text-foreground text-center">Describe your lifestyle</label>
                                    <div><label className="block text-xs font-medium text-muted-foreground mb-1">Activity Level</label><div className="grid grid-cols-2 lg:grid-cols-4 gap-2">{(['sedentary', 'light', 'moderate', 'active'] as const).map(level => (<button key={level} onClick={() => handleUpdateForm('activityLevel', level)} className={`px-4 py-2 rounded-md text-sm capitalize border ${formData.activityLevel === level ? 'bg-primary text-primary-foreground border-primary' : 'bg-input hover:bg-secondary border-border'}`}>{level}</button>))}</div></div>
                                    <div><label htmlFor="workoutDays" className="block text-xs font-medium text-muted-foreground mb-1">Workout days/week?</label><input id="workoutDays" type="number" min="1" max="7" value={formData.workoutDays} onChange={e => handleUpdateForm('workoutDays', e.target.value)} placeholder="e.g., 3" className="w-full px-3 py-2 bg-input border border-border rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-muted-foreground mb-1">Equipment Access</label><div className="grid grid-cols-3 gap-2">{(['bodyweight', 'home-gym', 'full-gym'] as const).map(eq => (<button key={eq} onClick={() => handleUpdateForm('equipment', eq)} className={`px-4 py-2 rounded-md text-sm capitalize border ${formData.equipment === eq ? 'bg-primary text-primary-foreground border-primary' : 'bg-input hover:bg-secondary border-border'}`}>{eq.replace('-', ' ')}</button>))}</div></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center flex-shrink-0">
                       <button onClick={() => setFormStep(p => p - 1)} className={`px-4 py-2 text-sm font-medium text-secondary-foreground bg-secondary rounded-md hover:bg-secondary/80 ${formStep > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>Back</button>
                       {formStep < 2 ? (
                            <button onClick={() => setFormStep(p => p + 1)} disabled={formStep === 0 ? !isStep1Valid : !isStep2Valid} className="px-6 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-md shadow-sm enabled:hover:bg-primary/90 disabled:opacity-50">Next</button>
                       ) : (
                            <button onClick={handleGeneratePlan} disabled={!isStep3Valid} className="px-6 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-md shadow-sm enabled:hover:bg-primary/90 disabled:opacity-50">Generate Plan</button>
                       )}
                    </div>
                </div>
            )
        };
        return contentMap[status] || null;
    };

    return (
        <>
            {planInfo ? (
                <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 text-left animate-fade-in">
                    <div className="sm:mb-4">
                        <h3 className="text-xl font-bold text-card-foreground">Your Daily Dashboard</h3>
                        <p className="text-muted-foreground text-sm mt-1">Here's your focus for today. Stay consistent!</p>
                    </div>
                    <div className="mt-4 flex flex-col sm:grid sm:grid-cols-5 gap-4">
                        <div className="order-1 sm:order-2 sm:col-span-3 bg-card border border-border p-4 sm:p-6 rounded-lg flex flex-col items-center justify-center text-center">
                            <div className="w-full flex justify-between items-center mb-2">
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Today's Focus</p>
                                <p className="text-xs font-mono text-muted-foreground">
                                    {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                                </p>
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-card-foreground truncate max-w-full">{getTodaysWorkout()}</p>
                        </div>
                        
                        <div className="order-2 sm:order-1 sm:col-span-1 bg-secondary p-4 rounded-lg flex-col items-center justify-center text-center hidden sm:flex">
                            <CalendarIcon className="w-8 h-8 text-primary mb-2" />
                            <p className="text-2xl font-bold text-secondary-foreground">{totalUpdates}</p>
                            <p className="text-xs text-muted-foreground">Gym Days</p>
                        </div>

                        <div className="order-3 sm:order-3 sm:col-span-1 bg-secondary p-4 rounded-lg flex-col items-center justify-center text-center hidden sm:flex">
                            <TargetIcon className="w-8 h-8 text-primary mb-2" />
                            <p className="text-2xl font-bold text-secondary-foreground">{planInfo.plan.nutrition.proteinGrams}g</p>
                            <p className="text-xs text-muted-foreground">Protein Goal</p>
                        </div>

                        <div className="order-2 grid grid-cols-2 gap-4 sm:hidden">
                            <div className="bg-secondary p-4 rounded-lg flex flex-col items-center justify-center text-center">
                                <CalendarIcon className="w-8 h-8 text-primary mb-2" />
                                <p className="text-2xl font-bold text-secondary-foreground">{totalUpdates}</p>
                                <p className="text-xs text-muted-foreground">Gym Days</p>
                            </div>
                            <div className="bg-secondary p-4 rounded-lg flex flex-col items-center justify-center text-center">
                                <TargetIcon className="w-8 h-8 text-primary mb-2" />
                                <p className="text-2xl font-bold text-secondary-foreground">{planInfo.plan.nutrition.proteinGrams}g</p>
                                <p className="text-xs text-muted-foreground">Protein Goal</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                 <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                        <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-md">
                            <CloudIcon className="w-9 h-9" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-card-foreground">Ready to Start Your Journey?</h3>
                            <p className="text-muted-foreground text-sm mt-1">Get a free, AI-generated starter plan to kickstart your fitness goals.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleStart}
                        className="w-full sm:w-auto flex-shrink-0 mt-4 sm:mt-0 px-5 py-2.5 font-semibold text-primary-foreground bg-primary rounded-md shadow-sm transition-colors hover:bg-primary/90"
                    >
                        Create Your Fitness Plan
                    </button>
                </div>
            )}

            {isModalOpen && ReactDOM.createPortal(
                <div 
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-opacity"
                    onClick={handleCloseModal}
                    aria-modal="true" 
                    role="dialog"
                >
                    <style>{`
                        @keyframes fadeInOpacity { from { opacity: 0 } to { opacity: 1 } }
                        .animate-fade-in-opacity { animation: fadeInOpacity 0.3s ease-out forwards; }
                    `}</style>
                    <div
                        className="relative bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={handleCloseModal} className="absolute top-3 right-3 p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors z-10" aria-label="Close">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <main className="flex-grow overflow-y-auto">
                           {renderModalContent()}
                        </main>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};