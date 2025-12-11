
import { useEffect } from "react";
import { FUELS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useLocation, useRoute } from "wouter";
import { ChevronLeft, Droplets, TrendingDown, Sparkles } from "lucide-react";

export default function FuelSelectionScreen() {
  const [match, params] = useRoute("/station/:id");
  const [, setLocation] = useLocation();
  const { selectedStation, selectFuel } = useStore();

  const fuels = FUELS.filter(f => f.stationId === params?.id);

  const handleSelect = (fuel: typeof FUELS[0]) => {
    selectFuel(fuel);
    setLocation("/packages");
  };

  if (!selectedStation) {
    return <div className="p-6 text-white">Please select a station first.</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Dynamic Header */}
      <div className={`h-56 relative p-6 flex flex-col justify-end overflow-hidden`}>
        <div className={`absolute inset-0 opacity-20 ${
          selectedStation.id === 'okko' ? 'bg-green-600' :
          selectedStation.id === 'wog' ? 'bg-green-500' :
          selectedStation.id === 'upg' ? 'bg-emerald-500' :
          'bg-yellow-500'
        }`} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        
        <button 
          onClick={() => setLocation("/")}
          className="absolute top-6 left-6 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-colors z-20"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <div className="relative z-10">
          <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 font-heading uppercase">
            {selectedStation.logoText}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-mono tracking-wider border border-primary/20">
              LIVE PRICES
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-8 space-y-3 relative z-10">
        {fuels.map((fuel) => (
          <button
            key={fuel.id}
            onClick={() => handleSelect(fuel)}
            className="w-full glass-card p-5 rounded-xl flex items-center justify-between group active:scale-[0.99] transition-all hover:bg-white/5 relative overflow-hidden"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <Droplets className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-xl tracking-tight">{fuel.name}</h3>
                <div className="flex items-center gap-3 text-sm mt-1">
                  <span className="text-gray-500 line-through font-mono">{fuel.basePrice.toFixed(2)}</span>
                  <span className="text-primary font-bold font-mono text-lg text-glow">
                    {fuel.discountPrice.toFixed(2)} ₴
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right relative z-10">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">Savings / L</span>
                <div className="relative group/badge">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-400 rounded blur opacity-20 group-hover/badge:opacity-40 transition-opacity duration-500" />
                  <span className="relative px-3 py-1.5 rounded bg-primary/10 text-primary font-bold text-sm border border-primary/50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                    <TrendingDown className="w-3 h-3" />
                    -{(fuel.basePrice - fuel.discountPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
