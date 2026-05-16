'use client';

import { useMemo, useState } from 'react';
import type { GraphNode, KnowledgeGraph as KnowledgeGraphType } from '@/types';
import { Badge } from '@/components/ui/Badge';

const typeColor: Record<string, string> = {
  patient: '#2563eb',
  diagnosis: '#7c3aed',
  medication: '#10b981',
  allergy: '#ef4444',
  lab: '#f97316',
  vital: '#06b6d4',
  alert: '#dc2626',
};

export function KnowledgeGraph({ graph }: { graph: KnowledgeGraphType }) {
  const [selected, setSelected] = useState<GraphNode | null>(graph.nodes[0] || null);
  const layout = useMemo(() => {
    const width = 820;
    const height = 460;
    const center = { x: width / 2, y: height / 2 };
    const nodes = graph.nodes.map((node, index) => {
      if (node.id === 'patient') return { ...node, x: center.x, y: center.y };
      const angle = ((index - 1) / Math.max(graph.nodes.length - 1, 1)) * Math.PI * 2;
      const radius = node.type === 'alert' ? 190 : 160 + (index % 3) * 28;
      return { ...node, x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius };
    });
    return { width, height, nodes };
  }, [graph]);

  const getNode = (id: string) => layout.nodes.find((node) => node.id === id);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-soft">
        <svg viewBox={`0 0 ${layout.width} ${layout.height}`} className="h-[360px] w-full sm:h-[460px]">
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="3.5" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {graph.edges.map((edge, index) => {
            const source = getNode(edge.source);
            const target = getNode(edge.target);
            if (!source || !target) return null;
            return (
              <g key={`${edge.source}-${edge.target}-${index}`}>
                <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="rgba(148,163,184,0.45)" strokeWidth="1.5" />
                <text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2} fill="rgba(226,232,240,0.75)" fontSize="10" textAnchor="middle">{edge.label}</text>
              </g>
            );
          })}
          {layout.nodes.map((node) => (
            <g key={node.id} onClick={() => setSelected(node)} className="cursor-pointer">
              <circle cx={node.x} cy={node.y} r={node.id === 'patient' ? 38 : 28} fill={typeColor[node.type] || '#64748b'} opacity="0.95" filter="url(#glow)" />
              <circle cx={node.x} cy={node.y} r={node.id === 'patient' ? 43 : 33} fill="none" stroke={node.risk === 'critical' || node.risk === 'high' ? '#fca5a5' : 'rgba(255,255,255,0.45)'} strokeWidth="2" />
              <text x={node.x} y={node.y + 4} fill="white" fontSize={node.id === 'patient' ? '12' : '10'} fontWeight="700" textAnchor="middle">{node.label.slice(0, 14)}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Selected node</p>
        {selected ? (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-2xl font-black text-ink">{selected.label}</h3>
              <div className="mt-2 flex flex-wrap gap-2"><Badge>{selected.type}</Badge><Badge risk={selected.risk}>{selected.risk}</Badge></div>
            </div>
            <pre className="max-h-72 overflow-auto rounded-3xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">{JSON.stringify(selected.details, null, 2)}</pre>
          </div>
        ) : <p className="mt-4 text-sm text-slate-500">Click a node to inspect details.</p>}
      </div>
    </div>
  );
}
