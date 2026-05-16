import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const features = [
  ['Medical extraction', 'Patient details, medications, labs, diagnoses, allergies, and follow-up notes.'],
  ['Drug safety screening', 'Local interaction rules plus AI-assisted interpretation for review.'],
  ['Knowledge graph', 'Visual map connecting patient, medicines, labs, diagnoses, and alerts.'],
  ['Simple insights', 'Plain-language explanations students, patients, and caregivers can understand.'],
];

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-clinical-700 shadow-sm">OCR • NLP • Knowledge Graphs • Medication Safety</div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-ink sm:text-6xl">Medical Document Intelligence for reports, prescriptions, and safer understanding.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Transform messy medical documents into structured health records, medication reminder plans, interaction checks, and a beautiful patient knowledge graph.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/analyze"><Button>Analyze a document</Button></Link>
            <Link href="/dashboard"><Button variant="secondary">View dashboard</Button></Link>
          </div>
        </div>
        <Card className="relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-grid bg-[size:32px_32px] opacity-70" />
          <div className="relative rounded-[2rem] bg-slate-950 p-5 text-white shadow-soft">
            <div className="mb-5 flex items-center justify-between"><p className="font-black">Live clinical graph</p><span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200">AI ready</span></div>
            <svg viewBox="0 0 520 340" className="w-full">
              {[[260,170,70,65],[130,80,260,170],[410,80,260,170],[150,260,260,170],[400,260,260,170],[260,40,260,170]].map((l,i)=><line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke="rgba(148,163,184,0.45)" />)}
              {[[260,170,'Patient','#2563eb'],[130,80,'Metformin','#10b981'],[410,80,'HbA1c 8.2','#f97316'],[150,260,'Diabetes','#7c3aed'],[400,260,'BP High','#dc2626'],[260,40,'Aspirin','#10b981']].map((n)=><g key={String(n[2])}><circle cx={Number(n[0])} cy={Number(n[1])} r="42" fill={String(n[3])}/><text x={Number(n[0])} y={Number(n[1])+4} textAnchor="middle" fill="white" fontSize="13" fontWeight="700">{n[2]}</text></g>)}
            </svg>
          </div>
        </Card>
      </section>
      <section className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {features.map(([title, description]) => <Card key={title} className="p-6"><h3 className="text-lg font-black text-ink">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p></Card>)}
      </section>
    </main>
  );
}
