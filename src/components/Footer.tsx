import * as Icons from "lucide-react";
import { Link } from "@tanstack/react-router";
import { whatsappLink } from "@/lib/products";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import logo from "@/assets/imagens_inicio/logo_da_marca_sem_fundo.png";

export function Footer() {
  return (
    <footer className="mt-32 relative">
      <div className="h-px bg-gradient-to-r from-transparent via-rose to-transparent" />
      <div className="bg-chocolate text-cream/90 dark:bg-background dark:text-foreground">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
          {/* Logo e Tagline */}
          <div className="text-center mb-10 sm:mb-14">
            <img 
              src={logo} 
              alt="Alma e Essência" 
              className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 opacity-90"
            />
            <p className="font-serif italic text-cream/70 leading-relaxed text-base sm:text-lg max-w-2xl mx-auto">
              Pequenos rituais que perfumam a casa e acalmam a alma. Feitos à mão, com tempo e cuidado.
            </p>
          </div>

          {/* Grid de conteúdo */}
          <div className="grid gap-8 sm:gap-10 md:grid-cols-3 mb-10 sm:mb-14">
            {/* Navegação */}
            <div className="text-center md:text-left">
              <p className="font-serif uppercase tracking-[0.3em] text-xs text-rose mb-5 font-semibold">Navegação</p>
              <ul className="space-y-3 font-light">
                <li>
                  <Link to="/" className="inline-flex items-center gap-2 hover:text-rose transition">
                    <Icons.Home className="h-4 w-4" /> Home
                  </Link>
                </li>
                <li>
                  <Link to="/quem-somos" className="inline-flex items-center gap-2 hover:text-rose transition">
                    <Icons.Heart className="h-4 w-4" /> Quem Somos
                  </Link>
                </li>
                <li>
                  <Link to="/produtos" className="inline-flex items-center gap-2 hover:text-rose transition">
                    <Icons.ShoppingBag className="h-4 w-4" /> Produtos
                  </Link>
                </li>
                <li>
                  <Link to="/contato" className="inline-flex items-center gap-2 hover:text-rose transition">
                    <Icons.Mail className="h-4 w-4" /> Contato
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categorias */}
            <div className="text-center md:text-left">
              <p className="font-serif uppercase tracking-[0.3em] text-xs text-rose mb-5 font-semibold">Categorias</p>
              <ul className="space-y-3 font-light text-sm">
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <Icons.Flame className="h-3.5 w-3.5 text-rose" /> Velas Aromáticas
                </li>
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <Icons.Droplets className="h-3.5 w-3.5 text-rose" /> Sabonetes Artesanais
                </li>
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <Icons.Wind className="h-3.5 w-3.5 text-rose" /> Home Sprays
                </li>
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <Icons.Sparkles className="h-3.5 w-3.5 text-rose" /> Difusores
                </li>
              </ul>
            </div>

            {/* Contato e Redes Sociais */}
            <div className="text-center md:text-left">
              <p className="font-serif uppercase tracking-[0.3em] text-xs text-rose mb-5 font-semibold">Conecte-se</p>
              
              {/* Redes Sociais */}
              <div className="flex items-center justify-center md:justify-start gap-3 mb-5">
                <a 
                  href="https://www.instagram.com/alma_e_essencia/" 
                  aria-label="Instagram" 
                  className="rounded-full p-2.5 border border-cream/20 hover:bg-rose hover:border-rose hover:text-white transition-all"
                >
                  <Icons.Instagram className="h-4 w-4" />
                </a>
                <a 
                  href="https://www.facebook.com/almaeessencia" 
                  aria-label="Facebook" 
                  className="rounded-full p-2.5 border border-cream/20 hover:bg-rose hover:border-rose hover:text-white transition-all"
                >
                  <Icons.Facebook className="h-4 w-4" />
                </a>
              </div>

              {/* WhatsApp */}
              <a
                href={whatsappLink("Olá! Gostaria de saber mais sobre os produtos.")}
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-whatsapp text-white px-6 py-3 text-sm hover:opacity-90 transition shadow-lg hover:shadow-xl"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span className="font-medium">Falar no WhatsApp</span>
              </a>

              {/* Horário de atendimento */}
                <p className="mt-4 text-xs text-cream/60 flex items-center justify-center md:justify-start gap-1.5">
                  <Icons.Clock className="h-3 w-3" />
                  Atendimento: Seg-Sex, 9h às 18h
                </p>
            </div>
          </div>

          {/* Linha divisória */}
          <div className="border-t border-cream/10 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
              <p className="text-xs font-light tracking-wide text-cream/50">
                © {new Date().getFullYear()} Alma e Essência
              </p>
              <p className="text-xs font-light tracking-wide text-cream/50 italic">
                Feito à mão, com amor. 🌿
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
