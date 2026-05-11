import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { products, whatsappLink } from "@/lib/products";
import { useState } from "react";
import { ChevronLeft, Minus, Plus, Star } from "lucide-react";

export const Route = createFileRoute("/produtos/$slug")({
  component: ProductPage,
  loader: ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-3xl mb-2">Produto não encontrado</h1>
        <Link to="/" className="text-caramel-deep underline">Voltar</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center">
      <p>{error.message}</p>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [scent, setScent] = useState(product.scents[0]);
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);

  const related = products.filter((p) => p.slug !== product.slug);

  const message = `Olá! Quero comprar: ${product.name} (${scent}, ${size}) — Quantidade: ${qty}`;

  return (
    <div className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-caramel-deep mb-8">
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="grid lg:grid-cols-2 gap-14">
          {/* Gallery */}
          <div>
            <div className="rounded-[2rem] overflow-hidden bg-secondary/40 shadow-soft aspect-square">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[product.image, product.image, product.image, product.image].map((src, i) => (
                <button key={i} className="rounded-2xl overflow-hidden aspect-square border border-border hover:border-caramel transition-colors">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-caramel-deep mb-3">{product.category}</p>
            <h1 className="font-serif text-5xl mb-3">{product.name}</h1>
            <div className="flex items-center gap-2 mb-5">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className={`h-4 w-4 ${i <= 4 ? "fill-caramel text-caramel" : "text-muted-foreground"}`} />
              ))}
              <span className="text-sm text-muted-foreground ml-2">(48 avaliações)</span>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            <p className="font-serif text-3xl text-caramel-deep mb-8">
              R$ {(product.price * qty).toFixed(2).replace(".", ",")}
            </p>

            {/* Scent */}
            <div className="mb-7">
              <p className="text-xs uppercase tracking-[0.25em] text-foreground/70 mb-3">Aroma</p>
              <div className="flex flex-wrap gap-2">
                {product.scents.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setScent(s)}
                    className={`rounded-full px-5 py-2.5 text-sm transition-all duration-300 border ${
                      scent === s
                        ? "bg-rose border-caramel text-foreground scale-105 shadow-soft"
                        : "bg-card border-border hover:border-caramel/60"
                    }`}
                  >{s}</button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-7">
              <p className="text-xs uppercase tracking-[0.25em] text-foreground/70 mb-3">Tamanho</p>
              <div className="inline-flex p-1 rounded-full bg-secondary">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-full px-6 py-2 text-sm transition-all ${
                      size === s ? "bg-background shadow-soft text-foreground" : "text-muted-foreground"
                    }`}
                  >{s}</button>
                ))}
              </div>
            </div>

            {/* Qty */}
            <div className="mb-9">
              <p className="text-xs uppercase tracking-[0.25em] text-foreground/70 mb-3">Quantidade</p>
              <div className="inline-flex items-center rounded-full border border-border bg-card">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:text-caramel-deep">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-serif text-lg">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="p-3 hover:text-caramel-deep">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <a
              href={whatsappLink(message)}
              target="_blank" rel="noreferrer"
              className="w-full flex items-center justify-center gap-3 rounded-full bg-whatsapp text-white py-5 text-base font-medium shadow-soft hover:shadow-bloom hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/>
                <path d="M20.5 3.5C18.3 1.2 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12 .1-3.2-1.2-6.3-3.4-8.3zM12 21.8c-1.8 0-3.6-.5-5.2-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.5-1.5-5.4 0-5.5 4.5-10 10-10 2.7 0 5.2 1 7.1 2.9 1.9 1.9 2.9 4.4 2.9 7.1 0 5.5-4.5 10-10 10z"/>
              </svg>
              Comprar pelo WhatsApp
            </a>
            <p className="text-xs text-center text-muted-foreground mt-3">Atendimento personalizado · Resposta em minutos</p>
          </div>
        </div>

        {/* Related */}
        <div className="mt-32">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-serif text-3xl">Você também pode amar</h2>
            <Link to="/" className="text-sm text-caramel-deep">Ver tudo</Link>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6 snap-x">
            {related.map((p) => (
              <div key={p.slug} className="min-w-[280px] max-w-[300px] snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
