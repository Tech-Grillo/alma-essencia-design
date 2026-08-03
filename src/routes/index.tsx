import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getAllProducts } from "@/lib/products-supabase";
import type { Product } from "@/lib/products-supabase";
import { getTopFavoriteProducts } from "@/lib/analytics";
import { SimpleMap } from "@/components/SimpleMap";
import heroImg from "@/assets/imagens_inicio/imagem_barraca.png";
import heroImgFront from "@/assets/imagens_inicio/imagem_frente_mae.png";
import barraca02Img from "@/assets/imagens_inicio/imagem barraca02.jpg";
import produtosImg from "@/assets/imagens_inicio/produtos.png";
import aboutImg from "@/assets/imagens_inicio/body.png";
import gregoImg from "@/assets/imagens_inicio/imagem-grego.jpg";
import velasImg from "@/assets/imagens_inicio/imagem_velas_o.png";
import difusorImg from "@/assets/imagens_inicio/imagem_difusor_Home.png";
import linhaAzulImg from "@/assets/imagens_inicio/linhaazul.png";
import bombaAromaImg from "@/assets/imagens_inicio/bomba_de_aroma.png";
import difusorLAImg from "@/assets/imagens_inicio/difusor_LA.png";
import tuboLataImg from "@/assets/imagens_inicio/tubo_de_lata.png";
import velasImg2 from "@/assets/imagens_inicio/velas.png";
import waltsMeltsImg from "@/assets/imagens_inicio/walts_melts.png";
import * as Icons from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
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
      const favoriteProducts = getTopFavoriteProducts(10);
      
      let featuredProducts: Product[];
      
      if (favoriteProducts.length > 0) {
        featuredProducts = favoriteProducts
          .map(item => allProducts.find(p => p.slug === item.slug))
          .filter((p): p is Product => p !== undefined);
      } else {
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
    }, 4000);

    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAboutIndex((current) => (current + 1) % aboutImages.length);
    }, 4000);

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
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-warm opacity-80" />
        <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 pt-14 pb-20 sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-2 gap-10 sm:gap-14 items-center">
          <div className="relative z-10 animate-slide-in-left space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose/10 via-caramel/10 to-rose/10 backdrop-blur-md px-6 py-3 text-sm uppercase tracking-[0.3em] text-caramel-deep dark:text-white border-2 border-caramel/20 shadow-lg">
              <Icons.Sparkles className="h-5 w-5 text-caramel-deep" />
              <span className="font-bold">Artesanal · Natural</span>
              <Icons.Sparkles className="h-5 w-5 text-caramel-deep" />
            </div>
            
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] text-foreground">
              Feito com <em className="font-script text-caramel-deep dark:text-white not-italic">amor</em>,<br />
              sentido na pele.
            </h1>
            
            <p className="max-w-lg text-lg sm:text-xl text-muted-foreground leading-relaxed">
              <span className="text-caramel-deep dark:text-white font-semibold">Velas, sabonetes e brumas perfumadas</span> que transformam o ordinário em ritual. Pequenas pausas para respirar.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              <Link
                to="/produtos"
                className="group relative w-full sm:w-auto rounded-full bg-gradient-caramel text-primary-foreground px-10 sm:px-12 py-4 sm:py-5 shadow-2xl hover:shadow-bloom hover:-translate-y-1.5 active:translate-y-0 transition-all text-base uppercase tracking-[0.5em] text-center font-bold"
              >
                <span className="relative z-10">Explorar Produtos</span>
              </Link>
              <Link 
                to="/quem-somos" 
                className="group relative w-full sm:w-auto text-center px-10 py-4 text-base uppercase tracking-[0.3em] font-bold text-foreground/80 hover:text-caramel-deep transition-all duration-300"
              >
                <span className="relative z-10">Nossa história</span>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-caramel-deep group-hover:w-3/4 transition-all duration-300" />
              </Link>
            </div>
          </div>

          <div className="relative animate-slide-in-right">
            <div className="absolute -inset-6 bg-rose/40 rounded-[3rem] rotate-3 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] shadow-bloom">
              <div className="flex transition-transform duration-[2200ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform" style={{ transform: `translateX(-${heroIndex * 100}%)`, backfaceVisibility: 'hidden' }}>
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
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-20 sm:py-24 lg:py-32 grid lg:grid-cols-2 gap-10 sm:gap-16 items-center animate-fade-in-up">
        <div className="relative">
          <div className="relative overflow-hidden rounded-[2rem] shadow-soft aspect-square">
              <div className="flex transition-transform duration-700 ease-in-out will-change-transform" style={{ transform: `translateX(-${aboutIndex * 100}%)`, backfaceVisibility: 'hidden' }}>
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
            Alma e Essência
          </h2>
          <div className="botanical-divider mb-6 max-w-xs ml-0">
            <span>✿</span>
          </div>
          <p className="text-chocolate dark:text-caramel-deep leading-relaxed text-lg sm:text-xl md:text-2xl mb-4 font-medium">
            Na Alma e Essência, cada produto é desenvolvido com carinho, dedicação e respeito ao bem-estar de quem usa.
          </p>
          <p className="text-chocolate dark:text-caramel-deep leading-relaxed text-lg sm:text-xl md:text-2xl mb-4 font-medium">
            Nossos sabonetes, velas aromáticas, difusores de ambiente, águas para lençóis, hidratantes, esfoliantes e geleias de banho são produzidos com ingredientes de origem vegana, enriquecidos com óleos essenciais, óleos vegetais e extratos naturais cuidadosamente selecionados.
          </p>
          <p className="text-xl font-sans text-[#8B4513] font-semibold leading-relaxed">
            Acreditamos que cuidar de si é um gesto pequeno, repetido todos os dias.
          </p>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="relative mx-auto max-w-[1600px] px-6 lg:px-10 py-24 animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-b from-rose/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative text-center mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-16 bg-gradient-to-r from-transparent via-caramel-deep/60 to-transparent" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-caramel-deep dark:text-white font-semibold relative z-10">Destaques</p>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose/20 to-transparent blur-sm -z-0" />
            </div>
            <span className="h-px w-16 bg-gradient-to-r from-transparent via-caramel-deep/60 to-transparent" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 bg-gradient-caramel bg-clip-text text-transparent leading-tight">
            Produtos favoritos
          </h2>
          <div className="botanical-divider mt-6 mb-6">
            <span className="text-4xl inline-block animate-pulse">❀</span>
          </div>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Selecionamos com carinho os produtos mais amados por vocês
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-rose/5 via-caramel/5 to-rose/5 rounded-[2rem] blur-2xl -z-10" />
          <FeaturedCarousel products={products} />
        </div>
        
        {/* Signature */}
        <div className="mt-16 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-rose/10 via-caramel/10 to-rose/10 rounded-full blur-xl opacity-60" />
            <p className="relative font-script text-5xl sm:text-6xl md:text-7xl text-caramel-deep dark:text-white italic">
              Adriana Grillo
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-caramel-deep/40" />
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">Fundadora & Artesã</p>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-caramel-deep/40" />
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="relative mx-auto max-w-[1600px] px-6 lg:px-10 pt-32 pb-24 animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-b from-rose/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative text-center mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-16 bg-gradient-to-r from-transparent via-caramel-deep/60 to-transparent" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-caramel-deep dark:text-white font-semibold relative z-10">Destaques</p>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose/20 to-transparent blur-sm -z-0" />
            </div>
            <span className="h-px w-16 bg-gradient-to-r from-transparent via-caramel-deep/60 to-transparent" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 bg-gradient-caramel bg-clip-text text-transparent leading-tight">
            Mais vendidos
          </h2>
          <div className="botanical-divider mt-6 mb-6">
            <span className="text-4xl inline-block animate-pulse">✿</span>
          </div>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Os produtos que fazem mais sucesso entre nossos clientes
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-rose/5 via-caramel/5 to-rose/5 rounded-[2rem] blur-2xl -z-10" />
          <BestSellersCarousel />
        </div>
        
        {/* Signature */}
        <div className="mt-16 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-rose/10 via-caramel/10 to-rose/10 rounded-full blur-xl opacity-60" />
            <p className="relative font-script text-5xl sm:text-6xl md:text-7xl text-caramel-deep dark:text-white italic">
              Adriana Grillo
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-caramel-deep/40" />
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">Fundadora & Artesã</p>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-caramel-deep/40" />
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-10 pb-24 animate-fade-in-up">
        <div className="rounded-[2.5rem] overflow-hidden border border-border bg-card shadow-soft grid md:grid-cols-2">
          <div className="p-6 sm:p-10 md:p-14 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-caramel-deep dark:text-white mb-6">
              <Icons.MapPin className="h-6 w-6" />
              <span className="text-sm uppercase tracking-[0.3em] font-bold">Visite-nos</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl mb-6">Nos encontre</h2>
            <div className="font-serif space-y-1 mb-4">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
                BAIRRO DE ICARAÍ
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-caramel-deep dark:text-white leading-tight">
                FEIRA - CAMPO DE SÃO BENTO
              </p>
              <p className="text-base sm:text-lg md:text-xl font-medium text-foreground/80 leading-tight">
                RIO DE JANEIRO · RJ
              </p>
            </div>
            <p className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-caramel-deep dark:text-white">
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

function FeaturedCarousel({ products }: { products: Product[] }) {
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

const bestSellers = [
  { name: "Velas", image: velasImg2, category: "Velas", price: 79.9, slug: "vela-aromatica-lavanda" },
  { name: "Tubo de lata", image: tuboLataImg, category: "Kits", price: 89.9, slug: "kit-banho" },
  { name: "Difusor", image: difusorLAImg, category: "Difusores", price: 119.0, slug: "difusor-baunilha" },
  { name: "Wax melts", image: waltsMeltsImg, category: "Whalts Melts", price: 49.9, slug: "walts-melts" },
];

function BestSellersCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    loop: true,
    dragFree: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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
          {bestSellers.map((item) => (
            <div
              key={item.name}
              className="min-w-[calc(100%-1.75rem)] sm:min-w-[calc(50%-1.75rem)] lg:min-w-[calc(33.333%-1.75rem)] xl:min-w-[calc(25%-1.75rem)]"
            >
              <article className="group relative rounded-3xl bg-card/95 border border-border/60 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-bloom h-full flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-secondary/40 flex-shrink-0">
                  <Link
                    to="/produtos/$slug"
                    params={{ slug: item.slug }}
                    className="block h-full w-full"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ transform: 'translateZ(0)' }}
                    />
                  </Link>
                </div>
                <div className="p-4 sm:p-6 flex flex-col flex-1">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-caramel-deep/80 dark:text-white mb-1 text-center">
                    {item.category}
                  </p>
                  <h3 className="font-serif text-xl sm:text-2xl leading-tight mb-2 text-center">{item.name}</h3>
                  <span className="font-serif text-3xl sm:text-4xl font-black text-[#8B4513] text-center mb-4 drop-shadow-md tracking-tight">
                    R$ {item.price.toFixed(2).replace(".", ",")}
                  </span>
                  <div className="mt-auto">
                    <Link
                      to="/produtos/$slug"
                      params={{ slug: item.slug }}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-[#8B4513] text-white text-sm py-3 font-medium transition-all hover:bg-[#6B3410] hover:shadow-lg"
                  >
                    <ShoppingBag className="h-4 w-4" /> COMPRAR
                  </Link>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canScrollPrev}
        className="absolute left-0 top-1/2 z-10 flex h-12 w-12 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition-all hover:border-caramel hover:bg-caramel hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Anterior"
      >
        <Icons.ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canScrollNext}
        className="absolute right-0 top-1/2 z-10 flex h-12 w-12 translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition-all hover:border-caramel hover:bg-caramel hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Próximo"
      >
        <Icons.ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}