import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  phone: varchar("phone").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Phone verification codes
export const phoneVerifications = pgTable("phone_verifications", {
  id: serial("id").primaryKey(),
  phone: varchar("phone").notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: integer("verified").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPhoneVerificationSchema = createInsertSchema(phoneVerifications).omit({
  id: true,
  createdAt: true,
});
export type InsertPhoneVerification = z.infer<typeof insertPhoneVerificationSchema>;
export type PhoneVerification = typeof phoneVerifications.$inferSelect;

// QR Codes Inventory
export const qrCodes = pgTable("qr_codes", {
  id: serial("id").primaryKey(),
  stationId: text("station_id").notNull(),
  fuelType: text("fuel_type").notNull(),
  liters: integer("liters").notNull(),
  qrCodeUrl: text("qr_code_url").notNull(),
  status: text("status").notNull().default("available"), // available, sold
  purchaseId: integer("purchase_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQrCodeSchema = createInsertSchema(qrCodes).omit({
  id: true,
  createdAt: true,
});
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;
export type QrCode = typeof qrCodes.$inferSelect;

// Purchases
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(), // Track user by session for now
  packageId: text("package_id").notNull(),
  stationName: text("station_name").notNull(),
  fuelName: text("fuel_name").notNull(),
  liters: integer("liters").notNull(),
  price: integer("price").notNull(), // in UAH
  qrCodeId: integer("qr_code_id"),
  status: text("status").notNull().default("pending"), // pending, delivered, failed
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;

// Fuel Packages (predefined pricing)
export const fuelPackages = pgTable("fuel_packages", {
  id: text("id").primaryKey(),
  stationId: text("station_id").notNull(),
  fuelTypeId: text("fuel_type_id").notNull(),
  fuelName: text("fuel_name").notNull(),
  liters: integer("liters").notNull(),
  price: integer("price").notNull(), // in UAH
  originalPrice: integer("original_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFuelPackageSchema = createInsertSchema(fuelPackages).omit({
  createdAt: true,
});
export type InsertFuelPackage = z.infer<typeof insertFuelPackageSchema>;
export type FuelPackage = typeof fuelPackages.$inferSelect;
