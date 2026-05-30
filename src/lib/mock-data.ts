/**
 * Mock data for development/demo before database is connected.
 * Replace with real Prisma queries once DATABASE_URL is configured.
 */

export type MockLocale = "fr" | "en" | "zh";

export interface MockProduct {
  id: string;
  slug: string;
  type: "SELF" | "AGENT";
  source: string;
  sourceUrl?: string;
  priceMGA: number;
  basePriceCNY?: number;
  weightKg?: number;
  stock?: number;
  status: "ACTIVE" | "DRAFT" | "SOLD_OUT";
  images: string[];
  category: { slug: string; name: Record<MockLocale, string> };
  translations: Record<MockLocale, { name: string; description: string; isAuto: boolean }>;
}

export const MOCK_CATEGORIES = [
  {
    slug: "electronics",
    name: { fr: "Électronique", en: "Electronics", zh: "电子产品" },
  },
  {
    slug: "clothing",
    name: { fr: "Vêtements & Mode", en: "Clothing & Fashion", zh: "服装时尚" },
  },
  {
    slug: "home-goods",
    name: { fr: "Maison & Cuisine", en: "Home & Kitchen", zh: "家居厨具" },
  },
  {
    slug: "beauty",
    name: { fr: "Beauté & Santé", en: "Beauty & Health", zh: "美妆健康" },
  },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "1",
    slug: "xiaomi-power-bank-20000",
    type: "SELF",
    source: "NONE",
    priceMGA: 85000,
    basePriceCNY: 89,
    weightKg: 0.45,
    stock: 15,
    status: "ACTIVE",
    images: [
      "https://images.unsplash.com/photo-1585338218612-5f2f43a3ef75?w=600&q=80",
    ],
    category: {
      slug: "electronics",
      name: { fr: "Électronique", en: "Electronics", zh: "电子产品" },
    },
    translations: {
      fr: {
        name: "Batterie externe Xiaomi 20000mAh",
        description:
          "Batterie externe Xiaomi authentique, 20000mAh grande capacité, charge rapide 18W, double sortie USB. Idéal pour smartphones et tablettes.\n\n**Caractéristiques :**\n- Capacité : 20000mAh\n- Charge rapide 18W\n- 2 ports USB-A + 1 USB-C\n- Poids : 450g",
        isAuto: false,
      },
      en: {
        name: "Xiaomi Power Bank 20000mAh",
        description:
          "Genuine Xiaomi power bank, 20000mAh large capacity, 18W fast charging, dual USB output. Perfect for smartphones and tablets.\n\n**Specs:**\n- Capacity: 20000mAh\n- 18W fast charge\n- 2x USB-A + 1x USB-C\n- Weight: 450g",
        isAuto: false,
      },
      zh: {
        name: "小米移动电源 20000mAh",
        description:
          "小米正品移动电源，20000mAh大容量，支持18W快充，双USB输出，适合手机、平板充电。\n\n**参数：**\n- 容量：20000mAh\n- 18W快充\n- 2×USB-A + 1×USB-C\n- 重量：450g",
        isAuto: false,
      },
    },
  },
  {
    id: "2",
    slug: "women-summer-dress-agent",
    type: "AGENT",
    source: "TAOBAO",
    sourceUrl: "https://item.taobao.com/example",
    priceMGA: 52000,
    basePriceCNY: 45,
    weightKg: 0.3,
    status: "ACTIVE",
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
    ],
    category: {
      slug: "clothing",
      name: { fr: "Vêtements & Mode", en: "Clothing & Fashion", zh: "服装时尚" },
    },
    translations: {
      fr: {
        name: "Robe d'été en mousseline pour femme",
        description:
          "Nouvelle robe d'été en mousseline légère et respirante. Plusieurs couleurs disponibles.\n\n**Tailles disponibles :** S / M / L / XL\n\n⚠️ Article en commande depuis la Chine — délai estimé 3–4 semaines après confirmation.",
        isAuto: true,
      },
      en: {
        name: "Women's Summer Chiffon Dress",
        description:
          "New summer chiffon dress, lightweight and breathable. Multiple colors available.\n\n**Sizes:** S / M / L / XL\n\n⚠️ China-sourced item — estimated 3–4 weeks after order confirmation.",
        isAuto: true,
      },
      zh: {
        name: "女款夏季雪纺连衣裙",
        description:
          "夏季新款雪纺连衣裙，轻薄透气，多色可选。\n\n**尺码：** S / M / L / XL\n\n⚠️ 代购商品，下单确认后约3-4周到货。",
        isAuto: false,
      },
    },
  },
  {
    id: "3",
    slug: "rice-cooker-3l-agent",
    type: "AGENT",
    source: "JD",
    sourceUrl: "https://item.jd.com/example",
    priceMGA: 138000,
    basePriceCNY: 129,
    weightKg: 2.5,
    status: "ACTIVE",
    images: [
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80",
    ],
    category: {
      slug: "home-goods",
      name: { fr: "Maison & Cuisine", en: "Home & Kitchen", zh: "家居厨具" },
    },
    translations: {
      fr: {
        name: "Cuiseur à riz intelligent 3L",
        description:
          "Cuiseur à riz intelligent 3 litres, plusieurs modes de cuisson, revêtement antiadhésif.\n\n**Caractéristiques :**\n- Capacité : 3L (pour 3–4 personnes)\n- Tension : 220V ✅ Compatible Madagascar\n- Minuterie programmable\n- Revêtement antiadhésif\n\n⚠️ Délai livraison : 3–5 semaines.",
        isAuto: true,
      },
      en: {
        name: "Smart 3L Rice Cooker",
        description:
          "3L smart rice cooker, multiple cooking modes, non-stick inner pot.\n\n**Specs:**\n- Capacity: 3L (3–4 people)\n- Voltage: 220V ✅ Madagascar compatible\n- Programmable timer\n- Non-stick coating\n\n⚠️ Delivery: 3–5 weeks.",
        isAuto: true,
      },
      zh: {
        name: "智能电饭煲 3L 多功能",
        description:
          "3升智能电饭煲，多功能烹饪模式，不粘内胆。\n\n**参数：**\n- 容量：3L（3-4人份）\n- 电压：220V ✅ 马达加斯加可用\n- 定时预约功能\n- 不粘涂层\n\n⚠️ 代购商品，3-5周到货。",
        isAuto: false,
      },
    },
  },
  {
    id: "4",
    slug: "led-desk-lamp-agent",
    type: "AGENT",
    source: "PINDUODUO",
    priceMGA: 38000,
    basePriceCNY: 35,
    weightKg: 0.8,
    status: "ACTIVE",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    ],
    category: {
      slug: "home-goods",
      name: { fr: "Maison & Cuisine", en: "Home & Kitchen", zh: "家居厨具" },
    },
    translations: {
      fr: {
        name: "Lampe de bureau LED rechargeable",
        description:
          "Lampe de bureau LED avec port de recharge USB intégré. Idéale pour le travail et les études.\n\n**Caractéristiques :**\n- 3 modes de luminosité\n- Batterie rechargeable\n- Bras flexible\n- Protection oculaire",
        isAuto: true,
      },
      en: {
        name: "Rechargeable LED Desk Lamp",
        description:
          "LED desk lamp with built-in USB charging port. Perfect for work and study.\n\n**Features:**\n- 3 brightness modes\n- Rechargeable battery\n- Flexible arm\n- Eye protection",
        isAuto: true,
      },
      zh: {
        name: "LED充电台灯",
        description:
          "带USB充电口的LED台灯，适合工作和学习使用。\n\n**特点：**\n- 三档亮度\n- 可充电电池\n- 可调节臂\n- 护眼设计",
        isAuto: false,
      },
    },
  },
  {
    id: "5",
    slug: "bluetooth-earbuds-agent",
    type: "AGENT",
    source: "ALIBABA1688",
    priceMGA: 65000,
    basePriceCNY: 68,
    weightKg: 0.08,
    status: "ACTIVE",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
    ],
    category: {
      slug: "electronics",
      name: { fr: "Électronique", en: "Electronics", zh: "电子产品" },
    },
    translations: {
      fr: {
        name: "Écouteurs Bluetooth sans fil TWS",
        description:
          "Écouteurs intra-auriculaires Bluetooth 5.0 avec boîtier de charge. Son haute qualité.\n\n**Caractéristiques :**\n- Bluetooth 5.0\n- Autonomie : 6h + 18h (boîtier)\n- Réduction de bruit\n- Étanche IPX5",
        isAuto: true,
      },
      en: {
        name: "TWS Wireless Bluetooth Earbuds",
        description:
          "Bluetooth 5.0 wireless earbuds with charging case. High-quality sound.\n\n**Features:**\n- Bluetooth 5.0\n- Battery: 6h + 18h (case)\n- Noise reduction\n- IPX5 waterproof",
        isAuto: true,
      },
      zh: {
        name: "TWS蓝牙无线耳机",
        description:
          "蓝牙5.0无线入耳式耳机，带充电仓，高品质音效。\n\n**参数：**\n- 蓝牙5.0\n- 续航：6小时+18小时（充电仓）\n- 降噪功能\n- IPX5防水",
        isAuto: false,
      },
    },
  },
  {
    id: "6",
    slug: "skin-care-set-agent",
    type: "AGENT",
    source: "TAOBAO",
    priceMGA: 95000,
    basePriceCNY: 98,
    weightKg: 0.5,
    status: "ACTIVE",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80",
    ],
    category: {
      slug: "beauty",
      name: { fr: "Beauté & Santé", en: "Beauty & Health", zh: "美妆健康" },
    },
    translations: {
      fr: {
        name: "Coffret soin visage 5 pièces",
        description:
          "Coffret complet de soins visage : nettoyant, tonique, sérum, crème de jour et masque.\n\n**Contenu :**\n- Nettoyant doux 100ml\n- Tonique hydratant 100ml\n- Sérum vitamine C 30ml\n- Crème de jour 50ml\n- Masque hydratant x5",
        isAuto: true,
      },
      en: {
        name: "5-Piece Facial Skincare Set",
        description:
          "Complete facial skincare set: cleanser, toner, serum, day cream and mask.\n\n**Contents:**\n- Gentle cleanser 100ml\n- Hydrating toner 100ml\n- Vitamin C serum 30ml\n- Day cream 50ml\n- Hydrating mask x5",
        isAuto: true,
      },
      zh: {
        name: "五件套护肤礼盒",
        description:
          "完整护肤套装：洁面乳、爽肤水、精华液、日霜和面膜。\n\n**内容：**\n- 温和洁面乳 100ml\n- 补水爽肤水 100ml\n- 维C精华液 30ml\n- 日霜 50ml\n- 补水面膜 ×5",
        isAuto: false,
      },
    },
  },
];

export function getMockProduct(slug: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getMockProductsByCategory(categorySlug?: string): MockProduct[] {
  if (!categorySlug) return MOCK_PRODUCTS.filter((p) => p.status === "ACTIVE");
  return MOCK_PRODUCTS.filter(
    (p) => p.status === "ACTIVE" && p.category.slug === categorySlug
  );
}
