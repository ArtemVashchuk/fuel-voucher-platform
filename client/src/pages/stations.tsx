
import { STATIONS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";

export default function StationsScreen() {
  const [, setLocation] = useLocation();
  const selectStation = useStore((state) => state.selectStation);

  const handleSelect = (station: typeof STATIONS[0]) => {
    selectStation(station);
    setLocation(`/station/${station.id}`);
  };

  return (
    <div className="p-6 pt-12 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          Choose your<br />filling station
        </h1>
        <p className="text-gray-500 mt-2">Select a partner network to see prices</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {STATIONS.map((station) => (
          <button
            key={station.id}
            onClick={() => handleSelect(station)}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all active:scale-[0.98] hover:shadow-md text-left flex items-center justify-between"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${station.color}`} />
            
            <div className="pl-4">
              <span className={`text-2xl font-black tracking-tighter ${
                station.id === 'okko' ? 'text-green-600' :
                station.id === 'wog' ? 'text-green-500' :
                station.id === 'upg' ? 'text-emerald-500' :
                'text-yellow-500'
              }`}>
                {station.logoText}
              </span>
            </div>

            <div className="bg-gray-50 p-2 rounded-full text-gray-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
