import { useState } from 'react';
import apiClient from '../services/apiClient';

export function useImportImages() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const submitImport = async (driveUrl, importName, maxImages, tags) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.post('/import/google-drive', {
                driveUrl,
                importName,
                maxImages: parseInt(maxImages),
                tags: tags.split(',').map(t => t.trim())
            });
            return response.data.jobId;
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { submitImport, loading, error };
}