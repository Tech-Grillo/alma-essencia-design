import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { site, whatsappLink } from "@/config/site";
import { useCart } from "@/lib/cart";
import { getOrderStatus } from "@/lib/checkout/functions";
import { OrderReviews } from "@/components/OrderReviews";
import type { OrderStatus, OrderSummary } from "@/lib/checkout/types";

export const Route = createFileRoute("/pedido/$id")({
  head: () => ({ meta: [{ title: `Seu pedido — ${site.name}` }, { name: "robots", content: "noindex" }] }),
  component: OrderPage,
});

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS: Record<OrderStatus, { icon: React.ReactNode; title: string; text: string; tone: string }> = {
  paid: {
    icon: <Icons.CheckCircle2 className="h-14 w-14" />,
    title: "Pedido confirmado!",
    text: "Recebemos seu pagamento. Vamos falar com você pelo WhatsApp para combinar a retirada ou a entrega.",
    tone: "text-green-600 dark:text-green-400",
  },
  pending: {
    icon: <Icons.Clock className="h-14 w-14" />,
    title: "Aguardando confirmação",
    text: "Seu pagamento está sendo processado. Esta página atualiza sozinha assim que for aprovado.",
    tone: "text-caramel-deep",
  },
  rejected: {
    icon: <Icons.XCircle className="h-14 w-14" />,
    title: "Pagamento recusado",
    text: "O pagamento não foi aprovado e nada foi cobrado. Você pode tentar de novo com Pix ou outro cartão.",
    tone: "text-rose",
  },
  cancelled: {
    icon: <Icons.XCircle className="h-14 w-14" />,
    title: "Pagamento cancelado",
    text: "Este pagamento foi cancelado. Se tiver dúvidas, fale com a gente pelo WhatsApp.",
    tone: "text-rose",
  },
  expired: {
    icon: <Icons.TimerOff className="h-14 w-14" />,
    title: "Pix expirado",
    text: "O prazo para pagar este Pix terminou e nada foi cobrado. Monte o pedido de novo para gerar outro.",
    tone: "text-muted-foreground",
  },
};

function OrderPage() {
  const { id } = Route.useParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderSummary | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async (attempt = 0) => {
      const result = await getOrderStatus({ data: { orderId: id } }).catch(() => null);
      if (!active) return;
      setOrder(result);
      if (result?.status === "paid") clearCart();
      if (result?.status === "pending" && attempt < 60) timer = setTimeout(() => load(attempt + 1), 5000);
    };
    load();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [id, clearCart]);

  const shortId = id.slice(0, 8);
  const status = order ? STATUS[order.status] : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-xl px-4 py-16 sm:py-24">
        <div className="rounded-[2rem] border border-border bg-card p-8 text-center shadow-soft sm:p-12">
          {order === undefined ? (
            <p className="flex items-center justify-center gap-2 text-muted-foreground">
              <Icons.Loader2 className="h-5 w-5 animate-spin" /> Carregando pedido...
            </p>
          ) : !order || !status ? (
            <>
              <h1 className="mb-3 font-serif text-3xl">Pedido não encontrado</h1>
              <Link to="/produtos" className="text-caramel-deep underline underline-offset-4">
                Ver produtos
              </Link>
            </>
          ) : (
            <>
              <div className={`mb-4 flex justify-center ${status.tone}`}>{status.icon}</div>
              <h1 className="mb-3 font-serif text-4xl">{status.title}</h1>
              <p className="mb-6 text-muted-foreground">{status.text}</p>
              <div className="mb-8 inline-flex flex-col gap-1 rounded-2xl bg-secondary/40 px-6 py-4 text-sm">
                <span>
                  Pedido <span className="font-semibold">#{shortId}</span>
                </span>
                <span>
                  {order.paymentMethod === "pix" ? "Pix" : "Cartão de crédito"} · {brl(order.total)}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href={whatsappLink(`Olá! Fiz o pedido #${shortId} pelo site e gostaria de combinar a entrega.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-whatsapp py-4 font-medium text-white shadow-soft hover:opacity-90"
                >
                  <WhatsAppIcon className="h-5 w-5" /> Falar sobre meu pedido
                </a>
                {(order.status === "rejected" || order.status === "expired") && (
                  <Link to="/carrinho" className="rounded-full border border-border py-3 font-medium hover:bg-secondary">
                    Voltar ao carrinho
                  </Link>
                )}
                <Link to="/produtos" className="text-sm text-muted-foreground hover:text-caramel-deep">
                  Continuar comprando
                </Link>
              </div>
            </>
          )}
        </div>
        {order?.status === "paid" && <OrderReviews orderId={order.id} />}
      </div>
      <Footer />
    </div>
  );
}
