import * as Icons from "lucide-react";
import { Link } from "@tanstack/react-router";
import { whatsappLink } from "@/lib/products";

export function Footer() {
  return (
    <footer className="mt-32 relative">
      <div className="h-px bg-gradient-to-r from-transparent via-rose to-transparent" />
      <div className="bg-chocolate text-cream/90">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 grid md:grid-cols-3 gap-12">
          <div>
            <p className="mt-6 font-serif italic text-cream/70 leading-relaxed">
              Pequenos rituais que perfumam a casa e acalmam a alma. Feitos à mão, com tempo e cuidado.
            </p>
          </div>

          <div>
            <p className="font-serif uppercase tracking-[0.3em] text-xs text-rose mb-5">Navegação</p>
            <ul className="space-y-3 font-light">
              <li><Link to="/" className="hover:text-rose transition">Home</Link></li>
              <li><Link to="/quem-somos" className="hover:text-rose transition">Quem Somos</Link></li>
              <li><Link to="/produtos" className="hover:text-rose transition">Produtos</Link></li>
              <li><Link to="/contato" className="hover:text-rose transition">Contato</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-serif uppercase tracking-[0.3em] text-xs text-rose mb-5">Conecte-se</p>
            <div className="flex items-center gap-3 mb-6">
              <a href="#" aria-label="Instagram" className="rounded-full p-2.5 border border-cream/20 hover:bg-rose/20 transition">
                <Icons.Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="rounded-full p-2.5 border border-cream/20 hover:bg-rose/20 transition">
                <Icons.Facebook className="h-4 w-4" />
              </a>
            </div>
            <a
              href={whatsappLink("Olá! Gostaria de saber mais sobre os produtos.")}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp text-white px-5 py-2.5 text-sm hover:opacity-90 transition"
            >
              <Icons.MessageCircle className="h-4 w-4" /> Falar no WhatsApp
            </a>
          </div>
        </div>
        <div className="border-t border-cream/10 py-5 text-center text-xs font-light tracking-wide text-cream/50">
          © {new Date().getFullYear()} Alma e Essência — Feito à mão, com amor.
        </div>
      </div>
    </footer>
  );
}
