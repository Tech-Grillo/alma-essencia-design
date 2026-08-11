import * as Icons from "lucide-react";
import { Link } from "@tanstack/react-router";
import { whatsappLink, categories, categoryGroups } from "@/lib/products";
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
          {/* Redesigned footer: 3 columns + compact bottom bar */}
          <div className="grid gap-8 sm:gap-10 md:grid-cols-3 mb-8 sm:mb-12">
            {/* Column 1: Logo + tagline + social */}
            <div className="text-center md:text-left">
              <div className="flex items-center md:items-start gap-4 md:gap-6">
                <img src={logo} alt="Alma e Essência" className="h-16 w-16 sm:h-20 sm:w-20 opacity-95" />
                <div>
                  <p className="font-serif italic text-cream/80 leading-relaxed text-sm sm:text-base max-w-xs">
                    Pequenos rituais que perfumam a casa e acalmam a alma.
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <a href="https://www.instagram.com/alma_e_essencia/" aria-label="Instagram" className="rounded-full p-2 border border-cream/15 hover:bg-rose hover:border-rose hover:text-white transition-all">
                      <Icons.Instagram className="h-4 w-4" />
                    </a>
                    <a href="https://www.facebook.com/almaeessencia" aria-label="Facebook" className="rounded-full p-2 border border-cream/15 hover:bg-rose hover:border-rose hover:text-white transition-all">
                      <Icons.Facebook className="h-4 w-4" />
                    </a>
                    <a href={whatsappLink("Olá! Gostaria de saber mais sobre os produtos.")} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-2 rounded-full bg-whatsapp text-white px-4 py-2 text-sm hover:opacity-95 transition shadow">
                      <WhatsAppIcon className="h-4 w-4" />
                      <span className="font-medium">WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Quick links + top categories */}
            <div className="text-center md:text-left">
              <p className="font-serif uppercase tracking-[0.25em] text-xs text-rose mb-4 font-semibold">Navegação</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <ul className="space-y-2 font-light">
                  <li><Link to="/" className="hover:text-rose transition">Home</Link></li>
                  <li><Link to="/quem-somos" className="hover:text-rose transition">Quem somos</Link></li>
                  <li><Link to="/produtos" className="hover:text-rose transition">Produtos</Link></li>
                  <li><Link to="/contato" className="hover:text-rose transition">Contato</Link></li>
                </ul>

                <div>
                  <p className="uppercase tracking-[0.18em] text-rose text-xs mb-2 font-semibold">Categorias</p>
                  <ul className="space-y-2 font-light">
                    {categories.slice(0, 8).map((cat) => (
                      <li key={cat}><Link to="/produtos" search={(prev) => ({ ...prev, categoria: cat })} className="hover:text-rose transition">{cat}</Link></li>
                    ))}
                    <li className="mt-1"><Link to="/produtos" className="text-rose font-medium hover:underline">Ver todas as categorias</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Column 3: Contact, newsletter, small info */}
            <div className="text-center md:text-left">
              <p className="font-serif uppercase tracking-[0.25em] text-xs text-rose mb-4 font-semibold">Fale conosco</p>
              <div className="text-sm font-light mb-4">
                <p className="flex items-center gap-2"><Icons.Mail className="h-4 w-4" /> {CONTACT_EMAIL}</p>
                <p className="mt-2 flex items-center gap-2"><Icons.Phone className="h-4 w-4" /> {CONTACT_PHONE}</p>
                <p className="mt-2 flex items-center gap-2 text-cream/70"><Icons.Clock className="h-4 w-4" /> Seg-Sex, 9h às 18h</p>
              </div>

              <div className="mt-6 text-sm text-cream/70">
                <a href="/politica-de-privacidade" className="mr-4 hover:underline">Política de Privacidade</a>
                <a href="/termos" className="hover:underline">Termos</a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-cream/10 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
              <p className="text-xs font-light tracking-wide text-cream/50">© {new Date().getFullYear()} Alma e Essência — Todos os direitos reservados</p>
              <div className="flex items-center gap-4">
                <p className="text-sm font-light tracking-wide text-cream/60 italic">Feito à mão, com amor.</p>
                  <div className="flex items-center gap-3">
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

