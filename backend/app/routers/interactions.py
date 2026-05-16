from fastapi import APIRouter

from app.models.schemas import InteractionRequest, Interaction
from app.services.drug_interaction import detect_interactions

router = APIRouter(prefix='/interactions', tags=['Medication interaction screening'])


@router.post('/check', response_model=list[Interaction])
async def check_interactions(payload: InteractionRequest):
    return detect_interactions(payload.medications)
