import * as Icons from "lucide-react";
import { Link } from "@tanstack/react-router";
import { whatsappLink, categories } from "@/lib/products";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import logo from "@/assets/imagens_inicio/logo_da_marca_sem_fundo.png";
import visaIcon from "@/assets/icons/visa.svg";
import mastercardIcon from "@/assets/icons/mastercard.svg";
import pixIcon from "@/assets/icons/pix.svg";

const CONTACT_EMAIL = "alamaeessencia36@gmail.com";
const CONTACT_PHONE = "(21) 98716-3045";

export function Footer() {
  return (
    <footer className="mt-32 relative">
      <div className="h-px bg-gradient-to-r from-transparent via-rose to-transparent" />
      <div className="bg-chocolate text-cream/90 dark:bg-background dark:text-foreground">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
          <div className="grid gap-10 sm:gap-12 md:grid-cols-3 mb-10 sm:mb-14">
            {/* Column 1: Logo + tagline + social */}
            <div className="text-center md:text-left">
              <div className="flex flex-col items-center md:items-start gap-5">
                <img 
                  src={logo} 
                  alt="Alma e Essência" 
                  className="h-16 w-16 sm:h-20 sm:w-20 opacity-95" 
                />
                <div className="text-center md:text-left">
                  <p className="font-serif italic text-cream/80 leading-relaxed text-sm sm:text-base max-w-sm mx-auto md:mx-0">
                    Pequenos rituais que perfumam a casa e acalmam a alma.
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-3 mt-5">
                    <a 
                      href="https://www.instagram.com/alma_e_essencia/" 
                      aria-label="Instagram" 
                      className="rounded-full p-2.5 border border-cream/15 hover:bg-rose hover:border-rose hover:text-white transition-all"
                    >
                      <Icons.Instagram className="h-4 w-4" />
                    </a>
                    <a 
                      href="https://www.facebook.com/almaeessencia" 
                      aria-label="Facebook" 
                      className="rounded-full p-2.5 border border-cream/15 hover:bg-rose hover:border-rose hover:text-white transition-all"
                    >
                      <Icons.Facebook className="h-4 w-4" />
                    </a>
                    <a 
                      href={whatsappLink("Olá! Gostaria de saber mais sobre os produtos.")} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-2 rounded-full bg-whatsapp text-white px-5 py-2.5 text-sm hover:opacity-95 transition shadow"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      <span className="font-medium">WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Quick links + top categories */}
            <div className="text-center md:text-left">
              <p className="font-serif uppercase tracking-[0.25em] text-xs text-rose mb-4 font-semibold">
                Navegação
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <ul className="space-y-2.5 font-light">
                  <li>
                    <Link to="/" className="hover:text-rose transition">Home</Link>
                  </li>
                  <li>
                    <Link to="/quem-somos" className="hover:text-rose transition">Quem somos</Link>
                  </li>
                  <li>
                    <Link to="/produtos" className="hover:text-rose transition">Produtos</Link>
                  </li>
                  <li>
                    <Link to="/contato" className="hover:text-rose transition">Contato</Link>
                  </li>
                </ul>

                <div>
                  <p className="uppercase tracking-[0.18em] text-rose text-xs mb-2.5 font-semibold">
                    Categorias
                  </p>
                  <ul className="space-y-2.5 font-light">
                    {categories.slice(0, 5).map((cat) => (
                      <li key={cat}>
                        <Link 
                          to="/produtos" 
                          search={(prev) => ({ ...prev, categoria: cat })} 
                          className="hover:text-rose transition"
                        >
                          {cat}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link 
                        to="/produtos" 
                        className="text-rose font-medium hover:underline"
                      >
                        Ver todas
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Column 3: Contact info */}
            <div className="text-center md:text-left">
              <p className="font-serif uppercase tracking-[0.25em] text-xs text-rose mb-4 font-semibold">
                Fale conosco
              </p>
              <div className="text-sm font-light space-y-3">
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <Icons.Mail className="h-4 w-4 flex-shrink-0" />
                  <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-rose transition break-all">
                    {CONTACT_EMAIL}
                  </a>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <Icons.Phone className="h-4 w-4 flex-shrink-0" />
                  <a href={`tel:${CONTACT_PHONE.replace(/\D/g, "")}`} className="hover:text-rose transition">
                    {CONTACT_PHONE}
                  </a>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2.5 text-cream/70">
                  <Icons.Clock className="h-4 w-4 flex-shrink-0" />
                  <span>Seg-Sex, 9h às 18h</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-cream/70">
                <a href="/politica-de-privacidade" className="hover:text-rose transition">
                  Política de Privacidade
                </a>
                <span className="hidden sm:inline">·</span>
                <a href="/termos" className="hover:text-rose transition">
                  Termos
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-cream/10 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
              <p className="text-xs font-light tracking-wide text-cream/50">
                © {new Date().getFullYear()} Alma e Essência — Todos os direitos reservados
              </p>
              <div className="flex items-center justify-center gap-4">
                <p className="text-sm font-light tracking-wide text-cream/60 italic">
                  Feito à mão, com amor.
                </p>
                <div className="flex items-center gap-2.5">
                  <img src={visaIcon} alt="Visa" className="h-6 p-1 rounded bg-cream/6" />
                  <img src={mastercardIcon} alt="Mastercard" className="h-6 p-1 rounded bg-cream/6" />
                  <img src={pixIcon} alt="PIX" className="h-6 p-1 rounded bg-cream/6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}