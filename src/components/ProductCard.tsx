import { Link, useNavigate } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { type Product } from "@/lib/products";
import { productToCartItem, useCart } from "@/lib/cart";
import { useProductTracking } from "@/hooks/useProductTracking";
import placeholderProduto from "@/assets/placeholder-produto.webp";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ProductCard({ product }: { product: Product }) {
  const { handleClick } = useProductTracking(product.slug, product.name);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const sizes = product.sizes ?? [];
  const scents = product.scents ?? [];
  const lowest = sizes.length ? Math.min(...sizes.map((s) => s.price)) : product.price;
  const hasOptions = sizes.length > 1 || scents.length > 1; // precisa escolher tamanho ou aroma

  // Com tamanho ou aroma para escolher, "Comprar" abre o produto; sem opções, já vai para o carrinho.
  const buy = () => {
    handleClick();
    if (hasOptions) {
      navigate({ to: "/produtos/$slug", params: { slug: product.slug } });
      return;
    }
    addItem(productToCartItem(product, sizes[0]?.label, 1, scents[0] ?? null), 1);
    navigate({ to: "/carrinho" });
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
        <p className="mb-1 truncate text-xs font-medium uppercase tracking-wide text-caramel-deep dark:text-caramel sm:text-sm">
          {product.category}
        </p>
        <Link
          to="/produtos/$slug"
          params={{ slug: product.slug }}
          onClick={handleClick}
          className="line-clamp-2 text-base font-semibold leading-snug text-foreground hover:text-caramel-deep sm:text-lg"
        >
          {product.name}
        </Link>
        <p className="mt-2">
          {sizes.length > 1 && <span className="mr-1 text-xs text-foreground/70 sm:text-sm">a partir de</span>}
          <span className="text-lg font-bold text-caramel-deep dark:text-white sm:text-xl">{brl(lowest)}</span>
        </p>

        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={buy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-caramel py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-caramel/90 sm:py-3 sm:text-base"
          >
            <Icons.ShoppingBag className="h-4 w-4" /> Comprar
          </button>
        </div>
      </div>
    </article>
  );
}
