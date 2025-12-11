
import { Link, useLocation } from "wouter";
import { Home, QrCode, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const getCartItemCount = useStore((state) => state.getCartItemCount);
  const cartCount = getCartItemCount();

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-white/5">
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {children}
      </main>

      {/* Floating Glass Navigation */}
      <div className="absolute bottom-6 left-6 right-6 z-50">
        <nav className="glass rounded-2xl px-6 py-4 flex justify-between items-center shadow-2xl border border-white/10 backdrop-blur-xl bg-black/40">
          <Link href="/" className={cn("flex flex-col items-center gap-1 transition-all duration-300", isActive("/") ? "text-primary scale-110" : "text-gray-500 hover:text-gray-300")}>
            <Home className={cn("w-6 h-6", isActive("/") && "drop-shadow-[0_0_8px_rgba(0,255,128,0.6)]")} />
          </Link>
          
          <Link href="/basket" className={cn("flex flex-col items-center gap-1 transition-all duration-300 relative", isActive("/basket") ? "text-primary scale-110" : "text-gray-500 hover:text-gray-300")}>
            <ShoppingCart className={cn("w-6 h-6", isActive("/basket") && "drop-shadow-[0_0_8px_rgba(0,255,128,0.6)]")} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(255,50,50,0.5)]">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
          
          <Link href="/my-codes" className={cn("flex flex-col items-center gap-1 transition-all duration-300", isActive("/my-codes") ? "text-primary scale-110" : "text-gray-500 hover:text-gray-300")}>
            <QrCode className={cn("w-6 h-6", isActive("/my-codes") && "drop-shadow-[0_0_8px_rgba(0,255,128,0.6)]")} />
          </Link>

          <Link href="/profile" className={cn("flex flex-col items-center gap-1 transition-all duration-300", isActive("/profile") ? "text-primary scale-110" : "text-gray-500 hover:text-gray-300")}>
            <User className={cn("w-6 h-6", isActive("/profile") && "drop-shadow-[0_0_8px_rgba(0,255,128,0.6)]")} />
          </Link>
        </nav>
      </div>
    </div>
  );
}
