-- 给 electronics 添加 5 个子分类
-- 在 Supabase SQL Editor 里执行此脚本

DO $$
DECLARE
  elec_id TEXT;
BEGIN
  -- 获取 electronics 分类 ID
  SELECT id INTO elec_id FROM "Category" WHERE slug = 'electronics';

  IF elec_id IS NULL THEN
    RAISE EXCEPTION 'electronics category not found';
  END IF;

  -- 手机
  INSERT INTO "Category" (id, slug, "parentId", sort, "createdAt")
  VALUES (gen_random_uuid()::text, 'electronics-phone', elec_id, 1, NOW())
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'zh', '手机' FROM "Category" WHERE slug = 'electronics-phone'
  ON CONFLICT ("categoryId", locale) DO NOTHING;
  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'en', 'Mobile Phones' FROM "Category" WHERE slug = 'electronics-phone'
  ON CONFLICT ("categoryId", locale) DO NOTHING;
  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'fr', 'Téléphones' FROM "Category" WHERE slug = 'electronics-phone'
  ON CONFLICT ("categoryId", locale) DO NOTHING;

  -- 音响
  INSERT INTO "Category" (id, slug, "parentId", sort, "createdAt")
  VALUES (gen_random_uuid()::text, 'electronics-audio', elec_id, 2, NOW())
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'zh', '音响' FROM "Category" WHERE slug = 'electronics-audio'
  ON CONFLICT ("categoryId", locale) DO NOTHING;
  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'en', 'Audio & Speakers' FROM "Category" WHERE slug = 'electronics-audio'
  ON CONFLICT ("categoryId", locale) DO NOTHING;
  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'fr', 'Audio & Son' FROM "Category" WHERE slug = 'electronics-audio'
  ON CONFLICT ("categoryId", locale) DO NOTHING;

  -- 手机周边
  INSERT INTO "Category" (id, slug, "parentId", sort, "createdAt")
  VALUES (gen_random_uuid()::text, 'electronics-accessories', elec_id, 3, NOW())
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'zh', '手机周边' FROM "Category" WHERE slug = 'electronics-accessories'
  ON CONFLICT ("categoryId", locale) DO NOTHING;
  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'en', 'Mobile Accessories' FROM "Category" WHERE slug = 'electronics-accessories'
  ON CONFLICT ("categoryId", locale) DO NOTHING;
  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'fr', 'Accessoires Mobile' FROM "Category" WHERE slug = 'electronics-accessories'
  ON CONFLICT ("categoryId", locale) DO NOTHING;

  -- 小家电
  INSERT INTO "Category" (id, slug, "parentId", sort, "createdAt")
  VALUES (gen_random_uuid()::text, 'electronics-appliances', elec_id, 4, NOW())
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'zh', '小家电' FROM "Category" WHERE slug = 'electronics-appliances'
  ON CONFLICT ("categoryId", locale) DO NOTHING;
  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'en', 'Small Appliances' FROM "Category" WHERE slug = 'electronics-appliances'
  ON CONFLICT ("categoryId", locale) DO NOTHING;
  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'fr', 'Petit Électroménager' FROM "Category" WHERE slug = 'electronics-appliances'
  ON CONFLICT ("categoryId", locale) DO NOTHING;

  -- 电视
  INSERT INTO "Category" (id, slug, "parentId", sort, "createdAt")
  VALUES (gen_random_uuid()::text, 'electronics-tv', elec_id, 5, NOW())
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'zh', '电视' FROM "Category" WHERE slug = 'electronics-tv'
  ON CONFLICT ("categoryId", locale) DO NOTHING;
  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'en', 'Television' FROM "Category" WHERE slug = 'electronics-tv'
  ON CONFLICT ("categoryId", locale) DO NOTHING;
  INSERT INTO "CategoryTranslation" (id, "categoryId", locale, name)
  SELECT gen_random_uuid()::text, id, 'fr', 'Télévision' FROM "Category" WHERE slug = 'electronics-tv'
  ON CONFLICT ("categoryId", locale) DO NOTHING;

  RAISE NOTICE '✓ 5 subcategories added under electronics (id: %)', elec_id;
END $$;
