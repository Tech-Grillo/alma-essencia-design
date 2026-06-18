import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, MessageCircle } from "lucide-react";

export default function HelpBot() {
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Início", desc: "Página inicial com destaque e produtos" },
    { to: "/produtos", label: "Produtos", desc: "Ver catálogo de produtos" },
    { to: "/quem-somos", label: "Quem Somos", desc: "Nossa história" },
    { to: "/contato", label: "Contato", desc: "Fale conosco" },
    { to: "/carrinho", label: "Carrinho", desc: "Ver itens no carrinho" },
    
  ];

  return (
    <div>
      {/* Floating button */}
      <button
        aria-label={open ? "Fechar assistente" : "Abrir assistente"}
        onClick={() => setOpen((s) => !s)}
        className="fixed z-50 right-6 bottom-6 inline-flex items-center justify-center rounded-full bg-rose/90 hover:bg-rose text-white h-14 w-14 shadow-lg"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      <div
        aria-hidden={!open}
        className={`fixed z-50 right-6 bottom-24 w-80 max-w-xs bg-card border border-border rounded-2xl shadow-bloom p-4 transition-all transform ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        <h3 className="font-serif text-lg mb-2">Assistente do site</h3>
        <p className="text-sm text-muted-foreground mb-3">Posso te guiar pelas seções do site. Clique em um item para navegar.</p>

        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                onClick={() => setOpen(false)}
                className="block rounded-full px-3 py-2 hover:bg-secondary transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{l.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{l.desc}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-4 text-right">
          <button onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Fechar</button>
        </div>
      </div>
    </div>
  );
}
