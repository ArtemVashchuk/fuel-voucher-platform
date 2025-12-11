
import { useLocation } from "wouter";
import { CheckCircle2, QrCode, Zap } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function SuccessScreen() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Neon confetti
    const colors = ['#00ffaa', '#00cc88', '#ffffff'];
    
    const end = Date.now() + 1000;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[100px] rounded-full" />

      <div className="relative z-10">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/50 shadow-[0_0_30px_rgba(var(--primary),0.3)] animate-in zoom-in duration-500">
          <CheckCircle2 className="w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
        </div>

        <h1 className="text-5xl font-black mb-4 text-white font-heading tracking-tighter uppercase text-glow">
          Transaction<br/>Complete
        </h1>
        <p className="text-gray-400 text-sm font-mono tracking-widest uppercase mb-12">
          Assets transferred to secure wallet
        </p>

        <button
          onClick={() => setLocation("/my-codes")}
          className="w-full bg-primary text-black py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:bg-primary/90 transition-all font-heading tracking-wider uppercase"
        >
          <QrCode className="w-5 h-5" />
          Access Wallet
        </button>

        <button
          onClick={() => setLocation("/")}
          className="mt-8 text-gray-500 text-xs font-mono uppercase tracking-widest hover:text-white transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
