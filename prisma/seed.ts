import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Default settings ─────────────────────────────────────────────────────
  const settings = [
    { key: "exchange_rate_cny_mga", value: "640" },     // 1 CNY = 640 MGA (adjust to current rate)
    { key: "default_deposit_pct", value: "30" },         // 30% deposit
    { key: "default_service_fee_pct", value: "15" },     // 15% service fee
    { key: "default_intl_shipping_per_kg", value: "25000" }, // 25,000 MGA/kg
    { key: "site_name", value: "MadaShop" },
    { key: "contact_whatsapp", value: "+261 XX XXX XXXX" },
    { key: "contact_email", value: "contact@madashop.mg" },
    { key: "default_locale", value: "fr" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("✓ Settings seeded");

  // ── Admin user ───────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@madashop.mg" },
    update: {},
    create: {
      email: "admin@madashop.mg",
      name: "Admin",
      role: "ADMIN",
      locale: "fr",
    },
  });
  console.log("✓ Admin user seeded:", admin.email);

  // ── Categories ───────────────────────────────────────────────────────────
  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      slug: "electronics",
      sort: 1,
      translations: {
        create: [
          { locale: "fr", name: "Électronique" },
          { locale: "en", name: "Electronics" },
          { locale: "zh", name: "电子产品" },
        ],
      },
    },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: {},
    create: {
      slug: "clothing",
      sort: 2,
      translations: {
        create: [
          { locale: "fr", name: "Vêtements & Mode" },
          { locale: "en", name: "Clothing & Fashion" },
          { locale: "zh", name: "服装时尚" },
        ],
      },
    },
  });

  const homeGoods = await prisma.category.upsert({
    where: { slug: "home-goods" },
    update: {},
    create: {
      slug: "home-goods",
      sort: 3,
      translations: {
        create: [
          { locale: "fr", name: "Maison & Cuisine" },
          { locale: "en", name: "Home & Kitchen" },
          { locale: "zh", name: "家居厨具" },
        ],
      },
    },
  });

  const beauty = await prisma.category.upsert({
    where: { slug: "beauty" },
    update: {},
    create: {
      slug: "beauty",
      sort: 4,
      translations: {
        create: [
          { locale: "fr", name: "Beauté & Santé" },
          { locale: "en", name: "Beauty & Health" },
          { locale: "zh", name: "美妆健康" },
        ],
      },
    },
  });

  console.log("✓ Categories seeded");

  // ── Sample products ──────────────────────────────────────────────────────

  // Self-owned product
  await prisma.product.upsert({
    where: { slug: "xiaomi-power-bank-20000" },
    update: {},
    create: {
      slug: "xiaomi-power-bank-20000",
      type: "SELF",
      source: "NONE",
      categoryId: electronics.id,
      basePriceCNY: "89.00",
      priceMGA: "85000",
      weightKg: "0.450",
      stock: 15,
      status: "ACTIVE",
      translations: {
        create: [
          {
            locale: "zh",
            name: "小米移动电源 20000mAh",
            description:
              "小米正品移动电源，20000mAh大容量，支持18W快充，双USB输出，适合手机、平板充电。",
            isAuto: false,
          },
          {
            locale: "fr",
            name: "Batterie externe Xiaomi 20000mAh",
            description:
              "Batterie externe Xiaomi authentique, 20000mAh grande capacité, charge rapide 18W, double sortie USB. Idéal pour smartphones et tablettes.",
            isAuto: false,
          },
          {
            locale: "en",
            name: "Xiaomi Power Bank 20000mAh",
            description:
              "Genuine Xiaomi power bank, 20000mAh large capacity, 18W fast charging, dual USB output. Perfect for smartphones and tablets.",
            isAuto: false,
          },
        ],
      },
    },
  });

  // Agent product (China sourcing)
  await prisma.product.upsert({
    where: { slug: "women-summer-dress-agent" },
    update: {},
    create: {
      slug: "women-summer-dress-agent",
      type: "AGENT",
      source: "TAOBAO",
      sourceUrl: "https://item.taobao.com/example",
      categoryId: clothing.id,
      basePriceCNY: "45.00",
      priceMGA: "52000",
      serviceFeePct: "15",
      weightKg: "0.300",
      stock: null,
      status: "ACTIVE",
      translations: {
        create: [
          {
            locale: "zh",
            name: "女款夏季雪纺连衣裙",
            description:
              "夏季新款雪纺连衣裙，轻薄透气，多色可选（S/M/L/XL），下单时请备注颜色和尺码。代购商品，付款后3-4周到货。",
            isAuto: false,
          },
          {
            locale: "fr",
            name: "Robe d'été en mousseline pour femme",
            description:
              "Nouvelle robe d'été en mousseline légère et respirante, plusieurs couleurs disponibles (S/M/L/XL). Précisez la couleur et la taille lors de la commande. Article en commande depuis Chine, délai 3-4 semaines.",
            isAuto: true,
          },
          {
            locale: "en",
            name: "Women's Summer Chiffon Dress",
            description:
              "New summer chiffon dress, lightweight and breathable, multiple colors available (S/M/L/XL). Please specify color and size when ordering. China sourced item, 3-4 weeks delivery.",
            isAuto: true,
          },
        ],
      },
    },
  });

  // Home goods product
  await prisma.product.upsert({
    where: { slug: "rice-cooker-3l-agent" },
    update: {},
    create: {
      slug: "rice-cooker-3l-agent",
      type: "AGENT",
      source: "JD",
      sourceUrl: "https://item.jd.com/example",
      categoryId: homeGoods.id,
      basePriceCNY: "129.00",
      priceMGA: "138000",
      serviceFeePct: "15",
      weightKg: "2.500",
      stock: null,
      status: "ACTIVE",
      translations: {
        create: [
          {
            locale: "zh",
            name: "电饭煲 3L 智能多功能",
            description:
              "3升智能电饭煲，多功能烹饪模式，内胆不粘涂层，定时预约功能，适合3-4人家庭。220V电压，适合马达加斯加使用。",
            isAuto: false,
          },
          {
            locale: "fr",
            name: "Cuiseur à riz intelligent 3L multifonction",
            description:
              "Cuiseur à riz intelligent 3 litres, plusieurs modes de cuisson, revêtement antiadhésif, minuterie programmable, idéal pour 3-4 personnes. Tension 220V, compatible Madagascar.",
            isAuto: true,
          },
          {
            locale: "en",
            name: "Smart 3L Multi-function Rice Cooker",
            description:
              "3L smart rice cooker with multiple cooking modes, non-stick inner pot, programmable timer, suitable for 3-4 people. 220V power, compatible with Madagascar.",
            isAuto: true,
          },
        ],
      },
    },
  });

  console.log("✓ Sample products seeded");
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
