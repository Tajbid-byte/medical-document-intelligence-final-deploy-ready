import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function RemindersPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-ink">Medication reminders</h1>
      <p className="mt-3 max-w-2xl text-slate-600">Reminder plans are generated automatically after document analysis based on detected dose frequency.</p>
      <Card className="mt-8"><CardContent><h2 className="text-2xl font-black text-ink">How to generate reminders</h2><ol className="mt-4 space-y-3 text-sm font-semibold leading-6 text-slate-600"><li>1. Open Analyze.</li><li>2. Upload a prescription or paste medicine text.</li><li>3. Review the reminder cards inside the result dashboard.</li><li>4. Confirm timing with a pharmacist before using it in real life.</li></ol><Link href="/analyze" className="mt-6 inline-block"><Button>Analyze prescription</Button></Link></CardContent></Card>
    </main>
  );
}
