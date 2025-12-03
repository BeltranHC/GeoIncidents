import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Filter, 
  Layers, 
  AlertTriangle,
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  Shield
} from 'lucide-react';
import { Map } from '../../components/map';
import { Button } from '../../components/ui';
import { ReportIncidentModal } from '../../components/incidents';
import { incidentService, categoryService } from '../../services';
import { useMapStore, useAuthStore } from '../../store';
import { Incident } from '../../types';
import toast from 'react-hot-toast';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { 
    showHeatmap, 
    setShowHeatmap, 
    isReportModalOpen, 
    setReportModalOpen,
    reportLocation,
    setReportLocation,
    filters,
  } = useMapStore();

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  // Cargar categorías
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  // Cargar incidentes
  const { data: incidentsData, refetch: refetchIncidents } = useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => incidentService.getAll(filters),
  });

  // Cargar datos del mapa de calor
  const { data: heatmapData = [] } = useQuery({
    queryKey: ['heatmap', filters],
    queryFn: () => incidentService.getHeatmapData(filters),
    enabled: showHeatmap,
  });

  const handleMapClick = (lat: number, lng: number) => {
    if (isAuthenticated) {
      setReportLocation([lat, lng]);
      setReportModalOpen(true);
    }
  };

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 lg:hidden">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-primary-600">GeoIncidentes</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Heatmap */}
            <Button
              variant={showHeatmap ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setShowHeatmap(!showHeatmap)}
              leftIcon={<Layers className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Mapa de Calor</span>
            </Button>

            {/* Filters */}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Filtros</span>
            </Button>

            {isAuthenticated ? (
              <>
                <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
                </button>
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">
                      {user?.firstName}
                    </span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/admin');
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Shield className="w-4 h-4" />
                          Panel de Admin
                        </button>
                      )}
                      
                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4" />
                        Configuración
                      </button>
                      
                      <hr className="my-1" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Button variant="primary" size="sm" onClick={() => window.location.href = '/login'}>
                Iniciar sesión
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative">
        {/* Map */}
        <Map
          incidents={incidentsData?.incidents || []}
          categories={categories}
          onIncidentClick={handleIncidentClick}
          onMapClick={handleMapClick}
          heatmapData={heatmapData}
          showHeatmap={showHeatmap}
        />

        {/* Floating action button */}
        {isAuthenticated && (
          <button
            onClick={() => setReportModalOpen(true)}
            className="absolute bottom-6 right-6 w-14 h-14 bg-danger-500 hover:bg-danger-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-10"
          >
            <Plus className="w-7 h-7" />
          </button>
        )}

        {/* Stats card */}
        <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg p-4 z-10 max-w-xs">
          <div className="flex items-center gap-2 text-warning-600 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Incidentes Activos</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {incidentsData?.total || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            en las últimas 24 horas
          </p>
        </div>

        {/* Selected incident detail panel */}
        {selectedIncident && (
          <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg p-4 z-10 w-80">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900">{selectedIncident.title}</h3>
              <button 
                onClick={() => setSelectedIncident(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{selectedIncident.description}</p>
            <div className="flex gap-2 mb-3">
              <span className={`severity-badge severity-${selectedIncident.severity}`}>
                {selectedIncident.severity}
              </span>
              <span className={`status-badge status-${selectedIncident.status}`}>
                {selectedIncident.status}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {new Date(selectedIncident.incidentDate).toLocaleString()}
            </p>
          </div>
        )}
      </main>

      {/* Report Modal */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportLocation(null);
        }}
        location={reportLocation}
        onSuccess={() => refetchIncidents()}
      />
    </div>
  );
};
