
import React from 'react';
import type { ReportData } from '../types';
import { SkeletonOverlay } from './SkeletonOverlay';
import { AlertIcon, CheckIcon, InfoIcon, RestartIcon } from './icons';

interface ReportProps {
  data: ReportData;
  onReset: () => void;
}

const ReportCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg">
        <div className="flex items-center mb-4">
            {icon}
            <h3 className="text-xl font-bold ml-3 text-gray-100">{title}</h3>
        </div>
        {children}
    </div>
);

export const Report: React.FC<ReportProps> = ({ data, onReset }) => {
  return (
    <div className="w-full mx-auto animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 sm:mb-0">{data.title}</h1>
             <button
                onClick={onReset}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                <RestartIcon className="w-4 h-4 mr-2" />
                Analyze Another Video
            </button>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 sm:p-6 shadow-2xl shadow-red-900/20">
                <div className="flex items-center text-red-400 mb-3">
                    <AlertIcon className="w-7 h-7" />
                    <h2 className="text-2xl font-bold ml-3">{data.error.title}</h2>
                    <span className="ml-auto text-sm font-mono bg-red-500/20 text-red-300 px-2 py-1 rounded">{data.error.timestamp}</span>
                </div>
                <div className="relative rounded-lg overflow-hidden border-2 border-red-500/30">
                    <img src={data.error.imageSrc} alt="Exercise frame with error" className="w-full h-auto" />
                    <SkeletonOverlay skeleton={data.error.skeleton} />
                </div>
            </div>

            <ReportCard title="Actionable Correction Plan" icon={<CheckIcon className="w-6 h-6 text-green-400" />}>
                 <div className="space-y-4">
                    {data.correctionPlan.steps.map((step, index) => (
                        <div key={index}>
                            <p className="font-semibold text-cyan-400">{step.title}</p>
                            <p className="text-gray-400 text-sm">{step.description}</p>
                        </div>
                    ))}
                </div>
            </ReportCard>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
            <ReportCard title="Specific Findings" icon={<InfoIcon className="w-6 h-6 text-yellow-400" />}>
                <div className="space-y-4 text-gray-300">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Error Name</p>
                        <p className="font-semibold text-red-400">{data.findings.errorName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Description</p>
                        <p className="text-sm">{data.findings.description}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-500 font-medium">Analysis Confidence</p>
                        <p className="font-mono text-lg text-green-400">{data.findings.confidence}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Affected Joints</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {data.findings.affectedJoints.map((joint) => (
                                <span key={joint} className="text-xs font-medium bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">{joint}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </ReportCard>
            
             <ReportCard title={data.rationale.title} icon={<AlertIcon className="w-6 h-6 text-red-400" />}>
                <p className="text-gray-400 text-sm">{data.rationale.text}</p>
            </ReportCard>
        </div>
      </div>
    </div>
  );
};
