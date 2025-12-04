import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Filter,
  Search,
  Eye,
  MapPin,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { incidentService } from '@/services/incident.service';
import { categoryService } from '@/services/category.service';
import { useAuthStore } from '@/store/authStore';
import { Incident, IncidentFilters, IncidentStatus } from '@/types';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  validated: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  resolved: 'bg-blue-100 text-blue-800',
};

const severityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
  critical: 'bg-purple-100 text-purple-800',
};

export const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [filters, setFilters] = useState<IncidentFilters>({
    page: 1,
    limit: 10,
  });
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: incidentsData, isLoading } = useQuery({
    queryKey: ['admin-incidents', filters],
    queryFn: () => incidentService.getAll(filters),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  // Calcular estadísticas de los incidentes
  const { data: allIncidentsData } = useQuery({
    queryKey: ['all-incidents-stats'],
    queryFn: () => incidentService.getAll({ limit: 500 }),
    staleTime: 0,
    refetchOnMount: true,
  });

  const stats = {
    pending: allIncidentsData?.incidents?.filter(i => i.status === 'pending').length || 0,
    validated: allIncidentsData?.incidents?.filter(i => i.status === 'validated').length || 0,
    rejected: allIncidentsData?.incidents?.filter(i => i.status === 'rejected').length || 0,
    total: allIncidentsData?.incidents?.length || 0,
  };

  const validateMutation = useMutation({
    mutationFn: (id: string) => incidentService.validate(id),
    onSuccess: () => {
      toast.success('Incidente validado correctamente');
      queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['all-incidents-stats'] });
      setSelectedIncident(null);
    },
    onError: () => {
      toast.error('Error al validar el incidente');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => incidentService.reject(id, 'Rechazado por el administrador'),
    onSuccess: () => {
      toast.success('Incidente rechazado');
      queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['all-incidents-stats'] });
      setSelectedIncident(null);
    },
    onError: () => {
      toast.error('Error al rechazar el incidente');
    },
  });

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const incidents = incidentsData?.incidents || [];
  const pagination = incidentsData?.pagination;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al mapa
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Administración
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Validados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.validated}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Rechazados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Búsqueda
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Buscar..."
                    onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={filters.status || ''}
                  onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as IncidentStatus || undefined }))}
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendientes</option>
                  <option value="validated">Validados</option>
                  <option value="rejected">Rechazados</option>
                  <option value="resolved">Resueltos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={filters.categoryId || ''}
                  onChange={(e) => setFilters(f => ({ ...f, categoryId: e.target.value || undefined }))}
                >
                  <option value="">Todas</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severidad
                </label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={filters.severity || ''}
                  onChange={(e) => setFilters(f => ({ ...f, severity: e.target.value as any }))}
                >
                  <option value="">Todas</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Incidents Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Incidentes</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-500">Cargando incidentes...</p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron incidentes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Incidente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {incident.title}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {incident.address || 'Sin dirección'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {incident.category?.name || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${severityColors[incident.severity]}`}>
                          {incident.severity === 'low' && 'Baja'}
                          {incident.severity === 'medium' && 'Media'}
                          {incident.severity === 'high' && 'Alta'}
                          {incident.severity === 'critical' && 'Crítica'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[incident.status]}`}>
                          {incident.status === 'pending' && 'Pendiente'}
                          {incident.status === 'validated' && 'Validado'}
                          {incident.status === 'rejected' && 'Rechazado'}
                          {incident.status === 'resolved' && 'Resuelto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(incident.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedIncident(incident)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} resultados
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Incident Detail Modal */}
      <Modal
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title="Detalles del Incidente"
        size="lg"
      >
        {selectedIncident && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedIncident.title}
              </h3>
              <p className="mt-2 text-gray-600">{selectedIncident.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Categoría</p>
                <p className="font-medium">{selectedIncident.category?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Severidad</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${severityColors[selectedIncident.severity]}`}>
                  {selectedIncident.severity}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedIncident.status]}`}>
                  {selectedIncident.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium">
                  {new Date(selectedIncident.createdAt).toLocaleString('es-ES')}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Ubicación</p>
              <p className="font-medium">{selectedIncident.address || 'Sin dirección'}</p>
              <p className="text-sm text-gray-400">
                Lat: {selectedIncident.latitude}, Lng: {selectedIncident.longitude}
              </p>
            </div>

            {selectedIncident.evidences && selectedIncident.evidences.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Evidencias</p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedIncident.evidences.map((ev) => (
                    <a
                      key={ev.id}
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      {ev.type === 'image' ? (
                        <img
                          src={ev.url}
                          alt="Evidencia"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs text-gray-500">{ev.type}</span>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selectedIncident.status === 'pending' ? (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="primary"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    if (confirm('¿Estás seguro de que deseas VALIDAR este incidente?')) {
                      validateMutation.mutate(selectedIncident.id);
                    }
                  }}
                  isLoading={validateMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Validar Incidente
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    if (confirm('¿Estás seguro de que deseas RECHAZAR este incidente?')) {
                      rejectMutation.mutate(selectedIncident.id);
                    }
                  }}
                  isLoading={rejectMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar Incidente
                </Button>
              </div>
            ) : (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 text-center mb-3">
                  Este incidente ya fue {selectedIncident.status === 'validated' ? 'validado' : 'rechazado'}
                </p>
                <div className="flex gap-3">
                  {selectedIncident.status !== 'validated' && (
                    <Button
                      variant="primary"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        if (confirm('¿Cambiar estado a VALIDADO?')) {
                          validateMutation.mutate(selectedIncident.id);
                        }
                      }}
                      isLoading={validateMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Cambiar a Validado
                    </Button>
                  )}
                  {selectedIncident.status !== 'rejected' && (
                    <Button
                      variant="danger"
                      className="flex-1"
                      onClick={() => {
                        if (confirm('¿Cambiar estado a RECHAZADO?')) {
                          rejectMutation.mutate(selectedIncident.id);
                        }
                      }}
                      isLoading={rejectMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cambiar a Rechazado
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
