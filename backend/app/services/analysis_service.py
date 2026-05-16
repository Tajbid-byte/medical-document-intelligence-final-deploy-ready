from __future__ import annotations

from uuid import uuid4

from app.models.schemas import AnalysisResponse
from app.services.drug_interaction import detect_interactions, medication_safety_alerts
from app.services.groq_service import analyze_with_groq
from app.services.knowledge_graph import build_knowledge_graph
from app.services.medical_parser import (
    build_alerts,
    create_insights,
    create_questions,
    create_summary,
    parse_allergies,
    parse_diagnoses,
    parse_labs,
    parse_medications,
    parse_patient,
    parse_vitals,
)
from app.services.reminder_service import create_reminders


def confidence_from_counts(meds: int, labs: int, diagnoses: int, text_len: int, ai_used: bool) -> float:
    score = 0.35
    score += min(meds, 5) * 0.05
    score += min(labs, 5) * 0.04
    score += min(diagnoses, 3) * 0.05
    if text_len > 300:
        score += 0.1
    if ai_used:
        score += 0.15
    return round(min(score, 0.94), 2)


async def analyze_document_text(text: str, document_type: str, extraction_notes: list[str] | None = None) -> AnalysisResponse:
    notes = extraction_notes or []
    ai_data = {}
    try:
        ai_data = await analyze_with_groq(text, document_type)
        if ai_data:
            notes.append('Groq AI extraction completed successfully.')
    except Exception as exc:
        notes.append(f'Groq AI extraction skipped or failed: {exc}. Local parser results are shown.')
        ai_data = {}

    patient = parse_patient(text, ai_data)
    diagnoses = parse_diagnoses(text, ai_data)
    medications = parse_medications(text, ai_data)
    allergies = parse_allergies(text, ai_data)
    labs = parse_labs(text, ai_data)
    vitals = parse_vitals(text, ai_data)
    interactions = detect_interactions(medications, text)
    alerts = build_alerts(text, labs, vitals, ai_data)
    alerts.extend(medication_safety_alerts(medications, [a.substance for a in allergies]))
    reminders = create_reminders(medications)
    graph = build_knowledge_graph(patient, diagnoses, medications, allergies, labs, vitals, alerts)
    summary = create_summary(ai_data, diagnoses, medications, labs)
    insights = create_insights(ai_data, diagnoses, medications, labs)
    questions = create_questions(ai_data, len(interactions), labs)

    return AnalysisResponse(
        analysis_id=str(uuid4()),
        extracted_text=text,
        document_type=document_type,
        confidence_score=confidence_from_counts(len(medications), len(labs), len(diagnoses), len(text), bool(ai_data)),
        patient=patient,
        diagnoses=diagnoses,
        medications=medications,
        allergies=allergies,
        labs=labs,
        vitals=vitals,
        interactions=interactions,
        alerts=alerts,
        reminders=reminders,
        simple_summary=summary,
        health_insights=insights,
        recommended_questions=questions,
        knowledge_graph=graph,
        extraction_notes=notes,
    )
