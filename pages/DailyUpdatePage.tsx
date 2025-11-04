import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon, CheckIcon } from '../components/icons';
import { addDailyUpdate } from '../lib/db';

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
    const [weight, setWeight] = useState<string>('');
    const [protein, setProtein] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Clean up the object URL to avoid memory leaks
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);

    const handleFileSelected = (file: File | null | undefined) => {
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
            const url = URL.createObjectURL(file);
            setImageUrl(url);
            setError('');
        } else if (file) {
            setError('Please select a valid image file (e.g., JPG, PNG).');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelected(e.target.files?.[0]);
    };
    
    const handleContainerClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileSelected(e.dataTransfer.files?.[0]);
    };

    const resetForm = () => {
        setImageFile(null);
        setImageUrl(null);
        setWeight('');
        setProtein('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile || !weight) {
            setError('Please upload an image and enter your current weight.');
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
                weight: parseFloat(weight),
                protein: protein ? parseInt(protein, 10) : undefined,
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

    const isFormValid = imageFile && weight && !isSubmitting;

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
                            onClick={handleContainerClick}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            className={`relative aspect-video w-full rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${imageUrl ? 'border-primary/50' : isDragging ? 'border-primary bg-secondary' : 'border-border hover:border-primary/50 bg-muted/50'}`}
                        >
                            {imageUrl ? (
                                <img src={imageUrl} alt="Progress preview" className="w-full h-full object-contain rounded-md" />
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    <CameraIcon className="w-10 h-10 mx-auto mb-2" />
                                    <p className="font-semibold text-primary">Click or drag & drop</p>
                                    <p className="text-xs">Upload a photo of your physique</p>
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
                            <label htmlFor="weight" className="block text-sm font-medium text-foreground mb-2">Weight (kg/lbs)</label>
                            <input
                                id="weight"
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="e.g., 75.5"
                                className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="protein" className="block text-sm font-medium text-foreground mb-2">Protein Intake (grams) <span className="text-muted-foreground text-xs">(Optional)</span></label>
                             <input
                                id="protein"
                                type="number"
                                value={protein}
                                onChange={(e) => setProtein(e.target.value)}
                                placeholder="e.g., 150"
                                className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            />
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