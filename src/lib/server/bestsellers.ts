// Mais vendidos de verdade: soma as unidades dos pedidos pagos. SÓ no servidor.
import { supabaseAdmin } from "./supabase-admin";

export async function bestSellerSlugs(limit = 8, days = 180): Promise<string[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("items")
    .eq("status", "paid")
    .gte("created_at", since)
    .limit(2000);
  if (error) throw new Error(error.message);

  const units = new Map<string, number>();
  for (const order of data ?? []) {
    for (const item of (order.items ?? []) as { slug: string; quantity: number }[]) {
      units.set(item.slug, (units.get(item.slug) ?? 0) + Number(item.quantity || 0));
    }
  }
  return [...units.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([slug]) => slug);
}
