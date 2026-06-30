import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import aboutImg from "@/assets/imagens_inicio/about.jpg";

export const Route = createFileRoute("/quem-somos")({
  component: About,
  head: () => ({ meta: [
    { title: "Quem Somos — Alma e Essência" },
    { name: "description", content: "Nossa história artesanal, feita à mão e com amor." },
  ]}),
});

function About() {
  return (
    <div className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-5xl px-6 lg:px-10 pt-16 pb-24 animate-fade-in-up">
        <div className="text-center mb-14">
          <p className="font-script text-3xl text-caramel-deep dark:text-white">— Nossa história</p>
          <h1 className="font-serif text-5xl md:text-6xl mt-1">Pequeno, feito com tempo.</h1>
          <div className="botanical-divider mt-6"><span>✿</span></div>
        </div>
        <img src={aboutImg} alt="Mãos artesanais" loading="lazy" className="rounded-[2rem] w-full aspect-[16/9] object-cover shadow-soft mb-12" />
        <div className="prose prose-lg mx-auto max-w-2xl text-muted-foreground leading-relaxed space-y-6">
          <p className="text-xl font-serif text-foreground">
            Tudo começou numa cozinha pequena, com cera derretendo numa panela e o cheiro de lavanda invadindo a casa.
          </p>
          <p>
            A Alma e Essência é um pequeno negócio que nasceu do desejo de transformar
            momentos simples em rituais de cuidado. Nossos proutos são feitos
            com ingredientes naturais e muito carinho.
          </p>
          <p>
            Acreditamos que o autocuidado é um gesto pequeno, repetido todos os dias — acender
            uma vela ao final da tarde, sentir o aroma de um sabonete no banho, perfumar o quarto com um 
            home spray antes de dormir.
          </p>
          <p className="font-script text-3xl text-caramel-deep dark:text-white text-center pt-6">
            Com amor,<br />Alma e Essência
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
