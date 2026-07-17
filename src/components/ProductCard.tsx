import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { type Product } from "@/lib/products";
import { useProductTracking } from "@/hooks/useProductTracking";

export function ProductCard({ product }: { product: Product }) {
  useProductTracking(product.slug, product.name);
  
  return (
    <article className="group relative rounded-3xl bg-card border border-border/60 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-bloom h-full flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-secondary/40 flex-shrink-0">
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
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        <p className="text-[11px] uppercase tracking-[0.25em] text-caramel-deep/80 dark:text-white mb-1 text-center">
          {product.category}
        </p>
        <h3 className="font-serif text-xl sm:text-2xl leading-tight mb-2 text-center">{product.name}</h3>
        <span className="font-serif text-2xl sm:text-3xl font-bold bg-gradient-caramel bg-clip-text text-transparent text-center mb-4">
          R$ {Math.min(...product.sizes.map((s: any) => s.price)).toFixed(2).replace(".", ",")}
        </span>

        <div className="mt-auto">
          <Link
            to="/produtos/$slug"
            params={{ slug: product.slug }}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-rose text-white text-sm py-3 font-medium transition-all hover:opacity-90"
          >
            <Icons.ShoppingBag className="h-4 w-4" /> COMPRAR
          </Link>
        </div>
      </div>
    </article>
  );
}