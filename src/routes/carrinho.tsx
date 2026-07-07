import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart, productToCartItem } from "@/lib/cart";
import { whatsappLink } from "@/lib/products";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import * as Icons from "lucide-react";

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
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
        <div className="flex items-center gap-3 mb-10">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-caramel-deep">
            <Icons.ChevronLeft className="h-4 w-4" /> Voltar
          </Link>
        </div>
        

        <h1 className="font-serif text-5xl mb-2">Meu Carrinho</h1>
        <p className="text-muted-foreground mb-8">{getCount()} {getCount() === 1 ? "item" : "itens"}</p>

        {items.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center">
            <Icons.ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Seu carrinho está vazio</p>
            <p className="text-muted-foreground mb-6">Explore nossos produtos e adicione algo especial!</p>
            <Link to="/produtos" className="inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-white hover:bg-rose/90 transition-colors font-medium">
              <Icons.ShoppingBag className="h-4 w-4" /> Ver produtos
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Produtos */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={`${item.slug}-${item.size ?? "default"}`} className="rounded-2xl border border-border bg-card p-6 flex gap-6">
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
                    
                    <div className="flex items-center justify-between">
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
                        <p className="font-serif text-2xl font-bold bg-gradient-caramel bg-clip-text text-transparent">R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</p>
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
              <div className="rounded-3xl border-2 border-rose/20 bg-rose/5 p-8 sticky top-24">
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
                    <span className="font-serif text-3xl font-bold bg-gradient-caramel bg-clip-text text-transparent">R$ {getTotal().toFixed(2).replace(".", ",")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Frete será calculado com o vendedor</p>
                </div>

                <div className="space-y-3">
                  <a
                    href={whatsappLink(buildWhatsAppMessage())}
                    target="_blank" rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-whatsapp text-white py-4 font-medium hover:opacity-90 transition-opacity shadow-soft hover:shadow-bloom"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/>
                      <path d="M20.5 3.5C18.3 1.2 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12 .1-3.2-1.2-6.3-3.4-8.3zM12 21.8c-1.8 0-3.6-.5-5.2-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.5-1.5-5.4 0-5.5 4.5-10 10-10 2.7 0 5.2 1 7.1 2.9 1.9 1.9 2.9 4.4 2.9 7.1 0 5.5-4.5 10-10 10z"/>
                    </svg>
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
