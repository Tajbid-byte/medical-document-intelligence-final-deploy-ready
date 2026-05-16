import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><h1 className="text-4xl font-black text-ink">Clinical intelligence dashboard</h1><p className="mt-3 max-w-2xl text-slate-600">A project-ready overview for extraction quality, alert load, medication review, and patient record readiness.</p></div>
        <Link href="/analyze"><Button>Run new analysis</Button></Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Document types" value="4" note="Prescription, lab report, discharge summary, general report" />
        <StatCard label="AI pipeline" value="OCR + NLP" note="Tesseract OCR, local parser, Groq extraction" />
        <StatCard label="Safety modules" value="3" note="Interaction rules, allergy checks, abnormal lab alerts" />
        <StatCard label="Deploy targets" value="2" note="Vercel frontend and Render backend" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><h2 className="text-xl font-black text-ink">System workflow</h2></CardHeader><CardContent className="space-y-3">{['Document upload or manual text input','OCR / PDF text extraction','Medical entity extraction','Drug interaction screening','Knowledge graph generation','Simple-language patient insight'].map((item, i)=><div key={item} className="flex gap-3 rounded-2xl bg-slate-50 p-4"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-black text-white">{i+1}</span><p className="font-semibold text-slate-700">{item}</p></div>)}</CardContent></Card>
        <Card><CardHeader><h2 className="text-xl font-black text-ink">Production upgrade ideas</h2></CardHeader><CardContent className="space-y-3">{['Add encrypted database for patient history','Connect Google Document AI or Azure Document Intelligence','Add user authentication and role-based access','Create audit logs for all document access','Add clinician approval workflow before final record saving'].map((item)=><p key={item} className="rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-900">{item}</p>)}</CardContent></Card>
      </div>
    </main>
  );
}
