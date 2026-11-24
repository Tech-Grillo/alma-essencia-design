import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { site, whatsappLink } from "@/config/site";
import { POLICIES } from "@/lib/policies";


/** Layout comum das páginas de política: título, data de atualização, texto e contato. */
export function PolicyPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <nav aria-label="Políticas da loja" className="mb-8 flex flex-wrap gap-2">
          {POLICIES.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              activeProps={{ className: "border-caramel bg-caramel text-primary-foreground" }}
              inactiveProps={{ className: "border-border text-foreground/80 hover:border-caramel" }}
              className="rounded-full border px-4 py-2 text-base font-medium transition"
            >
              {p.label}
            </Link>
          ))}
        </nav>

        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">{title}</h1>
        <p className="mt-3 text-lg text-foreground/80">{intro}</p>
        <p className="mt-2 text-sm text-foreground/60">Atualizado em {updated}</p>

        <div className="policy-text mt-10 space-y-10 text-lg leading-relaxed text-foreground/85">{children}</div>

        <div className="mt-14 rounded-2xl border border-border bg-secondary/40 p-6">
          <p className="text-lg font-semibold">Ficou alguma dúvida?</p>
          <p className="mt-1 text-base text-foreground/80">
            Fale com a gente pelo WhatsApp ou pelo e-mail{" "}
            <a href={`mailto:${site.contact.email}`} className="font-medium text-caramel-deep underline-offset-2 hover:underline dark:text-caramel">
              {site.contact.email}
            </a>
            .
          </p>
          <a
            href={whatsappLink("Olá! Tenho uma dúvida sobre as políticas da loja.")}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-3 text-base font-semibold text-white hover:opacity-90"
          >
            <WhatsAppIcon className="h-5 w-5" /> Falar no WhatsApp
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Uma seção com título dentro da página de política. */
export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-serif text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>
      <div className="space-y-3 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}
