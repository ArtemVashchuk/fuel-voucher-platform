
import { useState } from "react";
import { Upload, FileUp, Check } from "lucide-react";
import { STATIONS, FUELS } from "@/lib/mock-data";

export default function AdminScreen() {
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    // Mock upload delay
    setTimeout(() => {
      setIsUploading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 text-sm">Upload new QR codes to inventory</p>
      </header>

      <form onSubmit={handleUpload} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Select Station</label>
          <select className="w-full p-3 rounded-xl border border-gray-200 bg-white">
            {STATIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Fuel Type</label>
          <select className="w-full p-3 rounded-xl border border-gray-200 bg-white">
            <option>A-95</option>
            <option>Diesel</option>
            <option>Gas</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Volume</label>
          <select className="w-full p-3 rounded-xl border border-gray-200 bg-white">
            <option>10 L</option>
            <option>20 L</option>
            <option>50 L</option>
          </select>
        </div>

        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <FileUp className="w-6 h-6" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Click to upload CSV/Images</p>
            <p className="text-sm text-gray-400">or drag and drop files here</p>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isUploading}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
            success ? 'bg-green-500' : 'bg-black'
          }`}
        >
          {isUploading ? (
            "Uploading..."
          ) : success ? (
            <>
              <Check className="w-5 h-5" />
              Uploaded Successfully
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload QRs
            </>
          )}
        </button>
      </form>
    </div>
  );
}
