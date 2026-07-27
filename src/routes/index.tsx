import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getAllProducts } from "@/lib/products-supabase";
import type { Product } from "@/lib/products-supabase";
import { getTopClickedProducts } from "@/lib/analytics";
import { SimpleMap } from "@/components/SimpleMap";
import heroImg from "@/assets/imagens_inicio/imagem_barraca.png";
import heroImgFront from "@/assets/imagens_inicio/imagem_frente_mae.png";
import barraca02Img from "@/assets/imagens_inicio/imagem barraca02.jpg";
import produtosImg from "@/assets/imagens_inicio/produtos.png";
import aboutImg from "@/assets/imagens_inicio/about.jpg";
import gregoImg from "@/assets/imagens_inicio/imagem-grego.jpg";
import velasImg from "@/assets/imagens_inicio/imagem_velas_o.png";
import difusorImg from "@/assets/imagens_inicio/imagem_difusor_Home.png";
import linhaAzulImg from "@/assets/imagens_inicio/linhaazul.png";
import * as Icons from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [aboutIndex, setAboutIndex] = useState(0);
  const heroImages = [heroImg, heroImgFront, barraca02Img, produtosImg];
  const aboutImages = [aboutImg, gregoImg, velasImg, difusorImg, linhaAzulImg];

  useEffect(() => {
    getAllProducts().then(allProducts => {
      // Buscar os top 10 produtos mais clicados
      const topClicked = getTopClickedProducts(10);
      
      let featuredProducts: Product[];
      
      if (topClicked.length > 0) {
        // Se houver produtos com cliques, mostrar os top 10
        featuredProducts = topClicked
          .map(clicked => allProducts.find(p => p.slug === clicked.slug))
          .filter((p): p is Product => p !== undefined);
      } else {
        // Se não houver cliques ainda, mostrar os primeiros 10 produtos
        featuredProducts = allProducts.slice(0, 10);
      }
      
      setProducts(featuredProducts);
      setLoading(false);
    }).catch(error => {
      console.error('Erro ao carregar produtos:', error);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroImages.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAboutIndex((current) => (current + 1) % aboutImages.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [aboutImages.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* SEARCH BAR */}
      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-12">
        <div className="flex flex-col items-center gap-4">
          <SearchBar />
        </div>
      </section>

    

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-warm opacity-80" />
        <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 pt-14 pb-20 sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-2 gap-10 sm:gap-14 items-center">
          <div className="relative z-10 animate-slide-in-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-background/70 backdrop-blur px-5 py-2 text-sm uppercase tracking-[0.3em] text-caramel-deep dark:text-white mb-8 border border-border">
              <Icons.Sparkles className="h-4 w-4" /> Artesanal · Natural
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] text-foreground">
              Feito com <em className="font-script text-caramel-deep dark:text-white not-italic">amor</em>,<br />
              sentido na pele.
            </h1>
            <p className="mt-7 max-w-md text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Velas, sabonetes e brumas perfumadas que transformam o ordinário em ritual. Pequenas pausas para respirar.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to="/produtos"
                className="w-full sm:w-auto rounded-full bg-gradient-caramel text-primary-foreground px-8 sm:px-10 py-4 sm:py-5 shadow-soft hover:shadow-bloom hover:-translate-y-1.5 active:translate-y-0 transition-all text-base uppercase tracking-[0.5em] text-center"
              >
                Explorar Produtos
              </Link>
              <Link to="/quem-somos" className="text-base uppercase tracking-[0.2em] text-foreground/70 hover:text-caramel-deep transition-colors">
  Nossa história
</Link>
            </div>
          </div>

          <div className="relative animate-slide-in-right">
            <div className="absolute -inset-6 bg-rose/40 rounded-[3rem] rotate-3 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] shadow-bloom">
              <div className="flex transition-transform duration-[2200ms] ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform: `translateX(-${heroIndex * 100}%)` }}>
                {heroImages.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`Imagem ilustrativa da marca em destaque ${index + 1}`}
                    width={1600}
                    height={1024}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="min-w-full object-cover aspect-[5/4] w-full h-auto"
                  />
                ))}
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Selecionar imagem ${index + 1}`}
                    onClick={() => setHeroIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full border border-white/80 transition-all duration-300 ${
                      heroIndex === index ? "scale-125 bg-white" : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl shadow-soft px-5 py-3 hidden md:block">
              <p className="font-script text-2xl text-caramel-deep leading-none">100%</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Natural</p>
            </div>
          </div>
        </div>

        {/* botanical svg */}
        <svg className="absolute top-10 right-0 w-40 text-rose opacity-40" viewBox="0 0 100 200" fill="none" stroke="currentColor" strokeWidth="0.6">
          <path d="M50 0 Q40 50 50 100 Q60 150 50 200" />
          <path d="M50 30 Q30 30 20 50" /><path d="M50 30 Q70 30 80 50" />
          <path d="M50 70 Q30 70 20 90" /><path d="M50 70 Q70 70 80 90" />
          <path d="M50 110 Q30 110 20 130" /><path d="M50 110 Q70 110 80 130" />
        </svg>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-20 sm:py-24 lg:py-32 grid lg:grid-cols-2 gap-10 sm:gap-16 items-center animate-fade-in-up">
        <div className="relative">
          <div className="relative overflow-hidden rounded-[2rem] shadow-soft aspect-square">
            <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${aboutIndex * 100}%)` }}>
              {aboutImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={index === 0 ? "Mãos segurando sabonete artesanal" : "Imagem grega"}
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="min-w-full object-cover aspect-square w-full h-auto"
                />
              ))}
            </div>
          </div>
          <div className="absolute -top-5 -right-5 h-24 w-24 rounded-full border border-caramel/40 hidden md:block" />
          {/* Navigation dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {aboutImages.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Selecionar imagem ${index + 1}`}
                onClick={() => setAboutIndex(index)}
                className={`h-2.5 w-2.5 rounded-full border border-caramel/60 transition-all duration-300 ${
                  aboutIndex === index ? "scale-125 bg-caramel-deep" : "bg-caramel/40 hover:bg-caramel/80"
                }`}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="font-script text-3xl text-caramel-deep dark:text-white mb-3">— Quem somos</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight mb-6">
            Uma história feita à mão, dentro de casa.
          </h2>
          <div className="botanical-divider mb-6 max-w-xs ml-0">
            <span>✿</span>
          </div>
          <p className="text-chocolate dark:text-caramel-deep leading-relaxed text-lg sm:text-xl md:text-2xl mb-4 font-medium">
            A Alma e Essência nasceu na cozinha da nossa casa, entre panelas de cera e
            flores secas. Cada produto é pensado, mexido e embalado por mãos da família —
            com tempo, intenção e ingredientes que respeitam a pele e a natureza.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Acreditamos que cuidar de si é um gesto pequeno, repetido todos os dias.
          </p>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-10 pb-24 animate-fade-in-up">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-caramel-deep dark:text-white mb-3">Destaques</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">Produtos favoritos</h2>
          <div className="botanical-divider mt-6"><span>❀</span></div>
        </div>
        <FeaturedCarousel products={products} />
      </section>

      {/* LOCATION */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-10 pb-24 animate-fade-in-up">
        <div className="rounded-[2.5rem] overflow-hidden border border-border bg-card shadow-soft grid md:grid-cols-2">
          <div className="p-6 sm:p-10 md:p-14 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 text-caramel-deep dark:text-white mb-4">
              <Icons.MapPin className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.3em]">Visite-nos</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-4">Nos encontre</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              BAIRRO DE ICARAÍ <br /> <span className="detalhe dark:text-white" style={{ color: "var(--caramel-deep)" }}>FEIRA - CAMPO DE SÃO BENTO</span><br />RIO DE JANEIRO · RJ
            </p>
            <p className="font-serif text-muted-foreground text-sm dark:text-white" style={{ fontSize: "1.4em", color: "var(--caramel-deep)" }}>
              Domingos · 09h às 15h
            </p>
          </div>
          <div className="aspect-[4/3] md:aspect-auto">
            <SimpleMap lat={-22.9041} lng={-43.1075} title="Alma e Essência - Icaraí" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeaturedCarousel({ products }: { products: typeof import("@/lib/products").products }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: "start",
    slidesToScroll: 1,
    loop: true,
    dragFree: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
        <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
          <div className="flex gap-7">
            {products.map((p) => (
              <div key={p.slug} className="min-w-[calc(100%-1.75rem)] sm:min-w-[calc(50%-1.75rem)] lg:min-w-[calc(33.333%-1.75rem)] xl:min-w-[calc(25%-1.75rem)] 2xl:min-w-[calc(20%-1.75rem)]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>

      {/* Navigation Buttons */}
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-card border border-border shadow-soft flex items-center justify-center text-foreground hover:bg-caramel hover:text-white hover:border-caramel transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Anterior"
      >
        <Icons.ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={scrollNext}
        disabled={!canScrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-card border border-border shadow-soft flex items-center justify-center text-foreground hover:bg-caramel hover:text-white hover:border-caramel transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Próximo"
      >
        <Icons.ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
