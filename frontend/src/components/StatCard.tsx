import { Card } from '@/components/ui/Card';

export function StatCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-ink">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
    </Card>
  );
}
