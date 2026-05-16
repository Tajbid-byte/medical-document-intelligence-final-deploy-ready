from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    app_name: str = 'Medical Document Intelligence API'
    api_prefix: str = '/api/v1'
    environment: str = 'development'
    frontend_url: str = 'http://localhost:3000'
    groq_api_key: str = ''
    groq_model: str = 'llama-3.1-8b-instant'
    max_upload_mb: int = 12

    @property
    def allowed_origins(self) -> list[str]:
        if self.frontend_url.strip() == '*':
            return ['*']
        origins = [self.frontend_url.strip(), 'http://localhost:3000', 'http://127.0.0.1:3000']
        return [origin for origin in origins if origin]


settings = Settings()
