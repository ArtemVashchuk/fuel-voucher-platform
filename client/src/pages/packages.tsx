
import { getPackagesForFuel } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { ChevronLeft, Zap } from "lucide-react";

export default function PackagesScreen() {
  const [, setLocation] = useLocation();
  const { selectedStation, selectedFuel, selectPackage } = useStore();

  if (!selectedStation || !selectedFuel) {
    return <div className="p-6">Missing selection data.</div>;
  }

  const packages = getPackagesForFuel(selectedFuel.id, selectedStation.id);

  const handleSelect = (pkg: typeof packages[0]) => {
    selectPackage(pkg);
    setLocation("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-6 pb-4 shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => setLocation(`/station/${selectedStation.id}`)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-xl leading-none">{selectedFuel.name}</h2>
            <p className="text-sm text-gray-500">{selectedStation.name}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${selectedStation.color}`}>
            {selectedStation.logoText}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1">
        <h3 className="font-medium text-gray-500 uppercase text-xs tracking-wider">Select Volume</h3>
        
        {packages.map((pkg) => {
          const savings = pkg.originalPrice - pkg.price;
          
          return (
            <button
              key={pkg.id}
              onClick={() => handleSelect(pkg)}
              className="w-full group relative bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-primary/20 active:border-primary transition-all text-left"
            >
              <div className="absolute top-4 right-4 bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" />
                Save {savings} ₴
              </div>

              <div className="mb-4">
                <span className="text-5xl font-black text-gray-900 tracking-tighter">
                  {pkg.liters}
                </span>
                <span className="text-xl font-medium text-gray-400 ml-1">liters</span>
              </div>

              <div className="flex items-end justify-between border-t border-gray-100 pt-4 mt-2">
                <div>
                  <div className="text-sm text-gray-400 line-through mb-0.5">
                    {pkg.originalPrice} ₴
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {pkg.price} ₴
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-1">Price per liter</div>
                  <div className="font-medium text-gray-900">
                    {(pkg.price / pkg.liters).toFixed(2)} ₴
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
