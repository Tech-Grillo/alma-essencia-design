import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { type Product, whatsappLink } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative rounded-3xl bg-card border border-border/60 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-bloom">
      <div className="aspect-square overflow-hidden bg-secondary/40">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-6 pb-16">
        <p className="text-[11px] uppercase tracking-[0.25em] text-caramel-deep/80 mb-2 text-center">
          {product.category}
        </p>
        <h3 className="font-serif text-2xl leading-tight mb-1 text-center">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 text-center">{product.short}</p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {product.scents.slice(0, 3).map((s) => (
            <span key={s} className="text-[11px] rounded-full px-2.5 py-1 bg-rose/40 text-foreground/80">
              {s}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="font-serif text-xl text-caramel-deep">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          <Link
            to="/produtos/$slug"
            params={{ slug: product.slug }}
            className="rounded-full px-4 py-2 text-sm bg-secondary hover:bg-rose transition-colors"
          >
            Ver detalhes
          </Link>
        </div>

        <a
          href={whatsappLink(`Olá! Tenho interesse no produto: ${product.name}`)}
          target="_blank" rel="noreferrer"
          className="absolute left-0 right-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-whatsapp text-white text-sm py-3 flex items-center justify-center gap-2 font-medium"
        >
          <MessageCircle className="h-4 w-4" /> Comprar pelo WhatsApp
        </a>
      </div>
    </article>
  );
}
