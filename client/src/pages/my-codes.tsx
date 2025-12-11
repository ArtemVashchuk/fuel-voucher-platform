
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { useState } from "react";
import { X, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export default function MyCodesScreen() {
  const myCodes = useStore((state) => state.myCodes);
  const [selectedCode, setSelectedCode] = useState<typeof myCodes[0] | null>(null);

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">My Fuel Codes</h1>
        <p className="text-gray-500 mt-2">Show these QR codes at the cashier</p>
      </header>

      {myCodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
          <p>No codes purchased yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myCodes.map((code) => (
            <DialogPrimitive.Root key={code.id}>
              <DialogPrimitive.Trigger asChild>
                <button 
                  className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <img src={code.qrCodeUrl} className="w-10 h-10 opacity-50 mix-blend-multiply" alt="QR Thumbnail" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{code.fuelName}</h3>
                      <p className="text-sm text-gray-500">{code.stationName} • {code.liters}L</p>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-md font-bold ${
                    code.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {code.status.toUpperCase()}
                  </div>
                </button>
              </DialogPrimitive.Trigger>

              <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-none">
                <div className={`h-32 ${
                   code.stationName === 'OKKO' ? 'bg-green-600' :
                   code.stationName === 'WOG' ? 'bg-green-500' :
                   code.stationName === 'UPG' ? 'bg-emerald-500' :
                   'bg-yellow-500'
                } p-6 text-white relative flex flex-col justify-end`}>
                  <DialogPrimitive.Close className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                    <X className="w-4 h-4 text-white" />
                  </DialogPrimitive.Close>
                  <h2 className="text-3xl font-black">{code.stationName}</h2>
                  <p className="opacity-90 font-medium">{code.fuelName} • {code.liters}L</p>
                </div>
                
                <div className="p-8 flex flex-col items-center gap-6">
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                    <img src={code.qrCodeUrl} className="w-64 h-64 mix-blend-multiply" alt="QR Code" />
                  </div>
                  
                  <div className="text-center space-y-1">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Code ID</p>
                    <p className="font-mono font-bold text-xl text-gray-900 flex items-center gap-2 justify-center">
                      {code.id}
                      <Copy className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-900" />
                    </p>
                  </div>

                  <p className="text-center text-sm text-gray-400 max-w-[200px]">
                    Show this code to the cashier before payment.
                  </p>
                </div>
              </DialogContent>
            </DialogPrimitive.Root>
          ))}
        </div>
      )}
    </div>
  );
}
