import { db } from "./db";
import { eq, and, gt, desc } from "drizzle-orm";
import {
  type QrCode,
  type InsertQrCode,
  type Purchase,
  type InsertPurchase,
  type FuelPackage,
  type InsertFuelPackage,
  type Station,
  type InsertStation,
  type FuelType,
  type InsertFuelType,
  type User,
  type UpsertUser,
  type PhoneVerification,
  type InsertPhoneVerification,
  qrCodes,
  purchases,
  fuelPackages,
  stations,
  fuelTypes,
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
  
  // QR Assignment
  findAvailableQrCode(stationId: string, fuelType: string, liters: number): Promise<QrCode | undefined>;
  assignQrToPurchase(purchaseId: number, qrCodeId: number): Promise<void>;
  
  // Admin operations
  getAllQrCodes(): Promise<QrCode[]>;
  getAllPurchases(): Promise<Purchase[]>;
  deleteQrCode(id: number): Promise<void>;
  updateQrCode(id: number, data: Partial<InsertQrCode>): Promise<QrCode>;
  
  // Station operations
  getAllStations(): Promise<Station[]>;
  getStation(id: string): Promise<Station | undefined>;
  createStation(station: InsertStation): Promise<Station>;
  updateStation(id: string, data: Partial<InsertStation>): Promise<Station>;
  deleteStation(id: string): Promise<void>;
  
  // Fuel Type operations
  getAllFuelTypes(): Promise<FuelType[]>;
  getFuelTypesByStation(stationId: string): Promise<FuelType[]>;
  createFuelType(fuelType: InsertFuelType): Promise<FuelType>;
  updateFuelType(id: string, data: Partial<InsertFuelType>): Promise<FuelType>;
  deleteFuelType(id: string): Promise<void>;
  
  // Package operations
  deletePackage(id: string): Promise<void>;
  updatePackage(id: string, data: Partial<InsertFuelPackage>): Promise<FuelPackage>;
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

  // QR Assignment Methods
  async findAvailableQrCode(stationId: string, fuelType: string, liters: number): Promise<QrCode | undefined> {
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

  async assignQrToPurchase(purchaseId: number, qrCodeId: number): Promise<void> {
    await db.update(qrCodes).set({ status: "sold", purchaseId }).where(eq(qrCodes.id, qrCodeId));
    await db.update(purchases).set({ qrCodeId, status: "delivered" }).where(eq(purchases.id, purchaseId));
  }

  // Admin Methods
  async getAllQrCodes(): Promise<QrCode[]> {
    return await db.select().from(qrCodes).orderBy(desc(qrCodes.createdAt));
  }

  async getAllPurchases(): Promise<Purchase[]> {
    return await db.select().from(purchases).orderBy(desc(purchases.createdAt));
  }

  async deleteQrCode(id: number): Promise<void> {
    await db.delete(qrCodes).where(eq(qrCodes.id, id));
  }

  async updateQrCode(id: number, data: Partial<InsertQrCode>): Promise<QrCode> {
    const [updated] = await db.update(qrCodes).set(data).where(eq(qrCodes.id, id)).returning();
    return updated;
  }

  // Station Methods
  async getAllStations(): Promise<Station[]> {
    return await db.select().from(stations).orderBy(stations.name);
  }

  async getStation(id: string): Promise<Station | undefined> {
    const [station] = await db.select().from(stations).where(eq(stations.id, id));
    return station;
  }

  async createStation(station: InsertStation): Promise<Station> {
    const [created] = await db.insert(stations).values(station).returning();
    return created;
  }

  async updateStation(id: string, data: Partial<InsertStation>): Promise<Station> {
    const [updated] = await db.update(stations).set(data).where(eq(stations.id, id)).returning();
    return updated;
  }

  async deleteStation(id: string): Promise<void> {
    await db.delete(stations).where(eq(stations.id, id));
  }

  // Fuel Type Methods
  async getAllFuelTypes(): Promise<FuelType[]> {
    return await db.select().from(fuelTypes).orderBy(fuelTypes.name);
  }

  async getFuelTypesByStation(stationId: string): Promise<FuelType[]> {
    return await db.select().from(fuelTypes).where(eq(fuelTypes.stationId, stationId));
  }

  async createFuelType(fuelType: InsertFuelType): Promise<FuelType> {
    const [created] = await db.insert(fuelTypes).values(fuelType).returning();
    return created;
  }

  async updateFuelType(id: string, data: Partial<InsertFuelType>): Promise<FuelType> {
    const [updated] = await db.update(fuelTypes).set(data).where(eq(fuelTypes.id, id)).returning();
    return updated;
  }

  async deleteFuelType(id: string): Promise<void> {
    await db.delete(fuelTypes).where(eq(fuelTypes.id, id));
  }

  // Additional Package Methods
  async deletePackage(id: string): Promise<void> {
    await db.delete(fuelPackages).where(eq(fuelPackages.id, id));
  }

  async updatePackage(id: string, data: Partial<InsertFuelPackage>): Promise<FuelPackage> {
    const [updated] = await db.update(fuelPackages).set(data).where(eq(fuelPackages.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
