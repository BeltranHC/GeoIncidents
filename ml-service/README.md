# ML Service for Incident Pattern Analysis

## Overview
FastAPI service for analyzing incident patterns and predicting risk zones.

## Features
- DBSCAN clustering for identifying incident hotspots
- Time series analysis for predicting incident occurrence
- Risk zone generation based on historical data
- Heat map data generation

## Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn main:app --reload --port 8000
```

## Environment Variables
See `.env.example` for required configuration.

## API Endpoints
- `POST /api/analyze/clustering` - Perform DBSCAN clustering on incidents
- `POST /api/analyze/hotspots` - Identify incident hotspots
- `POST /api/predict/risk-zones` - Predict risk zones
- `GET /api/predict/time-series` - Time series predictions
- `GET /health` - Health check
