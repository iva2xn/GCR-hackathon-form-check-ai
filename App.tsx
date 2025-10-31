
import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Report } from './components/Report';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { AppStatus, ReportData } from './types';
import { DUMMY_REPORT_DATA } from './constants';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);

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

  const handleAnalyze = () => {
    if (!file) return;
    setStatus('loading');
    // Simulate a 3-second AI analysis delay
    setTimeout(() => {
      setReportData(DUMMY_REPORT_DATA);
      setStatus('report');
    }, 3000);
  };

  const handleReset = () => {
    setStatus('idle');
    setFile(null);
    setVideoUrl(null);
    setReportData(null);
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <LoadingSpinner />;
      case 'report':
        return reportData && <Report data={reportData} onReset={handleReset} />;
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
