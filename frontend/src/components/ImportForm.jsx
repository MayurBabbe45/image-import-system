import React from 'react';
import { useState } from 'react';
import { useImportImages } from '../hooks/useImportImages';
import { ArrowPathIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

export function ImportForm({ onImportStarted }) {
    const [url, setUrl] = useState('https://drive.google.com/drive/folders/1yxoVifdLICJ8DRvWKFXixQVcDgE8CnkB?usp=sharing');
    const { submitImport, loading, error } = useImportImages();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!url) return;
        try {
            const jobId = await submitImport(url, 'Demo Import', 20, 'demo');
            onImportStarted(jobId);
        } catch (err) {
            // Error handled in hook
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    {/* Simple SVG Icon */}
                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">New Import Job</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Drive Folder URL</label>
                    <input 
                        type="text" 
                        value={url} 
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                </div>
                
                {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                        🚨 {error}
                    </div>
                )}

                <button 
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2
                        ${loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md active:transform active:scale-95'
                        }`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Queueing Job...
                        </>
                    ) : (
                        'Start Import Processing'
                    )}
                </button>
            </form>
        </div>
    );
}