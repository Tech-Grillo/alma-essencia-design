import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/lib/theme";
import { useCart } from "@/lib/cart";
import logo from "@/assets/imagens_inicio/logo_da_marca_sem_fundo.png";
import { WHATSAPP_NUMBER } from "@/lib/products";



const nav = [
  { to: "/", label: "Início" },
  { to: "/quem-somos", label: "Quem Somos", },
  { to: "/produtos", label: "Produtos" },
  { to: "/contato", label: "Contato" },
];






export function Header() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { getCount } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 bg-header-bg shadow-md">
        <div className="mx-auto max-w-[2000px] pl-1 sm:pl-2 lg:pl-3 pr-2 sm:pr-4 lg:pr-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              className="rounded-full p-1 sm:p-1.5 hover:bg-white/10 transition-colors text-white"
            >
              <Icons.Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <Link id="logo1" to="/" aria-label="Voltar para o início" className="flex items-center gap-0.5 sm:gap-1 group min-w-0">
              <img 
                src={logo} 
                alt="Alma e Essência" 
                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 flex-shrink-0 object-contain bg-transparent"
              />
              <span className="font-script text-lg sm:text-xl md:text-2xl lg:text-3xl text-white whitespace-nowrap leading-none">
                alma e essência
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {nav.map((n) => (
              <Link
                id="inicio"
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-base lg:text-lg font-semibold text-white bg-white/20 rounded-full px-4 lg:px-5 py-1.5 lg:py-2" }}
                className="text-base lg:text-lg font-semibold tracking-wide uppercase text-white/90 px-4 lg:px-5 py-1.5 lg:py-2 rounded-full transition-all hover:text-white hover:bg-white/10"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={(event) => toggle({ clientX: event.clientX, clientY: event.clientY })}
              aria-label="Alternar tema"
              className="rounded-full p-2 sm:p-2.5 hover:bg-white/10 transition-colors text-white"
            >
              {theme === "light" ? <Icons.Moon className="h-5 w-5 sm:h-6 sm:w-6" /> : <Icons.Sun className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
            <Link to="/carrinho" aria-label="Carrinho" className="relative rounded-full p-2 sm:p-2.5 hover:bg-white/10 transition-colors text-white">
              <Icons.ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {getCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 text-[10px] rounded-full bg-rose text-white flex items-center justify-center font-medium">
                  {getCount()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Side drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div className="absolute inset-0 bg-chocolate/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <aside
          className={`fixed inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto bg-background shadow-bloom p-6 transition-transform duration-500 ${open ? "translate-x-0" : "-translate-x-full"}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-rose/20 to-caramel/20 rounded-full blur-md opacity-60" />
                <img 
                  src={logo} 
                  alt="Alma e Essência" 
                  className="relative h-10 w-10 object-contain"
                />
              </a>
              <Link to="/" className="font-serif text-xl uppercase tracking-[0.12em] text-chocolate dark:text-white">
                Alma Essência
              </Link>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-secondary">
              <Icons.X className="h-5 w-5" />
            </button>
          </div>

          <div className="pr-2">
            <p className="font-serif text-sm sm:text-base font-semibold uppercase tracking-[0.3em] text-foreground mb-4">
              Navegação
            </p>
            <ul className="space-y-3 mb-8">
              {nav.map((n) => (
                <li key={n.to}>
                  <Link
                    id="inicio"
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="font-serif text-[1.15rem] sm:text-[1.25rem] font-bold text-foreground px-4 py-3 rounded-full block transition-all hover:text-chocolate-deep dark:hover:text-white hover:bg-chocolate/10 dark:hover:bg-chocolate/30 hover:shadow-soft"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-border/70 bg-secondary/40 p-4 space-y-3">
              <p className="font-serif text-base font-semibold text-foreground">
                Sobre a Alma e Essência
              </p>
              <p className="text-[15px] font-medium text-foreground/85 leading-6">
                Somos uma marca que une carinho, fragrâncias e rituais para transformar o lar em um espaço mais acolhedor e especial.
              </p>
              <p className="text-[15px] font-medium text-foreground/85 leading-6">
                Aqui você encontra produtos artesanais, atendimento personalizado e uma experiência de compra mais leve e bonita.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border-2 border-caramel/20 bg-gradient-to-br from-rose/5 via-caramel/5 to-rose/5 p-5 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Icons.MapPin className="h-5 w-5 text-caramel-deep" />
                <p className="font-serif text-base font-bold uppercase tracking-[0.2em] text-caramel-deep">
                  Visite-nos
                </p>
              </div>
              
               <div className="space-y-2">
                <p className="text-base font-bold text-foreground leading-tight">
                  BAIRRO DE ICARAÍ
                </p>
                <p className="text-sm font-semibold text-caramel-deep leading-tight">
                  FEIRA - CAMPO DE SÃO BENTO
                </p>
                <p className="text-sm font-medium text-foreground/80 leading-tight">
                  RIO DE JANEIRO · RJ
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg px-3 py-2 mt-2">
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 font-medium flex items-start gap-2">
                    <Icons.AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span><span className="font-bold">Somos visitantes</span> — feira temporária na maioria dos domingos, mas confirme presença pelo WhatsApp.</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-caramel/20">
                  <p className="text-lg font-bold text-caramel-deep flex items-center gap-2">
                    <Icons.Clock className="h-5 w-5" />
                    Domingos · 09h às 15h
                  </p>
                </div>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-caramel-deep transition-colors pt-2"
                >
                  <Icons.MessageCircle className="h-4 w-4" />
                  {WHATSAPP_NUMBER}
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
