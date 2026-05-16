from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import analysis, interactions, reminders, records

app = FastAPI(
    title=settings.app_name,
    description='AI-powered medical document extraction, medication safety support, and simple-language health insights.',
    version='1.0.0',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/')
async def root():
    return {
        'message': 'Medical Document Intelligence API is running',
        'docs': '/docs',
        'health': '/health',
    }


@app.get('/health')
async def health():
    return {'status': 'healthy', 'service': settings.app_name, 'environment': settings.environment}


app.include_router(analysis.router, prefix=settings.api_prefix)
app.include_router(interactions.router, prefix=settings.api_prefix)
app.include_router(reminders.router, prefix=settings.api_prefix)
app.include_router(records.router, prefix=settings.api_prefix)
