from __future__ import annotations

import re
from app.models.schemas import Interaction, Alert, Medication

INTERACTION_RULES = [
    {
        'terms': ['warfarin', 'aspirin'],
        'severity': 'high',
        'explanation': 'Warfarin and aspirin may increase bleeding risk when used together.',
        'recommendation': 'Ask a doctor or pharmacist to confirm whether both medicines are intended and whether monitoring is needed.',
    },
    {
        'terms': ['warfarin', 'ibuprofen'],
        'severity': 'high',
        'explanation': 'Warfarin and ibuprofen can increase bleeding risk and stomach irritation risk.',
        'recommendation': 'Avoid changing pain medicine without pharmacist or clinician guidance.',
    },
    {
        'terms': ['aspirin', 'ibuprofen'],
        'severity': 'moderate',
        'explanation': 'Aspirin and ibuprofen together may increase stomach bleeding risk and can interfere with aspirin timing.',
        'recommendation': 'Check with a pharmacist about safe timing and whether both are needed.',
    },
    {
        'terms': ['metformin', 'contrast'],
        'severity': 'moderate',
        'explanation': 'Metformin may need special handling around iodinated contrast procedures in some patients.',
        'recommendation': 'Confirm kidney function and procedure instructions with the clinical team.',
    },
    {
        'terms': ['lisinopril', 'potassium'],
        'severity': 'moderate',
        'explanation': 'ACE inhibitors such as lisinopril plus potassium supplements may increase potassium levels.',
        'recommendation': 'Ask whether potassium monitoring is needed.',
    },
    {
        'terms': ['lisinopril', 'spironolactone'],
        'severity': 'high',
        'explanation': 'Lisinopril and spironolactone may raise potassium levels, especially with kidney problems.',
        'recommendation': 'Clinician review and potassium monitoring may be needed.',
    },
    {
        'terms': ['simvastatin', 'clarithromycin'],
        'severity': 'high',
        'explanation': 'Clarithromycin can increase simvastatin levels and muscle injury risk.',
        'recommendation': 'Ask a clinician or pharmacist whether a temporary statin hold or alternative antibiotic is needed.',
    },
    {
        'terms': ['atorvastatin', 'clarithromycin'],
        'severity': 'moderate',
        'explanation': 'Clarithromycin can increase atorvastatin exposure and muscle side-effect risk.',
        'recommendation': 'Ask a pharmacist about dose adjustment or alternatives.',
    },
    {
        'terms': ['tramadol', 'sertraline'],
        'severity': 'moderate',
        'explanation': 'Tramadol with some antidepressants may increase serotonin-related side effects or seizure risk.',
        'recommendation': 'Seek professional guidance if agitation, fever, confusion, tremor, or severe symptoms occur.',
    },
    {
        'terms': ['sildenafil', 'nitroglycerin'],
        'severity': 'critical',
        'explanation': 'Sildenafil and nitrates such as nitroglycerin can cause a dangerous blood pressure drop.',
        'recommendation': 'This combination requires urgent professional review. Do not combine unless specifically directed by a clinician.',
    },
]


def normalize_med_name(name: str) -> str:
    return re.sub(r'[^a-z0-9 ]+', ' ', name.lower()).strip()


def detect_interactions(medications: list[str | Medication], extra_text: str = '') -> list[Interaction]:
    med_names: list[str] = []
    for med in medications:
        if isinstance(med, Medication):
            med_names.append(med.name)
        else:
            med_names.append(str(med))
    searchable = ' '.join(normalize_med_name(m) for m in med_names) + ' ' + normalize_med_name(extra_text)

    interactions: list[Interaction] = []
    for rule in INTERACTION_RULES:
        if all(term in searchable for term in rule['terms']):
            interactions.append(
                Interaction(
                    severity=rule['severity'],
                    medications=rule['terms'],
                    explanation=rule['explanation'],
                    recommendation=rule['recommendation'],
                )
            )
    return interactions


def medication_safety_alerts(meds: list[Medication], allergies: list[str]) -> list[Alert]:
    alerts: list[Alert] = []
    med_blob = ' '.join(m.name.lower() for m in meds)
    allergy_blob = ' '.join(a.lower() for a in allergies)
    if 'penicillin' in allergy_blob and any(x in med_blob for x in ['amoxicillin', 'ampicillin', 'penicillin']):
        alerts.append(
            Alert(
                severity='high',
                title='Possible allergy conflict',
                description='The document mentions penicillin allergy and a penicillin-family medicine may be present.',
                recommendation='Confirm allergy history and medication safety with a clinician or pharmacist before use.',
            )
        )
    return alerts
