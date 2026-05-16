'use client';

import { useState } from 'react';
import { checkInteractions } from '@/lib/api';
import type { Interaction } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function InteractionsPage() {
  const [text, setText] = useState('Warfarin, Aspirin, Ibuprofen');
  const [results, setResults] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const meds = text.split(',').map((x) => x.trim()).filter(Boolean);
      setResults(await checkInteractions(meds));
    } finally { setLoading(false); }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-ink">Medication interaction checker</h1>
      <p className="mt-3 max-w-2xl text-slate-600">Enter comma-separated medicine names for a quick educational safety screen. This does not replace pharmacist review.</p>
      <Card className="mt-8"><CardContent className="space-y-4"><textarea value={text} onChange={(e)=>setText(e.target.value)} rows={5} className="w-full rounded-3xl border border-slate-200 p-4 outline-none ring-clinical-500 focus:ring-4"/><Button onClick={run} disabled={loading}>{loading ? 'Checking...' : 'Check interactions'}</Button></CardContent></Card>
      <div className="mt-6 space-y-4">{results.map((item)=><Card key={item.explanation}><CardContent><div className="flex items-start justify-between gap-3"><h2 className="text-xl font-black text-ink">{item.medications.join(' + ')}</h2><Badge risk={item.severity}>{item.severity}</Badge></div><p className="mt-3 text-slate-600">{item.explanation}</p><p className="mt-3 font-semibold text-slate-700">{item.recommendation}</p></CardContent></Card>)}{!results.length && <p className="text-sm text-slate-500">No interaction results yet, or none detected by the local ruleset.</p>}</div>
    </main>
  );
}
