import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, MessageCircle, ChevronRight, ShoppingBag, MapPin, Phone, Mail, Instagram, Package, Info } from "lucide-react";

type GuideSection = "home" | "products" | "about" | "contact" | "cart";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  to: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: <ShoppingBag className="h-5 w-5" />,
    label: "Ver Produtos",
    description: "Navegue pelo catálogo completo",
    to: "/produtos",
    color: "bg-rose/10 text-rose",
  },
  {
    icon: <Package className="h-5 w-5" />,
    label: "Destaques",
    description: "Produtos mais vendidos",
    to: "/",
    color: "bg-caramel/10 text-caramel-deep",
  },
  {
    icon: <Info className="h-5 w-5" />,
    label: "Nossa História",
    description: "Conheça a Alma e Essência",
    to: "/quem-somos",
    color: "bg-green-100 text-green-700",
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    label: "Localização",
    description: "Feira de Icaraí - RJ",
    to: "/contato",
    color: "bg-blue-100 text-blue-700",
  },
];

const CONTACT_OPTIONS = [
  {
    icon: <Phone className="h-4 w-4" />,
    label: "WhatsApp",
    value: "(21) 989794503",
    href: "https://wa.me/5521987163045",
  },
  {
    icon: <Mail className="h-4 w-4" />,
    label: "E-mail",
    value: "ola@almaeessencia.com",
    href: "mailto:ola@almaeessencia.com",
  },
  {
    icon: <Instagram className="h-4 w-4" />,
    label: "Instagram",
    value: "@almaeessencia",
    href: "https://www.instagram.com/alma_e_essencia/",
  },
];

export default function HelpBot() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<GuideSection>("home");

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-lg mb-3">Bem-vindo! 👋</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explore as seções principais do nosso site:
              </p>
            </div>

            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border hover:border-caramel/50 hover:shadow-soft transition-all group"
                >
                  <div className={`h-12 w-12 rounded-full ${action.color} flex items-center justify-center flex-shrink-0`}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm group-hover:text-caramel-deep transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-caramel-deep transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Contato rápido:</p>
              <div className="grid grid-cols-3 gap-2">
                {CONTACT_OPTIONS.map((contact) => (
                  <a
                    key={contact.label}
                    href={contact.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="text-caramel-deep">{contact.icon}</div>
                    <span className="text-[10px] text-muted-foreground">{contact.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        );

      case "products":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-lg mb-1">Nossos Produtos 🛍️</h3>
              <p className="text-sm text-muted-foreground">
                Todos feitos à mão com amor e ingredientes naturais
              </p>
            </div>

            <div className="space-y-2">
              <Link
                to="/produtos"
                onClick={() => setOpen(false)}
                className="block p-4 rounded-xl bg-gradient-caramel text-white hover:shadow-bloom transition-all"
              >
                <p className="font-semibold text-sm mb-1">Ver Catálogo Completo</p>
                <p className="text-xs opacity-90">Velas, sabonetes, home sprays e difusores</p>
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/produtos"
                  onClick={() => setOpen(false)}
                  className="p-3 rounded-xl bg-card border border-border hover:border-caramel/50 transition-all text-center"
                >
                  <p className="text-2xl mb-1">🕯️</p>
                  <p className="text-xs font-semibold">Velas</p>
                </Link>
                <Link
                  to="/produtos"
                  onClick={() => setOpen(false)}
                  className="p-3 rounded-xl bg-card border border-border hover:border-caramel/50 transition-all text-center"
                >
                  <p className="text-2xl mb-1">🧼</p>
                  <p className="text-xs font-semibold">Sabonetes</p>
                </Link>
                <Link
                  to="/produtos"
                  onClick={() => setOpen(false)}
                  className="p-3 rounded-xl bg-card border border-border hover:border-caramel/50 transition-all text-center"
                >
                  <p className="text-2xl mb-1">💨</p>
                  <p className="text-xs font-semibold">Home Sprays</p>
                </Link>
                <Link
                  to="/produtos"
                  onClick={() => setOpen(false)}
                  className="p-3 rounded-xl bg-card border border-border hover:border-caramel/50 transition-all text-center"
                >
                  <p className="text-2xl mb-1">🌸</p>
                  <p className="text-xs font-semibold">Difusores</p>
                </Link>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose/10 border border-rose/20">
              <p className="text-xs text-caramel-deep">
                💡 <strong>Dica:</strong> Todos os produtos são artesanais e feitos sob encomenda
              </p>
            </div>
          </div>
        );

      case "about":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-lg mb-1">Nossa História 💝</h3>
              <p className="text-sm text-muted-foreground">
                Pequenos rituais feitos à mão, com tempo e cuidado
              </p>
            </div>

            <Link
              to="/quem-somos"
              onClick={() => setOpen(false)}
              className="block p-4 rounded-xl bg-card border border-border hover:border-caramel/50 transition-all"
            >
              <p className="font-semibold text-sm mb-2">Conheça nossa história</p>
              <p className="text-xs text-muted-foreground mb-3">
                Tudo começou numa cozinha pequena, com cera derretendo numa panela e o cheiro de lavanda invadindo a casa.
              </p>
              <div className="flex items-center gap-2 text-caramel-deep text-xs font-semibold">
                <span>Ler mais</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-secondary/50 text-center">
                <p className="text-2xl mb-1">🌱</p>
                <p className="text-xs font-semibold">100% Natural</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 text-center">
                <p className="text-2xl mb-1">🐰</p>
                <p className="text-xs font-semibold">Cruelty Free</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 text-center">
                <p className="text-2xl mb-1">✋</p>
                <p className="text-xs font-semibold">Artesanal</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 text-center">
                <p className="text-2xl mb-1">💚</p>
                <p className="text-xs font-semibold">Sustentável</p>
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-lg mb-1">Fale Conosco 💬</h3>
              <p className="text-sm text-muted-foreground">
                Estamos aqui para te atender!
              </p>
            </div>

            <div className="space-y-2">
              {CONTACT_OPTIONS.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-caramel/50 transition-all"
                >
                  <div className="h-10 w-10 rounded-full bg-caramel/10 flex items-center justify-center text-caramel-deep flex-shrink-0">
                    {contact.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{contact.label}</p>
                    <p className="text-sm font-semibold truncate">{contact.value}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </a>
              ))}
            </div>

            <Link
              to="/contato"
              onClick={() => setOpen(false)}
              className="block p-4 rounded-xl bg-gradient-caramel text-white text-center hover:shadow-bloom transition-all"
            >
              <p className="font-semibold text-sm">Ver todas as formas de contato</p>
            </Link>

            <div className="p-3 rounded-xl bg-secondary/50">
              <p className="text-xs text-muted-foreground">
                📍 <strong>Localização:</strong> Feira de Icaraí - Campo de São Bento, Rio de Janeiro. Aos domingos das 9h às 15h.
              </p>
            </div>
          </div>
        );

      case "cart":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-lg mb-1">Meu Carrinho 🛒</h3>
              <p className="text-sm text-muted-foreground">
                Seus produtos selecionados
              </p>
            </div>

            <Link
              to="/carrinho"
              onClick={() => setOpen(false)}
              className="block p-4 rounded-xl bg-gradient-caramel text-white hover:shadow-bloom transition-all"
            >
              <p className="font-semibold text-sm mb-1">Ver Carrinho</p>
              <p className="text-xs opacity-90">Finalize seu pedido</p>
            </Link>

            <div className="p-3 rounded-xl bg-rose/10 border border-rose/20">
              <p className="text-xs text-caramel-deep">
                💡 <strong>Formas de pagamento:</strong> Cartão, PIX ou Boleto. Parcelamos em até 3x sem juros!
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {/* Floating button */}
      <button
        aria-label={open ? "Fechar assistente" : "Abrir assistente"}
        onClick={() => setOpen((s) => !s)}
        className="fixed z-50 right-6 bottom-6 inline-flex items-center justify-center rounded-full bg-rose/90 hover:bg-rose text-white h-14 w-14 shadow-lg hover:shadow-xl transition-all hover:scale-110"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      <div
        aria-hidden={!open}
        className={`fixed z-50 right-6 bottom-24 w-96 max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-bloom transition-all transform ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Header com navegação por abas */}
        <div className="bg-gradient-caramel rounded-t-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-serif text-base text-white font-semibold">Guia Rápido</h3>
                <p className="text-[10px] text-white/80">Navegue pelo site</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setActiveSection("home")}
              className={`flex-1 text-xs py-1.5 rounded-md transition-all ${
                activeSection === "home"
                  ? "bg-white text-caramel-deep font-semibold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Início
            </button>
            <button
              onClick={() => setActiveSection("products")}
              className={`flex-1 text-xs py-1.5 rounded-md transition-all ${
                activeSection === "products"
                  ? "bg-white text-caramel-deep font-semibold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Produtos
            </button>
            <button
              onClick={() => setActiveSection("about")}
              className={`flex-1 text-xs py-1.5 rounded-md transition-all ${
                activeSection === "about"
                  ? "bg-white text-caramel-deep font-semibold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Sobre
            </button>
            <button
              onClick={() => setActiveSection("contact")}
              className={`flex-1 text-xs py-1.5 rounded-md transition-all ${
                activeSection === "contact"
                  ? "bg-white text-caramel-deep font-semibold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Contato
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[500px] overflow-y-auto bg-background/50">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}