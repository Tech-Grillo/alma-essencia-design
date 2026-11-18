import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { type Product } from "@/lib/products";
import { productToCartItem, useCart } from "@/lib/cart";
import { useProductTracking } from "@/hooks/useProductTracking";
import placeholderProduto from "@/assets/placeholder-produto.webp";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ProductCard({ product }: { product: Product }) {
  const { handleClick } = useProductTracking(product.slug, product.name);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const sizes = product.sizes ?? [];
  const scents = product.scents ?? [];
  const lowest = sizes.length ? Math.min(...sizes.map((s) => s.price)) : product.price;
  const hasOptions = sizes.length > 1 || scents.length > 1; // precisa escolher tamanho ou aroma na página

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(t);
  }, [added]);

  const quickAdd = () => {
    addItem(productToCartItem(product, sizes[0]?.label, 1, scents[0] ?? null), 1);
    setAdded(true);
  };

  return (
    <article className="group flex h-full flex-col">
      <Link
        to="/produtos/$slug"
        params={{ slug: product.slug }}
        onClick={handleClick}
        className="relative block aspect-square overflow-hidden rounded-2xl bg-secondary/50"
      >
        <img
          src={product.images?.[0] || placeholderProduto}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <p className="mb-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">{product.category}</p>
        <Link
          to="/produtos/$slug"
          params={{ slug: product.slug }}
          onClick={handleClick}
          className="line-clamp-2 text-sm font-medium leading-snug text-foreground hover:text-caramel-deep sm:text-base"
        >
          {product.name}
        </Link>
        <p className="mt-1.5">
          {sizes.length > 1 && <span className="mr-1 text-[11px] text-muted-foreground sm:text-xs">a partir de</span>}
          <span className="text-base font-semibold text-caramel-deep dark:text-white sm:text-lg">{brl(lowest)}</span>
        </p>

        <div className="mt-auto pt-3">
          {hasOptions ? (
            <Link
              to="/produtos/$slug"
              params={{ slug: product.slug }}
              onClick={handleClick}
              className="flex w-full items-center justify-center gap-1.5 rounded-full border border-caramel/50 py-2 text-xs font-semibold text-caramel-deep transition hover:bg-caramel hover:text-primary-foreground dark:text-white sm:py-2.5 sm:text-sm"
            >
              Escolher opções
            </Link>
          ) : (
            <button
              type="button"
              onClick={quickAdd}
              className={`flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition sm:py-2.5 sm:text-sm ${
                added ? "bg-green-600 text-white" : "bg-caramel text-primary-foreground hover:bg-caramel/90"
              }`}
              aria-live="polite"
            >
              {added ? <Icons.Check className="h-4 w-4" /> : <Icons.ShoppingBag className="h-4 w-4" />}
              {added ? "Adicionado" : "Adicionar"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
