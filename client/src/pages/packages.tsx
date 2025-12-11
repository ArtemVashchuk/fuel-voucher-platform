
import { getPackagesForFuel } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { ChevronLeft, Zap, Flame, Skull, ArrowRight, TrendingDown } from "lucide-react";

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
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Background effects */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-0 w-48 h-48 bg-red-500/10 rounded-full blur-[100px]" />
      
      <div className="bg-black/90 backdrop-blur-md p-6 pb-4 border-b-2 border-primary/30 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLocation(`/station/${selectedStation.id}`)}
            data-testid="button-back"
            className="p-2 -ml-2 border-2 border-white/20 hover:border-primary transition-colors bg-black/50"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1">
            <h2 className="font-black text-2xl text-white leading-none tracking-tight font-heading uppercase flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              {selectedFuel.name}
            </h2>
            <p className="text-xs text-red-400 font-mono tracking-[0.2em] uppercase mt-1 flex items-center gap-2">
              <Skull className="w-3 h-3" />
              SELECT VOLUME
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 relative z-10">
        {packages.map((pkg, index) => {
          const savings = pkg.originalPrice - pkg.price;
          const isPopular = pkg.liters === 20;
          
          return (
            <button
              key={pkg.id}
              onClick={() => handleSelect(pkg)}
              data-testid={`package-${pkg.liters}L`}
              className={`w-full group relative bg-black/80 border-2 ${isPopular ? 'border-primary animate-pulse-glow' : 'border-white/10 hover:border-primary'} p-0 transition-all text-left overflow-hidden hover:box-glow active:scale-[0.98]`}
            >
              {/* MASSIVE SAVINGS BADGE */}
              <div className="absolute top-0 right-0 z-20">
                <div className={`${isPopular ? 'bg-red-500 text-white' : 'bg-primary text-black'} font-black text-sm px-5 py-2.5 flex items-center gap-2 font-heading tracking-wider ${isPopular ? 'shadow-[0_0_30px_rgba(255,50,50,0.6)]' : 'shadow-[0_0_20px_rgba(0,255,128,0.5)]'}`}>
                  <Flame className={`w-4 h-4 ${isPopular ? 'animate-pulse' : ''}`} />
                  SAVE {savings} ₴
                </div>
              </div>
              
              {isPopular && (
                <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 font-mono tracking-wider z-20">
                  HOT DEAL
                </div>
              )}

              <div className="flex items-stretch">
                {/* Volume display */}
                <div className="w-32 bg-primary/10 border-r-2 border-primary/30 flex flex-col items-center justify-center p-6 group-hover:bg-primary/20 transition-all">
                  <span className="text-6xl font-black text-white tracking-tighter font-heading text-glow-intense">
                    {pkg.liters}
                  </span>
                  <span className="text-xl font-bold text-primary font-mono">LITERS</span>
                </div>
                
                {/* Pricing */}
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-3xl font-black text-white font-heading tracking-tight">
                      {pkg.price}
                    </span>
                    <span className="text-xl text-primary font-bold mb-0.5">₴</span>
                    <span className="text-lg text-gray-600 line-through font-mono ml-2">
                      {pkg.originalPrice} ₴
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 font-mono">
                      <span className="text-gray-600">UNIT:</span> {(pkg.price / pkg.liters).toFixed(2)} ₴/L
                    </div>
                    <div className="flex items-center gap-1 text-primary text-xs font-bold">
                      <TrendingDown className="w-3 h-3" />
                      {Math.round((1 - pkg.price / pkg.originalPrice) * 100)}% OFF
                    </div>
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="w-16 bg-white/5 border-l-2 border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-black" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="p-4 border-t-2 border-white/10 bg-black/50">
        <p className="text-center text-[10px] text-gray-600 font-mono tracking-[0.2em] uppercase">
          [ PRICES LOCKED FOR 24H AFTER PURCHASE ]
        </p>
      </div>
    </div>
  );
}
