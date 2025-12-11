
import { useState, useEffect } from "react";
import { X, Copy, QrCode, Zap } from "lucide-react";
import { DialogContent } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { getPurchasesBySession, getSessionId } from "@/lib/api";
import { toast } from "sonner";

interface PurchaseWithQr {
  id: number;
  packageId: string;
  stationName: string;
  fuelName: string;
  liters: number;
  price: number;
  status: string;
  createdAt: string;
  qrCode?: {
    id: number;
    qrCodeUrl: string;
    stationId: string;
    fuelType: string;
    liters: number;
    status: string;
  };
}

export default function MyCodesScreen() {
  const [purchases, setPurchases] = useState<PurchaseWithQr[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const sessionId = getSessionId();
      const data = await getPurchasesBySession(sessionId);
      // Only show delivered purchases with QR codes
      const deliveredPurchases = data.filter(p => p.status === 'delivered' && p.qrCode);
      setPurchases(deliveredPurchases);
    } catch (error) {
      console.error("Failed to load purchases:", error);
      toast.error("Failed to load your codes");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code ID copied!");
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-gray-400 font-mono">Loading your codes...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pt-12">
      <header>
        <h1 className="text-3xl font-bold text-white font-heading tracking-tight uppercase">My Assets</h1>
        <p className="text-gray-500 text-xs font-mono mt-1 tracking-widest uppercase">// SECURE STORAGE</p>
      </header>

      {purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-600 border border-dashed border-white/10 rounded-2xl bg-white/5">
          <QrCode className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-mono text-sm">NO ACTIVE CODES FOUND</p>
          <p className="text-xs text-gray-500 mt-2">Purchase a fuel package to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <DialogPrimitive.Root key={purchase.id}>
              <DialogPrimitive.Trigger asChild>
                <button 
                  className="w-full glass-card rounded-xl p-0 flex items-stretch group active:scale-[0.98] transition-all text-left overflow-hidden hover:border-primary/40"
                >
                  <div className="w-24 bg-black/40 flex items-center justify-center p-4 border-r border-white/5">
                    {purchase.qrCode && (
                      <img 
                        src={purchase.qrCode.qrCodeUrl} 
                        className="w-full opacity-80 mix-blend-screen filter grayscale contrast-200 group-hover:grayscale-0 transition-all" 
                        alt="QR Thumbnail" 
                      />
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap className="w-12 h-12" />
                    </div>
                    <h3 className="font-bold text-white text-lg font-heading tracking-wide">{purchase.fuelName}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-1">{purchase.stationName} • {purchase.liters}L</p>
                    <div className="text-[10px] mt-2 inline-block px-2 py-0.5 rounded border bg-primary/10 border-primary/20 text-primary font-mono uppercase tracking-wider">
                      {purchase.status}
                    </div>
                  </div>
                </button>
              </DialogPrimitive.Trigger>

              <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background border border-white/10 shadow-2xl">
                <div className="relative">
                   {/* Header */}
                  <div className="h-32 p-6 flex flex-col justify-end relative overflow-hidden">
                     <div className={`absolute inset-0 opacity-20 ${
                        purchase.stationName === 'OKKO' ? 'bg-green-600' :
                        purchase.stationName === 'WOG' ? 'bg-green-500' :
                        purchase.stationName === 'UPG' ? 'bg-emerald-500' :
                        'bg-yellow-500'
                     }`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    
                    <DialogPrimitive.Close className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-white/10 rounded-full transition-colors z-20 text-white">
                      <X className="w-4 h-4" />
                    </DialogPrimitive.Close>
                    
                    <div className="relative z-10">
                      <h2 className="text-4xl font-black text-white font-heading uppercase tracking-tighter">{purchase.stationName}</h2>
                      <p className="text-gray-300 font-mono text-sm">{purchase.fuelName} • {purchase.liters}L</p>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-8 flex flex-col items-center gap-8 bg-background">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full opacity-50 animate-pulse" />
                      <div className="bg-white p-4 rounded-xl shadow-lg relative z-10">
                        {purchase.qrCode && (
                          <img 
                            src={purchase.qrCode.qrCodeUrl} 
                            className="w-56 h-56 mix-blend-multiply filter contrast-125" 
                            alt="QR Code" 
                          />
                        )}
                      </div>
                      {/* Scanner Line Animation */}
                      <div className="absolute top-4 left-4 right-4 h-1 bg-red-500 shadow-[0_0_10px_red] z-20 animate-[scan_2s_ease-in-out_infinite]" />
                    </div>
                    
                    <div className="text-center space-y-2 w-full">
                      <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Identification Sequence</p>
                      <div 
                        onClick={() => copyToClipboard(purchase.id.toString())}
                        className="bg-white/5 border border-white/10 rounded p-3 font-mono font-bold text-lg text-primary flex items-center justify-between gap-2 group cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <span className="truncate">#{purchase.id.toString().padStart(8, '0')}</span>
                        <Copy className="w-4 h-4 text-gray-500 group-hover:text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </DialogPrimitive.Root>
          ))}
        </div>
      )}
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 1rem; opacity: 0; }
          50% { top: calc(100% - 1rem); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
