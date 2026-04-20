import { useState, useEffect, useCallback, useRef } from 'react';
import Papa from 'papaparse';

export interface Internship {
  company: string;
  title: string;
  location: string;
  stipend: string;
  duration: string;
  requirements: string;
  apply_link: string;
  source?: string;
  match_percentage?: number;
  embedding?: number[];
  score?: number;
}

export const useInternshipEngine = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  // Initialize Worker
  useEffect(() => {
    const worker = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'READY') {
        setIsReady(true);
      }
      if (type === 'DATA_LOADED') {
        setInternships(payload);
        setFilteredInternships(payload);
        setLoading(false);
      }
      if (type === 'SEARCH_RESULTS') {
        setFilteredInternships(payload);
        setLoading(false);
      }
      if (type === 'ERROR') {
        console.error('Worker Error:', payload);
        setLoading(false);
      }
    };

    worker.postMessage({ type: 'INIT' });

    return () => worker.terminate();
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}internships.csv`);
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = (results.data as Internship[]).filter(j => j.company && j.title);
            if (workerRef.current && isReady) {
              workerRef.current.postMessage({ type: 'LOAD_DATA', payload: parsedData });
            }
          }
        });
      } catch (err) {
        console.error('Fetch Error:', err);
        setLoading(false);
      }
    };

    if (isReady) {
      fetchInternships();
    }
  }, [isReady]);

  // Search Function — simplified, no more level filter
  const search = useCallback((term: string, filterSource: string) => {
    setLoading(true);
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'SEARCH', payload: { term, filterSource } });
    }
  }, []);

  return {
    internships,
    filteredInternships,
    loading: loading || !isReady,
    search
  };
};
