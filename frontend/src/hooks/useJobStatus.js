import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export function useJobStatus(jobId) {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!jobId) return;
        setLoading(true);

        const poll = setInterval(async () => {
            try {
                const res = await apiClient.get(`/import/status/${jobId}`);
                setStatus(res.data);

                // Stop polling if done
                if (['completed', 'failed'].includes(res.data.state)) {
                    clearInterval(poll);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Polling error", err);
                clearInterval(poll);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(poll);
    }, [jobId]);

    return { status, loading };
}