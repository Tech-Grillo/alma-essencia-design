// Resumo do painel: números reais tirados dos pedidos e avaliações no Supabase.
import { useEffect, useState, type ReactNode } from "react";
import * as Icons from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { OrderStatus } from "@/lib/checkout/types";
import { Button, Card, EmptyState, Notice, brl } from "./ui";
import { StatusBadge } from "./OrdersTab";

type OrderRow = {
  id: string;
  created_at: string;
  status: OrderStatus;
  total: number;
  customer_name: string;
  payment_method: "pix" | "card";
  items: { name: string; quantity: number; lineTotal: number }[];
};

type Tab = "resumo" | "pedidos" | "produtos" | "avaliacoes";

export function OverviewTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [rating, setRating] = useState<{ avg: number; count: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const since = new Date();
    since.setMonth(since.getMonth() - 6);
    Promise.all([
      supabase
        .from("orders")
        .select("id, created_at, status, total, customer_name, payment_method, items")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("product_reviews").select("rating"),
    ]).then(([o, p, r]) => {
      if (o.error) setError("Não foi possível carregar os pedidos. Confira se a migration 002_orders.sql foi aplicada.");
      setOrders((o.data ?? []) as OrderRow[]);
      setProductCount(p.count ?? null);
      const ratings = (r.data ?? []).map((x: { rating: number }) => x.rating);
      setRating(ratings.length ? { avg: ratings.reduce((a, b) => a + b, 0) / ratings.length, count: ratings.length } : null);
    });
  }, []);

  if (!orders) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icons.Loader2 className="h-4 w-4 animate-spin" /> Carregando...
      </p>
    );
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const paid = orders.filter((o) => o.status === "paid");
  const paidMonth = paid.filter((o) => new Date(o.created_at) >= monthStart);
  const revenueMonth = paidMonth.reduce((sum, o) => sum + Number(o.total), 0);
  const pending = orders.filter((o) => o.status === "pending").length;

  const top = new Map<string, { qty: number; revenue: number }>();
  for (const order of paid) {
    for (const item of order.items ?? []) {
      const entry = top.get(item.name) ?? { qty: 0, revenue: 0 };
      entry.qty += item.quantity;
      entry.revenue += Number(item.lineTotal);
      top.set(item.name, entry);
    }
  }
  const topProducts = [...top.entries()].sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);
  const monthName = now.toLocaleDateString("pt-BR", { month: "long" });

  return (
    <div className="space-y-6">
      {error && <Notice>{error}</Notice>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Stat label={`Faturamento em ${monthName}`} value={brl(revenueMonth)} icon={<Icons.Wallet className="h-4 w-4" />} />
        <Stat label={`Vendas em ${monthName}`} value={String(paidMonth.length)} icon={<Icons.ShoppingBag className="h-4 w-4" />} />
        <Stat
          label="Ticket médio"
          value={paidMonth.length ? brl(revenueMonth / paidMonth.length) : "—"}
          icon={<Icons.Receipt className="h-4 w-4" />}
        />
        <Stat
          label="Avaliação média"
          value={rating ? `${rating.avg.toFixed(1).replace(".", ",")} ★` : "—"}
          hint={rating ? `${rating.count} avaliações` : "Nenhuma ainda"}
          icon={<Icons.Star className="h-4 w-4" />}
        />
      </div>

      {pending > 0 && (
        <button onClick={() => onNavigate("pedidos")} className="block w-full text-left">
          <Notice tone="info">
            <span className="inline-flex items-center gap-2">
              <Icons.Clock className="h-4 w-4" /> {pending} {pending === 1 ? "pedido aguardando" : "pedidos aguardando"} pagamento. Ver pedidos →
            </span>
          </Notice>
        </button>
      )}

      {orders.length === 0 && !error ? (
        <EmptyState
          icon={<Icons.TrendingUp className="h-6 w-6" />}
          title="Ainda não há vendas pelo site"
          text="Quando o primeiro pedido for pago com Pix ou cartão, o faturamento, os pedidos e os produtos mais vendidos aparecem aqui."
          action={
            <Button variant="secondary" onClick={() => onNavigate("produtos")}>
              <Icons.Package className="h-4 w-4" /> Ver produtos{productCount != null ? ` (${productCount})` : ""}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="min-w-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
              <h2 className="font-medium">Últimos pedidos</h2>
              <button onClick={() => onNavigate("pedidos")} className="text-sm text-caramel-deep hover:underline">
                Ver todos
              </button>
            </div>
            <ul className="divide-y divide-border">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm sm:px-5">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2">
                      <span className="truncate font-medium">{o.customer_name}</span>
                      <span className="sm:hidden">
                        <StatusBadge status={o.status} />
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      #{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString("pt-BR")} · {o.payment_method === "pix" ? "Pix" : "Cartão"}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className="hidden sm:inline">
                      <StatusBadge status={o.status} />
                    </span>
                    <span className="text-right font-medium sm:w-24">{brl(o.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="min-w-0">
            <div className="border-b border-border px-4 py-4 sm:px-5">
              <h2 className="font-medium">Mais vendidos</h2>
              <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
            </div>
            {topProducts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">Aparece aqui depois da primeira venda paga.</p>
            ) : (
              <ol className="divide-y divide-border">
                {topProducts.map(([name, { qty, revenue }], i) => (
                  <li key={name} className="flex items-center gap-3 px-4 py-3 text-sm sm:px-5">
                    <span className="w-5 text-muted-foreground">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                    <span className="text-muted-foreground">{qty} un.</span>
                    <span className="text-right font-medium sm:w-24">{brl(revenue)}</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon: ReactNode }) {
  return (
    <Card className="p-4 lg:p-5">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span className="first-letter:uppercase">{label}</span>
      </p>
      <p className="mt-2 font-serif text-2xl lg:text-3xl">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
