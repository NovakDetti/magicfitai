import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  boolean,
  primaryKey,
  varchar,
  index,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import type { AdapterAccount } from "next-auth/adapters"

// ============================================
// NextAuth Tables
// ============================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  password: text("password"), // hashed password for credentials auth
  credits: integer("credits").notNull().default(0), // User credit balance
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
)

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
)

// ============================================
// Analysis Sessions
// ============================================

export type AnalysisStatus =
  | "pending"
  | "paid"
  | "processing"
  | "complete"
  | "failed"
  | "expired"

export interface AnalysisObservations {
  faceShape: string
  skinTone: string
  undertone: string
  contrast: string
  eyeShape: string
  brows: string
  lips: string
  notes: string
}

export interface MakeupProducts {
  base: string[]
  eyes: string[]
  brows: string[]
  lips: string[]
  face: string[]
}

export interface MakeupLook {
  id: string
  title: string
  why: string
  steps: string[]
  products: MakeupProducts
  afterImageUrl?: string
}

export interface AnalysisToggles {
  hasGlasses: boolean
  hasSensitiveSkin: boolean
  stylePreference?: "letisztult" | "hatarozott"
}

export const analysisSessions = pgTable(
  "analysis_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    guestToken: varchar("guest_token", { length: 64 }).unique(),
    status: text("status").$type<AnalysisStatus>().notNull().default("pending"),
    occasion: text("occasion").notNull(),
    toggles: jsonb("toggles").$type<AnalysisToggles>().notNull(),
    beforeImageUrl: text("before_image_url"),
    observations: jsonb("observations").$type<AnalysisObservations>(),
    looks: jsonb("looks").$type<MakeupLook[]>(),
    afterImages: jsonb("after_images").$type<string[]>(),
    pdfUrl: text("pdf_url"),
    stripeSessionId: text("stripe_session_id"),
    amount: integer("amount"),
    currency: varchar("currency", { length: 3 }).default("HUF"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    completedAt: timestamp("completed_at", { mode: "date" }),
    claimedAt: timestamp("claimed_at", { mode: "date" }),
  },
  (table) => [
    index("analysis_sessions_user_id_idx").on(table.userId),
    index("analysis_sessions_guest_token_idx").on(table.guestToken),
    index("analysis_sessions_status_idx").on(table.status),
  ]
)

// ============================================
// User Credits
// ============================================

export const userCredits = pgTable("user_credits", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export type CreditReason =
  | "purchase_single"
  | "purchase_pack_3"
  | "purchase_pack_5"
  | "purchase_pack_10"
  | "consume_analysis"
  | "refund"
  | "admin_adjustment"
  | "claim_guest_result"

export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    reason: text("reason").$type<CreditReason>().notNull(),
    analysisSessionId: uuid("analysis_session_id").references(
      () => analysisSessions.id
    ),
    stripeSessionId: text("stripe_session_id"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("credit_ledger_user_id_idx").on(table.userId),
    index("credit_ledger_created_at_idx").on(table.createdAt),
  ]
)

// ============================================
// Relations
// ============================================

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  analysisSessions: many(analysisSessions),
  credits: one(userCredits),
  creditLedger: many(creditLedger),
}))

export const analysisSessionsRelations = relations(analysisSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [analysisSessions.userId],
    references: [users.id],
  }),
  ratings: many(analysisRatings),
}))

export const userCreditsRelations = relations(userCredits, ({ one }) => ({
  user: one(users, {
    fields: [userCredits.userId],
    references: [users.id],
  }),
}))

export const creditLedgerRelations = relations(creditLedger, ({ one }) => ({
  user: one(users, {
    fields: [creditLedger.userId],
    references: [users.id],
  }),
  analysisSession: one(analysisSessions, {
    fields: [creditLedger.analysisSessionId],
    references: [analysisSessions.id],
  }),
}))

// ============================================
// Ratings / Reviews
// ============================================

export const analysisRatings = pgTable(
  "analysis_ratings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    analysisSessionId: uuid("analysis_session_id")
      .notNull()
      .references(() => analysisSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    rating: integer("rating").notNull(), // 1-5 stars
    comment: text("comment"), // Optional text feedback
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("analysis_ratings_session_id_idx").on(table.analysisSessionId),
    index("analysis_ratings_user_id_idx").on(table.userId),
  ]
)

export const analysisRatingsRelations = relations(analysisRatings, ({ one }) => ({
  analysisSession: one(analysisSessions, {
    fields: [analysisRatings.analysisSessionId],
    references: [analysisSessions.id],
  }),
  user: one(users, {
    fields: [analysisRatings.userId],
    references: [users.id],
  }),
}))
