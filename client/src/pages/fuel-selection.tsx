
import { useEffect } from "react";
import { FUELS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useLocation, useRoute } from "wouter";
import { ChevronLeft, Droplets } from "lucide-react";

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
    // Fallback if accessed directly without selection
    return <div className="p-6">Please select a station first.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`h-48 ${selectedStation.color} relative p-6 flex flex-col justify-end text-white`}>
        <button 
          onClick={() => setLocation("/")}
          className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-4xl font-black tracking-tighter opacity-90">{selectedStation.logoText}</h1>
        <p className="text-white/80 font-medium">Select fuel type</p>
      </div>

      <div className="p-4 -mt-6 space-y-3 relative z-10">
        {fuels.map((fuel) => (
          <button
            key={fuel.id}
            onClick={() => handleSelect(fuel)}
            className="w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 text-lg">{fuel.name}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 line-through">{fuel.basePrice.toFixed(2)} ₴</span>
                  <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md">
                    {fuel.discountPrice.toFixed(2)} ₴
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <span className="block text-xs text-gray-400">Save</span>
              <span className="block font-bold text-green-600">
                {(fuel.basePrice - fuel.discountPrice).toFixed(2)} ₴/L
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
