
import { useLocation } from "wouter";
import { CheckCircle2, QrCode } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function SuccessScreen() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="min-h-screen bg-green-500 text-white flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-white/20 p-6 rounded-full mb-8 animate-in zoom-in duration-500">
        <CheckCircle2 className="w-20 h-20 text-white" />
      </div>

      <h1 className="text-4xl font-black mb-4">Payment<br/>Successful!</h1>
      <p className="text-white/80 text-lg mb-12">
        Your fuel code has been generated and added to your wallet.
      </p>

      <button
        onClick={() => setLocation("/my-codes")}
        className="w-full bg-white text-green-600 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl hover:bg-green-50 transition-colors"
      >
        <QrCode className="w-5 h-5" />
        View My Code
      </button>

      <button
        onClick={() => setLocation("/")}
        className="mt-6 text-white/60 font-medium hover:text-white transition-colors"
      >
        Back to Home
      </button>
    </div>
  );
}
