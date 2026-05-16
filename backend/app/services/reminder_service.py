from __future__ import annotations

import re
from app.models.schemas import Medication, Reminder


def times_for_frequency(freq: str | None) -> list[str]:
    if not freq:
        return ['09:00']
    f = freq.lower()
    if any(x in f for x in ['twice', 'bid', 'bd', '2 times']):
        return ['09:00', '21:00']
    if any(x in f for x in ['three', 'tid', 'tds', '3 times']):
        return ['08:00', '14:00', '22:00']
    if any(x in f for x in ['four', 'qid', '4 times']):
        return ['06:00', '12:00', '18:00', '23:00']
    if any(x in f for x in ['night', 'qhs', 'bed']):
        return ['22:00']
    if 'evening' in f:
        return ['19:00']
    if 'morning' in f:
        return ['08:00']
    if 'weekly' in f:
        return ['Monday 09:00']
    if re.search(r'every\s*8\s*hours?', f):
        return ['06:00', '14:00', '22:00']
    if re.search(r'every\s*12\s*hours?', f):
        return ['09:00', '21:00']
    return ['09:00']


def create_reminders(medications: list[Medication]) -> list[Reminder]:
    reminders: list[Reminder] = []
    for med in medications:
        reminders.append(
            Reminder(
                medication=med.name,
                dose=med.dose,
                frequency=med.frequency,
                suggested_times=times_for_frequency(med.frequency),
                notes=med.instructions or 'Confirm timing with the prescription or pharmacist.',
            )
        )
    return reminders
