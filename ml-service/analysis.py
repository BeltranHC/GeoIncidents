import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from typing import List, Tuple
from collections import defaultdict
import uuid

from models import (
    IncidentPoint,
    ClusterResult,
    HotspotResult,
    RiskZone,
    Coordinate,
    RiskLevel,
)
from config import get_settings

settings = get_settings()


def haversine_distance(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """Calculate the great circle distance between two points in kilometers."""
    lat1, lon1 = np.radians(coord1)
    lat2, lon2 = np.radians(coord2)
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    c = 2 * np.arcsin(np.sqrt(a))
    
    r = 6371  # Earth's radius in kilometers
    return c * r


def severity_to_numeric(severity: str) -> float:
    """Convert severity to numeric value."""
    mapping = {"low": 1, "medium": 2, "high": 3, "critical": 4}
    return mapping.get(severity, 1)


def perform_clustering(
    incidents: List[IncidentPoint],
    eps: float = None,
    min_samples: int = None
) -> Tuple[List[ClusterResult], int]:
    """
    Perform DBSCAN clustering on incident locations.
    
    Args:
        incidents: List of incident points
        eps: Maximum distance between two samples (in coordinate units)
        min_samples: Minimum number of samples in a neighborhood
    
    Returns:
        Tuple of (cluster results, noise point count)
    """
    if len(incidents) < 2:
        return [], len(incidents)
    
    eps = eps or settings.clustering_eps
    min_samples = min_samples or settings.clustering_min_samples
    
    # Extract coordinates
    coordinates = np.array([
        [inc.latitude, inc.longitude] for inc in incidents
    ])
    
    # Scale coordinates for better clustering
    # Note: For more accurate geographic clustering, use haversine distance
    scaler = StandardScaler()
    coordinates_scaled = scaler.fit_transform(coordinates)
    
    # Perform DBSCAN
    db = DBSCAN(eps=eps, min_samples=min_samples)
    labels = db.fit_predict(coordinates_scaled)
    
    # Process results
    cluster_dict = defaultdict(list)
    for idx, label in enumerate(labels):
        if label != -1:  # Not noise
            cluster_dict[label].append(incidents[idx])
    
    clusters = []
    for cluster_id, cluster_incidents in cluster_dict.items():
        # Calculate cluster center
        lats = [inc.latitude for inc in cluster_incidents]
        lngs = [inc.longitude for inc in cluster_incidents]
        center_lat = np.mean(lats)
        center_lng = np.mean(lngs)
        
        # Calculate radius (max distance from center)
        max_dist = 0
        for inc in cluster_incidents:
            dist = haversine_distance(
                (center_lat, center_lng),
                (inc.latitude, inc.longitude)
            )
            max_dist = max(max_dist, dist)
        
        # Calculate average severity
        avg_severity = np.mean([
            severity_to_numeric(inc.severity) for inc in cluster_incidents
        ])
        
        clusters.append(ClusterResult(
            cluster_id=cluster_id,
            center=Coordinate(latitude=center_lat, longitude=center_lng),
            point_count=len(cluster_incidents),
            incidents=[inc.id for inc in cluster_incidents],
            radius=max_dist,
            avg_severity=avg_severity
        ))
    
    noise_count = sum(1 for label in labels if label == -1)
    
    return clusters, noise_count


def identify_hotspots(
    incidents: List[IncidentPoint],
    threshold: float = 0.5
) -> List[HotspotResult]:
    """
    Identify incident hotspots using density-based analysis.
    
    Args:
        incidents: List of incident points
        threshold: Minimum intensity threshold (0-1)
    
    Returns:
        List of identified hotspots
    """
    if len(incidents) < 3:
        return []
    
    # First, perform clustering
    clusters, _ = perform_clustering(incidents, min_samples=2)
    
    if not clusters:
        return []
    
    # Calculate intensity for each cluster
    max_count = max(c.point_count for c in clusters)
    max_severity = max(c.avg_severity for c in clusters)
    
    hotspots = []
    for cluster in clusters:
        # Intensity based on count and severity
        count_score = cluster.point_count / max_count if max_count > 0 else 0
        severity_score = cluster.avg_severity / max_severity if max_severity > 0 else 0
        intensity = (count_score * 0.6 + severity_score * 0.4)
        
        if intensity >= threshold:
            # Get categories for this cluster
            cluster_incidents = [
                inc for inc in incidents if inc.id in cluster.incidents
            ]
            categories = list(set(
                inc.category_id for inc in cluster_incidents 
                if inc.category_id
            ))
            
            hotspots.append(HotspotResult(
                id=str(uuid.uuid4()),
                center=cluster.center,
                intensity=round(intensity, 3),
                incident_count=cluster.point_count,
                radius=max(cluster.radius, 0.1),  # Minimum 100m radius
                categories=categories
            ))
    
    return sorted(hotspots, key=lambda x: x.intensity, reverse=True)


def generate_risk_zones(
    incidents: List[IncidentPoint],
    grid_size: float = 0.005
) -> List[RiskZone]:
    """
    Generate risk zones based on incident density grid analysis.
    
    Args:
        incidents: List of incident points
        grid_size: Size of grid cells in degrees (~500m at equator)
    
    Returns:
        List of risk zones
    """
    if len(incidents) < 3:
        return []
    
    # Create grid cells
    lats = [inc.latitude for inc in incidents]
    lngs = [inc.longitude for inc in incidents]
    
    min_lat, max_lat = min(lats), max(lats)
    min_lng, max_lng = min(lngs), max(lngs)
    
    # Count incidents per grid cell
    grid_counts = defaultdict(list)
    for inc in incidents:
        cell_lat = int((inc.latitude - min_lat) / grid_size)
        cell_lng = int((inc.longitude - min_lng) / grid_size)
        grid_counts[(cell_lat, cell_lng)].append(inc)
    
    if not grid_counts:
        return []
    
    # Calculate thresholds for risk levels
    counts = [len(v) for v in grid_counts.values()]
    high_threshold = np.percentile(counts, 75)
    medium_threshold = np.percentile(counts, 50)
    
    risk_zones = []
    for (cell_lat, cell_lng), cell_incidents in grid_counts.items():
        count = len(cell_incidents)
        
        # Determine risk level
        if count >= high_threshold:
            risk_level = RiskLevel.high
        elif count >= medium_threshold:
            risk_level = RiskLevel.medium
        else:
            risk_level = RiskLevel.low
        
        # Only include medium and high risk zones
        if risk_level == RiskLevel.low:
            continue
        
        # Calculate polygon corners
        base_lat = min_lat + cell_lat * grid_size
        base_lng = min_lng + cell_lng * grid_size
        
        polygon = [
            Coordinate(latitude=base_lat, longitude=base_lng),
            Coordinate(latitude=base_lat + grid_size, longitude=base_lng),
            Coordinate(latitude=base_lat + grid_size, longitude=base_lng + grid_size),
            Coordinate(latitude=base_lat, longitude=base_lng + grid_size),
            Coordinate(latitude=base_lat, longitude=base_lng),  # Close polygon
        ]
        
        # Category breakdown
        category_counts = defaultdict(int)
        for inc in cell_incidents:
            cat_id = inc.category_id or "unknown"
            category_counts[cat_id] += 1
        
        # Confidence based on data density
        confidence = min(count / 10, 1.0)  # Max confidence at 10+ incidents
        
        risk_zones.append(RiskZone(
            id=str(uuid.uuid4()),
            polygon=polygon,
            risk_level=risk_level,
            incident_count=count,
            prediction_confidence=round(confidence, 2),
            category_breakdown=dict(category_counts)
        ))
    
    return sorted(risk_zones, key=lambda x: x.incident_count, reverse=True)


def predict_time_series(
    incidents: List[IncidentPoint],
    days_to_predict: int = 7
) -> dict:
    """
    Simple time series prediction for incident occurrence.
    
    This is a simplified implementation. For production, consider:
    - ARIMA/SARIMA models
    - Prophet
    - LSTM neural networks
    
    Args:
        incidents: Historical incident points
        days_to_predict: Number of days to predict
    
    Returns:
        Dictionary with predictions
    """
    from datetime import datetime, timedelta
    from collections import Counter
    
    if len(incidents) < 7:
        return {
            "predictions": [],
            "message": "Insufficient data for prediction (minimum 7 incidents required)"
        }
    
    # Group incidents by day
    daily_counts = Counter()
    for inc in incidents:
        day_key = inc.created_at.date()
        daily_counts[day_key] += 1
    
    if len(daily_counts) < 3:
        return {
            "predictions": [],
            "message": "Insufficient daily variation for prediction"
        }
    
    # Calculate simple moving average
    sorted_days = sorted(daily_counts.keys())
    counts = [daily_counts[d] for d in sorted_days]
    
    # Use last 7 days for prediction baseline
    recent_counts = counts[-7:] if len(counts) >= 7 else counts
    mean_count = np.mean(recent_counts)
    std_count = np.std(recent_counts) if len(recent_counts) > 1 else mean_count * 0.2
    
    # Generate predictions
    predictions = []
    last_date = sorted_days[-1]
    
    for i in range(1, days_to_predict + 1):
        pred_date = last_date + timedelta(days=i)
        
        # Add some daily variation (weekend effect, etc.)
        day_of_week = pred_date.weekday()
        weekend_factor = 0.8 if day_of_week >= 5 else 1.0
        
        predicted = mean_count * weekend_factor
        
        predictions.append({
            "date": pred_date.isoformat(),
            "predicted_count": round(predicted, 1),
            "confidence_interval_lower": round(max(0, predicted - 1.96 * std_count), 1),
            "confidence_interval_upper": round(predicted + 1.96 * std_count, 1)
        })
    
    return {
        "predictions": predictions,
        "historical_mean": round(mean_count, 2),
        "historical_std": round(std_count, 2),
        "data_points_used": len(counts)
    }
