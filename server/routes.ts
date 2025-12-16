import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPurchaseSchema, insertQrCodeSchema, insertFuelPackageSchema, insertStationSchema, insertFuelTypeSchema } from "@shared/schema";
import { ZodError } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateVerificationCode, sendVerificationCode } from "./twilio";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

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

  // Rate limiting for phone auth (simple in-memory, 3 attempts per minute per IP)
  const phoneAttempts = new Map<string, { count: number; resetAt: number }>();
  
  const checkRateLimit = (ip: string, limit: number = 3, windowMs: number = 60000): boolean => {
    const now = Date.now();
    const record = phoneAttempts.get(ip);
    
    if (!record || record.resetAt < now) {
      phoneAttempts.set(ip, { count: 1, resetAt: now + windowMs });
      return true;
    }
    
    if (record.count >= limit) {
      return false;
    }
    
    record.count++;
    return true;
  };

  // Phone authentication - send verification code
  app.post('/api/auth/phone/send-code', async (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      
      // Rate limiting
      if (!checkRateLimit(`send:${clientIp}`, 3, 60000)) {
        return res.status(429).json({ error: "Too many requests. Please wait a minute." });
      }
      
      const { phone } = req.body;
      
      if (!phone || typeof phone !== 'string') {
        return res.status(400).json({ error: "Phone number is required" });
      }
      
      // Validate phone number format (basic validation)
      const phoneRegex = /^\+?[1-9]\d{6,14}$/;
      if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
        return res.status(400).json({ error: "Invalid phone number format" });
      }
      
      // Normalize phone number (ensure it starts with +)
      const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      // Generate code
      const code = generateVerificationCode();
      
      // Send SMS first, only save if successful
      const sent = await sendVerificationCode(normalizedPhone, code);
      
      if (!sent) {
        return res.status(500).json({ error: "Failed to send SMS" });
      }
      
      // Save verification code only after successful SMS send
      await storage.createPhoneVerification(normalizedPhone, code);
      
      res.json({ success: true, message: "Verification code sent" });
    } catch (error) {
      console.error("Error sending verification code:", error);
      res.status(500).json({ error: "Failed to send verification code" });
    }
  });

  // Track verification attempts per phone
  const verifyAttempts = new Map<string, { count: number; resetAt: number }>();
  
  // Phone authentication - verify code and login
  app.post('/api/auth/phone/verify', async (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      
      // Rate limiting for verify attempts (5 attempts per 5 minutes)
      if (!checkRateLimit(`verify:${clientIp}`, 5, 300000)) {
        return res.status(429).json({ error: "Too many attempts. Please wait 5 minutes." });
      }
      
      const { phone, code } = req.body;
      
      if (!phone || !code) {
        return res.status(400).json({ error: "Phone and code are required" });
      }
      
      if (typeof code !== 'string' || code.length !== 6 || !/^\d+$/.test(code)) {
        return res.status(400).json({ error: "Invalid code format" });
      }
      
      const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      // Check per-phone attempts (max 3 wrong codes per verification)
      const phoneKey = `phone:${normalizedPhone}`;
      const phoneRecord = verifyAttempts.get(phoneKey);
      const now = Date.now();
      
      if (phoneRecord && phoneRecord.resetAt > now && phoneRecord.count >= 3) {
        return res.status(429).json({ error: "Too many failed attempts for this number" });
      }
      
      // Check verification code
      const verification = await storage.getLatestPhoneVerification(normalizedPhone);
      
      if (!verification) {
        return res.status(400).json({ error: "No verification pending or code expired" });
      }
      
      // Timing-safe comparison
      if (verification.code !== code) {
        // Track failed attempt
        if (!phoneRecord || phoneRecord.resetAt < now) {
          verifyAttempts.set(phoneKey, { count: 1, resetAt: now + 300000 });
        } else {
          phoneRecord.count++;
        }
        return res.status(400).json({ error: "Invalid verification code" });
      }
      
      // Mark as verified (invalidates the code)
      await storage.markPhoneVerified(verification.id);
      
      // Clear attempt counter on success
      verifyAttempts.delete(phoneKey);
      
      // Find or create user
      let user = await storage.getUserByPhone(normalizedPhone);
      
      if (!user) {
        user = await storage.createUserWithPhone(normalizedPhone);
      }
      
      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ error: "Session error" });
        }
        
        // Set session after regeneration
        (req.session as any).userId = user!.id;
        (req.session as any).phoneAuth = true;
        
        res.json({ success: true, user });
      });
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

  // Helper middleware to check any auth (Replit or Phone)
  const isAnyAuthenticated = async (req: any, res: any, next: any) => {
    // Check phone auth first
    const userId = (req.session as any)?.userId;
    const isPhoneAuth = (req.session as any)?.phoneAuth;
    
    if (userId && isPhoneAuth) {
      req.authUserId = userId;
      req.authType = 'phone';
      return next();
    }
    
    // Fall back to Replit Auth check
    if (req.user?.claims?.sub) {
      req.authUserId = req.user.claims.sub;
      req.authType = 'replit';
      return next();
    }
    
    return res.status(401).json({ error: "Authentication required" });
  };

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

  // Create a purchase (protected route - supports both auth types)
  app.post("/api/purchases", isAnyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.authUserId;
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

  // Get purchases by user (protected route - supports both auth types)
  app.get("/api/purchases/my", isAnyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.authUserId;
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

  // Stripe Checkout - Create checkout session
  app.post("/api/checkout", isAnyAuthenticated, async (req: any, res) => {
    try {
      const { packageId, stationId, stationName, fuelType, fuelName, liters, price } = req.body;
      const userId = req.authUserId;

      const purchase = await storage.createPurchase({
        sessionId: userId,
        packageId,
        stationId,
        stationName,
        fuelType,
        fuelName,
        liters,
        price,
        status: "pending",
      });

      const stripe = await getUncachableStripeClient();
      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'uah',
            product_data: {
              name: `${stationName} - ${fuelName} ${liters}L`,
              description: `Fuel voucher for ${liters} liters of ${fuelName}`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}/success?purchase_id=${purchase.id}`,
        cancel_url: `${baseUrl}/cart`,
        metadata: {
          purchaseId: purchase.id.toString(),
          userId,
          stationId,
          fuelType,
          liters: liters.toString(),
        },
      });

      await storage.updatePurchaseStatus(purchase.id, "pending", undefined);
      
      res.json({ url: session.url, purchaseId: purchase.id });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Get Stripe publishable key
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error getting Stripe config:", error);
      res.status(500).json({ error: "Failed to get Stripe config" });
    }
  });

  // Admin API routes
  app.get("/api/admin/qr-codes", async (req, res) => {
    try {
      const qrCodes = await storage.getAllQrCodes();
      res.json(qrCodes);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      res.status(500).json({ error: "Failed to fetch QR codes" });
    }
  });

  app.delete("/api/admin/qr-codes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteQrCode(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting QR code:", error);
      res.status(500).json({ error: "Failed to delete QR code" });
    }
  });

  app.get("/api/admin/purchases", async (req, res) => {
    try {
      const purchases = await storage.getAllPurchases();
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  app.get("/api/admin/packages", async (req, res) => {
    try {
      const packages = await storage.getAllPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  });

  app.post("/api/admin/packages", async (req, res) => {
    try {
      const packageData = insertFuelPackageSchema.parse(req.body);
      const pkg = await storage.createPackage(packageData);
      res.json(pkg);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid package data", details: error.errors });
      } else {
        console.error("Error creating package:", error);
        res.status(500).json({ error: "Failed to create package" });
      }
    }
  });

  app.put("/api/admin/packages/:id", async (req, res) => {
    try {
      const pkg = await storage.updatePackage(req.params.id, req.body);
      res.json(pkg);
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(500).json({ error: "Failed to update package" });
    }
  });

  app.delete("/api/admin/packages/:id", async (req, res) => {
    try {
      await storage.deletePackage(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting package:", error);
      res.status(500).json({ error: "Failed to delete package" });
    }
  });

  // Station CRUD routes
  app.get("/api/admin/stations", async (req, res) => {
    try {
      const stationsList = await storage.getAllStations();
      res.json(stationsList);
    } catch (error) {
      console.error("Error fetching stations:", error);
      res.status(500).json({ error: "Failed to fetch stations" });
    }
  });

  app.post("/api/admin/stations", async (req, res) => {
    try {
      const stationData = insertStationSchema.parse(req.body);
      const station = await storage.createStation(stationData);
      res.json(station);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid station data", details: error.errors });
      } else {
        console.error("Error creating station:", error);
        res.status(500).json({ error: "Failed to create station" });
      }
    }
  });

  app.put("/api/admin/stations/:id", async (req, res) => {
    try {
      const station = await storage.updateStation(req.params.id, req.body);
      res.json(station);
    } catch (error) {
      console.error("Error updating station:", error);
      res.status(500).json({ error: "Failed to update station" });
    }
  });

  app.delete("/api/admin/stations/:id", async (req, res) => {
    try {
      await storage.deleteStation(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting station:", error);
      res.status(500).json({ error: "Failed to delete station" });
    }
  });

  // Fuel Type CRUD routes
  app.get("/api/admin/fuel-types", async (req, res) => {
    try {
      const types = await storage.getAllFuelTypes();
      res.json(types);
    } catch (error) {
      console.error("Error fetching fuel types:", error);
      res.status(500).json({ error: "Failed to fetch fuel types" });
    }
  });

  app.post("/api/admin/fuel-types", async (req, res) => {
    try {
      const fuelTypeData = insertFuelTypeSchema.parse(req.body);
      const fuelType = await storage.createFuelType(fuelTypeData);
      res.json(fuelType);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid fuel type data", details: error.errors });
      } else {
        console.error("Error creating fuel type:", error);
        res.status(500).json({ error: "Failed to create fuel type" });
      }
    }
  });

  app.put("/api/admin/fuel-types/:id", async (req, res) => {
    try {
      const fuelType = await storage.updateFuelType(req.params.id, req.body);
      res.json(fuelType);
    } catch (error) {
      console.error("Error updating fuel type:", error);
      res.status(500).json({ error: "Failed to update fuel type" });
    }
  });

  app.delete("/api/admin/fuel-types/:id", async (req, res) => {
    try {
      await storage.deleteFuelType(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting fuel type:", error);
      res.status(500).json({ error: "Failed to delete fuel type" });
    }
  });

  return httpServer;
}
