import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart, productToCartItem } from "@/lib/cart";
import { whatsappLink } from "@/lib/products";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import * as Icons from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const Route = createFileRoute("/carrinho")({
  component: RouteComponent,
});

function RouteComponent() {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getCount } = useCart();

  const buildWhatsAppMessage = () => {
    if (items.length === 0) return "";
    
    let message = "🛍️ *Olá! Gostaria de fazer o seguinte pedido:*\n\n";
    
    items.forEach((item, index) => {
      message += `*${index + 1}. ${item.name}*\n`;
      if (item.size) message += `   Tamanho: ${item.size}\n`;
      message += `   Quantidade: ${item.quantity}\n`;
      message += `   Valor unitário: R$ ${item.price.toFixed(2).replace(".", ",")}\n`;
      message += `   Subtotal: R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}\n\n`;
    });
    
    message += `*💰 TOTAL: R$ ${getTotal().toFixed(2).replace(".", ",")}*\n\n`;
    message += "Por favor, confirme a disponibilidade e me envie mais informações sobre o envio. Obrigado! 😊";
    return message;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        <div className="flex items-center gap-3 mb-8 sm:mb-10">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-caramel-deep">
            <Icons.ChevronLeft className="h-4 w-4" /> Voltar
          </Link>
        </div>
        

        <h1 className="font-serif text-4xl sm:text-5xl mb-2">Meu Carrinho</h1>
        <p className="text-muted-foreground mb-8">{getCount()} {getCount() === 1 ? "item" : "itens"}</p>

        {items.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-caramel/30 bg-gradient-to-b from-rose/5 to-transparent p-8 sm:p-12 text-center">
            <Icons.ShoppingBag className="h-20 w-20 text-caramel-deep/40 mx-auto mb-6" />
            <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-caramel-deep mb-4">Seu carrinho está vazio</p>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-md mx-auto">Explore nossos produtos e adicione algo especial!</p>
            <Link to="/produtos" className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-caramel text-primary-foreground px-10 sm:px-12 py-4 sm:py-5 shadow-2xl hover:shadow-bloom hover:-translate-y-1.5 active:translate-y-0 transition-all text-base uppercase tracking-[0.5em] text-center font-bold">
              <span className="relative z-10 flex items-center gap-2">
                <Icons.ShoppingBag className="h-5 w-5" />
                Ver produtos
              </span>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-10">
            {/* Produtos */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={`${item.slug}-${item.size ?? "default"}`} className="rounded-2xl border border-border bg-card p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {item.image && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-secondary/40">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-serif text-lg mb-1">{item.name}</h3>
                    {item.size && (
                      <p className="text-sm text-muted-foreground mb-3">Tamanho: <span className="font-medium text-foreground">{item.size}</span></p>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Quantidade:</span>
                        <div className="inline-flex items-center rounded-full border border-border bg-secondary/50">
                          <button 
                            onClick={() => updateQuantity(item.slug, item.size ?? null, item.quantity - 1)} 
                            className="p-2 hover:text-caramel-deep transition-colors"
                          >
                            <Icons.Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.slug, item.size ?? null, item.quantity + 1)} 
                            className="p-2 hover:text-caramel-deep transition-colors"
                          >
                            <Icons.Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">R$ {item.price.toFixed(2).replace(".", ",")}</p>
                        <p className="font-serif text-2xl font-semibold text-caramel-deep dark:text-white">R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeItem(item.slug, item.size ?? null)} 
                    className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-full hover:bg-secondary"
                    aria-label="Remover"
                  >
                    <Icons.Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="lg:col-span-1">
              <div className="rounded-3xl border-2 border-rose/20 bg-rose/5 p-6 sm:p-8 lg:sticky lg:top-24">
                <h2 className="font-serif text-2xl mb-6">Resumo do pedido</h2>
                
                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">R$ {getTotal().toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="font-medium">A combinar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Desconto</span>
                    <span className="font-medium text-rose">-</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-3">
                    <span className="font-serif text-xl">Total</span>
                    <span className="font-serif text-3xl font-semibold text-caramel-deep dark:text-white">R$ {getTotal().toFixed(2).replace(".", ",")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Frete será calculado com o vendedor</p>
                </div>

                <div className="space-y-3">
                  <a
                    href={whatsappLink(buildWhatsAppMessage())}
                    target="_blank" rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-whatsapp text-white py-4 font-medium hover:opacity-90 transition-opacity shadow-soft hover:shadow-bloom"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    Comprar pelo WhatsApp
                  </a>
                  <p className="text-xs text-center text-muted-foreground">Atendimento personalizado · Resposta em minutos</p>
                </div>

                <button
                  onClick={() => clearCart()}
                  className="w-full mt-4 py-3 rounded-full border border-border text-foreground hover:bg-secondary transition-colors font-medium"
                >
                  Limpar carrinho
                </button>
              </div>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-12">
            <Link to="/produtos" className="inline-flex items-center gap-2 text-caramel-deep hover:text-caramel-deep/80 font-medium">
              <Icons.ArrowLeft className="h-4 w-4" /> Continuar comprando
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
