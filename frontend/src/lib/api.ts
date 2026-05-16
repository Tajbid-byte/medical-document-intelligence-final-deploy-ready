import type { AnalysisResponse, Interaction, Medication, Reminder } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function analyzeText(content: string, documentType: string): Promise<AnalysisResponse> {
  const response = await fetch(`${API_URL}/api/v1/documents/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, document_type: documentType }),
  });
  return parseResponse<AnalysisResponse>(response);
}

export async function uploadDocument(file: File, documentType: string, patientNotes: string): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append('file', file);
  form.append('document_type', documentType);
  form.append('patient_notes', patientNotes);
  const response = await fetch(`${API_URL}/api/v1/documents/upload`, {
    method: 'POST',
    body: form,
  });
  return parseResponse<AnalysisResponse>(response);
}

export async function checkInteractions(medications: string[]): Promise<Interaction[]> {
  const response = await fetch(`${API_URL}/api/v1/interactions/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medications }),
  });
  return parseResponse<Interaction[]>(response);
}

export async function planReminders(medications: Medication[]): Promise<Reminder[]> {
  const response = await fetch(`${API_URL}/api/v1/reminders/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medications }),
  });
  return parseResponse<Reminder[]>(response);
}

export { API_URL };
