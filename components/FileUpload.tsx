import React, { useRef, useState, useEffect } from 'react';
import { UploadIcon, PlayIcon, PauseIcon, VolumeUpIcon, VolumeOffIcon } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onAnalyze: () => void;
  file: File | null;
  videoUrl: string | null;
  videoDuration: number;
  startTime: number;
  endTime: number;
  onTimeRangeChange: (start: number, end: number) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  onAnalyze, 
  file,
  videoUrl,
  videoDuration,
  startTime,
  endTime,
  onTimeRangeChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingHandle, setIsDraggingHandle] = useState<'start' | 'end' | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [lastVolume, setLastVolume] = useState(0.75);
  const [playbackRate, setPlaybackRate] = useState(1);
  const playbackRates = [0.5, 0.75, 1, 1.5, 2];

  const formatTime = (timeInSeconds: number) => {
      const totalSeconds = Math.floor(timeInSeconds);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

  const handleMouseDown = (handle: 'start' | 'end') => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsDraggingHandle(handle);
  };

  const handleMouseUp = () => {
    setIsDraggingHandle(null);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingHandle || !timelineRef.current || !videoDuration) return;
    
    e.preventDefault();

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const newX = Math.min(Math.max(e.clientX, timelineRect.left), timelineRect.right);
    const percentage = (newX - timelineRect.left) / timelineRect.width;
    const newTime = percentage * videoDuration;

    let newStart = startTime;
    let newEnd = endTime;

    if (isDraggingHandle === 'start') {
        newStart = Math.max(0, Math.min(newTime, newEnd - 0.1));
        if (newEnd - newStart > 10) {
            newEnd = newStart + 10;
        }
    } else {
        newEnd = Math.min(videoDuration, Math.max(newTime, newStart + 0.1));
        if (newEnd - newStart > 10) {
            newStart = newEnd - 10;
        }
    }

    onTimeRangeChange(newStart, newEnd);
  };

  const handlePreviewToggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      if (video.currentTime < startTime || video.currentTime >= endTime) {
          video.currentTime = startTime;
      }
      video.play().catch(error => {
        if (error.name !== 'AbortError') {
          console.error("Video playback failed:", error);
        }
      });
    } else {
      video.pause();
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoRef.current) {
        videoRef.current.volume = newVolume;
        videoRef.current.muted = newVolume === 0;
    }
  };

  const toggleMute = () => {
      const video = videoRef.current;
      if (!video) return;

      if (video.muted || volume === 0) {
          const newVolume = lastVolume > 0 ? lastVolume : 0.5;
          setVolume(newVolume);
          setIsMuted(false);
          video.volume = newVolume;
          video.muted = false;
      } else {
          setLastVolume(volume);
          setVolume(0);
          setIsMuted(true);
          video.volume = 0;
          video.muted = true;
      }
  };
  
  const handlePlaybackRateChange = () => {
      const currentIndex = playbackRates.indexOf(playbackRate);
      const nextIndex = (currentIndex + 1) % playbackRates.length;
      const newRate = playbackRates[nextIndex];
      setPlaybackRate(newRate);
      if (videoRef.current) {
          videoRef.current.playbackRate = newRate;
      }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!timelineRef.current || !videoRef.current) return;
      const timelineRect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - timelineRect.left;
      const percentage = clickX / timelineRect.width;
      const newTime = percentage * videoDuration;

      // Ensure the seeked time is within the selected clip for continuous play
      const clampedTime = Math.max(startTime, Math.min(newTime, endTime));
      videoRef.current.currentTime = clampedTime;
      setCurrentPlaybackTime(clampedTime);
  };

  useEffect(() => {
    if (isDraggingHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingHandle, startTime, endTime, videoDuration]);

  useEffect(() => {
    if (videoRef.current) {
        if (isDraggingHandle === 'start') {
            videoRef.current.currentTime = startTime;
        } else if (isDraggingHandle === 'end') {
            videoRef.current.currentTime = endTime;
        }
    }
  }, [startTime, endTime, isDraggingHandle]);

  // Effect for handling video playback logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (video) {
        setCurrentPlaybackTime(video.currentTime);
        if (!video.paused && video.currentTime >= endTime) {
          video.currentTime = startTime;
        }
      }
    };
    const onPlay = () => setIsPreviewPlaying(true);
    const onPause = () => setIsPreviewPlaying(false);
    
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      if (video) {
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.removeEventListener('play', onPlay);
        video.removeEventListener('pause', onPause);
      }
    };
  }, [startTime, endTime]);
  
  // Set initial video properties and reset playback time when file changes
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
        setCurrentPlaybackTime(startTime);
        video.volume = volume;
        video.muted = isMuted;
        video.playbackRate = playbackRate;
    }
  }, [file, startTime]);

  const clipDuration = endTime - startTime;

  return (
    <div className="bg-card rounded-xl shadow p-6 sm:p-8 text-center transition-shadow hover:shadow-md">
      <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-4">
        {file ? 'Preview & Analyze Clip' : 'Analyze Your Exercise Form'}
      </h2>
      <p className="text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto">
        {file
          ? 'Use the timeline to select a 10-second clip, then use the player controls to review.'
          : 'Upload a video of your workout. Our AI will analyze your movement, detect critical errors, and provide actionable feedback to improve your form and prevent injury.'}
      </p>

      {file && videoUrl ? (
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex justify-end mb-2">
            <div className={`text-xs font-sans px-2 py-1 rounded-md transition-colors ${clipDuration > 10.01 ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'}`}>
              Clip: {clipDuration.toFixed(2)}s / 10.00s
            </div>
          </div>
          <div className="relative group bg-black rounded-t-md overflow-hidden">
            <video 
              ref={videoRef} 
              src={videoUrl} 
              playsInline
              preload="auto"
              className="w-full aspect-video"
              onClick={handlePreviewToggle}
            >
            </video>
            
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none bg-black/30">
              <div className="bg-black/50 rounded-full p-3 sm:p-4">
                {isPreviewPlaying ? (
                  <PauseIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                ) : (
                  <PlayIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-muted p-2 rounded-b-md flex items-center gap-3 text-muted-foreground select-none">
              <button onClick={handlePreviewToggle} className="p-1.5 hover:text-foreground transition-colors">
                  {isPreviewPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2 group">
                  <button onClick={toggleMute} className="p-1.5 hover:text-foreground transition-colors">
                      {isMuted || volume === 0 ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeUpIcon className="w-5 h-5" />}
                  </button>
                  <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-0 sm:w-20 cursor-pointer accent-primary transition-all duration-300 opacity-0 sm:opacity-100 group-hover:w-20 group-hover:opacity-100"
                      aria-label="Volume control"
                  />
              </div>
              <div className="text-xs font-mono flex-grow text-left sm:text-center">
                  {formatTime(currentPlaybackTime)} / {formatTime(videoDuration)}
              </div>
              <button
                  onClick={handlePlaybackRateChange}
                  className="text-xs font-mono font-semibold p-1 px-2 rounded hover:bg-secondary hover:text-secondary-foreground transition-colors w-14"
              >
                  {playbackRate.toFixed(2)}x
              </button>
          </div>

          <div className="relative pt-8 pb-4 px-3 select-none">
            <div ref={timelineRef} onClick={handleTimelineClick} className="relative w-full h-2 bg-muted rounded-full cursor-pointer">
              <div 
                className="absolute top-0 h-2 bg-primary/50"
                style={{
                  left: `${(startTime / videoDuration) * 100}%`,
                  width: `${(clipDuration / videoDuration) * 100}%`,
                }}
              ></div>
              <div
                className="absolute -top-1 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-lg pointer-events-none z-20"
                style={{
                  left: `calc(${(currentPlaybackTime / videoDuration) * 100}% - 8px)`,
                  opacity: (isPreviewPlaying || (currentPlaybackTime >= startTime && currentPlaybackTime <= endTime)) ? 1 : 0,
                  transition: 'opacity 0.2s',
                }}
              ></div>
              <div
                className="absolute -top-2 w-6 h-6 rounded-full bg-primary border-4 border-card shadow cursor-grab active:cursor-grabbing z-30"
                style={{ left: `calc(${(startTime / videoDuration) * 100}% - 12px)` }}
                onMouseDown={() => handleMouseDown('start')}
                aria-label="Start time handle"
                role="slider"
              ></div>
              <div
                className="absolute -top-2 w-6 h-6 rounded-full bg-primary border-4 border-card shadow cursor-grab active:cursor-grabbing z-30"
                style={{ left: `calc(${(endTime / videoDuration) * 100}% - 12px)` }}
                onMouseDown={() => handleMouseDown('end')}
                aria-label="End time handle"
                role="slider"
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
              <span>0.00s</span>
              <span>{videoDuration.toFixed(2)}s</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={openFileDialog}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 sm:p-12 cursor-pointer transition-colors duration-300 ${
            isDragging ? 'border-primary bg-secondary' : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <div className="flex flex-col items-center">
            <UploadIcon className="w-12 h-12 text-muted-foreground mb-4 transition-colors duration-300" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-2">MP4, MOV, AVI, or WEBM</p>
          </div>
        </div>
      )}
      
      <div className="mt-8 flex flex-col sm:flex-row sm:justify-center items-center gap-4">
        {file && (
          <button
            onClick={openFileDialog}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-lg font-bold text-secondary-foreground bg-secondary rounded-md shadow-sm transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            Change Video
          </button>
        )}
        <button
          onClick={onAnalyze}
          disabled={!file || clipDuration <= 0 || clipDuration > 10.1}
          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-primary-foreground bg-primary rounded-md shadow-sm transition-colors enabled:hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        >
          {file ? `Analyze ${clipDuration > 0 ? clipDuration.toFixed(1) : '0.0'}s Clip` : 'Analyze Form'}
        </button>
      </div>

      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};