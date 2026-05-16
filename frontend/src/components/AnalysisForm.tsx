'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const sample = `Patient: Amina Rahman, Age: 54. Diagnosis: Type 2 diabetes and hypertension. Medications: Metformin 500 mg twice daily, Lisinopril 10 mg once daily, Aspirin 75 mg daily. Lab results: HbA1c 8.2%, BP 150/95 mmHg, Creatinine 1.1 mg/dL. Allergy: Penicillin. Follow up after 2 weeks.`;

interface Props {
  loading: boolean;
  onText: (content: string, documentType: string) => void;
  onUpload: (file: File, documentType: string, notes: string) => void;
}

export function AnalysisForm({ loading, onText, onUpload }: Props) {
  const [content, setContent] = useState(sample);
  const [documentType, setDocumentType] = useState('medical_report');
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  function submit() {
    if (file) {
      onUpload(file, documentType, notes);
      return;
    }
    onText(content, documentType);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-ink">Document intake</h2>
            <p className="mt-1 text-sm text-slate-500">Upload a report or paste prescription text. The system extracts a structured health record.</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">OCR + NLP</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <label className="text-sm font-bold text-slate-700">Document type</label>
          <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-clinical-500 transition focus:ring-4">
            <option value="medical_report">Medical report</option>
            <option value="prescription">Prescription</option>
            <option value="lab_report">Lab report</option>
            <option value="discharge_summary">Discharge summary</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700">Upload PDF, image, or text file</label>
          <div className="mt-2 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center transition hover:border-clinical-300 hover:bg-blue-50">
            <input type="file" accept=".pdf,.txt,.png,.jpg,.jpeg,.webp,.bmp,.tiff" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mx-auto block w-full max-w-sm text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-bold file:text-white" />
            <p className="mt-3 text-xs text-slate-500">Scanned images use OCR. If OCR struggles, paste the text below.</p>
            {file && <p className="mt-2 text-sm font-bold text-clinical-700">Selected: {file.name}</p>}
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700">Manual text input</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={9} className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 outline-none ring-clinical-500 transition focus:ring-4" />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700">Additional patient notes optional</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Example: patient is pregnant, elderly, has kidney disease..." className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-clinical-500 transition focus:ring-4" />
        </div>
        <Button onClick={submit} disabled={loading || (!file && content.trim().length < 10)} className="w-full sm:w-auto">
          <span className="flex items-center justify-center gap-2">{loading && <LoadingSpinner />} Analyze Medical Document</span>
        </Button>
      </CardContent>
    </Card>
  );
}
