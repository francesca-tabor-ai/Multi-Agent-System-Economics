from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "MAS Economics API"
    database_url: str = "postgresql://postgres:postgres@localhost:5432/mas_economics"
    redis_url: str = "redis://localhost:6379"
    api_key: str = "dev-api-key"
    debug: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
