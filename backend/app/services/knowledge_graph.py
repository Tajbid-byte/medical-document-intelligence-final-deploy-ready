from __future__ import annotations

from app.models.schemas import (
    Alert,
    Allergy,
    Diagnosis,
    GraphEdge,
    GraphNode,
    KnowledgeGraph,
    LabResult,
    Medication,
    PatientInfo,
    VitalSign,
)


def _risk_from_status(status: str) -> str:
    if status in {'high', 'low'}:
        return 'moderate'
    return 'neutral'


def build_knowledge_graph(
    patient: PatientInfo,
    diagnoses: list[Diagnosis],
    medications: list[Medication],
    allergies: list[Allergy],
    labs: list[LabResult],
    vitals: list[VitalSign],
    alerts: list[Alert],
) -> KnowledgeGraph:
    patient_label = patient.name or 'Patient'
    nodes: list[GraphNode] = [GraphNode(id='patient', label=patient_label, type='patient', risk='neutral', details=patient.model_dump())]
    edges: list[GraphEdge] = []

    for i, diagnosis in enumerate(diagnoses[:8]):
        node_id = f'diagnosis-{i}'
        nodes.append(GraphNode(id=node_id, label=diagnosis.name, type='diagnosis', risk='neutral', details=diagnosis.model_dump()))
        edges.append(GraphEdge(source='patient', target=node_id, label='has diagnosis'))

    for i, med in enumerate(medications[:12]):
        node_id = f'medication-{i}'
        nodes.append(GraphNode(id=node_id, label=med.name, type='medication', risk='low', details=med.model_dump()))
        edges.append(GraphEdge(source='patient', target=node_id, label='takes'))
        if diagnoses:
            edges.append(GraphEdge(source=node_id, target='diagnosis-0', label='may treat'))

    for i, allergy in enumerate(allergies[:6]):
        node_id = f'allergy-{i}'
        nodes.append(GraphNode(id=node_id, label=allergy.substance, type='allergy', risk='high', details=allergy.model_dump()))
        edges.append(GraphEdge(source='patient', target=node_id, label='allergic to'))

    for i, lab in enumerate(labs[:10]):
        node_id = f'lab-{i}'
        nodes.append(GraphNode(id=node_id, label=lab.test, type='lab', risk=_risk_from_status(lab.status), details=lab.model_dump()))
        edges.append(GraphEdge(source='patient', target=node_id, label='has result'))

    for i, vital in enumerate(vitals[:8]):
        node_id = f'vital-{i}'
        nodes.append(GraphNode(id=node_id, label=vital.name, type='vital', risk=_risk_from_status(vital.status), details=vital.model_dump()))
        edges.append(GraphEdge(source='patient', target=node_id, label='has vital'))

    for i, alert in enumerate(alerts[:8]):
        node_id = f'alert-{i}'
        nodes.append(GraphNode(id=node_id, label=alert.title, type='alert', risk=alert.severity, details=alert.model_dump()))
        edges.append(GraphEdge(source='patient', target=node_id, label='needs review'))

    return KnowledgeGraph(nodes=nodes, edges=edges)
