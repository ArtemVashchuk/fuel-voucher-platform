
import { getPackagesForFuel } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { ChevronLeft, Zap, Flame } from "lucide-react";

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
              className="w-full group relative bg-card/40 hover:bg-card/60 rounded-xl p-6 border border-white/5 transition-all text-left overflow-hidden hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary),0.1)]"
            >
              {/* Tech Decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent -mr-8 -mt-8 rotate-45" />
              <div className="absolute bottom-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary/100 transition-all duration-300" />

              {/* SAVINGS BADGE - EMPHASIZED */}
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-black font-black text-xs px-4 py-2 rounded-bl-xl flex items-center gap-1.5 font-heading tracking-wider shadow-[0_0_20px_rgba(var(--primary),0.5)] group-hover:scale-105 transition-transform origin-top-right">
                  <Flame className="w-3.5 h-3.5 fill-black animate-pulse" />
                  SAVE {savings} ₴
                </div>
              </div>

              <div className="mb-6 relative z-10 pt-4">
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
