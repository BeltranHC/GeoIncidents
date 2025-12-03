from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/geo_incidents"
    backend_url: str = "http://localhost:3000"
    ml_service_port: int = 8000
    clustering_eps: float = 0.01  # ~1km for lat/lng
    clustering_min_samples: int = 3
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
