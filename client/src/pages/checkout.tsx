
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { ChevronLeft, CreditCard, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function CheckoutScreen() {
  const [, setLocation] = useLocation();
  const { selectedStation, selectedFuel, selectedPackage, addPurchase } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!selectedStation || !selectedFuel || !selectedPackage) {
    return <div className="p-6">Missing checkout data.</div>;
  }

  const handlePayment = () => {
    setIsProcessing(true);
    // Mock Stripe delay
    setTimeout(() => {
      const newPurchase = {
        id: Math.random().toString(36).substr(2, 9),
        packageId: selectedPackage.id,
        stationName: selectedStation.name,
        fuelName: selectedFuel.name,
        liters: selectedPackage.liters,
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MOCK_FUEL_CODE_" + Math.random(),
        purchaseDate: new Date().toISOString(),
        status: 'active' as const
      };
      
      addPurchase(newPurchase);
      setIsProcessing(false);
      setLocation("/success");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm">
        <button 
          onClick={() => setLocation("/packages")}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="font-bold text-lg">Checkout</h1>
      </div>

      <div className="p-6 flex-1 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <p className="text-sm text-gray-500">Station</p>
              <p className="font-bold text-lg">{selectedStation.name}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${selectedStation.color}`} />
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <p className="text-sm text-gray-500">Fuel Type</p>
              <p className="font-bold text-lg">{selectedFuel.name}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Volume</p>
              <p className="font-bold text-lg">{selectedPackage.liters} L</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex justify-between text-gray-500">
            <span>Original Price</span>
            <span className="line-through">{selectedPackage.originalPrice} ₴</span>
          </div>
          <div className="flex justify-between text-green-600 font-medium">
            <span>Discount</span>
            <span>- {(selectedPackage.originalPrice - selectedPackage.price)} ₴</span>
          </div>
          <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
            <span className="font-bold text-lg">Total</span>
            <span className="text-3xl font-black text-gray-900">{selectedPackage.price} ₴</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure payment via Stripe</span>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] transition-all"
        >
          {isProcessing ? (
            "Processing..."
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay {selectedPackage.price} ₴
            </>
          )}
        </button>
      </div>
    </div>
  );
}
