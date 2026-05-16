from __future__ import annotations

import re
from typing import Any

from app.models.schemas import PatientInfo, Medication, LabResult, VitalSign, Diagnosis, Allergy, Alert

COMMON_MED_WORDS = [
    'tablet', 'tab', 'capsule', 'cap', 'syrup', 'injection', 'inj', 'cream', 'drop', 'drops', 'ointment',
    'metformin', 'aspirin', 'lisinopril', 'amlodipine', 'atorvastatin', 'simvastatin', 'warfarin', 'ibuprofen',
    'paracetamol', 'acetaminophen', 'omeprazole', 'insulin', 'losartan', 'azithromycin', 'amoxicillin',
    'salbutamol', 'prednisolone', 'furosemide', 'clopidogrel', 'nitroglycerin', 'sildenafil', 'spironolactone',
]


def _first_match(patterns: list[str], text: str) -> str | None:
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip(' :\t\n,;')
    return None


def parse_patient(text: str, ai_data: dict[str, Any] | None = None) -> PatientInfo:
    ai_patient = (ai_data or {}).get('patient') or {}
    return PatientInfo(
        name=ai_patient.get('name') or _first_match([r'Patient\s*Name\s*[:\-]\s*([^\n]+)', r'Patient\s*[:\-]\s*([^,\n]+)', r'Name\s*[:\-]\s*([^\n]+)'], text),
        age=str(ai_patient.get('age')) if ai_patient.get('age') else _first_match([r'Age\s*[:\-]?\s*([0-9]{1,3}\s*(?:years|yrs|y/o)?)'], text),
        gender=ai_patient.get('gender') or _first_match([r'Gender\s*[:\-]\s*([^\n,]+)', r'Sex\s*[:\-]\s*([^\n,]+)'], text),
        patient_id=ai_patient.get('patient_id') or _first_match([r'Patient\s*ID\s*[:\-]\s*([^\n,]+)', r'MRN\s*[:\-]\s*([^\n,]+)'], text),
        visit_date=ai_patient.get('visit_date') or _first_match([r'Date\s*[:\-]\s*([0-9/\-.]{6,12})', r'Visit\s*Date\s*[:\-]\s*([^\n,]+)'], text),
    )


def parse_medications(text: str, ai_data: dict[str, Any] | None = None) -> list[Medication]:
    meds: list[Medication] = []
    for item in (ai_data or {}).get('medications') or []:
        if isinstance(item, dict) and item.get('name'):
            meds.append(Medication(**{**item, 'confidence': float(item.get('confidence') or 0.8)}))

    lines = [line.strip(' •-*\t') for line in text.splitlines() if line.strip()]
    med_pattern = re.compile(r'([A-Z][A-Za-z\-]{2,}|[a-z][a-z\-]{2,})\s*(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|units|%)?)?', re.IGNORECASE)
    seen = {m.name.lower() for m in meds}
    for line in lines:
        low = line.lower()
        if any(word in low for word in COMMON_MED_WORDS) or re.search(r'\b\d+\s*(mg|mcg|g|ml|units)\b', low):
            if len(line) > 160:
                continue
            match = med_pattern.search(line)
            if not match:
                continue
            name = match.group(1).strip()
            if name.lower() in {'patient', 'diagnosis', 'tablet', 'capsule', 'dose', 'daily', 'twice', 'once'}:
                continue
            dose = match.group(2).strip() if match.group(2) else None
            frequency = _first_match([r'(once daily|twice daily|three times daily|daily|bid|tid|qid|od|bd|tds|qhs|nightly|morning|evening|every \d+ hours?)'], line)
            if name.lower() not in seen:
                meds.append(Medication(name=name, dose=dose, frequency=frequency, instructions=line, confidence=0.62))
                seen.add(name.lower())
    return meds[:20]


def parse_diagnoses(text: str, ai_data: dict[str, Any] | None = None) -> list[Diagnosis]:
    diagnoses: list[Diagnosis] = []
    for item in (ai_data or {}).get('diagnoses') or []:
        if isinstance(item, dict) and item.get('name'):
            diagnoses.append(Diagnosis(**{**item, 'confidence': float(item.get('confidence') or 0.8)}))
    seen = {d.name.lower() for d in diagnoses}
    for pattern in [r'Diagnosis\s*[:\-]\s*([^\n]+)', r'Impression\s*[:\-]\s*([^\n]+)', r'Assessment\s*[:\-]\s*([^\n]+)']:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            chunk = match.group(1)
            for part in re.split(r',|;| and ', chunk):
                name = part.strip(' .')
                if name and name.lower() not in seen:
                    diagnoses.append(Diagnosis(name=name, evidence=match.group(0), confidence=0.68))
                    seen.add(name.lower())
    return diagnoses[:12]


def parse_allergies(text: str, ai_data: dict[str, Any] | None = None) -> list[Allergy]:
    allergies: list[Allergy] = []
    for item in (ai_data or {}).get('allergies') or []:
        if isinstance(item, dict) and item.get('substance'):
            allergies.append(Allergy(**item))
    seen = {a.substance.lower() for a in allergies}
    match = re.search(r'Allerg(?:y|ies)\s*[:\-]\s*([^\n]+)', text, re.IGNORECASE)
    if match:
        for part in re.split(r',|;', match.group(1)):
            substance = part.strip(' .')
            if substance and substance.lower() not in {'none', 'nil', 'nka'} and substance.lower() not in seen:
                allergies.append(Allergy(substance=substance))
                seen.add(substance.lower())
    return allergies[:10]


def parse_labs(text: str, ai_data: dict[str, Any] | None = None) -> list[LabResult]:
    labs: list[LabResult] = []
    for item in (ai_data or {}).get('labs') or []:
        if isinstance(item, dict) and item.get('test'):
            try:
                labs.append(LabResult(**item))
            except Exception:
                pass
    seen = {l.test.lower() for l in labs}
    lab_patterns = {
        'HbA1c': r'HbA1c\s*[:\-]?\s*([0-9.]+)\s*%?',
        'Glucose': r'(?:Glucose|FBS|RBS)\s*[:\-]?\s*([0-9.]+)\s*(mg/dL|mmol/L)?',
        'Creatinine': r'Creatinine\s*[:\-]?\s*([0-9.]+)\s*(mg/dL|µmol/L|umol/L)?',
        'Hemoglobin': r'(?:Hemoglobin|Hb)\s*[:\-]?\s*([0-9.]+)\s*(g/dL)?',
        'WBC': r'WBC\s*[:\-]?\s*([0-9.]+)\s*(?:x10\^?9/L|10\^9/L|K/uL)?',
        'ALT': r'ALT\s*[:\-]?\s*([0-9.]+)\s*(U/L)?',
        'AST': r'AST\s*[:\-]?\s*([0-9.]+)\s*(U/L)?',
        'Cholesterol': r'Cholesterol\s*[:\-]?\s*([0-9.]+)\s*(mg/dL|mmol/L)?',
    }
    for test, pattern in lab_patterns.items():
        if test.lower() in seen:
            continue
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value = match.group(1)
            unit = match.group(2) if len(match.groups()) > 1 else None
            status = 'unknown'
            explanation = None
            try:
                val = float(value)
                if test == 'HbA1c' and val >= 6.5:
                    status = 'high'; explanation = 'This value can be above the common diabetes threshold.'
                elif test == 'Creatinine' and val > 1.3:
                    status = 'high'; explanation = 'This may suggest kidney function needs review, depending on age, sex, and lab range.'
                elif test == 'Hemoglobin' and val < 12:
                    status = 'low'; explanation = 'This may be low in many adults, but reference ranges vary.'
                elif test in {'ALT', 'AST'} and val > 45:
                    status = 'high'; explanation = 'This liver enzyme may be above many common reference ranges.'
            except Exception:
                pass
            labs.append(LabResult(test=test, value=value, unit=unit, status=status, explanation=explanation))
            seen.add(test.lower())
    return labs[:20]


def parse_vitals(text: str, ai_data: dict[str, Any] | None = None) -> list[VitalSign]:
    vitals: list[VitalSign] = []
    for item in (ai_data or {}).get('vitals') or []:
        if isinstance(item, dict) and item.get('name') and item.get('value'):
            try:
                vitals.append(VitalSign(**item))
            except Exception:
                pass
    seen = {v.name.lower() for v in vitals}
    bp = re.search(r'\bBP\s*[:\-]?\s*(\d{2,3}/\d{2,3})\s*mmHg?', text, re.IGNORECASE)
    if bp and 'blood pressure' not in seen:
        systolic = int(bp.group(1).split('/')[0])
        status = 'high' if systolic >= 140 else 'normal'
        vitals.append(VitalSign(name='Blood Pressure', value=bp.group(1) + ' mmHg', status=status))
    hr = re.search(r'\b(?:HR|Pulse)\s*[:\-]?\s*(\d{2,3})\s*(?:bpm)?', text, re.IGNORECASE)
    if hr and 'heart rate' not in seen:
        val = int(hr.group(1)); status = 'high' if val > 100 else 'low' if val < 60 else 'normal'
        vitals.append(VitalSign(name='Heart Rate', value=str(val) + ' bpm', status=status))
    temp = re.search(r'\bTemp(?:erature)?\s*[:\-]?\s*(\d{2,3}(?:\.\d+)?)\s*(°?F|°?C)?', text, re.IGNORECASE)
    if temp and 'temperature' not in seen:
        vitals.append(VitalSign(name='Temperature', value=temp.group(1) + (temp.group(2) or ''), status='unknown'))
    return vitals[:10]


def build_alerts(text: str, labs: list[LabResult], vitals: list[VitalSign], ai_data: dict[str, Any] | None = None) -> list[Alert]:
    alerts: list[Alert] = []
    for item in (ai_data or {}).get('alerts') or []:
        if isinstance(item, dict) and item.get('title'):
            try:
                alerts.append(Alert(**item))
            except Exception:
                pass
    for lab in labs:
        if lab.status in {'high', 'low'}:
            alerts.append(Alert(
                severity='moderate',
                title=f'{lab.test} marked as {lab.status}',
                description=f'{lab.test} value appears {lab.status}: {lab.value or ""} {lab.unit or ""}'.strip(),
                recommendation='Compare with the lab reference range and discuss with a clinician if unexpected.',
            ))
    for vital in vitals:
        if vital.status == 'high':
            alerts.append(Alert(
                severity='moderate',
                title=f'{vital.name} appears high',
                description=f'{vital.name}: {vital.value}',
                recommendation='Recheck and discuss with a healthcare professional, especially if symptoms are present.',
            ))
    danger_phrases = ['chest pain', 'shortness of breath', 'unconscious', 'stroke', 'severe bleeding', 'anaphylaxis']
    low = text.lower()
    if any(phrase in low for phrase in danger_phrases):
        alerts.append(Alert(
            severity='critical',
            title='Emergency symptom phrase found',
            description='The document contains wording that may indicate an urgent symptom.',
            recommendation='If this reflects a current condition, seek urgent medical help immediately.',
        ))
    return alerts[:12]


def create_summary(ai_data: dict[str, Any] | None, diagnoses: list[Diagnosis], meds: list[Medication], labs: list[LabResult]) -> str:
    ai_summary = (ai_data or {}).get('simple_summary')
    if ai_summary:
        return str(ai_summary)
    bits = []
    if diagnoses:
        bits.append('The document mentions ' + ', '.join(d.name for d in diagnoses[:3]) + '.')
    if meds:
        bits.append('It lists ' + str(len(meds)) + ' medication(s), including ' + ', '.join(m.name for m in meds[:4]) + '.')
    if labs:
        abnormal = [l.test for l in labs if l.status in {'high', 'low'}]
        if abnormal:
            bits.append('Some lab or vital values may need review: ' + ', '.join(abnormal[:4]) + '.')
        else:
            bits.append('Lab values were extracted for easier review.')
    if not bits:
        bits.append('The document was processed, but only limited structured medical information could be extracted.')
    return ' '.join(bits)


def create_insights(ai_data: dict[str, Any] | None, diagnoses: list[Diagnosis], meds: list[Medication], labs: list[LabResult]) -> list[str]:
    ai = (ai_data or {}).get('health_insights')
    if isinstance(ai, list) and ai:
        return [str(x) for x in ai[:8]]
    insights = [
        'Use the extracted record as a checklist, not as a final medical decision.',
        'Confirm all medication names, doses, and frequencies with the original prescription.',
    ]
    if any(l.status in {'high', 'low'} for l in labs):
        insights.append('Highlighted lab results should be compared with the official lab reference range.')
    if len(meds) >= 4:
        insights.append('Multiple medicines were detected, so pharmacist review for interactions may be helpful.')
    if diagnoses:
        insights.append('Bring the diagnosis list to follow-up visits so the clinician can verify what is active or historical.')
    return insights[:8]


def create_questions(ai_data: dict[str, Any] | None, interactions_count: int, labs: list[LabResult]) -> list[str]:
    ai = (ai_data or {}).get('recommended_questions')
    if isinstance(ai, list) and ai:
        return [str(x) for x in ai[:8]]
    questions = [
        'Are all medication names, doses, and timings correct?',
        'Should any medicine be taken with food or avoided with other medicines?',
        'When should the next follow-up or repeat test happen?',
    ]
    if interactions_count:
        questions.append('Do any of these medicines interact with each other or with my allergies?')
    if any(l.status in {'high', 'low'} for l in labs):
        questions.append('Which abnormal lab values need action now and which can wait for follow-up?')
    return questions
