import type { AnalysisResponse } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ConfidenceRing } from '@/components/ConfidenceRing';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { StatCard } from '@/components/StatCard';

export function ResultsDashboard({ result }: { result: AnalysisResponse }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Medications" value={result.medications.length} note="Detected from prescription and report text" />
        <StatCard label="Lab results" value={result.labs.length} note="Structured values ready for review" />
        <StatCard label="Safety alerts" value={result.alerts.length + result.interactions.length} note="Includes local interaction rules" />
        <StatCard label="Graph nodes" value={result.knowledge_graph.nodes.length} note="Clinical entities connected visually" />
      </div>

      <Card>
        <CardContent className="grid gap-6 lg:grid-cols-[160px_1fr]">
          <ConfidenceRing value={result.confidence_score} />
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge>{result.document_type.replace('_', ' ')}</Badge>
              <Badge risk={result.alerts.some((a) => a.severity === 'critical') ? 'critical' : result.alerts.length ? 'moderate' : 'low'}>
                {result.alerts.length ? 'needs review' : 'low alert load'}
              </Badge>
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-ink">Simple-language summary</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{result.simple_summary}</p>
            <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">{result.safety_notice}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><h3 className="text-lg font-black text-ink">Patient profile</h3></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {Object.entries(result.patient).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3"><span className="font-bold capitalize text-slate-500">{key.replace('_', ' ')}</span><span className="text-right font-semibold text-ink">{value || 'Not found'}</span></div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h3 className="text-lg font-black text-ink">Health insights</h3></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.health_insights.map((insight) => <li key={insight} className="rounded-2xl bg-blue-50 p-4 text-sm font-medium leading-6 text-blue-900">{insight}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><h3 className="text-lg font-black text-ink">Medication table</h3></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead><tr className="border-b text-xs uppercase tracking-wider text-slate-400"><th className="py-3">Name</th><th>Dose</th><th>Frequency</th><th>Instructions</th><th>Confidence</th></tr></thead>
            <tbody>
              {result.medications.length ? result.medications.map((med) => (
                <tr key={`${med.name}-${med.dose}`} className="border-b border-slate-100"><td className="py-4 font-black text-ink">{med.name}</td><td>{med.dose || '-'}</td><td>{med.frequency || '-'}</td><td className="max-w-sm text-slate-500">{med.instructions || '-'}</td><td>{Math.round(med.confidence * 100)}%</td></tr>
              )) : <tr><td className="py-4 text-slate-500" colSpan={5}>No medications detected.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><h3 className="text-lg font-black text-ink">Labs and vitals</h3></CardHeader>
          <CardContent className="space-y-3">
            {[...result.labs.map((l) => ({ label: l.test, value: `${l.value || ''} ${l.unit || ''}`.trim(), status: l.status, note: l.explanation })), ...result.vitals.map((v) => ({ label: v.name, value: v.value, status: v.status, note: '' }))].map((item) => (
              <div key={`${item.label}-${item.value}`} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4">
                <div><p className="font-black text-ink">{item.label}</p><p className="text-xs text-slate-500">{item.note || 'Review against official reference range.'}</p></div>
                <div className="text-right"><p className="font-bold">{item.value || '-'}</p><Badge risk={item.status === 'normal' ? 'low' : item.status}>{item.status}</Badge></div>
              </div>
            ))}
            {!result.labs.length && !result.vitals.length && <p className="text-sm text-slate-500">No labs or vitals detected.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h3 className="text-lg font-black text-ink">Alerts and interactions</h3></CardHeader>
          <CardContent className="space-y-3">
            {[...result.interactions.map((i) => ({ severity: i.severity, title: i.medications.join(' + '), description: i.explanation, recommendation: i.recommendation })), ...result.alerts].map((alert, index) => (
              <div key={`${alert.title}-${index}`} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3"><h4 className="font-black text-ink">{alert.title}</h4><Badge risk={alert.severity}>{alert.severity}</Badge></div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{alert.description}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{alert.recommendation}</p>
              </div>
            ))}
            {!result.alerts.length && !result.interactions.length && <p className="text-sm text-slate-500">No safety alerts detected by this educational ruleset.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><h3 className="text-lg font-black text-ink">Medication reminder plan</h3></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {result.reminders.map((reminder) => (
            <div key={reminder.medication} className="rounded-3xl bg-slate-50 p-4">
              <p className="font-black text-ink">{reminder.medication}</p>
              <p className="mt-1 text-sm text-slate-500">{reminder.dose || 'Dose not found'} • {reminder.frequency || 'Timing needs confirmation'}</p>
              <div className="mt-3 flex flex-wrap gap-2">{reminder.suggested_times.map((time) => <Badge key={time} risk="low">{time}</Badge>)}</div>
            </div>
          ))}
          {!result.reminders.length && <p className="text-sm text-slate-500">No reminders because no medications were detected.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="text-lg font-black text-ink">Knowledge graph</h3></CardHeader>
        <CardContent><KnowledgeGraph graph={result.knowledge_graph} /></CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="text-lg font-black text-ink">Questions to ask a clinician or pharmacist</h3></CardHeader>
        <CardContent>
          <ol className="grid gap-3 md:grid-cols-2">
            {result.recommended_questions.map((question, index) => <li key={question} className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-900"><span className="mr-2 font-black">{index + 1}.</span>{question}</li>)}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
