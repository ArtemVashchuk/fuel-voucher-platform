
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { ChevronLeft, CreditCard, ShieldCheck, Cpu } from "lucide-react";
import { useState } from "react";

export default function CheckoutScreen() {
  const [, setLocation] = useLocation();
  const { selectedStation, selectedFuel, selectedPackage, addPurchase } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!selectedStation || !selectedFuel || !selectedPackage) {
    return <div className="p-6 text-white">Missing checkout data.</div>;
  }

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newPurchase = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        packageId: selectedPackage.id,
        stationName: selectedStation.name,
        fuelName: selectedFuel.name,
        liters: selectedPackage.liters,
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=00ffaa&bgcolor=000&data=MOCK_FUEL_CODE_" + Math.random(),
        purchaseDate: new Date().toISOString(),
        status: 'active' as const
      };
      
      addPurchase(newPurchase);
      setIsProcessing(false);
      setLocation("/success");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-background p-4 flex items-center gap-4 border-b border-white/5">
        <button 
          onClick={() => setLocation("/packages")}
          className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-400" />
        </button>
        <h1 className="font-bold text-lg text-white font-heading tracking-wider uppercase">Order Summary</h1>
      </div>

      <div className="p-6 flex-1 space-y-6">
        {/* Digital Ticket */}
        <div className="glass-card rounded-xl p-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500" />
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Provider</p>
                <p className="font-bold text-xl text-white font-heading">{selectedStation.name}</p>
              </div>
              <div className={`w-2 h-2 rounded-full ${selectedStation.color} shadow-[0_0_10px_currentColor]`} />
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Fuel Grade</p>
                <p className="font-bold text-xl text-white font-heading">{selectedFuel.name}</p>
              </div>
              <Cpu className="w-5 h-5 text-gray-600" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Quantity</p>
                <p className="font-bold text-xl text-primary font-mono">{selectedPackage.liters} L</p>
              </div>
            </div>
          </div>
          
          {/* Perforated edge effect */}
          <div className="relative h-4 bg-black/20">
            <div className="absolute top-0 left-0 w-full border-t border-dashed border-gray-700" />
          </div>

          <div className="p-6 bg-black/20 space-y-3">
             <div className="flex justify-between text-gray-500 text-sm font-mono">
              <span>Standard Rate</span>
              <span className="line-through">{selectedPackage.originalPrice} ₴</span>
            </div>
            <div className="flex justify-between text-primary font-medium text-sm font-mono">
              <span>Discount Applied</span>
              <span>- {(selectedPackage.originalPrice - selectedPackage.price)} ₴</span>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between items-end">
              <span className="font-bold text-lg text-white font-heading">TOTAL</span>
              <span className="text-3xl font-black text-white tracking-tighter font-heading text-glow">{selectedPackage.price} ₴</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-gray-500 justify-center uppercase tracking-widest font-mono">
          <ShieldCheck className="w-3 h-3 text-primary" />
          <span>Encrypted Transaction Protocol</span>
        </div>
      </div>

      <div className="p-6 bg-black/40 border-t border-white/5 backdrop-blur-md">
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-primary hover:bg-primary/90 text-black py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] transition-all font-heading tracking-wider uppercase shadow-[0_0_20px_rgba(var(--primary),0.4)]"
        >
          {isProcessing ? (
            <span className="animate-pulse">Processing Block...</span>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Initialize Pay
            </>
          )}
        </button>
      </div>
    </div>
  );
}
