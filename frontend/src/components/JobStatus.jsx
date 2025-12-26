import React from 'react';
import { useJobStatus } from '../hooks/useJobStatus';
import { useEffect } from 'react';
import { useRef } from 'react';

export function JobStatus({ jobId, onComplete }) {
    const { status } = useJobStatus(jobId);
    const hasCompletedRef = useRef(false); // Track if we already finished

    useEffect(() => {
        if (status?.state === 'completed' && status.progress === 100) {
             if (hasCompletedRef.current) return; // Stop if already ran
             
             hasCompletedRef.current = true; // Mark as done
             
             const timer = setTimeout(() => {
                 onComplete();
             }, 1000);
             return () => clearTimeout(timer);
        }
    }, [status, onComplete]);

    if (!status) return null;

    const isCompleted = status.state === 'completed';
    const isFailed = status.state === 'failed';

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Job Status</span>
                    <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {status.state.toUpperCase()}
                        <span className="text-sm text-gray-400 font-normal font-mono">#{jobId.split('-')[1]}</span>
                    </div>
                </div>
                <span className={`text-2xl font-bold ${isCompleted ? 'text-green-600' : 'text-indigo-600'}`}>
                    {status.progress}%
                </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ease-out ${
                        isFailed ? 'bg-red-500' : isCompleted ? 'bg-green-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${status.progress}%` }}
                >
                    {/* Animated stripe pattern */}
                    {!isCompleted && !isFailed && (
                        <div className="w-full h-full animate-pulse bg-white/20"></div>
                    )}
                </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-2 text-right">
                {isCompleted ? 'All images processed successfully' : 'Processing images in background worker...'}
            </p>
        </div>
    );
}