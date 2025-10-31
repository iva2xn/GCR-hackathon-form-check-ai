import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { FileUpload } from './components/FileUpload';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Report } from './components/Report';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { AppStatus, ReportData } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<string>('');

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
    setVideoUrl(URL.createObjectURL(selectedFile));
  };

  const extractFrames = async (videoFile: File, numFrames: number): Promise<{frame: string, mimeType: string}[]> => {
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
        const duration = video.duration;
        const interval = duration / numFrames;
        
        for (let i = 0; i < numFrames; i++) {
          video.currentTime = i * interval;
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
    setStatus('loading');
    setErrorMessage('');
    setLoadingMessage('Initializing analysis...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const NUM_FRAMES = 10; // Reduced for faster analysis
      
      setLoadingMessage('Extracting key frames from your video...');
      const frames = await extractFrames(file, NUM_FRAMES);
      
      const prompt = `You are an expert fitness coach and kinesiologist. Analyze this sequence of video frames of a user performing an exercise. Your task is to:
1. Identify the exercise.
2. Identify the single most critical form error that could lead to injury or reduced effectiveness.
3. Provide a detailed analysis and a step-by-step correction plan.
4. Generate skeleton data for a visual overlay. The keypoints must be normalized coordinates (0.0 to 1.0) relative to the image dimensions.
5. Select the single frame from the sequence (index 0 to ${NUM_FRAMES - 1}) that best illustrates this error and specify its index.
You must return your response in a JSON format that adheres to the provided schema. Ensure all strings within the JSON are properly escaped.`;
      
      const imageParts = frames.map(f => ({
        inlineData: {
          data: f.frame,
          mimeType: f.mimeType,
        }
      }));
      
      setLoadingMessage('AI coach is analyzing your movement patterns...');
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Switched to Flash model for speed
        contents: { parts: [{ text: prompt }, ...imageParts] },
        config: {
          responseMimeType: "application/json",
          responseSchema: reportDataSchema,
        },
      });
      
      setLoadingMessage('Compiling findings and correction plan...');
      const cleanedText = response.text
        .trim()
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');

      let report: ReportData;
      try {
        report = JSON.parse(cleanedText) as ReportData;
      } catch (parseError) {
        console.error("Failed to parse JSON response from API.");
        console.error("Raw response:", response.text);
        console.error("Cleaned text:", cleanedText);
        console.error("Parsing error:", parseError);
        throw new Error("The AI returned a response with an invalid format.");
      }
      
      // Add validation to prevent crash if the response is malformed
      if (!report || !report.error) {
        console.error("Malformed report data from API, missing 'error' object.", report);
        throw new Error("The AI returned an incomplete report. Please try again.");
      }
      
      setLoadingMessage('Finalizing your report...');
      const errorFrameIndex = report.error.errorFrameIndex ?? Math.floor(NUM_FRAMES / 2);
      
      // Ensure the frame index is within bounds
      const safeFrameIndex = Math.max(0, Math.min(frames.length - 1, errorFrameIndex));

      const errorFrameData = frames[safeFrameIndex];
      report.error.imageSrc = `data:${errorFrameData.mimeType};base64,${errorFrameData.frame}`;

      setReportData(report);
      setStatus('report');

    } catch (err) {
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
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-red-400 mb-4">Analysis Failed</h2>
            <p className="text-gray-400 mb-6 sm:mb-8 max-w-lg mx-auto whitespace-pre-wrap">
              {errorMessage}
            </p>
            <button
              onClick={handleReset}
              className="mt-8 w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-cyan-600 rounded-lg shadow-md transition-all duration-300 hover:bg-cyan-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
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
          />
        );
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl">
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;


// Gemini response schema definition
const pointSchema = {
  type: Type.OBJECT,
  properties: {
    x: { type: Type.NUMBER, description: "Normalized x-coordinate (0.0 to 1.0)." },
    y: { type: Type.NUMBER, description: "Normalized y-coordinate (0.0 to 1.0)." },
  },
  required: ['x', 'y'],
};

const skeletonSchema = {
    type: Type.OBJECT,
    properties: {
        keypoints: {
            type: Type.OBJECT,
            description: "A map of body joint names to their normalized (x,y) coordinates.",
            properties: {
                nose: { ...pointSchema }, leftShoulder: { ...pointSchema }, rightShoulder: { ...pointSchema },
                leftElbow: { ...pointSchema }, rightElbow: { ...pointSchema }, leftHip: { ...pointSchema },
                rightHip: { ...pointSchema }, pelvis: { ...pointSchema }, spine: { ...pointSchema },
                leftKnee: { ...pointSchema }, rightKnee: { ...pointSchema }, leftAnkle: { ...pointSchema },
                rightAnkle: { ...pointSchema },
            }
        },
        connections: {
            type: Type.ARRAY,
            items: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: "Array of pairs of keypoint names for standard skeleton connections."
        },
        highlightedConnections: {
            type: Type.ARRAY,
            items: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: "Connections to highlight in red to indicate the area of the form error."
        },
    },
};

const reportDataSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the report, e.g., 'Form Analysis Report: Barbell Squat'." },
    error: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "A short, descriptive title for the main error detected." },
        timestamp: { type: Type.STRING, description: "An estimated timestamp of the error, e.g., '@ 0:12'." },
        errorFrameIndex: { type: Type.INTEGER, description: `The index of the frame (from 0 to 9) that best shows the error.` },
        skeleton: skeletonSchema,
      },
    },
    findings: {
      type: Type.OBJECT,
      properties: {
        errorName: { type: Type.STRING, description: "A technical or common name for the error, e.g., '\"Butt Wink\" - Lumbar Spine Flexion'." },
        description: { type: Type.STRING, description: "An explanation of what the error is and its potential causes." },
        confidence: { type: Type.STRING, description: "The AI's confidence level, e.g., '94% High'." },
        affectedJoints: {
          type: Type.ARRAY, items: { type: Type.STRING },
          description: "A list of the primary joints or body parts affected by this error."
        },
      },
    },
    correctionPlan: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, default: "Actionable Correction Plan" },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A short, actionable title for a correction step." },
              description: { type: Type.STRING, description: "A detailed explanation of how to perform the correction." },
            },
          },
        },
      },
    },
    rationale: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, default: "Why This Correction Matters" },
        text: { type: Type.STRING, description: "An explanation of the risks of the poor form and the benefits of correcting it." },
      },
    },
  },
};