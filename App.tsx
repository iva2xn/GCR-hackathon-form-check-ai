
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FileUpload } from './components/FileUpload';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Report } from './components/Report';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { AppStatus, ReportData, ScoreDetail } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    // Clean up the object URL to avoid memory leaks
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    const newVideoUrl = URL.createObjectURL(selectedFile);
    setVideoUrl(newVideoUrl);
    setReportData(null); // Reset report on new file

    // Create a temporary video element to get duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      const duration = video.duration;
      setVideoDuration(duration);
      const defaultEndTime = Math.min(10, duration);
      setStartTime(0);
      setEndTime(defaultEndTime);
    };
    video.src = newVideoUrl;
    video.onerror = () => {
      setErrorMessage("Could not load video metadata. The file might be corrupted.");
      setStatus('error');
    }
  };
  
  const handleTimeRangeChange = (start: number, end: number) => {
    setStartTime(start);
    setEndTime(end);
  };

  const extractFrames = async (videoFile: File, numFrames: number, startTime: number, endTime: number): Promise<{frame: string, mimeType: string}[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.src = URL.createObjectURL(videoFile);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const frames: {frame: string, mimeType: string}[] = [];

      video.onloadedmetadata = async () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const clipDuration = endTime - startTime;

        if (clipDuration <= 0) {
            reject(new Error("Invalid time range. Duration must be greater than 0."));
            return;
        }

        const interval = clipDuration / numFrames;
        
        for (let i = 0; i < numFrames; i++) {
          video.currentTime = startTime + (i * interval);
          await new Promise(r => video.onseeked = r);
          if (!ctx) {
              reject(new Error("Canvas context not available"));
              return;
          }
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          const dataUrl = canvas.toDataURL('image/jpeg');
          const base64Data = dataUrl.split(',')[1];
          frames.push({ frame: base64Data, mimeType: 'image/jpeg' });
        }
        URL.revokeObjectURL(video.src);
        resolve(frames);
      };

      video.onerror = (e) => {
        reject(new Error('Failed to load video file for frame extraction.'));
      };
    });
  };

  const handleAnalyze = async () => {
    if (!file) return;

    if (endTime - startTime > 10.1) { // Add a small buffer for floating point inaccuracies
      setErrorMessage("The selected video clip must be 10 seconds or less.");
      setStatus('error');
      return;
    }
    if (endTime - startTime <= 0) {
      setErrorMessage("Please select a valid time range to analyze.");
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    let analysisInterval: number | undefined;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const NUM_FRAMES = 10;
      
      setLoadingMessage('Extracting key frames from your video...');
      const frames = await extractFrames(file, NUM_FRAMES, startTime, endTime);
      
      const prompt = `You are an expert fitness coach and kinesiologist with a positive and encouraging tone. Your primary goal is to provide accurate, helpful feedback to improve a user's exercise form and prevent injury. Analyze this sequence of video frames of a user performing an exercise. Your task is to:
1. Identify the exercise being performed.
2. Critically evaluate the user's form. Your main feedback should focus on the single most important area for improvement. 
   - If a critical error exists (something that could lead to injury), focus on that.
   - If the form is good but could be better, focus on the most impactful refinement.
   - If the form is excellent, acknowledge this and provide a tip for advanced optimization or variation.
3. Identify the single best aspect of the user's form that they should continue doing.
4. Provide a detailed analysis and a step-by-step correction or refinement plan for the main point of feedback.
5. Select the single frame from the sequence (index 0 to ${NUM_FRAMES - 1}) that best illustrates your main feedback point and specify its index.
6. Provide a detailed performance breakdown. For each of the following metrics, provide a score from 0 to 10 (where 10 is perfect) and a brief justification. Be realistic and constructive in your scoring. Scores of 9-10 should be reserved for textbook execution.
    - Spinal Alignment: Assess the neutrality of the spine throughout the movement.
    - Joint Stability: Assess the stability of key joints like knees, hips, and shoulders.
    - Range of Motion: Assess if the depth and movement range are appropriate and safe for the exercise.
    - Tempo & Control: Assess the smoothness and control of the movement, noting any jerky or rushed motions.
7. Based on your detailed breakdown, provide a final, overall justification summarizing the performance.
You must return your response in a JSON format that adheres to the provided schema. Ensure all strings within the JSON are properly escaped.`;
      
      const imageParts = frames.map(f => ({
        inlineData: {
          data: f.frame,
          mimeType: f.mimeType,
        }
      }));
      
      const analysisSteps = [
        'AI coach is analyzing your movement patterns...',
        'Comparing your form against ideal biomechanics...',
        'Pinpointing the most critical area for improvement...',
        'Creating your personalized correction plan...'
      ];
      let stepIndex = 0;
      setLoadingMessage(analysisSteps[stepIndex]);
      analysisInterval = window.setInterval(() => {
          stepIndex = (stepIndex + 1) % analysisSteps.length;
          setLoadingMessage(analysisSteps[stepIndex]);
      }, 3000);

      // --- Step 1: Get Text Analysis ---
      const analysisResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, ...imageParts] },
        config: {
          responseMimeType: "application/json",
          responseSchema: reportDataSchema,
          seed: 42,
        },
      });
      
      clearInterval(analysisInterval);
      analysisInterval = undefined;

      const cleanedText = analysisResponse.text
        .trim()
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');

      let report: any;
      try {
        report = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Failed to parse JSON response from API:", parseError);
        throw new Error("The AI returned a response with an invalid format.");
      }
      
      if (!report || !report.error || !report.error.feedbackType || !report.formRating || !report.formRating.detailedScores || report.formRating.detailedScores.length === 0) {
        throw new Error("The AI returned an incomplete report. Please try again.");
      }

      // Calculate accurate timestamp based on clip selection and frame index
      const clipDuration = endTime - startTime;
      const frameTimeInClip = (report.error.errorFrameIndex / NUM_FRAMES) * clipDuration;
      const absoluteFrameTime = startTime + frameTimeInClip;
      const minutes = Math.floor(absoluteFrameTime / 60);
      const seconds = Math.floor(absoluteFrameTime % 60);
      report.error.timestamp = `@ ${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      setLoadingMessage('Finalizing your report...');
      
      const errorFrameIndex = report.error.errorFrameIndex ?? Math.floor(NUM_FRAMES / 2);
      const safeFrameIndex = Math.max(0, Math.min(frames.length - 1, errorFrameIndex));
      const errorFrameData = frames[safeFrameIndex];

      // --- Step 2: Compile final report ---
      report.error.imageSrc = `data:${errorFrameData.mimeType};base64,${errorFrameData.frame}`;

      const getLevelFromScore = (score: number): string => {
        if (score < 40) return 'Needs Improvement';
        if (score < 75) return 'Good';
        if (score < 90) return 'Excellent';
        return 'Perfect';
      };

      const totalScore = report.formRating.detailedScores.reduce((sum: number, item: ScoreDetail) => sum + item.score, 0);
      const averageScore = totalScore / report.formRating.detailedScores.length;
      report.formRating.formScore = Math.round(averageScore * 10);
      report.formRating.level = getLevelFromScore(report.formRating.formScore);

      setReportData(report as ReportData);
      setStatus('report');

    } catch (err) {
      if (analysisInterval) {
        clearInterval(analysisInterval);
      }
      console.error("Error analyzing video:", err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setErrorMessage(`Failed to analyze the video. ${message}`);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setFile(null);
    setVideoUrl(null);
    setReportData(null);
    setErrorMessage('');
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <LoadingSpinner message={loadingMessage} />;
      case 'report':
        return reportData && <Report data={reportData} onReset={handleReset} />;
      case 'error':
        return (
          <div className="bg-card rounded-xl shadow p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-destructive mb-4">Analysis Failed</h2>
            <p className="text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto whitespace-pre-wrap">
              {errorMessage}
            </p>
            <button
              onClick={handleReset}
              className="mt-8 w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-primary-foreground bg-primary rounded-md shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              Try Again
            </button>
          </div>
        );
      case 'idle':
      default:
        return (
          <FileUpload
            onFileSelect={handleFileSelect}
            onAnalyze={handleAnalyze}
            file={file}
            videoUrl={videoUrl}
            videoDuration={videoDuration}
            startTime={startTime}
            endTime={endTime}
            onTimeRangeChange={handleTimeRangeChange}
          />
        );
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-7xl">
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;

// Gemini response schema definition
const reportDataSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the report, e.g., 'Form Analysis Report: Barbell Squat'." },
    error: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "A short, descriptive title for the main feedback point (this could be an error, a refinement, or an optimization tip)." },
        timestamp: { type: Type.STRING, description: "An estimated timestamp of the feedback point, e.g., '@ 0:12'." },
        errorFrameIndex: { type: Type.INTEGER, description: `The index of the frame (from 0 to 9) that best illustrates the main feedback point.` },
        feedbackType: { type: Type.STRING, description: "The category of the feedback. Must be one of: 'error', 'refinement', or 'optimization'."}
      },
      required: ['title', 'timestamp', 'errorFrameIndex', 'feedbackType'],
    },
    findings: {
      type: Type.OBJECT,
      properties: {
        errorName: { type: Type.STRING, description: "A technical or common name for the feedback point, e.g., '\"Butt Wink\"', 'Deeper Hip Hinge', or 'Advanced Core Bracing'." },
        description: { type: Type.STRING, description: "An explanation of the feedback point (what it is and why it's important)." },
        confidence: { type: Type.STRING, description: "The AI's confidence level, e.g., '94% High'." },
        affectedJoints: {
          type: Type.ARRAY, items: { type: Type.STRING },
          description: "A list of the primary joints or body parts related to this feedback."
        },
      },
      required: ['errorName', 'description', 'confidence', 'affectedJoints'],
    },
    correctionPlan: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Title for the plan, e.g., 'Actionable Correction Plan', 'Refinement Strategy', or 'Optimization Technique'." },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A short, actionable title for a correction step." },
              description: { type: Type.STRING, description: "A detailed explanation of how to perform the correction." },
            },
            required: ['title', 'description'],
          },
        },
      },
      required: ['title', 'steps'],
    },
    rationale: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Title for the rationale, e.g., 'Why This Matters', 'Benefits of this Refinement'." },
        text: { type: Type.STRING, description: "An explanation of the risks of the poor form and the benefits of correcting it, or the benefits of the suggested refinement." },
      },
      required: ['title', 'text'],
    },
    positiveReinforcement: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, default: "What You're Doing Well" },
        text: { type: Type.STRING, description: "An explanation of a key aspect of the form that was performed correctly." },
      },
      required: ['title', 'text'],
    },
    formRating: {
      type: Type.OBJECT,
      properties: {
        justification: { type: Type.STRING, description: "A brief overall justification for the performance, summarizing the key points from the breakdown." },
        detailedScores: {
          type: Type.ARRAY,
          description: "A detailed breakdown of the form based on key kinesiological principles.",
          items: {
            type: Type.OBJECT,
            properties: {
              metric: { type: Type.STRING, description: "The name of the performance metric being evaluated (e.g., 'Spinal Alignment')." },
              score: { type: Type.INTEGER, description: "A score from 0 to 10 for this specific metric." },
              justification: { type: Type.STRING, description: "A brief justification for the score given to this metric." }
            },
            required: ['metric', 'score', 'justification']
          }
        }
      },
      required: ['justification', 'detailedScores'],
    },
  },
  required: ['title', 'error', 'findings', 'correctionPlan', 'rationale', 'positiveReinforcement', 'formRating'],
};