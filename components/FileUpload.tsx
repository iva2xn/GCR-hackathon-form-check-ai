
import React, { useRef, useState } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onAnalyze: () => void;
  file: File | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onAnalyze, file }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (files[0].type.startsWith('video/')) {
        onFileSelect(files[0]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files[0].type.startsWith('video/')) {
        onFileSelect(files[0]);
      }
    }
  };
  
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 text-center transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl">
      <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4">Analyze Your Exercise Form</h2>
      <p className="text-gray-400 mb-6 sm:mb-8 max-w-lg mx-auto">
        Upload a video of your workout. Our AI will analyze your movement, detect critical errors, and provide actionable feedback to improve your form and prevent injury.
      </p>

      <div
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 sm:p-12 cursor-pointer transition-colors duration-300 ${
          isDragging ? 'border-cyan-400 bg-gray-700' : 'border-gray-600 hover:border-cyan-500 hover:bg-gray-700/50'
        }`}
      >
        <input
          type="file"
          accept="video/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <UploadIcon className="w-12 h-12 text-gray-500 mb-4 transition-colors duration-300" />
          {file ? (
            <p className="text-green-400 font-semibold">{file.name}</p>
          ) : (
            <p className="text-gray-400">
              <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">MP4, MOV, AVI, or WEBM</p>
        </div>
      </div>
      
      <button
        onClick={onAnalyze}
        disabled={!file}
        className="mt-8 w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-cyan-600 rounded-lg shadow-md transition-all duration-300 enabled:hover:bg-cyan-500 enabled:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        Analyze Form
      </button>
    </div>
  );
};
