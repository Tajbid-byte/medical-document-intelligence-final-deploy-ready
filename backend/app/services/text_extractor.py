from __future__ import annotations

import io
from dataclasses import dataclass

import pdfplumber
from PIL import Image


@dataclass
class ExtractionResult:
    text: str
    notes: list[str]


def _decode_text(data: bytes) -> str:
    for encoding in ('utf-8', 'utf-16', 'latin-1'):
        try:
            return data.decode(encoding)
        except Exception:
            continue
    return data.decode('utf-8', errors='ignore')


def extract_text_from_file(filename: str, content_type: str | None, data: bytes) -> ExtractionResult:
    notes: list[str] = []
    name = filename.lower()
    content_type = (content_type or '').lower()

    if len(data) == 0:
        return ExtractionResult('', ['Uploaded file was empty.'])

    if name.endswith('.txt') or 'text/plain' in content_type:
        return ExtractionResult(_decode_text(data), ['Text file decoded successfully.'])

    if name.endswith('.pdf') or 'application/pdf' in content_type:
        text_parts: list[str] = []
        try:
            with pdfplumber.open(io.BytesIO(data)) as pdf:
                for index, page in enumerate(pdf.pages, start=1):
                    text = page.extract_text() or ''
                    if text.strip():
                        text_parts.append(f'--- Page {index} ---\n{text}')
            if text_parts:
                notes.append('PDF text extracted successfully.')
                return ExtractionResult('\n\n'.join(text_parts), notes)
            notes.append('No selectable PDF text found. If this is a scanned PDF, upload page images or paste text manually.')
            return ExtractionResult('', notes)
        except Exception as exc:
            return ExtractionResult('', [f'PDF extraction failed: {exc}'])

    if any(name.endswith(ext) for ext in ('.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff')) or content_type.startswith('image/'):
        try:
            import pytesseract

            image = Image.open(io.BytesIO(data))
            text = pytesseract.image_to_string(image)
            if text.strip():
                notes.append('Image OCR completed using Tesseract.')
                return ExtractionResult(text, notes)
            return ExtractionResult('', ['OCR completed, but no readable text was found. Try a clearer image or paste text manually.'])
        except Exception as exc:
            return ExtractionResult('', [f'Image OCR unavailable or failed: {exc}. Paste the document text manually if needed.'])

    return ExtractionResult(_decode_text(data), ['Unsupported file type; attempted plain-text decoding.'])
