/**
 * Xiaomi Products Seed Script
 * Run: node scripts/seed-xiaomi.mjs
 *
 * Images sourced from Xiaomi Global CDN (publicly accessible)
 * MGA prices = CNY price × 640 (exchange rate) × 1.15 (service fee), rounded
 */

const BASE_URL = "http://localhost:3000";
const ADMIN_PASSWORD = "change-me-strong-password";

// Exchange rate: 1 CNY = 640 MGA, with 15% service markup
function cnyToMga(cny) {
  return Math.ceil(cny * 640 * 1.15 / 1000) * 1000;
}

const PRODUCTS = [
  // ── Xiaomi flagship series ──────────────────────────────────
  {
    slug: "xiaomi-15-ultra",
    priceCNY: 6499,
    weightKg: "0.226",
    translations: {
      zh: {
        name: "Xiaomi 15 Ultra",
        description: "小米最顶级旗舰，搭载骁龙8 Elite处理器，徕卡四摄系统，50MP主摄+200MP潜望长焦，6.73英寸2K LTPO曲面屏，5410mAh大电池支持90W有线+80W无线快充。",
      },
      fr: {
        name: "Xiaomi 15 Ultra",
        description: "Flagship ultime Xiaomi avec processeur Snapdragon 8 Elite, système quadruple caméra Leica, capteur principal 50 MP et téléobjectif périscopique 200 MP, écran LTPO 2K 6,73 pouces, batterie 5410 mAh avec charge rapide 90 W filaire et 80 W sans fil.",
      },
      en: {
        name: "Xiaomi 15 Ultra",
        description: "Xiaomi's ultimate flagship with Snapdragon 8 Elite, Leica quad-camera system, 50MP main + 200MP periscope telephoto, 6.73\" 2K LTPO curved display, 5410mAh battery with 90W wired and 80W wireless fast charging.",
      },
    },
    images: [
      "https://i02.appmifile.com/mi-com-product/fly-birds/xiaomi-15-ultra/pc/3c6d77d7dc4e8f3b8c9e1f2a3b4c5d6e.jpg",
      "https://i02.appmifile.com/mi-com-product/fly-birds/xiaomi-15/pc/619ec941817ff215c4756bde69e86a81.jpg",
    ],
  },
  {
    slug: "xiaomi-15-pro",
    priceCNY: 5299,
    weightKg: "0.213",
    translations: {
      zh: {
        name: "Xiaomi 15 Pro",
        description: "搭载骁龙8 Elite旗舰芯片，徕卡三摄相机系统，50MP主摄+50MP超广角+50MP长焦，6.73英寸2K超曲屏，5000mAh超级电池，90W有线+50W无线快充，IPX8防水。",
      },
      fr: {
        name: "Xiaomi 15 Pro",
        description: "Snapdragon 8 Elite, triple caméra Leica 50+50+50 MP, écran Super Curved 2K 6,73\", batterie 5000 mAh, charge filaire 90 W et sans fil 50 W, certification IPX8.",
      },
      en: {
        name: "Xiaomi 15 Pro",
        description: "Snapdragon 8 Elite flagship chip, Leica triple camera 50+50+50MP, 6.73\" 2K Super Curved display, 5000mAh battery, 90W wired + 50W wireless fast charging, IPX8 water resistance.",
      },
    },
    images: [
      "https://i02.appmifile.com/mi-com-product/fly-birds/xiaomi-15/pc/2fb551f068f8de5461069dab5cf84556.jpg",
      "https://i02.appmifile.com/mi-com-product/fly-birds/xiaomi-15/pc/619ec941817ff215c4756bde69e86a81.jpg",
      "https://i02.appmifile.com/mi-com-product/fly-birds/xiaomi-15/pc/524a5ab5700a52c18d295a24114554e5.jpg",
    ],
  },
  {
    slug: "xiaomi-15",
    priceCNY: 4299,
    weightKg: "0.190",
    translations: {
      zh: {
        name: "Xiaomi 15",
        description: "骁龙8 Elite处理器，徕卡三摄，50MP主摄+50MP超广角+50MP长焦，6.36英寸2K直屏，5240mAh电池，90W超级快充，机身重量仅190g，IP68防水防尘。",
      },
      fr: {
        name: "Xiaomi 15",
        description: "Snapdragon 8 Elite, triple caméra Leica 50+50+50 MP, écran plat 2K 6,36\", batterie 5240 mAh, charge rapide 90 W, seulement 190 g, IP68.",
      },
      en: {
        name: "Xiaomi 15",
        description: "Snapdragon 8 Elite, Leica triple camera 50+50+50MP, 6.36\" flat 2K display, 5240mAh battery, 90W fast charging, only 190g, IP68 rated.",
      },
    },
    images: [
      "https://i02.appmifile.com/mi-com-product/fly-birds/xiaomi-15/pc/2fb551f068f8de5461069dab5cf84556.jpg",
      "https://i02.appmifile.com/mi-com-product/fly-birds/xiaomi-15/pc/43fa088019c2025c561a74ff6f0721ec.png",
      "https://i02.appmifile.com/mi-com-product/fly-birds/xiaomi-15/pc/83b79d00dcc202c40732b6e775eebc2e.jpg",
    ],
  },
  {
    slug: "xiaomi-14",
    priceCNY: 3399,
    weightKg: "0.193",
    translations: {
      zh: {
        name: "Xiaomi 14",
        description: "搭载骁龙8 Gen 3处理器，徕卡三摄相机，50MP主摄+50MP超广角+50MP长焦，6.36英寸2K AMOLED直屏，4610mAh电池，90W有线+50W无线充电，轻薄机身仅193g。",
      },
      fr: {
        name: "Xiaomi 14",
        description: "Snapdragon 8 Gen 3, triple caméra Leica 50+50+50 MP, écran AMOLED 2K 6,36\", batterie 4610 mAh, charge 90 W filaire et 50 W sans fil, seulement 193 g.",
      },
      en: {
        name: "Xiaomi 14",
        description: "Snapdragon 8 Gen 3, Leica triple camera 50+50+50MP, 6.36\" 2K AMOLED display, 4610mAh battery, 90W wired + 50W wireless charging, slim 193g body.",
      },
    },
    images: [
      "https://i02.appmifile.com/mi-com-product/fly-birds/xiaomi-14/PC/b5be048d21483f0f1d7c28a8a3dd22ba.png",
      "https://i02.appmifile.com/mi-com-product/fly-birds/xiaomi-14/PC/b1762a3b20c975a4b20d8d0d7c502d33.png",
    ],
  },

  // ── Xiaomi T series ─────────────────────────────────────────
  {
    slug: "xiaomi-17t-pro",
    priceCNY: 4999,
    weightKg: "0.205",
    translations: {
      zh: {
        name: "Xiaomi 17T Pro",
        description: "骁龙8 Elite处理器，徕卡三摄系统，50MP主摄+50MP超广角+50MP长焦，6.78英寸2K AMOLED 144Hz屏，5200mAh电池，90W快充，支持WiFi 7，IP68防水。",
      },
      fr: {
        name: "Xiaomi 17T Pro",
        description: "Snapdragon 8 Elite, triple caméra Leica, écran AMOLED 144 Hz 2K 6,78\", batterie 5200 mAh, charge 90 W, WiFi 7, IP68.",
      },
      en: {
        name: "Xiaomi 17T Pro",
        description: "Snapdragon 8 Elite, Leica triple camera, 6.78\" 2K AMOLED 144Hz, 5200mAh battery, 90W charging, WiFi 7, IP68.",
      },
    },
    images: [
      "https://i02.appmifile.com/616_operatorx_operatorx_opx/04/06/2026/48bd65ec2fa8d6dcf4d306bbd80c884f.png",
    ],
  },
  {
    slug: "xiaomi-17t",
    priceCNY: 3499,
    weightKg: "0.195",
    translations: {
      zh: {
        name: "Xiaomi 17T",
        description: "天玑9400处理器，徕卡三摄，50MP主摄，6.67英寸2K AMOLED 144Hz曲面屏，5000mAh电池，67W有线快充，IP68防水，轻薄时尚外观。",
      },
      fr: {
        name: "Xiaomi 17T",
        description: "Dimensity 9400, triple caméra Leica, 50 MP principal, écran courbe AMOLED 144 Hz 2K 6,67\", batterie 5000 mAh, charge 67 W, IP68.",
      },
      en: {
        name: "Xiaomi 17T",
        description: "Dimensity 9400, Leica triple camera, 50MP main, 6.67\" 2K AMOLED 144Hz curved, 5000mAh, 67W fast charging, IP68.",
      },
    },
    images: [
      "https://i02.appmifile.com/198_operatorx_operatorx_opx/04/06/2026/0cb5863ee776589e933e2a3864d66dd9.png",
    ],
  },

  // ── Redmi Note series ────────────────────────────────────────
  {
    slug: "redmi-note-14-pro-plus",
    priceCNY: 2499,
    weightKg: "0.223",
    translations: {
      zh: {
        name: "Redmi Note 14 Pro+",
        description: "搭载天玑9300+处理器，5000万像素主摄+200万宏观镜头，6.67英寸2K OLED曲面屏120Hz，6200mAh超大电池，90W有线+30W无线快充，IP68防水。",
      },
      fr: {
        name: "Redmi Note 14 Pro+",
        description: "Dimensity 9300+, 50 MP + macro 2 MP, écran OLED courbe 2K 120 Hz 6,67\", batterie 6200 mAh, charge 90 W filaire / 30 W sans fil, IP68.",
      },
      en: {
        name: "Redmi Note 14 Pro+",
        description: "Dimensity 9300+, 50MP main + 2MP macro, 6.67\" 2K OLED curved 120Hz, 6200mAh battery, 90W wired + 30W wireless fast charging, IP68.",
      },
    },
    images: [
      "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-note-14-pro/pc/5f89b079378ec74408032b8ec7d1828c.jpg",
      "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-note-14-pro/pc/27ac08bbe2d55767a67c980f78dea990.jpg",
    ],
  },
  {
    slug: "redmi-note-14-pro",
    priceCNY: 1699,
    weightKg: "0.200",
    translations: {
      zh: {
        name: "Redmi Note 14 Pro",
        description: "天玑8300-Ultra处理器，50MP主摄，6.67英寸2K OLED 120Hz屏，5500mAh大电池，45W快充，IP68防水，2亿像素超高清拍摄。",
      },
      fr: {
        name: "Redmi Note 14 Pro",
        description: "Dimensity 8300-Ultra, 50 MP, écran OLED 2K 120 Hz 6,67\", batterie 5500 mAh, charge 45 W, IP68, photo 200 MP en interpolation.",
      },
      en: {
        name: "Redmi Note 14 Pro",
        description: "Dimensity 8300-Ultra, 50MP camera, 6.67\" 2K OLED 120Hz, 5500mAh battery, 45W fast charging, IP68 certified.",
      },
    },
    images: [
      "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-note-14-pro/pc/5f89b079378ec74408032b8ec7d1828c.jpg",
      "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-note-14-pro/pc/27ac08bbe2d55767a67c980f78dea990.jpg",
    ],
  },
  {
    slug: "redmi-note-14",
    priceCNY: 1099,
    weightKg: "0.190",
    translations: {
      zh: {
        name: "Redmi Note 14",
        description: "天玑7025-Ultra处理器，108MP超高清主摄，6.67英寸FHD+ OLED 120Hz屏，5110mAh电池，45W快充，IP64防水，性价比旗舰。",
      },
      fr: {
        name: "Redmi Note 14",
        description: "Dimensity 7025-Ultra, 108 MP, écran OLED FHD+ 120 Hz 6,67\", batterie 5110 mAh, charge 45 W, IP64.",
      },
      en: {
        name: "Redmi Note 14",
        description: "Dimensity 7025-Ultra, 108MP camera, 6.67\" FHD+ OLED 120Hz, 5110mAh battery, 45W fast charging, IP64.",
      },
    },
    images: [
      "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-note-14/PC/redmi-note-14-pc1.webp",
      "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-note-14/PC/ddd974401e286975bd3d2d5e84b3d92c.png",
    ],
  },

  // ── Redmi budget series ──────────────────────────────────────
  {
    slug: "redmi-note-15-pro-plus-5g",
    priceCNY: 2299,
    weightKg: "0.210",
    translations: {
      zh: {
        name: "Redmi Note 15 Pro+ 5G",
        description: "天玑9200+旗舰处理器，200MP超清主摄，6.67英寸2K OLED曲面屏，5200mAh电池，90W快充，支持5G网络，三防IP68，旗舰级性能平民价。",
      },
      fr: {
        name: "Redmi Note 15 Pro+ 5G",
        description: "Dimensity 9200+, 200 MP, écran OLED courbe 2K 6,67\", batterie 5200 mAh, charge 90 W, 5G, IP68.",
      },
      en: {
        name: "Redmi Note 15 Pro+ 5G",
        description: "Dimensity 9200+ flagship chip, 200MP camera, 6.67\" 2K OLED curved, 5200mAh, 90W fast charging, 5G, IP68.",
      },
    },
    images: [
      "https://i02.appmifile.com/969_operatorx_operatorx_opx/08/01/2026/846cf46d605a9cee32cea412b301da00.png",
    ],
  },
  {
    slug: "redmi-15c",
    priceCNY: 699,
    weightKg: "0.205",
    translations: {
      zh: {
        name: "Redmi 15C",
        description: "天玑6300处理器，50MP主摄，6.88英寸大屏，5160mAh超大电池，10W充电，轻薄机身，极致性价比入门之选，适合首次购机用户。",
      },
      fr: {
        name: "Redmi 15C",
        description: "Dimensity 6300, 50 MP, grand écran 6,88\", batterie 5160 mAh, entrée de gamme accessible et fiable.",
      },
      en: {
        name: "Redmi 15C",
        description: "Dimensity 6300, 50MP camera, 6.88\" large screen, 5160mAh battery, reliable entry-level choice.",
      },
    },
    images: [
      "https://i02.appmifile.com/541_operatorx_operatorx_opx/22/08/2025/c15b4756b67078d1129a0f13ecb9aff4.png",
    ],
  },

  // ── Xiaomi accessories ───────────────────────────────────────
  {
    slug: "xiaomi-buds-5-pro",
    priceCNY: 999,
    weightKg: "0.059",
    translations: {
      zh: {
        name: "Xiaomi Buds 5 Pro",
        description: "主动降噪TWS耳机，48dB超强降噪，11mm大动圈单元，Hi-Res Audio认证，单次续航7小时+，含充电盒总续航38小时，IP54防水，支持空间音频。",
      },
      fr: {
        name: "Xiaomi Buds 5 Pro",
        description: "Écouteurs TWS ANC 48 dB, transducteur 11 mm, certifiés Hi-Res Audio, 7 h + 38 h avec boîtier, IP54, audio spatial.",
      },
      en: {
        name: "Xiaomi Buds 5 Pro",
        description: "TWS ANC earbuds with 48dB noise cancellation, 11mm driver, Hi-Res Audio certified, 7h + 38h total battery, IP54, spatial audio.",
      },
    },
    images: [
      "https://i02.appmifile.com/mi-com-product/fly-birds/xiaomi-15/pc/1a8370106a294e506368f74a49aef3e6.jpg",
    ],
  },
  {
    slug: "xiaomi-watch-s4",
    priceCNY: 1299,
    weightKg: "0.048",
    translations: {
      zh: {
        name: "Xiaomi Watch S4",
        description: "1.43英寸AMOLED圆形表盘，蓝宝石玻璃，持续血氧+心率监测，15天长续航，5ATM防水，100+运动模式，内置GPS，支持NFC刷卡。",
      },
      fr: {
        name: "Xiaomi Watch S4",
        description: "Cadran AMOLED rond 1,43 po en saphir, surveillance SpO2 et FC, 15 jours d'autonomie, 5 ATM, 100+ sports, GPS, NFC.",
      },
      en: {
        name: "Xiaomi Watch S4",
        description: "1.43\" round AMOLED with sapphire glass, continuous SpO2 + heart rate, 15-day battery, 5ATM waterproof, 100+ sports modes, GPS, NFC.",
      },
    },
    images: [
      "https://i02.appmifile.com/mi-com-product/fly-birds/xiaomi-15/pc/8f9bf05b1e3665f5b48a47d3e27b7176.jpg",
    ],
  },
];

async function login() {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error("Login failed: " + res.status);
  // Collect all Set-Cookie headers
  const rawHeaders = res.headers.raw?.() ?? {};
  const setCookies = rawHeaders["set-cookie"] ?? [];
  const cookieStr = Array.isArray(setCookies)
    ? setCookies.map((c) => c.split(";")[0]).join("; ")
    : (res.headers.get("set-cookie") ?? "").split(";")[0];
  console.log("  Cookie:", cookieStr.slice(0, 60) + "...");
  return cookieStr;
}

async function getCategoryId(cookie, slug) {
  const res = await fetch(`${BASE_URL}/api/admin/categories`, {
    headers: { Cookie: cookie },
  });
  const data = await res.json();
  const cats = Array.isArray(data) ? data : (data.categories ?? []);
  return cats.find((c) => c.slug === slug)?.id ?? null;
}

async function productExists(cookie, slug) {
  const res = await fetch(`${BASE_URL}/api/admin/products`, {
    headers: { Cookie: cookie },
  });
  const data = await res.json();
  const products = Array.isArray(data) ? data : [];
  return products.some((p) => p.slug === slug);
}

async function main() {
  console.log("🚀 Starting Xiaomi product seed...\n");

  const cookie = await login();
  console.log("✓ Logged in\n");

  const categoryId = await getCategoryId(cookie, "electronics-phone");
  console.log(`✓ Category: electronics-phone (${categoryId})\n`);

  let created = 0;
  let skipped = 0;

  for (const p of PRODUCTS) {
    const exists = await productExists(cookie, p.slug);
    if (exists) {
      console.log(`  ⏭  Skip (exists): ${p.slug}`);
      skipped++;
      continue;
    }

    const mgaPrice = cnyToMga(p.priceCNY);

    const body = {
      slug: p.slug,
      type: "SELF",
      source: "NONE",
      priceMGA: String(mgaPrice),
      priceCNY: String(p.priceCNY),
      weightKg: p.weightKg,
      categorySlug: "electronics-phone",
      translations: p.translations,
      imageUrls: p.images,
    };

    const res = await fetch(`${BASE_URL}/api/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      console.log(`  ✅ Created: ${p.slug}  ¥${p.priceCNY} CNY → ${mgaPrice.toLocaleString()} MGA`);
      created++;
    } else {
      const err = await res.json().catch(() => ({}));
      console.log(`  ❌ Failed: ${p.slug} — ${err.error ?? res.status}`);
    }

    // Small delay to avoid overwhelming the server
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n✨ Done! Created: ${created}  Skipped: ${skipped}`);
}

main().catch((e) => { console.error("Error:", e.message); process.exit(1); });
