import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Trash2, Package, QrCode, ShoppingCart, Plus } from "lucide-react";
import { STATIONS } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

type QrCodeType = {
  id: number;
  stationId: string;
  fuelType: string;
  liters: number;
  qrCodeUrl: string;
  status: string;
  purchaseId: number | null;
  createdAt: string;
};

type PurchaseType = {
  id: number;
  sessionId: string;
  packageId: string;
  stationName: string;
  fuelName: string;
  liters: number;
  price: number;
  status: string;
  createdAt: string;
};

type PackageType = {
  id: string;
  stationId: string;
  fuelTypeId: string;
  fuelName: string;
  liters: number;
  price: number;
  originalPrice: number;
};

export default function AdminScreen() {
  const queryClient = useQueryClient();
  const [newQr, setNewQr] = useState({ stationId: "okko", fuelType: "a95", liters: 10, qrCodeUrl: "" });
  const [newPackage, setNewPackage] = useState({ id: "", stationId: "okko", fuelTypeId: "a95", fuelName: "A-95", liters: 10, price: 0, originalPrice: 0 });

  const { data: qrCodes = [] } = useQuery<QrCodeType[]>({
    queryKey: ["/api/admin/qr-codes"],
  });

  const { data: purchases = [] } = useQuery<PurchaseType[]>({
    queryKey: ["/api/admin/purchases"],
  });

  const { data: packages = [] } = useQuery<PackageType[]>({
    queryKey: ["/api/admin/packages"],
  });

  const createQrMutation = useMutation({
    mutationFn: async (data: typeof newQr) => {
      const res = await apiRequest("POST", "/api/qr-codes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/qr-codes"] });
      setNewQr({ ...newQr, qrCodeUrl: "" });
    },
  });

  const deleteQrMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/qr-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/qr-codes"] });
    },
  });

  const createPackageMutation = useMutation({
    mutationFn: async (data: typeof newPackage) => {
      const res = await apiRequest("POST", "/api/admin/packages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
      setNewPackage({ id: "", stationId: "okko", fuelTypeId: "a95", fuelName: "A-95", liters: 10, price: 0, originalPrice: 0 });
    },
  });

  const fuelTypes = [
    { id: "a95", name: "A-95" },
    { id: "a92", name: "A-92" },
    { id: "diesel", name: "Diesel" },
    { id: "gas", name: "LPG Gas" },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary font-heading">ADMIN PANEL</h1>
        <p className="text-gray-400">Manage QR codes, packages, and view purchases</p>
      </header>

      <Tabs defaultValue="qrcodes" className="space-y-6">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="qrcodes" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <QrCode className="w-4 h-4 mr-2" />
            QR Codes
          </TabsTrigger>
          <TabsTrigger value="packages" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <Package className="w-4 h-4 mr-2" />
            Packages
          </TabsTrigger>
          <TabsTrigger value="purchases" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Purchases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qrcodes" className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Add New QR Code</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <select
                value={newQr.stationId}
                onChange={(e) => setNewQr({ ...newQr, stationId: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                data-testid="select-station"
              >
                {STATIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={newQr.fuelType}
                onChange={(e) => setNewQr({ ...newQr, fuelType: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                data-testid="select-fuel"
              >
                {fuelTypes.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <select
                value={newQr.liters}
                onChange={(e) => setNewQr({ ...newQr, liters: parseInt(e.target.value) })}
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                data-testid="select-liters"
              >
                <option value={10}>10 L</option>
                <option value={20}>20 L</option>
                <option value={50}>50 L</option>
              </select>
              <Input
                placeholder="QR Code URL"
                value={newQr.qrCodeUrl}
                onChange={(e) => setNewQr({ ...newQr, qrCodeUrl: e.target.value })}
                className="bg-gray-800 border-gray-700"
                data-testid="input-qr-url"
              />
              <Button
                onClick={() => createQrMutation.mutate(newQr)}
                disabled={!newQr.qrCodeUrl || createQrMutation.isPending}
                className="bg-primary text-black hover:bg-primary/80"
                data-testid="button-add-qr"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add QR
              </Button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Station</th>
                  <th className="text-left p-4">Fuel</th>
                  <th className="text-left p-4">Liters</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.map((qr) => (
                  <tr key={qr.id} className="border-t border-gray-800" data-testid={`row-qr-${qr.id}`}>
                    <td className="p-4">{qr.id}</td>
                    <td className="p-4">{qr.stationId}</td>
                    <td className="p-4">{qr.fuelType}</td>
                    <td className="p-4">{qr.liters}L</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${qr.status === "available" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {qr.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQrMutation.mutate(qr.id)}
                        disabled={qr.status === "sold"}
                        className="text-red-400 hover:text-red-300"
                        data-testid={`button-delete-qr-${qr.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {qrCodes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No QR codes yet. Add some above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Add New Package</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                placeholder="Package ID (e.g. okko_a95_10)"
                value={newPackage.id}
                onChange={(e) => setNewPackage({ ...newPackage, id: e.target.value })}
                className="bg-gray-800 border-gray-700"
                data-testid="input-package-id"
              />
              <select
                value={newPackage.stationId}
                onChange={(e) => setNewPackage({ ...newPackage, stationId: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
              >
                {STATIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={newPackage.fuelTypeId}
                onChange={(e) => {
                  const fuel = fuelTypes.find(f => f.id === e.target.value);
                  setNewPackage({ ...newPackage, fuelTypeId: e.target.value, fuelName: fuel?.name || "" });
                }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
              >
                {fuelTypes.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <select
                value={newPackage.liters}
                onChange={(e) => setNewPackage({ ...newPackage, liters: parseInt(e.target.value) })}
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
              >
                <option value={10}>10 L</option>
                <option value={20}>20 L</option>
                <option value={50}>50 L</option>
              </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <Input
                type="number"
                placeholder="Price (UAH)"
                value={newPackage.price || ""}
                onChange={(e) => setNewPackage({ ...newPackage, price: parseInt(e.target.value) || 0 })}
                className="bg-gray-800 border-gray-700"
                data-testid="input-package-price"
              />
              <Input
                type="number"
                placeholder="Original Price (UAH)"
                value={newPackage.originalPrice || ""}
                onChange={(e) => setNewPackage({ ...newPackage, originalPrice: parseInt(e.target.value) || 0 })}
                className="bg-gray-800 border-gray-700"
                data-testid="input-package-original-price"
              />
              <Button
                onClick={() => createPackageMutation.mutate(newPackage)}
                disabled={!newPackage.id || !newPackage.price || createPackageMutation.isPending}
                className="bg-primary text-black hover:bg-primary/80"
                data-testid="button-add-package"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Package
              </Button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Station</th>
                  <th className="text-left p-4">Fuel</th>
                  <th className="text-left p-4">Liters</th>
                  <th className="text-left p-4">Price</th>
                  <th className="text-left p-4">Original</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-t border-gray-800" data-testid={`row-package-${pkg.id}`}>
                    <td className="p-4 font-mono text-sm">{pkg.id}</td>
                    <td className="p-4">{pkg.stationId}</td>
                    <td className="p-4">{pkg.fuelName}</td>
                    <td className="p-4">{pkg.liters}L</td>
                    <td className="p-4 text-primary font-bold">{pkg.price} UAH</td>
                    <td className="p-4 text-gray-500 line-through">{pkg.originalPrice} UAH</td>
                  </tr>
                ))}
                {packages.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No packages yet. Add some above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Station</th>
                  <th className="text-left p-4">Fuel</th>
                  <th className="text-left p-4">Liters</th>
                  <th className="text-left p-4">Price</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-t border-gray-800" data-testid={`row-purchase-${purchase.id}`}>
                    <td className="p-4">{purchase.id}</td>
                    <td className="p-4">{purchase.stationName}</td>
                    <td className="p-4">{purchase.fuelName}</td>
                    <td className="p-4">{purchase.liters}L</td>
                    <td className="p-4 text-primary font-bold">{purchase.price} UAH</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        purchase.status === "delivered" ? "bg-green-500/20 text-green-400" :
                        purchase.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No purchases yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
