import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPurchaseSchema, insertQrCodeSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all fuel packages
  app.get("/api/packages", async (req, res) => {
    try {
      const packages = await storage.getAllPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  });

  // Get packages by station
  app.get("/api/packages/station/:stationId", async (req, res) => {
    try {
      const { stationId } = req.params;
      const packages = await storage.getPackagesByStation(stationId);
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages by station:", error);
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  });

  // Create a purchase (without Stripe for now)
  app.post("/api/purchases", async (req, res) => {
    try {
      const purchaseData = insertPurchaseSchema.parse(req.body);
      const purchase = await storage.createPurchase(purchaseData);
      res.json(purchase);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid purchase data", details: error.errors });
      } else {
        console.error("Error creating purchase:", error);
        res.status(500).json({ error: "Failed to create purchase" });
      }
    }
  });

  // Get purchases by session
  app.get("/api/purchases/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const purchases = await storage.getPurchasesBySession(sessionId);
      
      // Fetch QR codes for delivered purchases
      const purchasesWithQr = await Promise.all(
        purchases.map(async (purchase) => {
          if (purchase.qrCodeId && purchase.status === "delivered") {
            const fullPurchase = await storage.getPurchaseWithQrCode(purchase.id);
            return fullPurchase || purchase;
          }
          return purchase;
        })
      );
      
      res.json(purchasesWithQr);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  // Complete a purchase (find and assign QR code)
  app.post("/api/purchases/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const purchaseId = parseInt(id);
      
      const purchase = await storage.getPurchase(purchaseId);
      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }

      // Find an available QR code matching the purchase criteria
      const availableQr = await storage.getAvailableQrCode(
        purchase.packageId.split("-")[1], // Extract station ID from package ID
        purchase.fuelName,
        purchase.liters
      );

      if (!availableQr) {
        return res.status(404).json({ error: "No QR codes available for this package" });
      }

      // Assign QR code to purchase
      await storage.markQrCodeAsSold(availableQr.id, purchaseId);
      await storage.updatePurchaseStatus(purchaseId, "delivered", availableQr.id);

      const updatedPurchase = await storage.getPurchaseWithQrCode(purchaseId);
      res.json(updatedPurchase);
    } catch (error) {
      console.error("Error completing purchase:", error);
      res.status(500).json({ error: "Failed to complete purchase" });
    }
  });

  // Upload QR codes (admin endpoint)
  app.post("/api/qr-codes", async (req, res) => {
    try {
      const qrCodeData = insertQrCodeSchema.parse(req.body);
      const qrCode = await storage.createQrCode(qrCodeData);
      res.json(qrCode);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid QR code data", details: error.errors });
      } else {
        console.error("Error creating QR code:", error);
        res.status(500).json({ error: "Failed to create QR code" });
      }
    }
  });

  // Bulk upload QR codes
  app.post("/api/qr-codes/bulk", async (req, res) => {
    try {
      const { qrCodes } = req.body;
      if (!Array.isArray(qrCodes)) {
        return res.status(400).json({ error: "qrCodes must be an array" });
      }

      const created = await Promise.all(
        qrCodes.map(async (qr) => {
          const validatedQr = insertQrCodeSchema.parse(qr);
          return await storage.createQrCode(validatedQr);
        })
      );

      res.json({ count: created.length, qrCodes: created });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid QR code data", details: error.errors });
      } else {
        console.error("Error bulk creating QR codes:", error);
        res.status(500).json({ error: "Failed to bulk create QR codes" });
      }
    }
  });

  return httpServer;
}
