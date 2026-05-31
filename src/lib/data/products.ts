import { supabase } from "@/lib/db";

export type ProductTranslation = {
  id: string;
  productId: string;
  locale: string;
  name: string;
  description: string;
  isAuto: boolean;
};

export type ProductImage = {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  sort: number;
};

export type Category = {
  id: string;
  slug: string;
  parentId: string | null;
  sort: number;
  createdAt: string;
};

export type Product = {
  id: string;
  slug: string;
  type: "SELF" | "AGENT";
  source: string;
  sourceUrl: string | null;
  categoryId: string | null;
  basePriceCNY: string | null;
  priceMGA: string | null;
  serviceFeePct: string | null;
  weightKg: string | null;
  stock: number | null;
  status: "DRAFT" | "ACTIVE" | "HIDDEN" | "SOLD_OUT";
  createdAt: string;
  updatedAt: string;
};

export type ProductWithRelations = Product & {
  translations: ProductTranslation[];
  images: ProductImage[];
  category: Category | null;
};

/** Get all active products, optionally filtered by category slug. */
export async function getProducts(categorySlug?: string): Promise<ProductWithRelations[]> {
  let query = supabase
    .from("Product")
    .select(`*, translations:ProductTranslation(*), images:ProductImage(*), category:Category(*)`)
    .eq("status", "ACTIVE")
    .order("createdAt", { ascending: false });

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("Category")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (cat) query = query.eq("categoryId", cat.id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as ProductWithRelations[];
}

/** Get a single product by slug. */
export async function getProduct(slug: string): Promise<ProductWithRelations | undefined> {
  const { data, error } = await supabase
    .from("Product")
    .select(`*, translations:ProductTranslation(*), images:ProductImage(*), category:Category(*)`)
    .eq("slug", slug)
    .single();
  if (error) return undefined;
  return data as ProductWithRelations;
}

/** Get all products (for admin). */
export async function getAllProducts(): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from("Product")
    .select(`*, translations:ProductTranslation(*), images:ProductImage(*), category:Category(*)`)
    .order("createdAt", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ProductWithRelations[];
}
