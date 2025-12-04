import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { Button, Input, Modal } from '../ui';
import { categoryService, incidentService } from '../../services';
import { CreateIncidentData, IncidentSeverity } from '../../types';
import toast from 'react-hot-toast';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: [number, number] | null;
  onSuccess?: () => void;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  location,
  onSuccess,
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateIncidentData>();

  // Cargar categorías
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  // Mutación para crear incidente
  const createIncident = useMutation({
    mutationFn: incidentService.create,
    onSuccess: () => {
      toast.success('Incidente reportado exitosamente');
      reset();
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al reportar incidente');
    },
  });

  const onSubmit = (data: CreateIncidentData) => {
    if (!location) {
      toast.error('Selecciona una ubicación en el mapa');
      return;
    }

    createIncident.mutate({
      ...data,
      latitude: location[0],
      longitude: location[1],
      incidentDate: new Date(data.incidentDate).toISOString(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reportar Incidente" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de incidente *
          </label>
          <select
            {...register('categoryId', { required: 'Selecciona una categoría' })}
            className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccionar...</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-danger-600">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Título */}
        <Input
          label="Título *"
          {...register('title', { 
            required: 'El título es requerido',
            maxLength: { value: 255, message: 'Máximo 255 caracteres' }
          })}
          error={errors.title?.message}
          placeholder="Describe brevemente el incidente"
        />

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            {...register('description', { required: 'La descripción es requerida' })}
            className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[100px]"
            placeholder="Proporciona detalles del incidente..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
          )}
        </div>

        {/* Ubicación */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-5 h-5" />
            <span className="font-medium">Ubicación</span>
          </div>
          {location ? (
            <p className="text-sm text-gray-600 mt-1">
              Lat: {location[0].toFixed(6)}, Lng: {location[1].toFixed(6)}
            </p>
          ) : (
            <p className="text-sm text-warning-600 mt-1">
              Haz clic en el mapa para seleccionar la ubicación
            </p>
          )}
        </div>

        {/* Fecha del incidente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            Fecha y hora del incidente *
          </label>
          <input
            type="datetime-local"
            {...register('incidentDate', { required: 'La fecha es requerida' })}
            className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.incidentDate && (
            <p className="mt-1 text-sm text-danger-600">{errors.incidentDate.message}</p>
          )}
        </div>

        {/* Severidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Severidad
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.values(IncidentSeverity).map((severity) => (
              <label
                key={severity}
                className="relative cursor-pointer"
              >
                <input
                  type="radio"
                  {...register('severity')}
                  value={severity}
                  className="peer sr-only"
                />
                <div className={`
                  px-3 py-3 rounded-lg border-2 text-center text-sm font-medium transition-all
                  peer-checked:ring-2 peer-checked:ring-offset-2
                  ${severity === 'low' 
                    ? 'border-green-400 bg-green-50 text-green-700 peer-checked:bg-green-500 peer-checked:text-white peer-checked:ring-green-500' 
                    : ''}
                  ${severity === 'medium' 
                    ? 'border-yellow-400 bg-yellow-50 text-yellow-700 peer-checked:bg-yellow-500 peer-checked:text-white peer-checked:ring-yellow-500' 
                    : ''}
                  ${severity === 'high' 
                    ? 'border-orange-400 bg-orange-50 text-orange-700 peer-checked:bg-orange-500 peer-checked:text-white peer-checked:ring-orange-500' 
                    : ''}
                  ${severity === 'critical' 
                    ? 'border-red-400 bg-red-50 text-red-700 peer-checked:bg-red-500 peer-checked:text-white peer-checked:ring-red-500' 
                    : ''}
                  hover:shadow-md
                `}>
                  <span className="capitalize">{severity === 'low' ? 'Baja' : severity === 'medium' ? 'Media' : severity === 'high' ? 'Alta' : 'Crítica'}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Reporte anónimo */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('isAnonymous')}
            id="isAnonymous"
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="isAnonymous" className="text-sm text-gray-700">
            Reportar de forma anónima
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={createIncident.isPending}
            disabled={!location}
          >
            Reportar Incidente
          </Button>
        </div>
      </form>
    </Modal>
  );
};
