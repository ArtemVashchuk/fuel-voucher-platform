import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPurchaseSchema, insertQrCodeSchema } from "@shared/schema";
import { ZodError } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateVerificationCode, sendVerificationCode } from "./twilio";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Phone authentication - send verification code
  app.post('/api/auth/phone/send-code', async (req, res) => {
    try {
      const { phone } = req.body;
      
      if (!phone || typeof phone !== 'string') {
        return res.status(400).json({ error: "Phone number is required" });
      }
      
      // Normalize phone number (ensure it starts with +)
      const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      // Generate code and save to database
      const code = generateVerificationCode();
      await storage.createPhoneVerification(normalizedPhone, code);
      
      // Send SMS
      const sent = await sendVerificationCode(normalizedPhone, code);
      
      if (!sent) {
        return res.status(500).json({ error: "Failed to send SMS" });
      }
      
      res.json({ success: true, message: "Verification code sent" });
    } catch (error) {
      console.error("Error sending verification code:", error);
      res.status(500).json({ error: "Failed to send verification code" });
    }
  });

  // Phone authentication - verify code and login
  app.post('/api/auth/phone/verify', async (req, res) => {
    try {
      const { phone, code } = req.body;
      
      if (!phone || !code) {
        return res.status(400).json({ error: "Phone and code are required" });
      }
      
      const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      // Check verification code
      const verification = await storage.getLatestPhoneVerification(normalizedPhone);
      
      if (!verification) {
        return res.status(400).json({ error: "No verification pending or code expired" });
      }
      
      if (verification.code !== code) {
        return res.status(400).json({ error: "Invalid verification code" });
      }
      
      // Mark as verified
      await storage.markPhoneVerified(verification.id);
      
      // Find or create user
      let user = await storage.getUserByPhone(normalizedPhone);
      
      if (!user) {
        user = await storage.createUserWithPhone(normalizedPhone);
      }
      
      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).phoneAuth = true;
      
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error verifying code:", error);
      res.status(500).json({ error: "Failed to verify code" });
    }
  });

  // Get current user for phone auth
  app.get('/api/auth/phone/user', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const isPhoneAuth = (req.session as any)?.phoneAuth;
      
      if (!userId || !isPhoneAuth) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching phone auth user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Phone auth logout
  app.post('/api/auth/phone/logout', async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.json({ success: true });
      });
    } catch (error) {
      console.error("Error logging out:", error);
      res.status(500).json({ error: "Failed to logout" });
    }
  });

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

  // Create a purchase (protected route)
  app.post("/api/purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchaseData = insertPurchaseSchema.parse({
        ...req.body,
        sessionId: userId, // Use user ID instead of session ID
      });
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

  // Get purchases by user (protected route)
  app.get("/api/purchases/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchases = await storage.getPurchasesBySession(userId);
      
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

  // Legacy: Get purchases by session (for backwards compatibility)
  app.get("/api/purchases/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const purchases = await storage.getPurchasesBySession(sessionId);
      
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
        purchase.packageId.split("-")[1],
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
