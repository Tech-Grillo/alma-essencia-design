import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SimpleMap } from "@/components/SimpleMap";
import * as Icons from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const whatsappLink = (productName: string) => {
  const phoneNumber = "5521987163045"; // 55 (Brasil) + 21 (DDD) + Número
  const message = encodeURIComponent(`Olá! Quero comprar a ${productName}`);
  
  return `https://wa.me/${phoneNumber}?text=${message}`;
};

export const Route = createFileRoute("/contato")({
  component: Contact,
  // Removemos o "head" que causava o erro e mantemos a estrutura limpa da rota
});

function Contact() {
  return (
    <div className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 pt-12 sm:pt-16 pb-20 sm:pb-24 animate-fade-in-up">
        <div className="text-center mb-10 sm:mb-14">
          <p className="font-script text-2xl sm:text-3xl text-caramel-deep dark:text-white">— Conecte-se</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl">Fale com a gente</h1>
          <div className="botanical-divider mt-6"><span>✿</span></div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10 sm:mb-12">
          {[
            { icon: WhatsAppIcon, label: "WhatsApp", value: "(21) 989794503", href: whatsappLink("Olá!") },
            { icon: Icons.Mail, label: "E-mail", value: "alamaeessencia36@gmail.com", href: "mailto:alamaeessencia36@gmail.com" },
            { icon: Icons.Instagram, label: "Instagram", value: "@alma_e_essencia", href: "#" },
          ].map((c) => {
            const Icon = c.icon;
            if (!Icon) {
              // log helpful debug info during SSR/dev
              try {
                console.error(`Missing icon for contato entry: ${c.label}`, c);
              } catch {}
              return (
                <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="rounded-3xl bg-card border border-border p-7 hover:shadow-bloom hover:-translate-y-1 transition-all">
                  <div className="h-6 w-6 mb-4" />
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">{c.label}</p>
                  <p className="font-serif text-xl">{c.value}</p>
                </a>
              );
            }

            return (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="rounded-3xl bg-card border border-border p-7 hover:shadow-bloom hover:-translate-y-1 transition-all">
                <Icon className="h-6 w-6 text-caramel-deep dark:text-white mb-4" />
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">{c.label}</p>
                <p className="font-serif text-xl">{c.value}</p>
              </a>
            );
          })}
        </div>

        <div className="rounded-[2rem] overflow-hidden border border-border">
          <div className="p-6 sm:p-8 bg-secondary/40 flex items-center gap-3">
            <Icons.MapPin className="h-5 w-5 text-caramel-deep dark:text-white" />
            <div>
              <p className="font-serif text-lg">BAIRRO DE ICARAÍ</p>
              <p className="font-serif text-sm text-muted-foreground">FEIRA - CAMPO DE SÃO BENTO</p>
              <p className="font-serif text-sm text-muted-foreground">RIO DE JANEIRO · RJ</p>
            </div>
          </div>
          <SimpleMap lat={-22.9041} lng={-43.1075} title="Alma e Essência - Icaraí" className="w-full h-80" />
        </div>
      </section>
      <Footer />
    </div>
  );
}
