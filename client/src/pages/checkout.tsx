
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { ChevronLeft, CreditCard, ShieldCheck, Cpu, ArrowDown, Zap, Skull, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { createPurchase, completePurchase, getSessionId } from "@/lib/api";
import { toast } from "sonner";

export default function CheckoutScreen() {
  const [, setLocation] = useLocation();
  const { selectedStation, selectedFuel, selectedPackage, resetSelection } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!selectedStation || !selectedFuel || !selectedPackage) {
    return <div className="p-6 text-white">Missing checkout data.</div>;
  }

  const savings = selectedPackage.originalPrice - selectedPackage.price;
  const savingsPercent = Math.round((1 - selectedPackage.price / selectedPackage.originalPrice) * 100);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const purchase = await createPurchase({
        sessionId: getSessionId(),
        packageId: selectedPackage.id,
        stationName: selectedStation.name,
        fuelName: selectedFuel.name,
        liters: selectedPackage.liters,
        price: selectedPackage.price,
        status: "pending",
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      await completePurchase(purchase.id);
      resetSelection();
      setLocation("/success");
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Aggressive background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b from-primary/10 to-transparent" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[100px]" />
      
      <div className="bg-black/90 p-4 flex items-center gap-4 border-b-2 border-primary/30 relative z-10">
        <button 
          onClick={() => setLocation("/packages")}
          data-testid="button-back"
          className="p-2 -ml-2 border-2 border-white/20 hover:border-primary transition-colors bg-black/50"
        >
          <ChevronLeft className="w-6 h-6 text-gray-400" />
        </button>
        <h1 className="font-black text-xl text-white font-heading tracking-wider uppercase flex items-center gap-2">
          <Skull className="w-5 h-5 text-red-500" />
          CONFIRM ORDER
        </h1>
      </div>

      <div className="p-6 flex-1 space-y-6 relative z-10">
        {/* Digital Ticket - More Aggressive */}
        <div className="bg-black border-2 border-primary/50 overflow-hidden relative box-glow">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_20px_rgba(0,255,128,0.8)]" />
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-white/10 pb-4">
              <div>
                <p className="text-[10px] text-red-400 uppercase tracking-[0.2em] font-mono flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  PROVIDER
                </p>
                <p className="font-black text-3xl text-white font-heading uppercase tracking-tight">{selectedStation.name}</p>
              </div>
              <Zap className="w-8 h-8 text-primary animate-pulse" />
            </div>

            <div className="flex items-center justify-between border-b-2 border-white/10 pb-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">FUEL GRADE</p>
                <p className="font-black text-2xl text-white font-heading">{selectedFuel.name}</p>
              </div>
              <Cpu className="w-6 h-6 text-gray-600" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">QUANTITY</p>
                <p className="font-black text-4xl text-primary font-mono text-glow-intense">{selectedPackage.liters}L</p>
              </div>
            </div>
          </div>
          
          {/* Perforated edge */}
          <div className="relative h-6 bg-primary/10">
            <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-primary/30" />
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full" />
          </div>

          <div className="p-6 bg-black/50 space-y-4">
            <div className="flex justify-between text-gray-500 text-sm font-mono">
              <span>STANDARD RATE</span>
              <span className="line-through text-red-400">{selectedPackage.originalPrice} ₴</span>
            </div>
            
            {/* MEGA SAVINGS DISPLAY */}
            <div className="bg-primary text-black font-black text-lg font-heading p-4 flex items-center justify-between shadow-[0_0_30px_rgba(0,255,128,0.6)] animate-savings-pulse">
              <span className="flex items-center gap-3">
                <span className="bg-black/20 p-2 rounded"><ArrowDown className="w-5 h-5" /></span>
                <div>
                  <div className="text-xl">DISCOUNT APPLIED</div>
                  <div className="text-sm opacity-70">{savingsPercent}% OFF</div>
                </div>
              </span>
              <span className="text-3xl">-{savings} ₴</span>
            </div>

            <div className="pt-4 border-t-2 border-white/10 flex justify-between items-end">
              <span className="font-bold text-xl text-white font-heading uppercase">TOTAL</span>
              <div className="text-right">
                <span className="text-5xl font-black text-white tracking-tighter font-heading text-glow-intense">{selectedPackage.price}</span>
                <span className="text-2xl text-primary ml-2">₴</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-primary justify-center uppercase tracking-[0.2em] font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>ENCRYPTED TRANSACTION PROTOCOL</span>
        </div>
      </div>

      <div className="p-6 bg-black border-t-2 border-primary/30">
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          data-testid="button-pay"
          className="w-full bg-primary hover:bg-primary/90 text-black py-5 font-black text-xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] transition-all font-heading tracking-wider uppercase shadow-[0_0_40px_rgba(0,255,128,0.5)] hover:shadow-[0_0_60px_rgba(0,255,128,0.7)]"
        >
          {isProcessing ? (
            <span className="animate-pulse flex items-center gap-3">
              <Zap className="w-6 h-6 animate-spin" />
              PROCESSING...
            </span>
          ) : (
            <>
              <CreditCard className="w-6 h-6" />
              EXECUTE PAYMENT
            </>
          )}
        </button>
      </div>
    </div>
  );
}
