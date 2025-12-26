import React, { useState, useEffect, useMemo } from 'react';
import apiClient from './services/apiClient';
import { ImportForm } from './components/ImportForm';
import { JobStatus } from './components/JobStatus';
import { MagnifyingGlassIcon, FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

function App() {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);

  // --- NEW: Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', '24h', '7d'
  const [sortBy, setSortBy] = useState('newest');      // 'newest', 'oldest', 'largest', 'smallest'

 const fetchImages = async (isBackgroundRefresh = false) => {
    // 👇 ONLY show loading spinner if it's NOT a background refresh
    if (!isBackgroundRefresh) setIsLoadingGallery(true);
    
    try {
        const res = await apiClient.get('/images?limit=500');
        if(res.data.data) {
            // Compare lengths to avoid unnecessary state updates if nothing changed
            setImages(prev => {
                if (JSON.stringify(prev) === JSON.stringify(res.data.data)) return prev;
                return res.data.data;
            });
        }
    } catch (err) {
        console.error("Failed to fetch gallery");
    } finally {
        setIsLoadingGallery(false);
    }
};

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent opening the image
    if(!confirm('Are you sure you want to delete this image?')) return;

    // Optimistic UI Update: Remove it from screen immediately
    setImages(prev => prev.filter(img => img.id !== id));

    try {
        await apiClient.delete(`/import/images/${id}`);
    } catch (err) {
        console.error("Delete failed", err);
        alert("Failed to delete image");
        fetchImages(true); // Revert if failed
    }
};

  useEffect(() => {
    fetchImages();
  }, []);

  // --- NEW: Filter Logic (Client Side) ---
  const processedImages = useMemo(() => {
    let result = [...images];

    // 1. Search
    if (searchTerm) {
        result = result.filter(img => 
            img.file_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // 2. Time Filter
    if (timeFilter !== 'all') {
        const now = new Date();
        const cutoff = new Date();
        
        if (timeFilter === '24h') cutoff.setHours(now.getHours() - 24);
        if (timeFilter === '7d') cutoff.setDate(now.getDate() - 7);

        result = result.filter(img => new Date(img.uploaded_at || img.created_at) > cutoff);
    }

    // 3. Sorting
    result.sort((a, b) => {
        const dateA = new Date(a.uploaded_at || 0);
        const dateB = new Date(b.uploaded_at || 0);
        const sizeA = parseInt(a.size || 0);
        const sizeB = parseInt(b.size || 0);

        switch (sortBy) {
            case 'oldest':   return dateA - dateB;
            case 'largest':  return sizeB - sizeA;
            case 'smallest': return sizeA - sizeB;
            case 'newest':   
            default:         return dateB - dateA;
        }
    });



    return result;
  }, [images, searchTerm, timeFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-lg">Im</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight">ImageImport<span className="text-indigo-600">Pro</span></h1>
            </div>
            <div className="flex items-center gap-4">
                 <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500 border border-gray-200">v1.0.0</span>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            
            {/* Left Col: Import Action */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                <ImportForm onImportStarted={setCurrentJobId} />
                {currentJobId && (
                    <JobStatus 
                        jobId={currentJobId} 
                        onComplete={() => fetchImages()} 
                    />
                )}
            </div>

            {/* Right Col: Info / Stats */}
            <div className="lg:col-span-7 xl:col-span-8 hidden lg:block">
                 <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-8 text-white h-full flex flex-col justify-center relative overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-3xl font-bold mb-4">Professional Image Processing</h2>
                        <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
                            Engineered for high-throughput capability using asynchronous worker queues and object storage.
                        </p>
                        
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                                <div className="text-2xl font-bold mb-1">{images.length}</div>
                                <div className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">Total Assets</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                                <div className="text-2xl font-bold mb-1">{(images.reduce((acc, img) => acc + (parseInt(img.size)||0), 0) / 1024 / 1024).toFixed(1)} MB</div>
                                <div className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">Storage Used</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                                <div className="text-2xl font-bold mb-1">0ms</div>
                                <div className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">UI Latency</div>
                            </div>
                        </div>
                    </div>
                    {/* Abstract Decoration */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                 </div>
            </div>
        </div>

        {/* --- TOOLBAR SECTION (NEW) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-20">
            
            {/* Search */}
            <div className="relative w-full md:max-w-md group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                    type="text" 
                    placeholder="Search by filename..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                />
            </div>

            {/* Filters */}
            <div className="flex gap-3 w-full md:w-auto">
                {/* Time Filter */}
                <div className="relative w-full md:w-40">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FunnelIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <select 
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="block w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <option value="all">All Time</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                    </select>
                </div>

                {/* Sort */}
                <div className="relative w-full md:w-40">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="block w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="largest">Size (Largest)</option>
                        <option value="smallest">Size (Smallest)</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Gallery Grid */}
        <div className="min-h-[400px]">
            <div className="flex justify-between items-baseline mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Gallery 
                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {processedImages.length}
                    </span>
                </h2>
                <button 
                    onClick={fetchImages} 
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                >
                    <ArrowPathIcon className="w-4 h-4" /> Refresh
                </button>
            </div>

            {isLoadingGallery ? (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p>Loading your assets...</p>
                 </div>
            ) : processedImages.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">No images found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'Try adjusting your search or filters.' : 'Start an import to see images here.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                    {processedImages.map((img) => (
                        <div 
                            key={img.id} 
                            className="group relative aspect-square bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1"
                        >
                            <img 
                                src={img.minio_url || img.public_url} 
                                alt={img.file_name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                            />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            {/* DELETE BUTTON (Add this) */}
                                <button 
                                    onClick={(e) => handleDelete(img.id, e)}
                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-md"
                                    title="Delete Image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>
                            {/* Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <p className="text-xs font-semibold truncate mb-0.5">{img.file_name}</p>
                                <div className="flex justify-between items-center text-[10px] text-gray-300 font-medium">
                                    <span>{(img.size / 1024).toFixed(0)} KB</span>
                                    <span className="uppercase bg-white/20 px-1.5 py-0.5 rounded">{img.format ? img.format.split('/')[1] : 'IMG'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

// Simple internal icon component to avoid extra imports if heroicons fails
function ArrowPathIcon({ className }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
}

export default App;