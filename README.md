# Medical Document Intelligence System

A professional full-stack AI healthcare assistant that extracts information from medical reports and prescriptions, builds structured patient health records, detects possible medication interactions, creates reminder schedules, and explains health insights in simple language.

> **Important:** This project is for educational, research, and decision-support use only. It does **not** provide medical diagnosis, emergency triage, or treatment instructions. Users should always consult a licensed clinician or pharmacist before acting on medication or health advice.

## What the system does

- Upload PDF, image, or text medical documents
- OCR support for prescription images using Tesseract when available
- Extract patient details, diagnoses, medications, lab results, vitals, allergies, and follow-up notes
- Generate simple-language health summaries
- Detect potential drug interactions using a local safety ruleset and optional Groq AI reasoning
- Build a knowledge graph connecting patient, medications, diagnoses, labs, and alerts
- Create medication reminder plans
- Provide a professional responsive UI for desktop and mobile

## Tech stack

### Frontend

- Next.js 16
- TypeScript
- Tailwind CSS
- Responsive SVG knowledge graph
- Deploy target: Vercel

### Backend

- FastAPI
- Python 3.11.11
- Groq API using OpenAI-compatible chat completions
- PDF text extraction with `pdfplumber`
- Image OCR with `pytesseract` + Render `Aptfile`
- Local medical parsing and drug-interaction rules
- Deploy target: Render

## Project structure

```txt
medical-document-intelligence/
├── frontend/                          # Next.js - Deploy on Vercel
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── analyze/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── interactions/page.tsx
│   │   │   ├── reminders/page.tsx
│   │   │   └── records/page.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── package.json
│   └── .env.example
│
└── backend/                           # FastAPI - Deploy on Render
    ├── app/
    │   ├── main.py
    │   ├── config.py
    │   ├── models/
    │   ├── routers/
    │   ├── services/
    │   └── utils/
    ├── requirements.txt
    ├── render.yaml
    ├── Aptfile
    ├── .python-version
    ├── runtime.txt
    └── .env.example
```

---

# Local development

## 1. Backend local setup

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
```

Run backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Test:

```txt
http://localhost:8000/health
http://localhost:8000/docs
```

## 2. Frontend local setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run frontend:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# Deploy backend on Render

## Step 1: Push project to GitHub

From the root folder:

```bash
git init
git add .
git commit -m "Initial Medical Document Intelligence System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/medical-document-intelligence.git
git push -u origin main
```

## Step 2: Create a Web Service on Render

Go to Render Dashboard:

```txt
New → Web Service → Build and deploy from GitHub
```

Select your GitHub repository.

Use these exact settings:

| Setting | Value |
|---|---|
| Runtime | Python 3 |
| Root Directory | `backend` |
| Build Command | `pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Plan | Free |

## Step 3: Add Render environment variables

In Render service settings, open **Environment** and add:

```env
PYTHON_VERSION=3.11.11
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
ENVIRONMENT=production
FRONTEND_URL=*
```

Later, after Vercel deployment, replace `FRONTEND_URL=*` with your real Vercel URL:

```env
FRONTEND_URL=https://your-vercel-project.vercel.app
```

## Step 4: Deploy

The included frontend has already been tested with `npm install` and `npm run build`. Some npm deprecation or audit warnings may appear, but they are not deployment-stopping errors.

Click:

```txt
Create Web Service
```

If you ever see dependency build errors, use:

```txt
Manual Deploy → Clear build cache & deploy
```

## Step 5: Test backend

Open:

```txt
https://your-render-service.onrender.com/health
```

Expected:

```json
{
  "status": "healthy"
}
```

Open API docs:

```txt
https://your-render-service.onrender.com/docs
```

---

# Deploy frontend on Vercel

## Step 1: Import GitHub repo

Go to Vercel Dashboard:

```txt
Add New → Project → Import GitHub Repository
```

Select the same repository.

## Step 2: Configure project

Use these exact settings:

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `frontend` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Node.js Version | `20.x` or newer |

## Step 3: Add Vercel environment variable

```env
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com
```

Do not add `/` at the end.

Correct:

```env
NEXT_PUBLIC_API_URL=https://medical-doc-intelligence-api.onrender.com
```

Wrong:

```env
NEXT_PUBLIC_API_URL=https://medical-doc-intelligence-api.onrender.com/
```

## Step 4: Deploy

The included frontend has already been tested with `npm install` and `npm run build`. Some npm deprecation or audit warnings may appear, but they are not deployment-stopping errors.

Click:

```txt
Deploy
```

## Step 5: Connect Vercel URL back to Render

After Vercel gives you a URL, go back to Render:

```txt
Backend Service → Environment → FRONTEND_URL
```

Set:

```env
FRONTEND_URL=https://your-vercel-project.vercel.app
```

Then redeploy backend:

```txt
Manual Deploy → Deploy latest commit
```

---

# How to test after deployment

## Backend health

```txt
https://your-render-service.onrender.com/health
```

## API docs

```txt
https://your-render-service.onrender.com/docs
```

## Frontend test

Open your Vercel URL, go to **Analyze**, and paste this sample:

```txt
Patient: Amina Rahman, Age: 54. Diagnosis: Type 2 diabetes and hypertension. Medications: Metformin 500 mg twice daily, Lisinopril 10 mg once daily, Aspirin 75 mg daily. Lab results: HbA1c 8.2%, BP 150/95 mmHg, Creatinine 1.1 mg/dL. Allergy: Penicillin. Follow up after 2 weeks.
```

Click **Analyze Medical Document**.

Expected output:

- Patient health record
- Medication list
- Lab results
- Potential alerts
- Medication reminder plan
- Knowledge graph visualization
- Simple-language health insight

---

# Environment variable summary

## Render backend

```env
PYTHON_VERSION=3.11.11
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
ENVIRONMENT=production
FRONTEND_URL=https://your-vercel-project.vercel.app
```

## Vercel frontend

```env
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com
```

---

# Notes about OCR

PDFs with selectable text work immediately. Image OCR uses Tesseract. The backend includes:

```txt
backend/Aptfile
```

with:

```txt
tesseract-ocr
tesseract-ocr-eng
```

If OCR output is weak, the UI also supports manual text paste. For serious clinical-grade OCR, connect a dedicated OCR provider later, such as Google Document AI, Azure AI Document Intelligence, AWS Textract, or OCR.space.

---

# Safety and compliance notes

This app is not a regulated medical device. Do not present it as a replacement for physicians, pharmacists, nurses, or licensed medical systems. For production healthcare use, you would need stronger privacy controls, audit logs, encryption at rest, HIPAA/GDPR compliance review, clinical validation, and human-in-the-loop safety checks.
