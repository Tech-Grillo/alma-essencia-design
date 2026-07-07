import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { type Product } from "@/lib/products";
import { useProductTracking } from "@/hooks/useProductTracking";

export function ProductCard({ product }: { product: Product }) {
  useProductTracking(product.slug, product.name);
  
  return (
    <article className="group relative rounded-3xl bg-card border border-border/60 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-bloom">
      <div className="relative aspect-square overflow-hidden bg-secondary/40">
        <Link
          to="/produtos/$slug"
          params={{ slug: product.slug }}
          className="block h-full w-full"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
      </div>
      <div className="p-6 pb-16">
        <p className="text-[11px] uppercase tracking-[0.25em] text-caramel-deep/80 dark:text-white mb-2 text-center">
          {product.category}
        </p>
        <h3 className="font-serif text-2xl leading-tight mb-1 text-center">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 text-center">
          {product.short}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {product.scents.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-[11px] rounded-full px-2.5 py-1 bg-rose/40 text-foreground/80"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="font-serif text-4xl font-bold bg-gradient-caramel bg-clip-text text-transparent">
            R$ {Math.min(...product.sizes.map((s: any) => s.price)).toFixed(2).replace(".", ",")}
          </span>
          <Link
            to="/produtos/$slug"
            params={{ slug: product.slug }}
            className="rounded-full px-4 py-2 text-sm bg-secondary hover:bg-rose transition-colors"
          >
            Ver detalhes
          </Link>
        </div>

        <Link
          to="/produtos/$slug"
          params={{ slug: product.slug }}
          className="absolute left-0 right-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 text-white text-sm py-3 flex items-center justify-center gap-2 font-medium bg-rose rounded-tl-3xl rounded-tr-3xl"
        >
          <Icons.ShoppingBag className="h-4 w-4" /> Comprar
        </Link>
      </div>
    </article>
  );
}
