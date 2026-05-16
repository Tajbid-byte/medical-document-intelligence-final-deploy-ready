export function ConfidenceRing({ value }: { value: number }) {
  const percent = Math.round(value * 100);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - value * circumference;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} stroke="#e2e8f0" strokeWidth="12" fill="none" />
        <circle cx="60" cy="60" r={radius} stroke="#2563eb" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-ink">{percent}%</span>
        <span className="text-xs font-bold text-slate-500">confidence</span>
      </div>
    </div>
  );
}
