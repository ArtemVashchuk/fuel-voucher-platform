
import { Link, useLocation } from "wouter";
import { Home, QrCode, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative">
      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
        <Link href="/" className={cn("flex flex-col items-center gap-1 transition-colors cursor-pointer", isActive("/") ? "text-primary" : "text-gray-400")}>
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Stations</span>
        </Link>
        
        <Link href="/my-codes" className={cn("flex flex-col items-center gap-1 transition-colors cursor-pointer", isActive("/my-codes") ? "text-primary" : "text-gray-400")}>
          <QrCode className="w-6 h-6" />
          <span className="text-[10px] font-medium">My Codes</span>
        </Link>

        <Link href="/profile" className={cn("flex flex-col items-center gap-1 transition-colors cursor-pointer", isActive("/profile") ? "text-primary" : "text-gray-400")}>
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
