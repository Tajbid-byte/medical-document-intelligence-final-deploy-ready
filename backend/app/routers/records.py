from fastapi import APIRouter

from app.models.schemas import RecordRequest

router = APIRouter(prefix='/records', tags=['Structured health records'])


@router.post('/export')
async def export_record(payload: RecordRequest):
    analysis = payload.analysis
    return {
        'patient': analysis.patient.model_dump(),
        'conditions': [d.model_dump() for d in analysis.diagnoses],
        'medications': [m.model_dump() for m in analysis.medications],
        'allergies': [a.model_dump() for a in analysis.allergies],
        'labs': [l.model_dump() for l in analysis.labs],
        'vitals': [v.model_dump() for v in analysis.vitals],
        'alerts': [a.model_dump() for a in analysis.alerts],
        'summary': analysis.simple_summary,
    }
