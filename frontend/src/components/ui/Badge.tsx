import type { ReactNode } from 'react';
import { cn, riskClass } from '@/lib/utils';

export function Badge({ children, risk = 'neutral', className }: { children: ReactNode; risk?: string; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize', riskClass(risk), className)}>{children}</span>;
}
