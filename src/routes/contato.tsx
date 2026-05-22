import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GoogleMap } from "@/components/GoogleMap";
import { whatsappLink } from "@/lib/products";
import { Instagram, Mail, MapPin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contato")({
  component: Contact,
  head: () => ({ meta: [
    { title: "Contato — Alma e Essência" },
    { name: "description", content: "Fale com a gente pelo WhatsApp ou visite nosso ateliê." },
  ]}),
});

function Contact() {
  return (
    <div className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-5xl px-6 lg:px-10 pt-16 pb-24 animate-fade-in-up">
        <div className="text-center mb-14">
          <p className="font-script text-3xl text-caramel-deep">— Conecte-se</p>
          <h1 className="font-serif text-5xl md:text-6xl">Fale com a gente</h1>
          <div className="botanical-divider mt-6"><span>✿</span></div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {[
            { icon: MessageCircle, label: "WhatsApp", value: "(21) 989794503", href: whatsappLink("Olá!") },
            { icon: Mail, label: "E-mail", value: "ola@almaeessencia.com", href: "mailto:ola@almaeessencia.com" },
            { icon: Instagram, label: "Instagram", value: "@almaeessencia", href: "#" },
          ].map((c) => (
            <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="rounded-3xl bg-card border border-border p-7 hover:shadow-bloom hover:-translate-y-1 transition-all">
              <c.icon className="h-6 w-6 text-caramel-deep mb-4" />
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">{c.label}</p>
              <p className="font-serif text-xl">{c.value}</p>
            </a>
          ))}
        </div>

        <div className="rounded-[2rem] overflow-hidden border border-border">
          <div className="p-8 bg-secondary/40 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-caramel-deep" />
            <p className="font-serif text-lg">Rua das Acácias, 128 — Vila Madalena, São Paulo</p>
          </div>
          <GoogleMap lat={-23.559} lng={-46.695} title="Alma e Essência - São Paulo" className="w-full h-80" />
        </div>
      </section>
      <Footer />
    </div>
  );
}
