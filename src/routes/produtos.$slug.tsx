import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getAllProducts, getProductBySlug, whatsappLink, type Product } from "@/lib/products-supabase";
import { useCart, productToCartItem } from "@/lib/cart";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { site } from "@/config/site";
import { ProductReviews, Stars, formatAverage, useProductReviews } from "@/components/ProductReviews";

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
  const reviewData = useProductReviews(slug);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setProduct(null);

    const loadProduct = async () => {
      try {
        const [products, foundProduct] = await Promise.all([
          getAllProducts(),
          getProductBySlug(slug),
        ]);
        if (!mounted) return;
        setAllProducts(products);
        setProduct(foundProduct ?? null);
      } catch (error) {
        if (!mounted) return;
        console.error('Erro ao carregar produto:', error);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    loadProduct();

    // Recarregar quando a página se tornar visível
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProduct();
      }
    };

    // Recarregar periodicamente (a cada 15 segundos)
    const interval = setInterval(() => {
      loadProduct();
    }, 15000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [slug]);

  const [scent, setScent] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const relatedScrollRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = () => {
    if (!product) return;

    addItem(productToCartItem(product, size), qty);
    navigate({ to: "/carrinho" });
  };

  const related = product ? allProducts.filter((p) => p.slug !== product.slug) : [];

  const checkRelatedScroll = () => {
    const container = relatedScrollRef.current;
    if (!container) return;
    const tolerance = 10;
    setCanScrollLeft(container.scrollLeft > tolerance);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - tolerance);
  };

  const scrollRelated = (direction: 'left' | 'right') => {
    const container = relatedScrollRef.current;
    if (!container) return;
    const scrollAmount = 300;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const container = relatedScrollRef.current;
    if (!container) return;
    checkRelatedScroll();
    container.addEventListener('scroll', checkRelatedScroll);
    return () => container.removeEventListener('scroll', checkRelatedScroll);
  }, [related]);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Carregando produto...</p>
      </div>
    );
  }

  if (!product) {
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

      <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-10 animate-fade-in-up">
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
            {reviewData.count > 0 ? (
              <a href="#avaliacoes" className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-caramel-deep">
                <Stars value={Math.round(reviewData.average)} size="sm" />
                <span>
                  {formatAverage(reviewData.average)} · {reviewData.count} {reviewData.count === 1 ? "avaliação" : "avaliações"}
                </span>
              </a>
            ) : (
              <div className="mb-5" />
            )}
            <div className="grid gap-6">
              <div className="rounded-[2rem] border border-border bg-card p-6 shadow-soft">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground mb-1">Preço estimado</p>
                    <p className="font-serif text-5xl font-semibold text-caramel-deep">
                      R$ {((product.sizes.find((s: any) => s.label === size)?.price ?? product.price) * qty).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <span className="rounded-full bg-rose/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-rose">
                    Escolha confortável
                  </span>
                </div>
                <p className="mt-5 text-base leading-7 text-muted-foreground font-medium">
                  Selecione aroma, tamanho e quantidade para enviar a mensagem automaticamente via WhatsApp.
                </p>
              </div>

              <div className="rounded-[2rem] border border-border bg-background p-6 shadow-soft">
                <div id="comprar" className="space-y-6 scroll-mt-28">
                  <div className="bg-gradient-to-br from-caramel/5 to-rose/5 rounded-2xl p-6 border border-caramel/10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-caramel to-rose rounded-full"></div>
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-caramel-deep">Descrição</p>
                    </div>
                    <p className="text-base text-foreground leading-relaxed font-medium">{product.description}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-foreground/70 mb-3 font-semibold">Aroma</p>
                    <div className="flex flex-wrap gap-3">
                      {product.scents.map((s: string) => (
                        <button
                          key={s}
                          onClick={() => setScent(s)}
                          className={`rounded-full border px-6 py-3 text-base font-semibold transition-all ${
                            scent === s
                              ? "border-caramel bg-caramel/10 text-foreground shadow-soft"
                              : "border-border bg-background text-muted-foreground hover:border-caramel/70 hover:text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-foreground/70 mb-3 font-semibold">Tamanho</p>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map((s: any) => (
                        <button
                          key={s.label}
                          onClick={() => setSize(s.label)}
                          className={`rounded-full border px-6 py-3 text-base font-semibold transition-all ${
                            size === s.label
                              ? "border-caramel bg-caramel/10 text-foreground shadow-soft"
                              : "border-border bg-background text-muted-foreground hover:border-caramel/70 hover:text-foreground"
                          }`}
                        >
                          {s.label} {s.unit && <span className="text-caramel-deep">({s.unit})</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-foreground/70 mb-3 font-semibold">Quantidade</p>
                    <div className="inline-flex items-center rounded-full border border-border bg-card">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="px-5 py-3 text-foreground transition hover:text-caramel-deep"
                      >
                        <Icons.Minus className="h-5 w-5" />
                      </button>
                      <span className="min-w-[3rem] text-center font-serif text-lg font-semibold">{qty}</span>
                      <button
                        onClick={() => setQty((q) => q + 1)}
                        className="px-5 py-3 text-foreground transition hover:text-caramel-deep"
                      >
                        <Icons.Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full rounded-full bg-gradient-caramel text-primary-foreground py-5 text-base font-semibold uppercase tracking-[0.18em] shadow-soft hover:shadow-bloom hover:-translate-y-0.5 transition-all"
                  >
                    Adicionar ao carrinho
                  </button>
                  <a
                    href={whatsappLink(message)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-caramel text-primary-foreground py-5 text-base font-semibold uppercase tracking-[0.18em] shadow-soft hover:shadow-bloom hover:-translate-y-0.5 transition-all"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    Comprar pelo WhatsApp
                  </a>
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Atendimento personalizado · Finalize seu pedido com rapidez e segurança.
                </p>
              </div>

              {/* Frete e entrega */}
              <div className="rounded-[2rem] border border-border bg-card p-6 shadow-soft sm:p-8">
                <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-caramel-deep">
                  <Icons.Truck className="h-4 w-4" /> Frete e entrega
                </p>
                <ul className="divide-y divide-border">
                  <li className="flex items-start gap-4 pb-4">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-caramel/30 text-caramel-deep">
                      <Icons.MapPin className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <p className="flex flex-wrap items-baseline justify-between gap-x-3 font-medium text-foreground">
                        Retirada na feira <span className="text-sm font-semibold text-green-700 dark:text-green-400">Grátis</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{site.checkout.pickup}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 pt-4">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-caramel/30 text-caramel-deep">
                      <Icons.Truck className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Entrega em Niterói</p>
                      <p className="text-sm text-muted-foreground">Taxa fixa por bairro, calculada no checkout.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <ProductReviews reviews={reviewData.reviews} average={reviewData.average} />

        {/* Related */}
        <div className="mt-32">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-serif text-3xl">Você também pode amar</h2>
            <Link to="/" className="text-sm text-caramel-deep">Ver tudo</Link>
          </div>
          <div className="relative">
            {/* Seta esquerda */}
            {canScrollLeft && (
              <button
                onClick={() => scrollRelated('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-xl rounded-full p-3 transition-all duration-300 hover:scale-110 -ml-4 border-2 border-caramel/20"
                aria-label="Rolar para esquerda"
              >
                <Icons.ChevronLeft className="h-6 w-6 text-caramel-deep" />
              </button>
            )}

            {/* Container de scroll */}
            <div
              ref={relatedScrollRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-6 -mx-6 px-6 snap-x hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {related.map((p) => (
                <div key={p.slug} className="min-w-[280px] max-w-[300px] snap-start flex-shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            {/* Seta direita */}
            {canScrollRight && (
              <button
                onClick={() => scrollRelated('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-xl rounded-full p-3 transition-all duration-300 hover:scale-110 -mr-4 border-2 border-caramel/20"
                aria-label="Rolar para direita"
              >
                <Icons.ChevronRight className="h-6 w-6 text-caramel-deep" />
              </button>
            )}
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
