import { create } from 'zustand';
import { TimeWindow, DescriptionMatchMode, DescriptionCombineMode } from '@/types/video';

interface DashboardState {
  timeWindow: TimeWindow;
  anchorDate: string | null;
  customRange: { start: string; end: string } | null;
  selectedBrands: string[];
  hideUnknown: boolean;

  // Description Filter State
  selectedDescriptions: string[];
  descriptionMatchMode: DescriptionMatchMode;
  descriptionCombineMode: DescriptionCombineMode;

  // Overall Mode State
  overallMode: boolean;

  setTimeWindow: (window: TimeWindow) => void;
  setAnchorDate: (date: string | null) => void;
  setCustomRange: (range: { start: string; end: string } | null) => void;
  setSelectedBrands: (brands: string[]) => void;
  setHideUnknown: (hide: boolean) => void;

  // Description Filter Actions
  setSelectedDescriptions: (ids: string[]) => void;
  setDescriptionMatchMode: (mode: DescriptionMatchMode) => void;
  setDescriptionCombineMode: (mode: DescriptionCombineMode) => void;
  clearDescriptionFilter: () => void;

  // Overall Mode Actions
  setOverallMode: (enabled: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  timeWindow: 'last30',
  anchorDate: null,
  customRange: null,
  selectedBrands: [],
  hideUnknown: false,

  // Description Filter Initial State
  selectedDescriptions: [],
  descriptionMatchMode: 'exact',
  descriptionCombineMode: 'OR',

  // Overall Mode Initial State
  overallMode: false,

  setTimeWindow: (timeWindow) => set({ timeWindow }),
  setAnchorDate: (anchorDate) => set({ anchorDate }),
  setCustomRange: (customRange) => set({ customRange }),
  setSelectedBrands: (selectedBrands) => set({ selectedBrands }),
  setHideUnknown: (hideUnknown) => set({ hideUnknown }),

  // Description Filter Actions
  setSelectedDescriptions: (selectedDescriptions) => set({ selectedDescriptions }),
  setDescriptionMatchMode: (descriptionMatchMode) => set({ descriptionMatchMode }),
  setDescriptionCombineMode: (descriptionCombineMode) => set({ descriptionCombineMode }),
  clearDescriptionFilter: () => set({
    selectedDescriptions: [],
    descriptionMatchMode: 'exact',
    descriptionCombineMode: 'OR'
  }),

  // Overall Mode Actions
  setOverallMode: (overallMode) => set({ overallMode }),
}));
