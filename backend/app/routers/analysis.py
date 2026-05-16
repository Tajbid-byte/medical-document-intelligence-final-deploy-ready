from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.config import settings
from app.models.schemas import AnalyzeRequest, AnalysisResponse
from app.services.analysis_service import analyze_document_text
from app.services.text_extractor import extract_text_from_file

router = APIRouter(prefix='/documents', tags=['Medical document analysis'])


@router.post('/analyze', response_model=AnalysisResponse)
async def analyze_text_document(payload: AnalyzeRequest):
    return await analyze_document_text(payload.content, payload.document_type, ['Text input analyzed.'])


@router.post('/upload', response_model=AnalysisResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form('medical_report'),
    patient_notes: str = Form(''),
):
    data = await file.read()
    if len(data) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f'File too large. Max upload size is {settings.max_upload_mb} MB.')

    result = extract_text_from_file(file.filename or 'upload', file.content_type, data)
    text = result.text
    if patient_notes.strip():
        text = f'{text}\n\nAdditional patient notes:\n{patient_notes.strip()}' if text else patient_notes.strip()
    if not text.strip():
        raise HTTPException(status_code=422, detail={'message': 'No readable text could be extracted.', 'notes': result.notes})
    return await analyze_document_text(text, document_type, result.notes)


@router.get('/sample')
async def sample_document():
    return {
        'content': 'Patient: Amina Rahman, Age: 54. Diagnosis: Type 2 diabetes and hypertension. Medications: Metformin 500 mg twice daily, Lisinopril 10 mg once daily, Aspirin 75 mg daily. Lab results: HbA1c 8.2%, BP 150/95 mmHg, Creatinine 1.1 mg/dL. Allergy: Penicillin. Follow up after 2 weeks.',
        'document_type': 'medical_report',
    }
