import { Card, CardContent } from '@/components/ui/Card';

export default function RecordsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-ink">Structured records</h1>
      <p className="mt-3 max-w-2xl text-slate-600">This starter app returns structured patient records as JSON from the analysis endpoint. You can later connect a database for persistent records.</p>
      <Card className="mt-8"><CardContent><pre className="overflow-auto rounded-3xl bg-slate-950 p-5 text-sm leading-6 text-slate-100">{`{
  "patient": {},
  "conditions": [],
  "medications": [],
  "allergies": [],
  "labs": [],
  "vitals": [],
  "alerts": [],
  "summary": ""
}`}</pre></CardContent></Card>
    </main>
  );
}
