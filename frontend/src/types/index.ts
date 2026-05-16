export type Risk = 'low' | 'moderate' | 'high' | 'critical' | 'neutral';

export interface PatientInfo {
  name?: string | null;
  age?: string | null;
  gender?: string | null;
  patient_id?: string | null;
  visit_date?: string | null;
}

export interface Medication {
  name: string;
  dose?: string | null;
  frequency?: string | null;
  route?: string | null;
  duration?: string | null;
  purpose?: string | null;
  instructions?: string | null;
  confidence: number;
}

export interface LabResult {
  test: string;
  value?: string | null;
  unit?: string | null;
  reference_range?: string | null;
  status: 'normal' | 'high' | 'low' | 'unknown';
  explanation?: string | null;
}

export interface VitalSign {
  name: string;
  value: string;
  status: 'normal' | 'high' | 'low' | 'unknown';
}

export interface Diagnosis {
  name: string;
  evidence?: string | null;
  confidence: number;
}

export interface Allergy {
  substance: string;
  reaction?: string | null;
}

export interface Alert {
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
}

export interface Interaction {
  severity: 'low' | 'moderate' | 'high' | 'critical';
  medications: string[];
  explanation: string;
  recommendation: string;
}

export interface Reminder {
  medication: string;
  dose?: string | null;
  frequency?: string | null;
  suggested_times: string[];
  notes?: string | null;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  risk: Risk;
  details: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AnalysisResponse {
  analysis_id: string;
  extracted_text: string;
  document_type: string;
  confidence_score: number;
  patient: PatientInfo;
  diagnoses: Diagnosis[];
  medications: Medication[];
  allergies: Allergy[];
  labs: LabResult[];
  vitals: VitalSign[];
  interactions: Interaction[];
  alerts: Alert[];
  reminders: Reminder[];
  simple_summary: string;
  health_insights: string[];
  recommended_questions: string[];
  knowledge_graph: KnowledgeGraph;
  extraction_notes: string[];
  safety_notice: string;
}
