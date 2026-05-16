from typing import Any, Literal
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    content: str = Field(..., min_length=10, description='Medical document text, prescription text, or report text')
    document_type: str = Field(default='medical_report', description='prescription, lab_report, discharge_summary, medical_report')
    source_name: str | None = None
    patient_notes: str | None = None


class PatientInfo(BaseModel):
    name: str | None = None
    age: str | None = None
    gender: str | None = None
    patient_id: str | None = None
    visit_date: str | None = None


class Medication(BaseModel):
    name: str
    dose: str | None = None
    frequency: str | None = None
    route: str | None = None
    duration: str | None = None
    purpose: str | None = None
    instructions: str | None = None
    confidence: float = 0.7


class LabResult(BaseModel):
    test: str
    value: str | None = None
    unit: str | None = None
    reference_range: str | None = None
    status: Literal['normal', 'high', 'low', 'unknown'] = 'unknown'
    explanation: str | None = None


class VitalSign(BaseModel):
    name: str
    value: str
    status: Literal['normal', 'high', 'low', 'unknown'] = 'unknown'


class Diagnosis(BaseModel):
    name: str
    evidence: str | None = None
    confidence: float = 0.7


class Allergy(BaseModel):
    substance: str
    reaction: str | None = None


class Alert(BaseModel):
    severity: Literal['low', 'moderate', 'high', 'critical']
    title: str
    description: str
    recommendation: str


class Interaction(BaseModel):
    severity: Literal['low', 'moderate', 'high', 'critical']
    medications: list[str]
    explanation: str
    recommendation: str


class Reminder(BaseModel):
    medication: str
    dose: str | None = None
    frequency: str | None = None
    suggested_times: list[str] = []
    notes: str | None = None


class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    risk: Literal['low', 'moderate', 'high', 'critical', 'neutral'] = 'neutral'
    details: dict[str, Any] = {}


class GraphEdge(BaseModel):
    source: str
    target: str
    label: str


class KnowledgeGraph(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class AnalysisResponse(BaseModel):
    analysis_id: str
    extracted_text: str
    document_type: str
    confidence_score: float
    patient: PatientInfo
    diagnoses: list[Diagnosis]
    medications: list[Medication]
    allergies: list[Allergy]
    labs: list[LabResult]
    vitals: list[VitalSign]
    interactions: list[Interaction]
    alerts: list[Alert]
    reminders: list[Reminder]
    simple_summary: str
    health_insights: list[str]
    recommended_questions: list[str]
    knowledge_graph: KnowledgeGraph
    extraction_notes: list[str] = []
    safety_notice: str = 'Educational decision-support only. Always confirm findings with a licensed clinician or pharmacist.'


class InteractionRequest(BaseModel):
    medications: list[str] = Field(..., min_length=1)


class ReminderRequest(BaseModel):
    medications: list[Medication]


class RecordRequest(BaseModel):
    analysis: AnalysisResponse
