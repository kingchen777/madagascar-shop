import { SourcePlatform } from "@prisma/client";

export interface ManualImportInput {
  sourceUrl: string;
  titleZh: string;
  descriptionZh?: string;
  basePriceCNY: string;
  weightKg?: string;
  spec?: string;
  imageUrls?: string[];
}

export interface ImportedProduct {
  source: SourcePlatform;
  sourceUrl: string;
  titleZh: string;
  descriptionZh: string;
  basePriceCNY: string;
  weightKg?: string;
  imageUrls: string[];
}

/**
 * Detect the source platform from a URL.
 */
export function detectPlatform(url: string): SourcePlatform {
  if (url.includes("1688.com")) return "ALIBABA1688";
  if (url.includes("taobao.com") || url.includes("item.taobao")) return "TAOBAO";
  if (url.includes("tmall.com")) return "TMALL";
  if (url.includes("pinduoduo.com") || url.includes("yangkeduo.com"))
    return "PINDUODUO";
  if (url.includes("jd.com")) return "JD";
  return "OTHER";
}

/**
 * ManualImporter: process manually entered product data (no scraping).
 * Operators paste the CN product link + fill in details themselves.
 */
export class ManualImporter {
  async import(input: ManualImportInput): Promise<ImportedProduct> {
    const source = detectPlatform(input.sourceUrl);

    return {
      source,
      sourceUrl: input.sourceUrl,
      titleZh: input.titleZh.trim(),
      descriptionZh: (input.descriptionZh ?? input.titleZh).trim(),
      basePriceCNY: input.basePriceCNY,
      weightKg: input.weightKg,
      imageUrls: input.imageUrls ?? [],
    };
  }
}
