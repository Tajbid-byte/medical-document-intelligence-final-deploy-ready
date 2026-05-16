import json
import re
from typing import Any

import httpx

from app.config import settings


SYSTEM_PROMPT = """
You are a careful medical document extraction assistant. Extract only what is present in the document.
Do not diagnose. Do not invent facts. Return JSON only.
Use plain language and include safety caveats. If a field is missing, return empty arrays or nulls.
JSON schema keys:
patient {name, age, gender, patient_id, visit_date}
diagnoses [{name, evidence, confidence}]
medications [{name, dose, frequency, route, duration, purpose, instructions, confidence}]
allergies [{substance, reaction}]
labs [{test, value, unit, reference_range, status, explanation}]
vitals [{name, value, status}]
alerts [{severity, title, description, recommendation}]
simple_summary string
health_insights [string]
recommended_questions [string]
"""


def _extract_json(text: str) -> dict[str, Any]:
    try:
        return json.loads(text)
    except Exception:
        pass

    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            return {}
    return {}


async def analyze_with_groq(document_text: str, document_type: str) -> dict[str, Any]:
    if not settings.groq_api_key:
        return {}

    payload = {
        'model': settings.groq_model,
        'messages': [
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {
                'role': 'user',
                'content': f'Document type: {document_type}\n\nDocument text:\n{document_text[:12000]}',
            },
        ],
        'temperature': 0.1,
        'response_format': {'type': 'json_object'},
    }

    headers = {
        'Authorization': f'Bearer {settings.groq_api_key}',
        'Content-Type': 'application/json',
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post('https://api.groq.com/openai/v1/chat/completions', json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        content = data['choices'][0]['message']['content']
        return _extract_json(content)
