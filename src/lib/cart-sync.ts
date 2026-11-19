import type { CartItem } from "@/lib/cart";
import type { Product } from "@/lib/products-supabase";

export type CartSyncResult = {
  items: CartItem[];
  /** Nomes dos produtos que saíram do carrinho (apagados ou opção que não existe mais). */
  removed: string[];
  /** Nomes dos produtos cujo preço mudou. */
  repriced: string[];
  /** true se algo no carrinho precisa ser trocado. */
  changed: boolean;
};

/**
 * Confere o carrinho salvo no navegador com o catálogo atual.
 * Segue as mesmas regras que o checkout usa no servidor, para o cliente não ser surpreendido lá.
 */
export function reconcileCart(items: CartItem[], catalog: Product[]): CartSyncResult {
  const bySlug = new Map(catalog.map((p) => [p.slug, p]));
  const next: CartItem[] = [];
  const removed: string[] = [];
  const repriced: string[] = [];
  let changed = false;

  for (const item of items) {
    const product = bySlug.get(item.slug);
    if (!product) {
      removed.push(item.name);
      changed = true;
      continue;
    }

    let price = Number(product.price);
    if (item.size) {
      const size = (product.sizes ?? []).find((s) => s.label === item.size);
      if (!size) {
        removed.push(item.name);
        changed = true;
        continue;
      }
      price = Number(size.price);
    }

    const scents = product.scents ?? [];
    if (scents.length > 0 && item.scent && !scents.includes(item.scent)) {
      removed.push(item.name);
      changed = true;
      continue;
    }

    const updated: CartItem = {
      ...item,
      price,
      name: product.name,
      image: product.images?.[0] || item.image,
    };
    if (price !== item.price) repriced.push(product.name);
    if (price !== item.price || updated.name !== item.name || updated.image !== item.image) changed = true;
    next.push(updated);
  }

  return { items: next, removed: [...new Set(removed)], repriced: [...new Set(repriced)], changed };
}
