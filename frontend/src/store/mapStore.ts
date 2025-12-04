import { create } from 'zustand';
import { BoundingBox, IncidentFilters, IncidentSeverity, IncidentStatus } from '../types';

interface MapState {
  // Vista del mapa
  center: [number, number];
  zoom: number;
  bounds: BoundingBox | null;
  
  // Filtros
  filters: IncidentFilters;
  showHeatmap: boolean;
  selectedCategories: string[];
  
  // Incidente seleccionado
  selectedIncidentId: string | null;
  
  // UI
  isFilterPanelOpen: boolean;
  isReportModalOpen: boolean;
  reportLocation: [number, number] | null;
  
  // Actions
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setBounds: (bounds: BoundingBox) => void;
  setFilters: (filters: Partial<IncidentFilters>) => void;
  resetFilters: () => void;
  setShowHeatmap: (show: boolean) => void;
  toggleCategory: (categoryId: string) => void;
  setSelectedIncident: (id: string | null) => void;
  setFilterPanelOpen: (open: boolean) => void;
  setReportModalOpen: (open: boolean) => void;
  setReportLocation: (location: [number, number] | null) => void;
}

const DEFAULT_CENTER: [number, number] = [-15.8402, -70.0219]; // Puno, Perú
const DEFAULT_ZOOM = 14;

const DEFAULT_FILTERS: IncidentFilters = {
  page: 1,
  limit: 50,
};

export const useMapStore = create<MapState>((set, get) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  bounds: null,
  filters: DEFAULT_FILTERS,
  showHeatmap: false,
  selectedCategories: [],
  selectedIncidentId: null,
  isFilterPanelOpen: false,
  isReportModalOpen: false,
  reportLocation: null,

  setCenter: (center) => set({ center }),
  
  setZoom: (zoom) => set({ zoom }),
  
  setBounds: (bounds) => set({ bounds }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  
  resetFilters: () => set({
    filters: DEFAULT_FILTERS,
    selectedCategories: [],
  }),
  
  setShowHeatmap: (show) => set({ showHeatmap: show }),
  
  toggleCategory: (categoryId) => set((state) => {
    const categories = state.selectedCategories.includes(categoryId)
      ? state.selectedCategories.filter(id => id !== categoryId)
      : [...state.selectedCategories, categoryId];
    return { selectedCategories: categories };
  }),
  
  setSelectedIncident: (id) => set({ selectedIncidentId: id }),
  
  setFilterPanelOpen: (open) => set({ isFilterPanelOpen: open }),
  
  setReportModalOpen: (open) => set({ isReportModalOpen: open }),
  
  setReportLocation: (location) => set({ reportLocation: location }),
}));
