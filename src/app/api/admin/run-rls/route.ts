import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// TEMPORARY ROUTE — delete after use
// Called once to enable RLS on Supabase tables

const RLS_SQL = `
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductTranslation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CategoryTranslation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Setting" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='Product' AND policyname='public_read_active_products') THEN
    CREATE POLICY "public_read_active_products" ON "Product" FOR SELECT TO anon USING (status = 'ACTIVE');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ProductTranslation' AND policyname='public_read_product_translations') THEN
    CREATE POLICY "public_read_product_translations" ON "ProductTranslation" FOR SELECT TO anon USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ProductImage' AND policyname='public_read_product_images') THEN
    CREATE POLICY "public_read_product_images" ON "ProductImage" FOR SELECT TO anon USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='Category' AND policyname='public_read_categories') THEN
    CREATE POLICY "public_read_categories" ON "Category" FOR SELECT TO anon USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='CategoryTranslation' AND policyname='public_read_category_translations') THEN
    CREATE POLICY "public_read_category_translations" ON "CategoryTranslation" FOR SELECT TO anon USING (true);
  END IF;
END $$;
`;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-run-secret");
  // One-time operation secret — delete this route after use
  if (secret !== "mada-rls-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // v6 — session pooler (port 5432) with decoded password
  const pool = new Pool({
    host: "aws-0-ap-southeast-1.pooler.supabase.com",
    port: 5432,
    database: "postgres",
    user: "postgres.uanvkasbfrcssejpelrn",
    password: "CHJchj@11!@#",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    const client = await pool.connect();
    try {
      await client.query(RLS_SQL);
      return NextResponse.json({ ok: true, message: "RLS policies applied successfully", version: "v6" });
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json({ error: String(err), version: "v6" }, { status: 500 });
  } finally {
    await pool.end();
  }
}
