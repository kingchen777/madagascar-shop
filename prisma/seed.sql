-- MadaShop Seed Data — Run in Supabase SQL Editor
-- https://supabase.com/dashboard/project/uanvkasbfrcssejpelrn/sql/new

-- ─── Settings ────────────────────────────────────────────────────────────────
INSERT INTO "Setting" ("key", "value", "updatedAt") VALUES
  ('exchange_rate_cny_mga',     '640',              NOW()),
  ('default_deposit_pct',       '30',               NOW()),
  ('default_service_fee_pct',   '15',               NOW()),
  ('default_intl_shipping_per_kg', '25000',         NOW()),
  ('site_name',                 'MadaShop',         NOW()),
  ('contact_whatsapp',          '+261 XX XXX XXXX', NOW()),
  ('contact_email',             'contact@madashop.mg', NOW()),
  ('default_locale',            'fr',               NOW())
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW();

-- ─── Admin User ───────────────────────────────────────────────────────────────
INSERT INTO "User" ("id", "email", "name", "role", "locale", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'admin@madashop.mg', 'Admin', 'ADMIN', 'fr', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- ─── Categories ───────────────────────────────────────────────────────────────
WITH ins_electronics AS (
  INSERT INTO "Category" ("id", "slug", "sort", "createdAt")
  VALUES (gen_random_uuid()::text, 'electronics', 1, NOW())
  ON CONFLICT ("slug") DO UPDATE SET "sort" = 1
  RETURNING "id"
)
INSERT INTO "CategoryTranslation" ("id", "categoryId", "locale", "name")
SELECT gen_random_uuid()::text, id, locale, name FROM ins_electronics,
  (VALUES ('fr','Électronique'),('en','Electronics'),('zh','电子产品')) AS t(locale, name)
ON CONFLICT ("categoryId", "locale") DO NOTHING;

WITH ins_clothing AS (
  INSERT INTO "Category" ("id", "slug", "sort", "createdAt")
  VALUES (gen_random_uuid()::text, 'clothing', 2, NOW())
  ON CONFLICT ("slug") DO UPDATE SET "sort" = 2
  RETURNING "id"
)
INSERT INTO "CategoryTranslation" ("id", "categoryId", "locale", "name")
SELECT gen_random_uuid()::text, id, locale, name FROM ins_clothing,
  (VALUES ('fr','Vêtements & Mode'),('en','Clothing & Fashion'),('zh','服装时尚')) AS t(locale, name)
ON CONFLICT ("categoryId", "locale") DO NOTHING;

WITH ins_home AS (
  INSERT INTO "Category" ("id", "slug", "sort", "createdAt")
  VALUES (gen_random_uuid()::text, 'home-goods', 3, NOW())
  ON CONFLICT ("slug") DO UPDATE SET "sort" = 3
  RETURNING "id"
)
INSERT INTO "CategoryTranslation" ("id", "categoryId", "locale", "name")
SELECT gen_random_uuid()::text, id, locale, name FROM ins_home,
  (VALUES ('fr','Maison & Cuisine'),('en','Home & Kitchen'),('zh','家居厨具')) AS t(locale, name)
ON CONFLICT ("categoryId", "locale") DO NOTHING;

WITH ins_beauty AS (
  INSERT INTO "Category" ("id", "slug", "sort", "createdAt")
  VALUES (gen_random_uuid()::text, 'beauty', 4, NOW())
  ON CONFLICT ("slug") DO UPDATE SET "sort" = 4
  RETURNING "id"
)
INSERT INTO "CategoryTranslation" ("id", "categoryId", "locale", "name")
SELECT gen_random_uuid()::text, id, locale, name FROM ins_beauty,
  (VALUES ('fr','Beauté & Santé'),('en','Beauty & Health'),('zh','美妆健康')) AS t(locale, name)
ON CONFLICT ("categoryId", "locale") DO NOTHING;

-- ─── Sample Products ──────────────────────────────────────────────────────────
WITH ins_pb AS (
  INSERT INTO "Product" ("id","slug","type","source","categoryId","basePriceCNY","priceMGA","weightKg","stock","status","createdAt","updatedAt")
  SELECT gen_random_uuid()::text,'xiaomi-power-bank-20000','SELF','NONE',id,'89.00','85000','0.450',15,'ACTIVE',NOW(),NOW()
  FROM "Category" WHERE slug='electronics'
  ON CONFLICT ("slug") DO UPDATE SET "updatedAt" = NOW()
  RETURNING "id"
)
INSERT INTO "ProductTranslation" ("id","productId","locale","name","description","isAuto")
SELECT gen_random_uuid()::text, id, locale, name, description, is_auto FROM ins_pb,
  (VALUES
    ('zh','小米移动电源 20000mAh','小米正品移动电源，20000mAh大容量，支持18W快充，双USB输出。',false),
    ('fr','Batterie externe Xiaomi 20000mAh','Batterie externe Xiaomi authentique, 20000mAh, charge rapide 18W, double sortie USB.',false),
    ('en','Xiaomi Power Bank 20000mAh','Genuine Xiaomi power bank, 20000mAh, 18W fast charging, dual USB output.',false)
  ) AS t(locale, name, description, is_auto)
ON CONFLICT ("productId","locale") DO NOTHING;

WITH ins_dress AS (
  INSERT INTO "Product" ("id","slug","type","source","sourceUrl","categoryId","basePriceCNY","priceMGA","serviceFeePct","weightKg","status","createdAt","updatedAt")
  SELECT gen_random_uuid()::text,'women-summer-dress-agent','AGENT','TAOBAO','https://item.taobao.com/example',id,'45.00','52000','15','0.300','ACTIVE',NOW(),NOW()
  FROM "Category" WHERE slug='clothing'
  ON CONFLICT ("slug") DO UPDATE SET "updatedAt" = NOW()
  RETURNING "id"
)
INSERT INTO "ProductTranslation" ("id","productId","locale","name","description","isAuto")
SELECT gen_random_uuid()::text, id, locale, name, description, is_auto FROM ins_dress,
  (VALUES
    ('zh','女款夏季雪纺连衣裙','夏季新款雪纺连衣裙，轻薄透气，多色可选（S/M/L/XL）。代购商品，3-4周到货。',false),
    ('fr','Robe d''été en mousseline pour femme','Nouvelle robe d''été en mousseline légère, plusieurs couleurs (S/M/L/XL). Délai 3-4 semaines.',true),
    ('en','Women''s Summer Chiffon Dress','New summer chiffon dress, multiple colors (S/M/L/XL). China sourced, 3-4 weeks delivery.',true)
  ) AS t(locale, name, description, is_auto)
ON CONFLICT ("productId","locale") DO NOTHING;

WITH ins_rice AS (
  INSERT INTO "Product" ("id","slug","type","source","sourceUrl","categoryId","basePriceCNY","priceMGA","serviceFeePct","weightKg","status","createdAt","updatedAt")
  SELECT gen_random_uuid()::text,'rice-cooker-3l-agent','AGENT','JD','https://item.jd.com/example',id,'129.00','138000','15','2.500','ACTIVE',NOW(),NOW()
  FROM "Category" WHERE slug='home-goods'
  ON CONFLICT ("slug") DO UPDATE SET "updatedAt" = NOW()
  RETURNING "id"
)
INSERT INTO "ProductTranslation" ("id","productId","locale","name","description","isAuto")
SELECT gen_random_uuid()::text, id, locale, name, description, is_auto FROM ins_rice,
  (VALUES
    ('zh','电饭煲 3L 智能多功能','3升智能电饭煲，多功能烹饪模式，内胆不粘涂层，220V适合马达加斯加。',false),
    ('fr','Cuiseur à riz intelligent 3L','Cuiseur à riz 3L, plusieurs modes de cuisson, revêtement antiadhésif, 220V, compatible Madagascar.',true),
    ('en','Smart 3L Multi-function Rice Cooker','3L smart rice cooker, multiple cooking modes, non-stick pot, 220V, Madagascar compatible.',true)
  ) AS t(locale, name, description, is_auto)
ON CONFLICT ("productId","locale") DO NOTHING;

SELECT 'Seed complete ✓' AS result;
