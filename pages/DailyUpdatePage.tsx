import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon, CheckIcon } from '../components/icons';
import { addDailyUpdate } from '../lib/db';
import type { DailyUpdate } from '../types';

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
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [weight, setWeight] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
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
        setDate(new Date().toISOString().split('T')[0]);
        setWeight('');
        setTitle('');
        setDescription('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile || !title || !description || !date) {
            setError('Photo, date, title, and description are required.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setIsSuccess(false);

        try {
            const imageBase64 = await fileToBase64(imageFile);
            
            const newUpdate: Omit<DailyUpdate, 'id'> = {
                date: new Date(date + 'T00:00:00').toISOString(),
                imageBase64,
                title,
                description,
            };

            if (weight) {
                newUpdate.weight = parseFloat(weight);
            }

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

    const isFormValid = imageFile && date && title && description && !isSubmitting;

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

                     <div>
                        <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">Date of Update</label>
                        <input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-foreground mb-2">Weight (kg/lbs) <span className="text-muted-foreground text-xs">(Optional)</span></label>
                            <input
                                id="weight"
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="e.g., 75.5"
                                className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">Title</label>
                             <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Morning Workout"
                                className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">Description</label>
                        <textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="How did you feel? Any new personal records?"
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            required
                        />
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