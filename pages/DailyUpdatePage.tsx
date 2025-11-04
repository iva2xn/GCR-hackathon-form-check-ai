import React, { useState, useRef } from 'react';
import { CameraIcon, CheckIcon } from '../components/icons';
import { addDailyUpdate } from '../lib/db';

const MUSCLE_GROUPS = [
    "Chest",
    "Back",
    "Legs",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Abs",
    "Full Body",
    "Rest Day"
];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const DailyUpdatePage: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [protein, setProtein] = useState<string>('');
    const [muscleGroup, setMuscleGroup] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setImageUrl(url);
        }
    };
    
    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const resetForm = () => {
        setImageFile(null);
        setImageUrl(null);
        setProtein('');
        setMuscleGroup('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile || !protein || !muscleGroup) {
            setError('Please fill out all fields and upload an image.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setIsSuccess(false);

        try {
            const imageBase64 = await fileToBase64(imageFile);
            const newUpdate = {
                id: Date.now(),
                date: new Date().toISOString(),
                imageBase64,
                protein: parseInt(protein, 10),
                muscleGroup,
            };
            await addDailyUpdate(newUpdate);
            
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                resetForm();
            }, 3000);

        } catch (err) {
            console.error("Failed to save daily update:", err);
            setError("Could not save your update. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = imageFile && protein && muscleGroup && !isSubmitting;

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="bg-card rounded-xl shadow p-6 sm:p-8 text-center transition-shadow hover:shadow-md">
                <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">
                    Log Your Daily Progress
                </h2>
                <p className="text-muted-foreground mb-8">
                    Consistency is key. Submit your daily update to stay on track.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Progress Photo</label>
                        <div
                            onClick={handleImageClick}
                            className={`aspect-video w-full rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${imageUrl ? 'border-primary/50' : 'border-border hover:border-primary/50 bg-muted/50'}`}
                        >
                            {imageUrl ? (
                                <img src={imageUrl} alt="Progress preview" className="w-full h-full object-contain rounded-md" />
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    <CameraIcon className="w-10 h-10 mx-auto mb-2" />
                                    <p className="font-semibold text-primary">Click to upload</p>
                                    <p className="text-xs">Upload an image of your physique</p>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="protein" className="block text-sm font-medium text-foreground mb-2">Protein Intake (grams)</label>
                            <input
                                id="protein"
                                type="number"
                                value={protein}
                                onChange={(e) => setProtein(e.target.value)}
                                placeholder="e.g., 150"
                                className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="muscleGroup" className="block text-sm font-medium text-foreground mb-2">Muscle Group Worked</label>
                            <select
                                id="muscleGroup"
                                value={muscleGroup}
                                onChange={(e) => setMuscleGroup(e.target.value)}
                                className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                                required
                            >
                                <option value="" disabled>Select a muscle group</option>
                                {MUSCLE_GROUPS.map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-destructive text-center">{error}</p>}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className="w-full inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-primary-foreground bg-primary rounded-md shadow-sm transition-colors enabled:hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                        >
                            {isSubmitting ? 'Submitting...' : isSuccess ? <><CheckIcon className="w-6 h-6 mr-2" /> Submitted!</> : 'Submit Daily Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};