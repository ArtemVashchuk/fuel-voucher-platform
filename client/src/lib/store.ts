
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FuelPackage, Station, FuelType } from './mock-data';

export interface PurchasedCode {
  id: string;
  packageId: string;
  stationName: string;
  fuelName: string;
  liters: number;
  qrCodeUrl: string; // Mock URL
  purchaseDate: string;
  status: 'active' | 'used';
}

interface AppState {
  // Cart/Selection flow
  selectedStation: Station | null;
  selectedFuel: FuelType | null;
  selectedPackage: FuelPackage | null;
  
  // User Data
  myCodes: PurchasedCode[];
  
  // Actions
  selectStation: (station: Station | null) => void;
  selectFuel: (fuel: FuelType | null) => void;
  selectPackage: (pkg: FuelPackage | null) => void;
  addPurchase: (code: PurchasedCode) => void;
  resetSelection: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      selectedStation: null,
      selectedFuel: null,
      selectedPackage: null,
      myCodes: [],

      selectStation: (station) => set({ selectedStation: station }),
      selectFuel: (fuel) => set({ selectedFuel: fuel }),
      selectPackage: (pkg) => set({ selectedPackage: pkg }),
      
      addPurchase: (code) => set((state) => ({ 
        myCodes: [code, ...state.myCodes] 
      })),
      
      resetSelection: () => set({
        selectedStation: null,
        selectedFuel: null,
        selectedPackage: null
      })
    }),
    {
      name: 'fuel-app-storage',
    }
  )
);
