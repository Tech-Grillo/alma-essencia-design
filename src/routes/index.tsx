import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";
import { GoogleMap } from "@/components/GoogleMap";
import heroImg from "@/assets/imagens_inicio/hero.jpg";
import aboutImg from "@/assets/imagens_inicio/about.jpg";
import { MapPin, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-warm opacity-80" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative z-10 animate-slide-in-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-background/70 backdrop-blur px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-caramel-deep dark:text-white mb-8 border border-border">
              <Sparkles className="h-3 w-3" /> Artesanal · Natural
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-foreground">
              Feito com <em className="font-script text-caramel-deep not-italic">amor</em>,<br />
              sentido na pele.
            </h1>
            <p className="mt-7 max-w-md text-lg text-muted-foreground leading-relaxed">
              Velas, sabonetes e brumas perfumadas que transformam o ordinário em ritual. Pequenas pausas para respirar.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link
                to="/produtos"
                className="rounded-full bg-gradient-caramel text-primary-foreground px-8 py-4 shadow-soft hover:shadow-bloom hover:-translate-y-1.5 active:translate-y-0 transition-all text-sm uppercase tracking-[0.5em]"
              >
                Explorar Produtos
              </Link>
              <Link to="/quem-somos" className="text-sm uppercase tracking-[0.2em] text-foreground/70 hover:text-caramel-deep border-b border-border pb-1">
                Nossa história
              </Link>
            </div>
          </div>

          <div className="relative animate-slide-in-right">
            <div className="absolute -inset-6 bg-rose/40 rounded-[3rem] rotate-3 blur-2xl" />
            <img
              src={heroImg}
              alt="Velas artesanais, sabonetes e flores secas"
              width={1600}
              height={1024}
              className="relative rounded-[2.5rem] shadow-bloom object-cover aspect-[5/4] w-full"
            />
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
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32 grid lg:grid-cols-2 gap-16 items-center animate-fade-in-up">
        <div className="relative">
          <img
            src={aboutImg}
            alt="Mãos segurando sabonete artesanal"
            width={1024}
            height={1024}
            loading="lazy"
            className="rounded-[2rem] shadow-soft aspect-square object-cover w-full"
          />
          <div className="absolute -top-5 -right-5 h-24 w-24 rounded-full border border-caramel/40 hidden md:block" />
        </div>
        <div>
          <p className="font-script text-3xl text-caramel-deep mb-3">— Quem somos</p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
            Uma história feita à mão, dentro de casa.
          </h2>
          <div className="botanical-divider mb-6 max-w-xs ml-0">
            <span>✿</span>
          </div>
          <p className="text-muted-foreground leading-relaxed text-lg mb-4">
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
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-24 animate-fade-in-up">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-caramel-deep mb-3">Destaques</p>
          <h2 className="font-serif text-4xl md:text-5xl">Pequenos rituais favoritos</h2>
          <div className="botanical-divider mt-6"><span>❀</span></div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {products.map((p) => (<ProductCard key={p.slug} product={p} />))}
        </div>
      </section>

      {/* LOCATION */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-24 animate-fade-in-up">
        <div className="rounded-[2.5rem] overflow-hidden border border-border bg-card shadow-soft grid md:grid-cols-2">
          <div className="p-10 md:p-14 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-caramel-deep mb-4">
              <MapPin className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.3em]">Visite-nos</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Nos encontre</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              BAIRRO DE ICARAÍ <br /> <span className="detalhe"  style={{ color: "var(--caramel-deep)" }}>FEIRA - CAMPO DE SÃO BENTO</span><br />RIO DE JANEIRO · RJ
            </p>
            <p className="font-serif text-muted-foreground text-sm" style={{ fontSize: "1.4em", color: "var(--caramel-deep)" }}>
              Domingos · 09h às 15h
            </p>
          </div>
          <div className="aspect-[4/3] md:aspect-auto">
            <GoogleMap lat={-22.9041} lng={-43.1075} title="Alma e Essência - Icaraí" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
