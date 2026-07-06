import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductReviews } from "@/components/ProductReviews";
import { getAllProducts, getProductBySlug, whatsappLink, type Product } from "@/lib/products-supabase";
import { useCart, productToCartItem } from "@/lib/cart";
import { type MouseEvent, useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { useProductTracking } from "@/hooks/useProductTracking";

export const Route = createFileRoute("/produtos/$slug")({
  component: ProductPage,
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
  const navigate = useNavigate();
  const { slug } = Route.useParams();
  const { addItem } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setProduct(null);

    Promise.all([getAllProducts(), getProductBySlug(slug)])
      .then(([products, foundProduct]) => {
        if (!mounted) return;
        setAllProducts(products);
        setProduct(foundProduct || null);
      })
      .catch(() => {
        if (!mounted) return;
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Carregando produto...</p>
      </div>
    );
  }

  // Track product view
  useProductTracking(product?.slug || "", product?.name || "");
  const [scent, setScent] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAddToCart = () => {
    if (!product) return;

    addItem(productToCartItem(product, size), qty);
    navigate({ to: "/carrinho" });
  };

  const related = product ? allProducts.filter((p) => p.slug !== product.slug) : [];
  const scrollToPurchase = (event?: MouseEvent<HTMLAnchorElement>) => {
    event?.preventDefault();

    if (!product) return;

    document.getElementById("comprar")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", product.purchaseLink);
  };

  useEffect(() => {
    if (!product) return;

    setScent(product.scents[0] || "");
    setSize(product.sizes[0]?.label || "");
    setQty(1);
  }, [product]);

  useEffect(() => {
    if (!product || window.location.hash !== "#comprar") return;

    window.setTimeout(() => {
      scrollToPurchase();
    }, 100);
  }, [product?.purchaseLink]);

  if (!product && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl mb-2">Produto não encontrado</h1>
          <Link to="/produtos" className="text-caramel-deep underline">Voltar</Link>
        </div>
      </div>
    );
  }

  const message = `Olá! Quero comprar: ${product.name} (${scent}, ${size}) — Quantidade: ${qty}`;

  return (
    <div className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-caramel-deep mb-8">
          <Icons.ChevronLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="grid lg:grid-cols-2 gap-14">
          {/* Gallery */}
          <div>
              <div className="rounded-[2rem] overflow-hidden bg-secondary/40 shadow-soft aspect-square">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedImage(product.images[0])}
                />
              </div>
              <div className="grid grid-cols-4 gap-3 mt-4">
                {product.images.map((src, i) => (
                  <button 
                    key={i} 
                    className="rounded-2xl overflow-hidden aspect-square border border-border hover:border-caramel transition-colors"
                    onClick={() => setSelectedImage(src)}
                  >
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
                <Icons.Star key={i} className={`h-4 w-4 ${i <= 4 ? "fill-caramel text-caramel" : "text-muted-foreground"}`} />
              ))}
              <span className="text-sm text-muted-foreground ml-2">(48 avaliações)</span>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">{product.description}</p>
            <a
              href={product.purchaseLink}
              className="inline-flex text-sm font-medium text-caramel-deep underline underline-offset-4 hover:text-foreground transition-colors mb-8"
            >
              Ir para a compra do produto
            </a>

            <p className="font-serif text-3xl text-caramel-deep mb-8">
              R$ {( (product.sizes.find((s: any) => s.label === size)?.price ?? product.price) * qty ).toFixed(2).replace(".", ",")}
            </p>

            {/* Scent */}
            <div id="comprar" className="mb-7 scroll-mt-28">
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
                {product.sizes.map((s: any) => (
                  <button
                    key={s.label}
                    onClick={() => setSize(s.label)}
                    className={`rounded-full px-6 py-2 text-sm transition-all ${
                      size === s.label ? "bg-background shadow-soft text-foreground" : "text-muted-foreground"
                    }`}
                  >{s.label}</button>
                ))}
              </div>
            </div>

            {/* Qty */}
            <div className="mb-9 flex items-end gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-foreground/70 mb-3">Quantidade</p>
                <div className="inline-flex items-center rounded-full border border-border bg-card">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:text-caramel-deep">
                    <Icons.Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-serif text-lg">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="p-3 hover:text-caramel-deep">
                    <Icons.Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="rounded-full px-6 py-3 text-sm bg-rose text-white hover:bg-rose/90 transition-colors font-medium opacity-90 hover:opacity-100 shadow-soft hover:shadow-bloom"
              >
                Adicionar ao carrinho
              </button>
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

        <ProductReviews product={product} />

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

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-caramel transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <Icons.X className="h-8 w-8" />
          </button>
          <img 
            src={selectedImage} 
            alt={product.name} 
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
