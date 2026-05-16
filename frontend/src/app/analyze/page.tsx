'use client';

import { AnalysisForm } from '@/components/AnalysisForm';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { Card, CardContent } from '@/components/ui/Card';
import { useAnalysis } from '@/hooks/useAnalysis';

export default function AnalyzePage() {
  const { result, loading, error, runText, runUpload } = useAnalysis();
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-ink">Analyze medical document</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Upload a prescription image, PDF report, or paste text. The app will create a structured record, safety signals, reminders, and graph visualization.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div><AnalysisForm loading={loading} onText={runText} onUpload={runUpload} /></div>
        <div>
          {error && <Card className="mb-5 border-red-200 bg-red-50"><CardContent><p className="font-bold text-red-700">{error}</p></CardContent></Card>}
          {result ? <ResultsDashboard result={result} /> : <Card><CardContent className="min-h-[360px]"><p className="text-slate-500">Your structured medical intelligence report will appear here. Think of it as a calm clinical assistant with excellent handwriting.</p></CardContent></Card>}
        </div>
      </div>
    </main>
  );
}
