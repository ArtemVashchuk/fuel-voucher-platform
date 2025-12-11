
import { getPackagesForFuel } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { ChevronLeft, Zap, Box } from "lucide-react";

export default function PackagesScreen() {
  const [, setLocation] = useLocation();
  const { selectedStation, selectedFuel, selectPackage } = useStore();

  if (!selectedStation || !selectedFuel) {
    return <div className="p-6 text-white">Missing selection data.</div>;
  }

  const packages = getPackagesForFuel(selectedFuel.id, selectedStation.id);

  const handleSelect = (pkg: typeof packages[0]) => {
    selectPackage(pkg);
    setLocation("/checkout");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-background/80 backdrop-blur-md p-6 pb-4 border-b border-white/5 z-10 sticky top-0">
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => setLocation(`/station/${selectedStation.id}`)}
            className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-400" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-xl text-white leading-none tracking-tight font-heading">{selectedFuel.name}</h2>
            <p className="text-xs text-primary font-mono tracking-widest uppercase mt-1">Capacity Selection</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1">
        {packages.map((pkg) => {
          const savings = pkg.originalPrice - pkg.price;
          
          return (
            <button
              key={pkg.id}
              onClick={() => handleSelect(pkg)}
              className="w-full group relative bg-card/40 hover:bg-card/60 rounded-xl p-6 border border-white/5 transition-all text-left overflow-hidden hover:border-primary/50"
            >
              {/* Tech Decoration */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent -mr-8 -mt-8 rotate-45" />
              <div className="absolute bottom-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary/100 transition-all duration-300" />

              <div className="absolute top-4 right-4 bg-primary/20 border border-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 font-mono uppercase tracking-wider">
                <Zap className="w-3 h-3 fill-current" />
                Save {savings} ₴
              </div>

              <div className="mb-6 relative z-10">
                <div className="flex items-baseline">
                  <span className="text-6xl font-black text-white tracking-tighter font-heading text-glow">
                    {pkg.liters}
                  </span>
                  <span className="text-xl font-medium text-gray-500 ml-2 font-mono">L</span>
                </div>
              </div>

              <div className="flex items-end justify-between border-t border-white/5 pt-4">
                <div>
                  <div className="text-sm text-gray-600 line-through mb-0.5 font-mono">
                    {pkg.originalPrice} ₴
                  </div>
                  <div className="text-2xl font-bold text-white font-heading tracking-tight">
                    {pkg.price} <span className="text-sm text-primary">₴</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Unit Price</div>
                  <div className="font-bold text-gray-300 font-mono">
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
