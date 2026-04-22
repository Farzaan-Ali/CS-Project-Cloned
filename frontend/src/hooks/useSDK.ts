
import { useState, useEffect, useCallback } from 'react';
import { Tool } from '../types/sdk';

export const useSDK = () => {

    //useState keeps track of the data in tools
    const [tools, setTools] = useState<Tool[]>([]);
    //useState tracks loading to check if thing exists
    const [loading, setLoading] = useState<boolean>(true);
    //useState stores error here if error occurs
    const [error, setError] = useState<string | null>(null);

    const API_BASE = "http://localhost:8000/api";

    //useCallback freezes fetchTools to not recreate it, helps performance
    const fetchTools = useCallback(async () => {
    setLoading(true);
    try {
        const response = await fetch(`${API_BASE}/sdk/tools/`);
        if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch from RCC Spine`);
        }
      
        const data: Tool[] = await response.json();
        setTools(data);
        setError(null);
    } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
        setLoading(false);
    }
  }, []);

    useEffect(() => {
        fetchTools();
  }, [fetchTools]);

    return { tools, loading, error, refresh: fetchTools };
};