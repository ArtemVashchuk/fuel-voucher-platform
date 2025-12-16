import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Package, QrCode, ShoppingCart, Plus, Building, Fuel, Edit2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/utils";

type StationType = {
  id: string;
  name: string;
  color: string;
  logoText: string;
  createdAt: string;
};

type FuelTypeType = {
  id: string;
  name: string;
  stationId: string;
  basePrice: number;
  discountPrice: number;
  createdAt: string;
};

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
  
  const [newStation, setNewStation] = useState({ id: "", name: "", color: "#00ff80", logoText: "" });
  const [editingStation, setEditingStation] = useState<StationType | null>(null);
  const [newFuelType, setNewFuelType] = useState({ id: "", name: "", stationId: "", basePrice: 0, discountPrice: 0 });
  const [editingFuelType, setEditingFuelType] = useState<FuelTypeType | null>(null);
  const [newQr, setNewQr] = useState({ stationId: "", fuelType: "", liters: 10, qrCodeUrl: "" });
  const [newPackage, setNewPackage] = useState({ id: "", stationId: "", fuelTypeId: "", fuelName: "", liters: 10, price: 0, originalPrice: 0 });

  const { data: stationsList = [] } = useQuery<StationType[]>({
    queryKey: ["/api/admin/stations"],
  });

  const { data: fuelTypesList = [] } = useQuery<FuelTypeType[]>({
    queryKey: ["/api/admin/fuel-types"],
  });

  const { data: qrCodes = [] } = useQuery<QrCodeType[]>({
    queryKey: ["/api/admin/qr-codes"],
  });

  const { data: purchases = [] } = useQuery<PurchaseType[]>({
    queryKey: ["/api/admin/purchases"],
  });

  const { data: packages = [] } = useQuery<PackageType[]>({
    queryKey: ["/api/admin/packages"],
  });

  const createStationMutation = useMutation({
    mutationFn: async (data: typeof newStation) => {
      const res = await apiRequest("POST", "/api/admin/stations", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stations"] });
      setNewStation({ id: "", name: "", color: "#00ff80", logoText: "" });
    },
  });

  const deleteStationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/stations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stations"] });
    },
  });

  const createFuelTypeMutation = useMutation({
    mutationFn: async (data: typeof newFuelType) => {
      const res = await apiRequest("POST", "/api/admin/fuel-types", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fuel-types"] });
      setNewFuelType({ id: "", name: "", stationId: "", basePrice: 0, discountPrice: 0 });
    },
  });

  const deleteFuelTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/fuel-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fuel-types"] });
    },
  });

  const updateStationMutation = useMutation({
    mutationFn: async (data: StationType) => {
      const res = await apiRequest("PUT", `/api/admin/stations/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stations"] });
      setEditingStation(null);
    },
  });

  const updateFuelTypeMutation = useMutation({
    mutationFn: async (data: FuelTypeType) => {
      const res = await apiRequest("PUT", `/api/admin/fuel-types/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fuel-types"] });
      setEditingFuelType(null);
    },
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
      setNewPackage({ id: "", stationId: "", fuelTypeId: "", fuelName: "", liters: 10, price: 0, originalPrice: 0 });
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/packages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
    },
  });

  const availableQrs = qrCodes.filter(q => q.status === "available");
  const soldQrs = qrCodes.filter(q => q.status === "sold");

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary font-heading">ADMIN PANEL</h1>
        <p className="text-gray-400">Manage stations, fuel types, QR codes, packages, and view purchases</p>
      </header>

      <Tabs defaultValue="stations" className="space-y-6">
        <TabsList className="bg-gray-900 border border-gray-800 flex-wrap">
          <TabsTrigger value="stations" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <Building className="w-4 h-4 mr-2" />
            Stations
          </TabsTrigger>
          <TabsTrigger value="fueltypes" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <Fuel className="w-4 h-4 mr-2" />
            Fuel Types
          </TabsTrigger>
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

        <TabsContent value="stations" className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Add New Station</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Input
                placeholder="Station ID (e.g. okko)"
                value={newStation.id}
                onChange={(e) => setNewStation({ ...newStation, id: e.target.value.toLowerCase() })}
                className="bg-gray-800 border-gray-700"
                data-testid="input-station-id"
              />
              <Input
                placeholder="Station Name (e.g. OKKO)"
                value={newStation.name}
                onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                className="bg-gray-800 border-gray-700"
                data-testid="input-station-name"
              />
              <Input
                placeholder="Logo Text"
                value={newStation.logoText}
                onChange={(e) => setNewStation({ ...newStation, logoText: e.target.value })}
                className="bg-gray-800 border-gray-700"
                data-testid="input-station-logo"
              />
              <Input
                type="color"
                value={newStation.color}
                onChange={(e) => setNewStation({ ...newStation, color: e.target.value })}
                className="bg-gray-800 border-gray-700 h-10"
                data-testid="input-station-color"
              />
              <Button
                onClick={() => createStationMutation.mutate(newStation)}
                disabled={!newStation.id || !newStation.name || createStationMutation.isPending}
                className="bg-primary text-black hover:bg-primary/80"
                data-testid="button-add-station"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Station
              </Button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Logo</th>
                  <th className="text-left p-4">Color</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stationsList.map((station) => (
                  editingStation?.id === station.id ? (
                    <tr key={station.id} className="border-t border-gray-800 bg-gray-800/50" data-testid={`row-station-${station.id}-editing`}>
                      <td className="p-4 font-mono">{station.id}</td>
                      <td className="p-2">
                        <Input
                          value={editingStation.name}
                          onChange={(e) => setEditingStation({ ...editingStation, name: e.target.value })}
                          className="bg-gray-700 border-gray-600"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={editingStation.logoText}
                          onChange={(e) => setEditingStation({ ...editingStation, logoText: e.target.value })}
                          className="bg-gray-700 border-gray-600"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="color"
                          value={editingStation.color}
                          onChange={(e) => setEditingStation({ ...editingStation, color: e.target.value })}
                          className="bg-gray-700 border-gray-600 h-8 w-12"
                        />
                      </td>
                      <td className="p-4 flex gap-2">
                        <Button size="sm" onClick={() => updateStationMutation.mutate(editingStation)} className="bg-primary text-black">Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingStation(null)}>Cancel</Button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={station.id} className="border-t border-gray-800" data-testid={`row-station-${station.id}`}>
                      <td className="p-4 font-mono">{station.id}</td>
                      <td className="p-4 font-bold">{station.name}</td>
                      <td className="p-4">{station.logoText}</td>
                      <td className="p-4">
                        <span className="inline-block w-6 h-6 rounded" style={{ backgroundColor: station.color }}></span>
                      </td>
                      <td className="p-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStation(station)}
                          className="text-blue-400 hover:text-blue-300"
                          data-testid={`button-edit-station-${station.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteStationMutation.mutate(station.id)}
                          className="text-red-400 hover:text-red-300"
                          data-testid={`button-delete-station-${station.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                ))}
                {stationsList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No stations yet. Add some above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="fueltypes" className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Add New Fuel Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Input
                placeholder="Fuel ID (e.g. a95)"
                value={newFuelType.id}
                onChange={(e) => setNewFuelType({ ...newFuelType, id: e.target.value.toLowerCase() })}
                className="bg-gray-800 border-gray-700"
                data-testid="input-fuel-id"
              />
              <Input
                placeholder="Name (e.g. A-95)"
                value={newFuelType.name}
                onChange={(e) => setNewFuelType({ ...newFuelType, name: e.target.value })}
                className="bg-gray-800 border-gray-700"
                data-testid="input-fuel-name"
              />
              <select
                value={newFuelType.stationId}
                onChange={(e) => setNewFuelType({ ...newFuelType, stationId: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                data-testid="select-fuel-station"
              >
                <option value="">Select Station</option>
                {stationsList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Base Price"
                value={newFuelType.basePrice || ""}
                onChange={(e) => setNewFuelType({ ...newFuelType, basePrice: parseInt(e.target.value) || 0 })}
                className="bg-gray-800 border-gray-700"
                data-testid="input-fuel-base-price"
              />
              <Input
                type="number"
                placeholder="Discount Price"
                value={newFuelType.discountPrice || ""}
                onChange={(e) => setNewFuelType({ ...newFuelType, discountPrice: parseInt(e.target.value) || 0 })}
                className="bg-gray-800 border-gray-700"
                data-testid="input-fuel-discount-price"
              />
              <Button
                onClick={() => createFuelTypeMutation.mutate(newFuelType)}
                disabled={!newFuelType.id || !newFuelType.name || !newFuelType.stationId || createFuelTypeMutation.isPending}
                className="bg-primary text-black hover:bg-primary/80"
                data-testid="button-add-fuel-type"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Station</th>
                  <th className="text-left p-4">Base Price</th>
                  <th className="text-left p-4">Discount Price</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fuelTypesList.map((fuel) => (
                  editingFuelType?.id === fuel.id ? (
                    <tr key={fuel.id} className="border-t border-gray-800 bg-gray-800/50" data-testid={`row-fuel-${fuel.id}-editing`}>
                      <td className="p-4 font-mono">{fuel.id}</td>
                      <td className="p-2">
                        <Input
                          value={editingFuelType.name}
                          onChange={(e) => setEditingFuelType({ ...editingFuelType, name: e.target.value })}
                          className="bg-gray-700 border-gray-600"
                        />
                      </td>
                      <td className="p-4">{stationsList.find(s => s.id === fuel.stationId)?.name || fuel.stationId}</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={editingFuelType.basePrice}
                          onChange={(e) => setEditingFuelType({ ...editingFuelType, basePrice: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700 border-gray-600 w-24"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={editingFuelType.discountPrice}
                          onChange={(e) => setEditingFuelType({ ...editingFuelType, discountPrice: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700 border-gray-600 w-24"
                        />
                      </td>
                      <td className="p-4 flex gap-2">
                        <Button size="sm" onClick={() => updateFuelTypeMutation.mutate(editingFuelType)} className="bg-primary text-black">Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingFuelType(null)}>Cancel</Button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={fuel.id} className="border-t border-gray-800" data-testid={`row-fuel-${fuel.id}`}>
                      <td className="p-4 font-mono">{fuel.id}</td>
                      <td className="p-4 font-bold">{fuel.name}</td>
                      <td className="p-4">{stationsList.find(s => s.id === fuel.stationId)?.name || fuel.stationId}</td>
                      <td className="p-4 text-gray-400">{fuel.basePrice} UAH</td>
                      <td className="p-4 text-primary font-bold">{fuel.discountPrice} UAH</td>
                      <td className="p-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingFuelType(fuel)}
                          className="text-blue-400 hover:text-blue-300"
                          data-testid={`button-edit-fuel-${fuel.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFuelTypeMutation.mutate(fuel.id)}
                          className="text-red-400 hover:text-red-300"
                          data-testid={`button-delete-fuel-${fuel.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                ))}
                {fuelTypesList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No fuel types yet. Add some above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="qrcodes" className="space-y-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-400">{availableQrs.length}</div>
              <div className="text-gray-400">Available QRs</div>
            </div>
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
              <div className="text-3xl font-bold text-red-400">{soldQrs.length}</div>
              <div className="text-gray-400">Sold QRs</div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Add New QR Code</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <select
                value={newQr.stationId}
                onChange={(e) => setNewQr({ ...newQr, stationId: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                data-testid="select-qr-station"
              >
                <option value="">Select Station</option>
                {stationsList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={newQr.fuelType}
                onChange={(e) => setNewQr({ ...newQr, fuelType: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                data-testid="select-qr-fuel"
              >
                <option value="">Select Fuel</option>
                {fuelTypesList
                  .filter(f => !newQr.stationId || f.stationId === newQr.stationId)
                  .map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
              </select>
              <select
                value={newQr.liters}
                onChange={(e) => setNewQr({ ...newQr, liters: parseInt(e.target.value) })}
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                data-testid="select-qr-liters"
              >
                <option value={10}>10 L</option>
                <option value={20}>20 L</option>
                <option value={50}>50 L</option>
              </select>
              <Input
                placeholder="QR Code URL or Image URL"
                value={newQr.qrCodeUrl}
                onChange={(e) => setNewQr({ ...newQr, qrCodeUrl: e.target.value })}
                className="bg-gray-800 border-gray-700"
                data-testid="input-qr-url"
              />
              <Button
                onClick={() => createQrMutation.mutate(newQr)}
                disabled={!newQr.stationId || !newQr.fuelType || !newQr.qrCodeUrl || createQrMutation.isPending}
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
                  <th className="text-left p-4">QR Preview</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.map((qr) => (
                  <tr key={qr.id} className="border-t border-gray-800" data-testid={`row-qr-${qr.id}`}>
                    <td className="p-4">{qr.id}</td>
                    <td className="p-4">{stationsList.find(s => s.id === qr.stationId)?.name || qr.stationId}</td>
                    <td className="p-4">{fuelTypesList.find(f => f.id === qr.fuelType)?.name || qr.fuelType}</td>
                    <td className="p-4">{qr.liters}L</td>
                    <td className="p-4">
                      {qr.qrCodeUrl.startsWith("http") ? (
                        <img src={qr.qrCodeUrl} alt="QR" className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <span className="text-xs text-gray-500 truncate max-w-[100px] block">{qr.qrCodeUrl}</span>
                      )}
                    </td>
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
                    <td colSpan={7} className="p-8 text-center text-gray-500">
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
                data-testid="select-package-station"
              >
                <option value="">Select Station</option>
                {stationsList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={newPackage.fuelTypeId}
                onChange={(e) => {
                  const fuel = fuelTypesList.find(f => f.id === e.target.value);
                  setNewPackage({ ...newPackage, fuelTypeId: e.target.value, fuelName: fuel?.name || "" });
                }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                data-testid="select-package-fuel"
              >
                <option value="">Select Fuel</option>
                {fuelTypesList
                  .filter(f => !newPackage.stationId || f.stationId === newPackage.stationId)
                  .map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
              </select>
              <select
                value={newPackage.liters}
                onChange={(e) => setNewPackage({ ...newPackage, liters: parseInt(e.target.value) })}
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                data-testid="select-package-liters"
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
                disabled={!newPackage.id || !newPackage.stationId || !newPackage.price || createPackageMutation.isPending}
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
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-t border-gray-800" data-testid={`row-package-${pkg.id}`}>
                    <td className="p-4 font-mono text-sm">{pkg.id}</td>
                    <td className="p-4">{stationsList.find(s => s.id === pkg.stationId)?.name || pkg.stationId}</td>
                    <td className="p-4">{pkg.fuelName}</td>
                    <td className="p-4">{pkg.liters}L</td>
                    <td className="p-4 text-primary font-bold">{pkg.price} UAH</td>
                    <td className="p-4 text-gray-500 line-through">{pkg.originalPrice} UAH</td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePackageMutation.mutate(pkg.id)}
                        className="text-red-400 hover:text-red-300"
                        data-testid={`button-delete-package-${pkg.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {packages.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
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
                        purchase.status === "pending_qr" ? "bg-orange-500/20 text-orange-400" :
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
