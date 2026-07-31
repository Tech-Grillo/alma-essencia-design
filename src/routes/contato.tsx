import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SimpleMap } from "@/components/SimpleMap";
import * as Icons from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const whatsappLink = (message: string) => {
  const phoneNumber = "5521987163045"; // 55 (Brasil) + 21 (DDD) + Número
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
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
        <div className="text-center mb-12 sm:mb-16">
          <p className="font-script text-2xl sm:text-3xl text-caramel-deep dark:text-white mb-3">— Conecte-se</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl mb-4">Fale com a gente</h1>
          <div className="botanical-divider mt-4"><span>✿</span></div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12 sm:mb-16">
          {[
            { 
              icon: WhatsAppIcon, 
              label: "WhatsApp", 
              value: "(21) 989794503", 
              href: whatsappLink("Olá! 🌿\n\nGostaria de saber mais sobre os produtos artesanais da Alma e Essência. Poderia me ajudar?"),
              iconColor: "text-green-600 dark:text-green-400",
              labelColor: "text-green-700 dark:text-green-300",
              valueColor: "text-foreground",
              borderColor: "border-green-300 dark:border-green-700",
              shadowColor: "shadow-green-200/50"
            },
            { 
              icon: Icons.Mail, 
              label: "E-mail", 
              value: "alamaeessencia36@gmail.com", 
              href: "mailto:alamaeessencia36@gmail.com",
              iconColor: "text-caramel-deep dark:text-caramel",
              labelColor: "text-caramel-deep dark:text-caramel",
              valueColor: "text-foreground",
              borderColor: "border-caramel dark:border-caramel/70",
              shadowColor: "shadow-caramel/30"
            },
            { 
              icon: Icons.Instagram, 
              label: "Instagram", 
              value: "@alma_e_essencia", 
              href: "https://www.instagram.com/alma_e_essencia/",
              iconColor: "text-purple-600 dark:text-purple-400",
              labelColor: "text-purple-700 dark:text-purple-300",
              valueColor: "text-foreground",
              borderColor: "border-purple-300 dark:border-purple-700",
              shadowColor: "shadow-purple-200/50"
            },
          ].map((c) => {
            const Icon = c.icon;
            if (!Icon) {
              // log helpful debug info during SSR/dev
              try {
                console.error(`Missing icon for contato entry: ${c.label}`, c);
              } catch {}
              return (
                <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className={`rounded-3xl bg-card border-2 ${c.borderColor} p-8 shadow-lg ${c.shadowColor} hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center`}>
                  <div className="h-12 w-12 mb-4" />
                  <p className={`text-sm uppercase tracking-[0.2em] ${c.labelColor} mb-2 font-bold`}>{c.label}</p>
                  <p className="font-serif text-xl font-bold">{c.value}</p>
                </a>
              );
            }

            return (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className={`rounded-3xl bg-card border-2 ${c.borderColor} p-8 sm:p-10 shadow-bloom hover:shadow-bloom hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center min-h-[240px]`}>
                <Icon className={`h-12 w-12 sm:h-14 sm:w-14 ${c.iconColor} mb-4`} />
                <p className={`text-base uppercase tracking-[0.25em] ${c.labelColor} mb-3 font-bold`}>{c.label}</p>
                <p className={`font-sans text-lg sm:text-xl font-semibold tracking-widest ${c.valueColor} break-all`}>{c.value}</p>
              </a>
            );
          })}
        </div>

        <div className="rounded-[2rem] overflow-hidden border border-border shadow-bloom mb-12 sm:mb-16">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-secondary/60 to-secondary/30 flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-caramel/20 dark:bg-caramel/30 flex items-center justify-center">
              <Icons.MapPin className="h-6 w-6 sm:h-7 sm:w-7 text-caramel-deep dark:text-caramel" />
            </div>
            <div className="space-y-1 flex-1">
              <p className="font-serif text-xl sm:text-2xl font-bold text-foreground leading-tight">BAIRRO DE ICARAÍ</p>
              <p className="font-serif text-base sm:text-lg font-semibold text-caramel-deep dark:text-caramel leading-tight">FEIRA - CAMPO DE SÃO BENTO</p>
              <p className="font-serif text-sm sm:text-base font-medium text-foreground/80 leading-tight">RIO DE JANEIRO · RJ</p>
              <p className="font-serif text-base sm:text-lg font-bold text-caramel-deep dark:text-caramel mt-2">
                Domingos · 09h às 15h
              </p>
            </div>
          </div>
          <SimpleMap lat={-22.9041} lng={-43.1075} title="Alma e Essência - Icaraí" className="w-full h-80" />
        </div>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="rounded-[2rem] border border-border bg-card p-6 sm:p-8 shadow-bloom">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-caramel/10 dark:bg-caramel/20 flex items-center justify-center">
                <Icons.Clock className="h-5 w-5 sm:h-6 sm:w-6 text-caramel-deep dark:text-caramel" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">Horário de Atendimento Presencial</h3>
            </div>
            <div className="space-y-2 ml-0 sm:ml-13">
              <p className="font-sans text-base sm:text-lg text-foreground/90">Feira - Campo de São Bento</p>
              <p className="font-serif text-lg sm:text-xl font-semibold text-caramel-deep dark:text-caramel">Domingos · 09h às 15h</p>
              <p className="font-sans text-sm text-muted-foreground mt-2">Estamos te esperando na feira!</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-6 sm:p-8 shadow-bloom">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-caramel/10 dark:bg-caramel/20 flex items-center justify-center">
                <Icons.Heart className="h-5 w-5 sm:h-6 sm:w-6 text-caramel-deep dark:text-caramel" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">Sobre Nós</h3>
            </div>
            <div className="space-y-2 ml-0 sm:ml-13">
              <p className="font-sans text-base sm:text-lg text-foreground/90 leading-relaxed">
                Produtos artesanais feitos com amor e carinho, trazendo a essência da natureza para sua vida.
              </p>
              <p className="font-script text-lg sm:text-xl text-caramel-deep dark:text-caramel mt-2">Alma e Essência 🌿</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-8 sm:mb-10">
          <div className="botanical-divider mb-6"><span>✿</span></div>
          <p className="font-script text-xl sm:text-2xl text-caramel-deep dark:text-white mb-2">Siga-nos nas redes sociais</p>
          <p className="font-sans text-sm sm:text-base text-muted-foreground">Acompanhe novidades e promoções exclusivas</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <a href="https://www.instagram.com/alma_e_essencia/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-sans font-semibold text-sm sm:text-base hover:shadow-lg hover:-translate-y-1 transition-all">
            <Icons.Instagram className="h-5 w-5" />
            <span>@alma_e_essencia</span>
          </a>
          <a href={whatsappLink("Olá! 🌿\n\nGostaria de saber mais sobre os produtos artesanais da Alma e Essência. Poderia me ajudar?")} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white font-sans font-semibold text-sm sm:text-base hover:shadow-lg hover:-translate-y-1 transition-all">
            <Icons.MessageCircle className="h-5 w-5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
}
