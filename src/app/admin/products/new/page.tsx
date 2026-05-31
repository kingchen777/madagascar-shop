import { supabase } from "@/lib/db";
import { NewProductForm } from "./NewProductForm";

export default async function NewProductPage() {
  const { data: categoriesData } = await supabase
    .from("Category")
    .select("slug, name")
    .order("slug");
  const categories = (categoriesData ?? []) as { slug: string; name: Record<string, string> }[];

  return <NewProductForm categories={categories} />;
}
