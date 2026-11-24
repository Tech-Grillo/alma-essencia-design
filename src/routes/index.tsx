import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import * as Icons from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { SimpleMap } from "@/components/SimpleMap";
import { getAllProducts, type Product } from "@/lib/products-supabase";
import { categoryGroups } from "@/lib/products";
import { getBestSellers } from "@/lib/home/functions";
import { site } from "@/config/site";
import placeholderProduto from "@/assets/placeholder-produto.webp";
import heroImg from "@/assets/imagens_inicio/imagem-barraca.webp";
import heroImgFront from "@/assets/imagens_inicio/imagem-frente-mae.webp";
import barraca02Img from "@/assets/imagens_inicio/imagem-barraca-02.webp";
import produtosImg from "@/assets/imagens_inicio/produtos.webp";
import aboutImg from "@/assets/imagens_inicio/body.webp";
import gregoImg from "@/assets/imagens_inicio/imagem-grego.webp";
import velasImg from "@/assets/imagens_inicio/imagem-velas-o.webp";
import difusorImg from "@/assets/imagens_inicio/imagem-difusor-home.webp";
import linhaAzulImg from "@/assets/imagens_inicio/linhaazul.webp";
import difusorLAImg from "@/assets/imagens_inicio/difusor-la.webp";
import tuboLataImg from "@/assets/imagens_inicio/tubo-de-lata.webp";
import velasImg2 from "@/assets/imagens_inicio/velas.webp";
import waxMeltsImg from "@/assets/imagens_inicio/walts-melts.webp";

export const Route = createFileRoute("/")({
  component: Home,
});

const heroImages = [heroImg, heroImgFront, barraca02Img, produtosImg];
const aboutImages = [aboutImg, gregoImg, velasImg, difusorImg, linhaAzulImg];

/** Fotos reais da marca usadas como capa de algumas categorias. As demais usam a foto do primeiro produto. */
const CATEGORY_PHOTOS: Record<string, string> = {
  "velas aromaticas": velasImg2,
  velas: velasImg2,
  difusores: difusorLAImg,
  kits: tuboLataImg,
  "whalts melts": waxMeltsImg,
  "wax melts": waxMeltsImg,
};

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
const parentOf = (category: string) => categoryGroups.find((g) => g.children.includes(category))?.parent ?? category;

function Home() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [bestSlugs, setBestSlugs] = useState<string[]>([]);

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch((error) => {
        console.error("Erro ao carregar produtos:", error);
        setProducts([]);
      });
    getBestSellers()
      .then(setBestSlugs)
      .catch(() => setBestSlugs([]));
  }, []);

  // Mais vendidos de verdade (pedidos pagos). Sem vendas ainda, mostra as novidades.
  const { title, subtitle, list } = useMemo(() => {
    const all = products ?? [];
    const best = bestSlugs.map((slug) => all.find((p) => p.slug === slug)).filter((p): p is Product => !!p);
    if (best.length >= 4) {
      return { title: "Mais vendidos", subtitle: "Os produtos que os clientes mais levam.", list: best.slice(0, 8) };
    }
    const newest = [...all].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    // Só os 4 cadastrados mais recentemente (uma linha no computador).
    return { title: "Novidades", subtitle: "Os produtos que acabaram de chegar à loja.", list: newest.slice(0, 4) };
  }, [products, bestSlugs]);

  const categories = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products ?? []) {
      const key = parentOf(p.category);
      map.set(key, [...(map.get(key) ?? []), p]);
    }
    return [...map.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 8)
      .map(([name, items]) => ({
        name,
        image: CATEGORY_PHOTOS[normalize(name)] ?? items.find((p) => p.images?.[0] && !p.images[0].includes("placeholder"))?.images[0] ?? placeholderProduto,
      }));
  }, [products]);

  return (
    <div className="min-h-screen overflow-x-clip">
      <Header />
      <Hero />
      <TrustBar />

      {/* PRODUTOS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
        <SectionTitle eyebrow="Loja" title={title} subtitle={subtitle} />
        {!products ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-secondary/70" />
                <div className="mt-3 h-4 w-3/4 rounded bg-secondary/70" />
                <div className="mt-3 h-11 rounded-full bg-secondary/70" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Link
            to="/produtos"
            className="inline-flex items-center gap-2 rounded-full border-2 border-caramel px-7 py-3 text-base font-semibold text-caramel-deep transition hover:bg-caramel hover:text-primary-foreground dark:text-white"
          >
            Ver todos os produtos <Icons.ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* COMPRE POR CATEGORIA */}
      {categories.length > 1 && (
        <section className="bg-secondary/40 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <SectionTitle eyebrow="Explore" title="Compre por categoria" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {categories.map((c) => (
                <a
                  key={c.name}
                  href={`/produtos?categoria=${encodeURIComponent(c.name)}`}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-secondary"
                >
                  <img
                    src={c.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3 sm:p-4">
                    <span className="text-base font-semibold text-white sm:text-lg">{c.name}</span>
                    <Icons.ArrowRight className="h-5 w-5 flex-shrink-0 text-white transition group-hover:translate-x-1" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <About />
      <Location />
      <Footer />
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-10 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-caramel-deep dark:text-caramel">{eyebrow}</p>
      <h2 className="font-serif text-4xl text-foreground sm:text-5xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-3 max-w-xl text-base text-foreground/80 sm:text-lg">{subtitle}</p>}
    </div>
  );
}

function useRotation(length: number, ms = 4500) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % length), ms);
    return () => window.clearInterval(timer);
  }, [length, ms]);
  return [index, setIndex] as const;
}

function Slides({ images, index, onSelect, alt, aspect }: { images: string[]; index: number; onSelect: (i: number) => void; alt: (i: number) => string; aspect: string }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] shadow-soft">
      <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((image, i) => (
          <img key={i} src={image} alt={alt(i)} loading={i === 0 ? "eager" : "lazy"} className={`w-full min-w-full object-cover ${aspect}`} />
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Mostrar foto ${i + 1}`}
            onClick={() => onSelect(i)}
            className={`h-2.5 w-2.5 rounded-full border border-white/80 transition ${index === i ? "scale-125 bg-white" : "bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>
    </div>
  );
}

function Hero() {
  const [index, setIndex] = useRotation(heroImages.length);
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-warm opacity-80" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:grid-cols-2 lg:gap-14 lg:px-10 lg:pb-24 lg:pt-20">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-caramel/30 bg-background/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-caramel-deep dark:text-white">
            <Icons.Sparkles className="h-4 w-4" /> Artesanal · Feito à mão
          </span>
          <h1 className="font-serif text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
            Feito com <em className="font-script not-italic text-caramel-deep dark:text-white">amor</em>,<br />
            sentido na pele.
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-foreground/80 sm:text-xl">
            Velas, sabonetes, hidratantes, home sprays e difusores que transformam o ordinário em ritual. Pequenas pausas para respirar.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              to="/produtos"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-caramel px-8 py-4 text-lg font-semibold text-primary-foreground shadow-soft transition hover:bg-caramel/90"
            >
              Ver produtos <Icons.ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/quem-somos"
              className="inline-flex items-center justify-center rounded-full border-2 border-foreground/15 px-8 py-4 text-lg font-semibold text-foreground transition hover:border-caramel hover:text-caramel-deep"
            >
              Nossa história
            </Link>
          </div>
        </div>

        <div className="relative">
          <Slides
            images={heroImages}
            index={index}
            onSelect={setIndex}
            alt={(i) => `Barraca da ${site.name} na feira, foto ${i + 1}`}
            aspect="aspect-[5/4]"
          />
          <div className="absolute -bottom-5 left-4 hidden rounded-2xl border border-border bg-card px-5 py-3 shadow-soft md:block">
            <p className="font-script text-2xl leading-none text-caramel-deep">Feito à mão</p>
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/70">em Niterói</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items: { icon: ReactNode; title: string; text: string }[] = [
    { icon: <Icons.HandHeart className="h-6 w-6" />, title: "Feito à mão", text: "Produção artesanal em Niterói" },
    { icon: <Icons.CreditCard className="h-6 w-6" />, title: "Pix ou cartão", text: "Pagamento seguro pelo site" },
    { icon: <Icons.MapPin className="h-6 w-6" />, title: "Retirada grátis", text: "Na feira do Campo de São Bento" },
    { icon: <Icons.Leaf className="h-6 w-6" />, title: "100% vegano", text: "Ingredientes de origem vegana" },
  ];
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-7 sm:px-6 lg:grid-cols-4 lg:px-10">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-caramel/15 text-caramel-deep dark:text-caramel">
              {item.icon}
            </span>
            <div>
              <p className="text-base font-semibold text-foreground">{item.title}</p>
              <p className="text-sm text-foreground/75">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function About() {
  const [index, setIndex] = useRotation(aboutImages.length);
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-[560px] lg:mx-0">
        <Slides images={aboutImages} index={index} onSelect={setIndex} alt={(i) => `Produtos da ${site.name}, foto ${i + 1}`} aspect="aspect-square" />
      </div>
      <div className="max-w-2xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-caramel-deep dark:text-caramel">Quem somos</p>
        <h2 className="mb-6 font-serif text-4xl text-foreground sm:text-5xl">{site.name}</h2>
        <div className="space-y-4 text-lg leading-relaxed text-foreground/85 sm:text-xl">
          <p>Na {site.name}, cada produto é desenvolvido com carinho, dedicação e respeito ao bem-estar de quem usa.</p>
          <p>
            Nossos sabonetes, velas aromáticas, difusores de ambiente, águas para lençóis, hidratantes, esfoliantes e geleias de banho são
            produzidos com ingredientes de origem vegana, enriquecidos com óleos essenciais, óleos vegetais e extratos naturais cuidadosamente
            selecionados.
          </p>
          <p className="font-semibold text-caramel-deep dark:text-white">Acreditamos que cuidar de si é um gesto pequeno, repetido todos os dias.</p>
        </div>
        <div className="mt-8">
          <p className="font-script text-5xl text-caramel-deep dark:text-white sm:text-6xl">Adriana Grillo</p>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.25em] text-foreground/70">Fundadora & Artesã</p>
        </div>
        <Link to="/quem-somos" className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-caramel-deep hover:underline dark:text-white">
          Conheça nossa história <Icons.ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Location() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-10">
      <div className="grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft md:grid-cols-2">
        <div className="flex flex-col justify-center p-6 sm:p-10 md:p-12">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-caramel-deep dark:text-caramel">
            <Icons.MapPin className="h-5 w-5" /> Visite-nos
          </p>
          <h2 className="mb-5 font-serif text-4xl sm:text-5xl">Nos encontre</h2>
          <p className="text-xl font-semibold text-foreground sm:text-2xl">Feira do Campo de São Bento</p>
          <p className="mb-5 text-lg text-foreground/80">Icaraí · Niterói, RJ</p>
          <p className="mb-5 font-serif text-2xl font-bold text-caramel-deep dark:text-white sm:text-3xl">Domingos · 9h às 15h</p>
          <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-900 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-200">
            <Icons.AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <span>
              <strong>Somos visitantes:</strong> estamos na feira na maioria dos domingos. Confirme pelo WhatsApp antes de ir.
            </span>
          </p>
        </div>
        <div className="aspect-[4/3] md:aspect-auto">
          <SimpleMap />
        </div>
      </div>
    </section>
  );
}
