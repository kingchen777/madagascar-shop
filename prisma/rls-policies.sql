-- ================================================================
-- MadaShop Row Level Security Policies
-- 执行方式: Supabase SQL Editor → 粘贴并运行
-- service_role key 在服务端使用，自动绕过 RLS，不受影响
-- anon key 仅允许公开读取商品/分类，禁止直接写入
-- ================================================================

-- 启用 RLS
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

-- ----------------------------------------------------------------
-- Product: anon 可读 ACTIVE 商品，禁止写入
-- ----------------------------------------------------------------
CREATE POLICY "public_read_active_products"
  ON "Product" FOR SELECT
  TO anon
  USING (status = 'ACTIVE');

-- ----------------------------------------------------------------
-- ProductTranslation / ProductImage: anon 可读（通过 Product join）
-- ----------------------------------------------------------------
CREATE POLICY "public_read_product_translations"
  ON "ProductTranslation" FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "public_read_product_images"
  ON "ProductImage" FOR SELECT
  TO anon
  USING (true);

-- ----------------------------------------------------------------
-- Category / CategoryTranslation: anon 可读
-- ----------------------------------------------------------------
CREATE POLICY "public_read_categories"
  ON "Category" FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "public_read_category_translations"
  ON "CategoryTranslation" FOR SELECT
  TO anon
  USING (true);

-- ----------------------------------------------------------------
-- Order / OrderItem / User / Payment: anon 无权限（服务端 service_role 操作）
-- ----------------------------------------------------------------
-- 不创建 anon 策略 → anon 无法读写

-- ----------------------------------------------------------------
-- Setting: anon 无权限
-- ----------------------------------------------------------------
-- 不创建 anon 策略 → anon 无法读写
