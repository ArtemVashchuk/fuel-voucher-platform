
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FuelPackage, Station, FuelType } from './mock-data';

interface AppState {
  // Cart/Selection flow
  selectedStation: Station | null;
  selectedFuel: FuelType | null;
  selectedPackage: FuelPackage | null;
  
  // Actions
  selectStation: (station: Station | null) => void;
  selectFuel: (fuel: FuelType | null) => void;
  selectPackage: (pkg: FuelPackage | null) => void;
  resetSelection: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      selectedStation: null,
      selectedFuel: null,
      selectedPackage: null,

      selectStation: (station) => set({ selectedStation: station }),
      selectFuel: (fuel) => set({ selectedFuel: fuel }),
      selectPackage: (pkg) => set({ selectedPackage: pkg }),
      
      resetSelection: () => set({
        selectedStation: null,
        selectedFuel: null,
        selectedPackage: null
      })
    }),
    {
      name: 'fuel-app-selection',
    }
  )
);
