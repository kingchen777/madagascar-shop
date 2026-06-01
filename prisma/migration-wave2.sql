-- Migration: Wave 2 additions
-- Add PromoType enum, Review table, PromoCode table, and new Order columns
-- Run this in Supabase SQL Editor (safe to run multiple times)

-- 1. Add PromoType enum (if not exists)
DO $$ BEGIN
  CREATE TYPE "PromoType" AS ENUM ('PERCENT', 'FIXED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add promoCode and discountMGA columns to Order (if not exists)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "promoCode" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discountMGA" DECIMAL(14,2);

-- 3. Create Review table (if not exists)
CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "author" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- 4. Create Review indexes and foreign keys (skip if exist)
CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");

DO $$ BEGIN
  ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Create PromoCode table (if not exists)
CREATE TABLE IF NOT EXISTS "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromoType" NOT NULL DEFAULT 'PERCENT',
    "value" DECIMAL(12,2) NOT NULL,
    "minOrderMGA" DECIMAL(12,2),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PromoCode_code_key" ON "PromoCode"("code");
