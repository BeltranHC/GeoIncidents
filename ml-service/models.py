from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum


class SeverityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Coordinate(BaseModel):
    latitude: float
    longitude: float


class IncidentPoint(BaseModel):
    id: str
    latitude: float
    longitude: float
    severity: SeverityLevel
    category_id: Optional[str] = None
    created_at: datetime


class ClusterResult(BaseModel):
    cluster_id: int
    center: Coordinate
    point_count: int
    incidents: List[str]  # incident IDs
    radius: float  # in kilometers
    avg_severity: float


class HotspotResult(BaseModel):
    id: str
    center: Coordinate
    intensity: float  # 0-1 scale
    incident_count: int
    radius: float
    categories: List[str]


class RiskZone(BaseModel):
    id: str
    polygon: List[Coordinate]
    risk_level: RiskLevel
    incident_count: int
    prediction_confidence: float
    category_breakdown: dict


class TimeSeriesPrediction(BaseModel):
    date: datetime
    predicted_count: float
    confidence_interval_lower: float
    confidence_interval_upper: float
    risk_areas: List[Coordinate]


class ClusteringRequest(BaseModel):
    incidents: List[IncidentPoint]
    eps: Optional[float] = None  # DBSCAN epsilon
    min_samples: Optional[int] = None


class ClusteringResponse(BaseModel):
    clusters: List[ClusterResult]
    noise_points: int
    total_clustered: int


class HotspotRequest(BaseModel):
    incidents: List[IncidentPoint]
    threshold: float = 0.5  # Minimum intensity threshold


class HotspotResponse(BaseModel):
    hotspots: List[HotspotResult]
    total_incidents_analyzed: int


class RiskZoneRequest(BaseModel):
    incidents: List[IncidentPoint]
    grid_size: float = 0.005  # Grid cell size in degrees
    time_window_days: int = 30


class RiskZoneResponse(BaseModel):
    risk_zones: List[RiskZone]
    analysis_period_days: int


class PredictionRequest(BaseModel):
    historical_incidents: List[IncidentPoint]
    days_to_predict: int = 7
