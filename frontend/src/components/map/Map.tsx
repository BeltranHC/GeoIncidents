import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { Incident, Category, HeatmapPoint } from '../../types';
import { useMapStore } from '../../store';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  incidents: Incident[];
  categories: Category[];
  onIncidentClick?: (incident: Incident) => void;
  onMapClick?: (lat: number, lng: number) => void;
  heatmapData?: HeatmapPoint[];
  showHeatmap?: boolean;
}

// Componente para manejar eventos del mapa
const MapEvents: React.FC<{ onMapClick?: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  const { setBounds, setCenter, setZoom } = useMapStore();
  
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
    moveend: (e) => {
      const map = e.target;
      const bounds = map.getBounds();
      setBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
      setCenter([map.getCenter().lat, map.getCenter().lng]);
      setZoom(map.getZoom());
    },
  });
  
  return null;
};

// Componente para el mapa de calor con colores por severidad
const HeatmapLayer: React.FC<{ points: HeatmapPoint[] }> = ({ points }) => {
  const map = useMap();
  
  useEffect(() => {
    if (points.length === 0) return;
    
    // Colores por severidad
    const severityColors: Record<string, string> = {
      'low': '#22c55e',      // verde
      'medium': '#f97316',   // naranja (media)
      'high': '#dc2626',     // rojo oscuro (alta)
      'critical': '#7f1d1d', // rojo muy oscuro (crítica)
    };
    
    // Crear círculos para cada punto con su color de severidad
    const circles: L.Circle[] = [];
    
    points.forEach(point => {
      const color = severityColors[point.severity || 'medium'] || '#eab308';
      const radius = point.intensity * 150; // Radio basado en intensidad
      
      const circle = L.circle([point.lat, point.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.5,
        radius: radius,
        weight: 2,
      });
      
      circle.addTo(map);
      circles.push(circle);
    });
    
    return () => {
      circles.forEach(circle => map.removeLayer(circle));
    };
  }, [map, points]);
  
  return null;
};

// Crear icono personalizado según la severidad
const createIncidentIcon = (severity: string, color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="incident-marker incident-marker-${severity}" style="background-color: ${color};">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

export const Map: React.FC<MapProps> = ({
  incidents,
  categories,
  onIncidentClick,
  onMapClick,
  heatmapData = [],
  showHeatmap = false,
}) => {
  const { center, zoom } = useMapStore();
  
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#666666';
  };
  
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-lg"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapEvents onMapClick={onMapClick} />
      
      {showHeatmap && heatmapData.length > 0 && (
        <HeatmapLayer points={heatmapData} />
      )}
      
      {!showHeatmap && incidents.map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.latitude, incident.longitude]}
          icon={createIncidentIcon(incident.severity, getCategoryColor(incident.categoryId))}
          eventHandlers={{
            click: () => onIncidentClick?.(incident),
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-gray-900">{incident.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{incident.description.substring(0, 100)}...</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`severity-badge severity-${incident.severity}`}
                >
                  {{
                    'low': 'Baja',
                    'medium': 'Media',
                    'high': 'Alta',
                    'critical': 'Crítica'
                  }[incident.severity] || incident.severity}
                </span>
                <span className={`status-badge status-${incident.status}`}>
                  {{
                    'pending': 'Pendiente',
                    'validated': 'Validado',
                    'rejected': 'Rechazado',
                    'resolved': 'Resuelto'
                  }[incident.status] || incident.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(incident.incidentDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
