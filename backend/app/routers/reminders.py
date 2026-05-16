from fastapi import APIRouter

from app.models.schemas import ReminderRequest, Reminder
from app.services.reminder_service import create_reminders

router = APIRouter(prefix='/reminders', tags=['Medication reminders'])


@router.post('/plan', response_model=list[Reminder])
async def create_reminder_plan(payload: ReminderRequest):
    return create_reminders(payload.medications)
