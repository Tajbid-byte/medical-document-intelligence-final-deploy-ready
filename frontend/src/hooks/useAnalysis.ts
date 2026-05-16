'use client';

import { useState } from 'react';
import type { AnalysisResponse } from '@/types';
import { analyzeText, uploadDocument } from '@/lib/api';

export function useAnalysis() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runText(content: string, documentType: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeText(content, documentType);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  async function runUpload(file: File, documentType: string, notes: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await uploadDocument(file, documentType, notes);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload analysis failed');
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, runText, runUpload, setResult };
}
