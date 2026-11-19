import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { supabase } from "@/lib/supabase";
import { site } from "@/config/site";
import type { OrderStatus } from "@/lib/checkout/types";
import { Card, EmptyState, Notice, brl, inputClass } from "./ui";

type OrderItem = { name: string; size: string | null; scent?: string | null; quantity: number; unitPrice: number; lineTotal: number };

type Order = {
  id: string;
  created_at: string;
  status: OrderStatus;
  payment_method: "pix" | "card";
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_type: "pickup" | "delivery" | "shipping";
  neighborhood: string | null;
  address: string | null;
  postal_code?: string | null;
  shipping_carrier?: string | null;
  shipping_service?: string | null;
  shipping_days?: number | null;
  delivery_fee: number;
  items: OrderItem[];
  total: number;
};

const STATUS: Record<OrderStatus, { label: string; className: string }> = {
  paid: { label: "Pago", className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  pending: { label: "Aguardando", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  rejected: { label: "Recusado", className: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" },
  cancelled: { label: "Cancelado", className: "bg-secondary text-muted-foreground" },
  expired: { label: "Expirado", className: "bg-secondary text-muted-foreground" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS[status];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}>{s.label}</span>;
}

type Filter = "paid" | "pending" | "all";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "paid", label: "Pagos" },
  { id: "pending", label: "Aguardando" },
  { id: "all", label: "Todos" },
];

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  return d.length >= 10 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : raw;
}

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("paid");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") query = query.eq("status", filter);
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

  const term = search.trim().toLowerCase();
  const shown = term
    ? orders.filter((o) => o.customer_name.toLowerCase().includes(term) || o.id.startsWith(term.replace("#", "")))
    : orders;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icons.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className={`${inputClass} pl-9`} placeholder="Buscar por cliente ou nº do pedido" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border p-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  filter === f.id ? "bg-caramel text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button onClick={load} className="rounded-xl border border-border p-2.5 text-muted-foreground hover:bg-secondary" aria-label="Atualizar">
            <Icons.RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && <Notice>{error}</Notice>}

      {loading && orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : shown.length === 0 && !error ? (
        <EmptyState
          icon={<Icons.ShoppingBag className="h-6 w-6" />}
          title={term ? "Nenhum pedido encontrado" : filter === "paid" ? "Nenhum pedido pago ainda" : "Nenhum pedido"}
          text={term ? "Confira o nome ou o número digitado." : "Os pedidos feitos pelo checkout do site aparecem aqui."}
        />
      ) : (
        <ul className="space-y-3">
          {shown.map((o) => {
            const phone = o.customer_phone.replace(/\D/g, "");
            const firstName = o.customer_name.split(" ")[0];
            return (
              <li key={o.id}>
                <Card className="p-4 sm:p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold">#{o.id.slice(0, 8)}</span>
                      <StatusBadge status={o.status} />
                      <span className="text-xs text-muted-foreground">{o.payment_method === "pix" ? "Pix" : "Cartão"}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>

                  <div className="grid gap-5 text-sm sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="font-medium">{o.customer_name}</p>
                      <p className="text-muted-foreground">{o.customer_email}</p>
                      <p className="flex items-start gap-1.5 pt-1 text-muted-foreground">
                        {o.delivery_type === "pickup" ? (
                          <>
                            <Icons.MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> Retirada na feira
                          </>
                        ) : o.delivery_type === "shipping" ? (
                          <>
                            <Icons.Package className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                            <span>
                              <span className="font-medium text-foreground">
                                {o.shipping_carrier} {o.shipping_service}
                              </span>
                              {o.shipping_days ? ` · até ${o.shipping_days} dias úteis` : ""}
                              <br />
                              {o.address} · CEP {o.postal_code?.replace(/^(\d{5})(\d{3})$/, "$1-$2")}
                            </span>
                          </>
                        ) : (
                          <>
                            <Icons.Truck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> {o.address} — {o.neighborhood}
                          </>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-3">
                        <a
                          href={`https://wa.me/55${phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                        >
                          <Icons.MessageCircle className="h-3.5 w-3.5 text-green-600" /> {formatPhone(o.customer_phone)}
                        </a>
                        {o.status === "paid" && (
                          <a
                            href={`https://wa.me/55${phone}?text=${encodeURIComponent(
                              `Oi, ${firstName}! Obrigado por comprar na ${site.name}. Quando puder, conta pra gente o que achou: ${window.location.origin}/pedido/${o.id}`,
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                          >
                            <Icons.Star className="h-3.5 w-3.5 text-caramel" /> Pedir avaliação
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl bg-secondary/40 p-3.5">
                      <ul className="space-y-1.5">
                        {o.items.map((item, i) => (
                          <li key={i} className="flex justify-between gap-3">
                            <span>
                              {item.quantity}× {item.name}
                              {item.size && !/^[uú]nico$/i.test(item.size) && <span className="text-muted-foreground"> · {item.size}</span>}
                              {item.scent && <span className="text-muted-foreground"> · {item.scent}</span>}
                            </span>
                            <span className="whitespace-nowrap">{brl(item.lineTotal)}</span>
                          </li>
                        ))}
                        {Number(o.delivery_fee) > 0 && (
                          <li className="flex justify-between text-muted-foreground">
                            <span>{o.delivery_type === "shipping" ? "Frete" : "Entrega"}</span>
                            <span>{brl(o.delivery_fee)}</span>
                          </li>
                        )}
                      </ul>
                      <p className="mt-2.5 flex justify-between border-t border-border pt-2.5 font-semibold">
                        <span>Total</span>
                        <span>{brl(o.total)}</span>
                      </p>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
