import { db } from "./db";
import { eq, and, gt, desc } from "drizzle-orm";
import {
  type QrCode,
  type InsertQrCode,
  type Purchase,
  type InsertPurchase,
  type FuelPackage,
  type InsertFuelPackage,
  type User,
  type UpsertUser,
  type PhoneVerification,
  type InsertPhoneVerification,
  qrCodes,
  purchases,
  fuelPackages,
  users,
  phoneVerifications,
} from "@shared/schema";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUserWithPhone(phone: string): Promise<User>;
  
  // Phone verification
  createPhoneVerification(phone: string, code: string): Promise<PhoneVerification>;
  getLatestPhoneVerification(phone: string): Promise<PhoneVerification | undefined>;
  markPhoneVerified(id: number): Promise<void>;
  
  // QR Code Management
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  getAvailableQrCode(stationId: string, fuelType: string, liters: number): Promise<QrCode | undefined>;
  markQrCodeAsSold(qrCodeId: number, purchaseId: number): Promise<void>;
  
  // Purchase Management
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  getPurchaseByStripeSession(stripeSessionId: string): Promise<Purchase | undefined>;
  getPurchasesBySession(sessionId: string): Promise<Purchase[]>;
  updatePurchaseStatus(id: number, status: string, qrCodeId?: number): Promise<void>;
  
  // Fuel Packages
  getAllPackages(): Promise<FuelPackage[]>;
  getPackagesByStation(stationId: string): Promise<FuelPackage[]>;
  createPackage(pkg: InsertFuelPackage): Promise<FuelPackage>;
  
  // Get purchase with QR code details
  getPurchaseWithQrCode(purchaseId: number): Promise<(Purchase & { qrCode?: QrCode }) | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User Methods (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createUserWithPhone(phone: string): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ phone })
      .returning();
    return user;
  }

  // Phone Verification Methods
  async createPhoneVerification(phone: string, code: string): Promise<PhoneVerification> {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const [verification] = await db
      .insert(phoneVerifications)
      .values({ phone, code, expiresAt })
      .returning();
    return verification;
  }

  async getLatestPhoneVerification(phone: string): Promise<PhoneVerification | undefined> {
    const [verification] = await db
      .select()
      .from(phoneVerifications)
      .where(
        and(
          eq(phoneVerifications.phone, phone),
          gt(phoneVerifications.expiresAt, new Date()),
          eq(phoneVerifications.verified, 0)
        )
      )
      .orderBy(desc(phoneVerifications.createdAt))
      .limit(1);
    return verification;
  }

  async markPhoneVerified(id: number): Promise<void> {
    await db
      .update(phoneVerifications)
      .set({ verified: 1 })
      .where(eq(phoneVerifications.id, id));
  }

  // QR Code Methods
  async createQrCode(qrCode: InsertQrCode): Promise<QrCode> {
    const [created] = await db.insert(qrCodes).values(qrCode).returning();
    return created;
  }

  async getAvailableQrCode(stationId: string, fuelType: string, liters: number): Promise<QrCode | undefined> {
    const [qrCode] = await db
      .select()
      .from(qrCodes)
      .where(
        and(
          eq(qrCodes.stationId, stationId),
          eq(qrCodes.fuelType, fuelType),
          eq(qrCodes.liters, liters),
          eq(qrCodes.status, "available")
        )
      )
      .limit(1);
    return qrCode;
  }

  async markQrCodeAsSold(qrCodeId: number, purchaseId: number): Promise<void> {
    await db
      .update(qrCodes)
      .set({ status: "sold", purchaseId })
      .where(eq(qrCodes.id, qrCodeId));
  }

  // Purchase Methods
  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [created] = await db.insert(purchases).values(purchase).returning();
    return created;
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase;
  }

  async getPurchaseByStripeSession(stripeSessionId: string): Promise<Purchase | undefined> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.stripeSessionId, stripeSessionId));
    return purchase;
  }

  async getPurchasesBySession(sessionId: string): Promise<Purchase[]> {
    return await db
      .select()
      .from(purchases)
      .where(eq(purchases.sessionId, sessionId))
      .orderBy(purchases.createdAt);
  }

  async updatePurchaseStatus(id: number, status: string, qrCodeId?: number): Promise<void> {
    const updates: any = { status };
    if (qrCodeId !== undefined) {
      updates.qrCodeId = qrCodeId;
    }
    await db.update(purchases).set(updates).where(eq(purchases.id, id));
  }

  async getPurchaseWithQrCode(purchaseId: number): Promise<(Purchase & { qrCode?: QrCode }) | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, purchaseId));
    if (!purchase) return undefined;

    if (purchase.qrCodeId) {
      const [qrCode] = await db.select().from(qrCodes).where(eq(qrCodes.id, purchase.qrCodeId));
      return { ...purchase, qrCode };
    }

    return purchase;
  }

  // Fuel Package Methods
  async getAllPackages(): Promise<FuelPackage[]> {
    return await db.select().from(fuelPackages);
  }

  async getPackagesByStation(stationId: string): Promise<FuelPackage[]> {
    return await db.select().from(fuelPackages).where(eq(fuelPackages.stationId, stationId));
  }

  async createPackage(pkg: InsertFuelPackage): Promise<FuelPackage> {
    const [created] = await db.insert(fuelPackages).values(pkg).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
