from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from config import get_settings
from models import (
    ClusteringRequest,
    ClusteringResponse,
    HotspotRequest,
    HotspotResponse,
    RiskZoneRequest,
    RiskZoneResponse,
    PredictionRequest,
)
from analysis import (
    perform_clustering,
    identify_hotspots,
    generate_risk_zones,
    predict_time_series,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("ML Service starting up...")
    yield
    logger.info("ML Service shutting down...")


app = FastAPI(
    title="Geo Incidents ML Service",
    description="Machine Learning service for incident pattern analysis and prediction",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "ml-service"}


@app.post("/api/analyze/clustering", response_model=ClusteringResponse)
async def analyze_clustering(request: ClusteringRequest):
    """
    Perform DBSCAN clustering on incident data.
    
    Identifies groups of nearby incidents that may represent
    persistent problem areas.
    """
    try:
        clusters, noise_count = perform_clustering(
            request.incidents,
            eps=request.eps,
            min_samples=request.min_samples
        )
        
        total_clustered = sum(c.point_count for c in clusters)
        
        return ClusteringResponse(
            clusters=clusters,
            noise_points=noise_count,
            total_clustered=total_clustered
        )
    except Exception as e:
        logger.error(f"Clustering error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze/hotspots", response_model=HotspotResponse)
async def analyze_hotspots(request: HotspotRequest):
    """
    Identify incident hotspots.
    
    Uses density analysis and severity weighting to identify
    areas with high incident concentration.
    """
    try:
        hotspots = identify_hotspots(
            request.incidents,
            threshold=request.threshold
        )
        
        return HotspotResponse(
            hotspots=hotspots,
            total_incidents_analyzed=len(request.incidents)
        )
    except Exception as e:
        logger.error(f"Hotspot analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/risk-zones", response_model=RiskZoneResponse)
async def predict_risk_zones(request: RiskZoneRequest):
    """
    Generate risk zone predictions.
    
    Analyzes historical incident data to identify areas
    with elevated risk levels.
    """
    try:
        risk_zones = generate_risk_zones(
            request.incidents,
            grid_size=request.grid_size
        )
        
        return RiskZoneResponse(
            risk_zones=risk_zones,
            analysis_period_days=request.time_window_days
        )
    except Exception as e:
        logger.error(f"Risk zone prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/time-series")
async def predict_time_series_endpoint(request: PredictionRequest):
    """
    Generate time series predictions for incident occurrence.
    
    Predicts the expected number of incidents for the next N days
    based on historical patterns.
    """
    try:
        predictions = predict_time_series(
            request.historical_incidents,
            days_to_predict=request.days_to_predict
        )
        
        return predictions
    except Exception as e:
        logger.error(f"Time series prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/info")
async def get_service_info():
    """Get information about the ML service capabilities."""
    return {
        "name": "Geo Incidents ML Service",
        "version": "1.0.0",
        "capabilities": [
            "DBSCAN clustering for incident grouping",
            "Hotspot identification with severity weighting",
            "Risk zone generation using grid analysis",
            "Time series prediction for incident forecasting"
        ],
        "algorithms": {
            "clustering": "DBSCAN (Density-Based Spatial Clustering)",
            "hotspots": "Density + Severity weighted analysis",
            "risk_zones": "Grid-based density analysis",
            "time_series": "Moving average with confidence intervals"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.ml_service_port)
