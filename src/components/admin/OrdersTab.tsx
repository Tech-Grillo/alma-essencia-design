import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { OrderStatus } from "@/lib/checkout/types";
import { site } from "@/config/site";

type OrderItem = { name: string; size: string | null; quantity: number; unitPrice: number; lineTotal: number };

type Order = {
  id: string;
  created_at: string;
  status: OrderStatus;
  payment_method: "pix" | "card";
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_type: "pickup" | "delivery";
  neighborhood: string | null;
  address: string | null;
  delivery_fee: number;
  items: OrderItem[];
  total: number;
};

const brl = (n: number) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_LABEL: Record<OrderStatus, { label: string; className: string }> = {
  paid: { label: "Pago", className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  pending: { label: "Aguardando", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  rejected: { label: "Recusado", className: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" },
  cancelled: { label: "Cancelado", className: "bg-secondary text-muted-foreground" },
  expired: { label: "Expirado", className: "bg-secondary text-muted-foreground" },
};

type Filter = "paid" | "all";

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("paid");

  const load = async () => {
    setLoading(true);
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
    if (filter === "paid") query = query.eq("status", "paid");
    const { data, error: err } = await query;
    setLoading(false);
    if (err) return setError("Não foi possível carregar os pedidos. Confira se a migration 002_orders.sql foi aplicada.");
    setError("");
    setOrders((data ?? []) as Order[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const paidTotal = orders.filter((o) => o.status === "paid").reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="rounded-[2rem] border border-border bg-card p-6 shadow-soft">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl">Pedidos</h2>
          {filter === "paid" && !loading && (
            <p className="text-sm text-muted-foreground">
              {orders.length} pagos · {brl(paidTotal)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(["paid", "all"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === f ? "bg-caramel text-primary-foreground" : "border border-border hover:bg-secondary"
              }`}
            >
              {f === "paid" ? "Pagos" : "Todos"}
            </button>
          ))}
          <button onClick={load} className="rounded-full border border-border p-2 hover:bg-secondary" aria-label="Atualizar">
            <Icons.RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && <p className="rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : orders.length === 0 && !error ? (
        <p className="text-sm text-muted-foreground">Nenhum pedido ainda.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => {
            const st = STATUS_LABEL[o.status];
            const phone = o.customer_phone.replace(/\D/g, "");
            return (
              <li key={o.id} className="rounded-2xl border border-border p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">#{o.id.slice(0, 8)}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.className}`}>{st.label}</span>
                    <span className="text-xs text-muted-foreground">{o.payment_method === "pix" ? "Pix" : "Cartão"}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="font-medium">{o.customer_name}</p>
                    <p className="text-muted-foreground">{o.customer_email}</p>
                    <a
                      href={`https://wa.me/55${phone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-green-700 hover:underline dark:text-green-400"
                    >
                      <Icons.MessageCircle className="h-3.5 w-3.5" /> {o.customer_phone}
                    </a>
                    <p className="mt-2 text-muted-foreground">
                      {o.delivery_type === "pickup" ? "Retirada na feira" : `Entrega: ${o.address} — ${o.neighborhood}`}
                    </p>
                    {o.status === "paid" && (
                      <a
                        href={`https://wa.me/55${phone}?text=${encodeURIComponent(
                          `Oi, ${o.customer_name.split(" ")[0]}! Obrigado por comprar na ${site.name}. Quando puder, conta pra gente o que achou: ${window.location.origin}/pedido/${o.id}`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                      >
                        <Icons.Star className="h-3.5 w-3.5" /> Pedir avaliação
                      </a>
                    )}
                  </div>
                  <div>
                    <ul className="space-y-1">
                      {o.items.map((item, i) => (
                        <li key={i} className="flex justify-between gap-2">
                          <span>
                            {item.quantity}× {item.name}
                            {item.size && <span className="text-muted-foreground"> · {item.size}</span>}
                          </span>
                          <span>{brl(item.lineTotal)}</span>
                        </li>
                      ))}
                      {Number(o.delivery_fee) > 0 && (
                        <li className="flex justify-between text-muted-foreground">
                          <span>Entrega</span>
                          <span>{brl(o.delivery_fee)}</span>
                        </li>
                      )}
                    </ul>
                    <p className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
                      <span>Total</span>
                      <span>{brl(o.total)}</span>
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
