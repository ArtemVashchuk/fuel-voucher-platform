
import { STATIONS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { ArrowRight, Zap } from "lucide-react";
import lionLogo from "@assets/generated_images/cyberpunk_lion_logo.png";

export default function StationsScreen() {
  const [, setLocation] = useLocation();
  const selectStation = useStore((state) => state.selectStation);

  const handleSelect = (station: typeof STATIONS[0]) => {
    selectStation(station);
    setLocation(`/station/${station.id}`);
  };

  return (
    <div className="p-6 pt-12 space-y-8">
      <header className="relative">
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
        
        {/* Branding Section */}
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-lg bg-black/50 border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <img src={lionLogo} alt="Lemberg Fuel Corp." className="w-8 h-8 object-contain drop-shadow-[0_0_5px_rgba(var(--primary),0.5)]" />
          </div>
          <div>
            <h2 className="text-white font-heading font-bold uppercase tracking-wider text-sm">Lemberg Fuel Corp.</h2>
            <p className="text-[10px] text-primary font-mono tracking-widest uppercase text-glow">Future Energy Solutions</p>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white leading-none tracking-tighter relative z-10">
          SELECT<br />
          <span className="text-primary text-glow">NETWORK</span>
        </h1>
        <p className="text-gray-400 mt-2 font-mono text-xs tracking-widest uppercase relative z-10">
          // Authorized Partners Only
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {STATIONS.map((station) => (
          <button
            key={station.id}
            onClick={() => handleSelect(station)}
            className="group relative overflow-hidden rounded-xl bg-card border border-white/5 p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(var(--primary),0.15)] text-left flex items-center justify-between"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r ${
               station.id === 'okko' ? 'from-green-500 to-transparent' :
               station.id === 'wog' ? 'from-green-400 to-transparent' :
               station.id === 'upg' ? 'from-emerald-500 to-transparent' :
               'from-yellow-500 to-transparent'
            }`} />
            
            <div className="relative z-10 pl-2">
              <span className={`text-3xl font-black tracking-tighter uppercase font-heading ${
                station.id === 'okko' ? 'text-green-500' :
                station.id === 'wog' ? 'text-green-400' :
                station.id === 'upg' ? 'text-emerald-400' :
                'text-yellow-400'
              }`}>
                {station.logoText}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Online</span>
              </div>
            </div>

            <div className="relative z-10 bg-white/5 p-3 rounded-lg text-gray-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors border border-white/5 group-hover:border-primary/30">
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
