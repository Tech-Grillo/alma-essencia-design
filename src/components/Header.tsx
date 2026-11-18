import { Link, useRouterState } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";
import { useCart } from "@/lib/cart";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import logo from "@/assets/imagens_inicio/logo-da-marca-sem-fundo.webp";
import { instagramHandle, instagramUrl, site, whatsappLink } from "@/config/site";

const nav = [
  { to: "/", label: "Início", icon: Icons.Home },
  { to: "/produtos", label: "Produtos", icon: Icons.ShoppingBag },
  { to: "/quem-somos", label: "Quem Somos", icon: Icons.Heart },
  { to: "/contato", label: "Contato", icon: Icons.MessageSquare },
] as const;

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.location.mapsQuery)}`;

export function Header() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { getCount } = useCart();
  const count = getCount();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const closeRef = useRef<HTMLButtonElement>(null);

  // Fecha ao trocar de página.
  useEffect(() => setOpen(false), [pathname]);

  // Com o menu aberto: trava a rolagem do fundo, fecha com Esc e põe o foco no "fechar".
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <>
      <header className="sticky top-0 z-40 bg-header-bg shadow-md">
        <div className="mx-auto flex h-14 max-w-[2000px] items-center justify-between gap-4 pl-1 pr-2 sm:h-16 sm:pl-2 sm:pr-4 md:pl-4 lg:pl-6 lg:pr-6">
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={open}
              aria-controls="menu-lateral"
              className="rounded-full p-2 text-white transition-colors hover:bg-white/10 md:hidden"
            >
              <Icons.Menu className="h-6 w-6" />
            </button>
            <Link id="logo1" to="/" aria-label="Voltar para o início" className="group flex min-w-0 items-center gap-0.5 sm:gap-1">
              <img
                src={logo}
                alt="Alma e Essência"
                className="h-7 w-7 flex-shrink-0 bg-transparent object-contain sm:h-8 sm:w-8 md:h-9 md:w-9"
              />
              <span className="whitespace-nowrap font-script text-lg leading-none text-white sm:text-xl md:text-2xl lg:text-3xl">
                alma e essência
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-6 md:flex lg:gap-8">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-lg lg:text-xl font-semibold text-white bg-white/20 rounded-full px-4 lg:px-5 py-1.5 lg:py-2" }}
                className="rounded-full px-4 py-1.5 text-lg font-semibold uppercase tracking-wide text-white/90 transition-all hover:bg-white/10 hover:text-white lg:px-5 lg:py-2 lg:text-xl"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={(event) => toggle({ clientX: event.clientX, clientY: event.clientY })}
              aria-label="Alternar tema"
              className="rounded-full p-2 text-white transition-colors hover:bg-white/10 sm:p-2.5"
            >
              {theme === "light" ? <Icons.Moon className="h-5 w-5 sm:h-6 sm:w-6" /> : <Icons.Sun className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
            <Link
              to="/carrinho"
              aria-label={count > 0 ? `Carrinho com ${count} ${count === 1 ? "item" : "itens"}` : "Carrinho"}
              className="relative rounded-full p-2 text-white transition-colors hover:bg-white/10 sm:p-2.5"
            >
              <Icons.ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Menu lateral (celular) */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 md:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="absolute inset-0 bg-chocolate/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <aside
          id="menu-lateral"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`fixed inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-background shadow-bloom transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Topo */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="" className="h-10 w-10 object-contain dark:brightness-0 dark:invert" />
              <span className="font-script text-2xl leading-none text-chocolate dark:text-white">alma e essência</span>
            </Link>
            <button
              ref={closeRef}
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="rounded-full p-2 text-foreground transition-colors hover:bg-secondary"
            >
              <Icons.X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 [scrollbar-width:none]">
            {/* Navegação */}
            <nav aria-label="Navegação principal">
              <ul className="space-y-1">
                {nav.map(({ to, label, icon: Icon }) => {
                  const active = isActive(to);
                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-lg font-semibold transition-colors ${
                          active ? "bg-caramel/15 text-caramel-deep dark:text-caramel" : "text-foreground hover:bg-secondary"
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1">{label}</span>
                        <Icons.ChevronRight className="h-5 w-5 opacity-40" />
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <Link
                    to="/carrinho"
                    aria-current={isActive("/carrinho") ? "page" : undefined}
                    className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-lg font-semibold transition-colors ${
                      isActive("/carrinho") ? "bg-caramel/15 text-caramel-deep dark:text-caramel" : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icons.ShoppingCart className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">Carrinho</span>
                    {count > 0 ? (
                      <span className="rounded-full bg-rose px-2.5 py-0.5 text-sm font-bold text-white">{count}</span>
                    ) : (
                      <Icons.ChevronRight className="h-5 w-5 opacity-40" />
                    )}
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Onde encontrar */}
            <div className="mt-6 rounded-2xl bg-secondary/50 p-5">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-caramel-deep dark:text-caramel">
                <Icons.MapPin className="h-4 w-4" /> Onde estamos
              </p>
              <p className="mt-2 text-lg font-semibold leading-snug text-foreground">{site.location.name}</p>
              <p className="mt-1 flex items-center gap-2 text-base text-foreground/80">
                <Icons.Clock className="h-4 w-4 flex-shrink-0" /> {site.hours}
              </p>
              <p className="mt-2 text-sm text-foreground/70">Confirme pelo WhatsApp antes de ir.</p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-base font-semibold text-caramel-deep underline-offset-4 hover:underline dark:text-caramel"
              >
                Como chegar <Icons.ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            {/* Contatos */}
            <div className="mt-4 space-y-1">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-base text-foreground transition-colors hover:bg-secondary"
              >
                <Icons.Instagram className="h-5 w-5 text-caramel-deep dark:text-caramel" />
                {instagramHandle}
              </a>
              <a
                href={`mailto:${site.contact.email}`}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-base text-foreground transition-colors hover:bg-secondary"
              >
                <Icons.Mail className="h-5 w-5 flex-shrink-0 text-caramel-deep dark:text-caramel" />
                <span className="truncate">{site.contact.email}</span>
              </a>
            </div>
          </div>

          {/* Ação principal fixa no rodapé do menu */}
          <div className="border-t border-border p-4">
            <a
              href={whatsappLink("Olá! Gostaria de saber mais sobre os produtos da Alma e Essência.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp py-3.5 text-lg font-semibold text-white transition hover:opacity-90"
            >
              <WhatsAppIcon className="h-5 w-5" /> Falar no WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
