import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { isDefaultSize, useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase";
import { site } from "@/config/site";
import { createCardPayment, createPixPayment, getOrderStatus } from "@/lib/checkout/functions";
import type { CheckoutInput, PixResult } from "@/lib/checkout/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: `Finalizar compra — ${site.name}` }, { name: "robots", content: "noindex" }] }),
  component: CheckoutPage,
});

type Zone = { neighborhood: string; fee: number };
type Method = "pix" | "card";

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY as string | undefined;
let mpInitialized = false;

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const onlyDigits = (s: string) => s.replace(/\D/g, "");

function formatPhone(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

const inputClass =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-caramel focus:ring-2 focus:ring-caramel/20";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground";

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart, ready } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [zones, setZones] = useState<Zone[]>([]);
  const [method, setMethod] = useState<Method>("pix");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pix, setPix] = useState<PixResult | null>(null);

  useEffect(() => {
    if (MP_PUBLIC_KEY && !mpInitialized) {
      initMercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
      mpInitialized = true;
    }
    supabase
      .from("delivery_zones")
      .select("neighborhood, fee")
      .eq("active", true)
      .order("neighborhood")
      .then(({ data }) => setZones((data ?? []).map((z) => ({ neighborhood: z.neighborhood, fee: Number(z.fee) }))));
  }, []);

  const subtotal = getTotal();
  const deliveryFee =
    deliveryType === "delivery" ? zones.find((z) => z.neighborhood === neighborhood)?.fee ?? 0 : 0;
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;

  const formError = useMemo(() => {
    if (name.trim().length < 2) return "Informe seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Informe um e-mail válido.";
    const digits = onlyDigits(phone);
    if (digits.length < 10 || digits.length > 11) return "Informe um WhatsApp com DDD.";
    if (deliveryType === "delivery") {
      if (!neighborhood) return "Escolha o bairro de entrega.";
      if (address.trim().length < 5) return "Informe o endereço completo.";
    }
    return "";
  }, [name, email, phone, deliveryType, neighborhood, address]);

  const checkout: CheckoutInput = {
    customer: { name, email, phone },
    delivery: deliveryType === "delivery" ? { type: "delivery", neighborhood, address } : { type: "pickup" },
    items: items.map((i) => ({ slug: i.slug, size: i.size ?? null, scent: i.scent ?? null, quantity: i.quantity })),
  };

  const finish = (orderId: string) => {
    clearCart();
    navigate({ to: "/pedido/$id", params: { id: orderId } });
  };

  const handlePix = async () => {
    if (formError) return setError(formError);
    setError("");
    setSubmitting(true);
    const result = await createPixPayment({ data: { checkout, expectedTotal: total } });
    setSubmitting(false);
    if (!result.ok) return setError(result.error);
    setPix(result.data);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <p className="flex items-center justify-center gap-2 py-32 text-muted-foreground">
          <Icons.Loader2 className="h-5 w-5 animate-spin" /> Carregando...
        </p>
      </div>
    );
  }

  if (items.length === 0 && !pix) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <Icons.ShoppingBag className="mx-auto mb-6 h-16 w-16 text-caramel-deep/40" />
          <h1 className="mb-3 font-serif text-4xl">Seu carrinho está vazio</h1>
          <Link to="/produtos" className="text-caramel-deep underline underline-offset-4">
            Ver produtos
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <Link to="/carrinho" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-caramel-deep">
          <Icons.ChevronLeft className="h-4 w-4" /> Voltar ao carrinho
        </Link>
        <h1 className="mb-8 font-serif text-4xl sm:text-5xl">Finalizar compra</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {pix ? (
              <PixPanel pix={pix} onPaid={() => finish(pix.orderId)} />
            ) : (
              <>
                <Section number={1} title="Seus dados">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                      <span className={labelClass}>Nome completo</span>
                      <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                    </label>
                    <label>
                      <span className={labelClass}>E-mail</span>
                      <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                    </label>
                    <label>
                      <span className={labelClass}>WhatsApp</span>
                      <input
                        className={inputClass}
                        inputMode="tel"
                        placeholder="(21) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        autoComplete="tel"
                      />
                    </label>
                  </div>
                </Section>

                <Section number={2} title="Entrega">
                  <div className="space-y-3">
                    <Choice
                      checked={deliveryType === "pickup"}
                      onSelect={() => setDeliveryType("pickup")}
                      title="Retirada — grátis"
                      description={site.checkout.pickup}
                    />
                    {zones.length > 0 && (
                      <Choice
                        checked={deliveryType === "delivery"}
                        onSelect={() => setDeliveryType("delivery")}
                        title="Entrega"
                        description="Taxa fixa por bairro"
                      />
                    )}
                    {deliveryType === "delivery" && (
                      <div className="grid gap-4 pt-2 sm:grid-cols-2">
                        <label>
                          <span className={labelClass}>Bairro</span>
                          <select className={inputClass} value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}>
                            <option value="">Selecione</option>
                            {zones.map((z) => (
                              <option key={z.neighborhood} value={z.neighborhood}>
                                {z.neighborhood} — {brl(z.fee)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span className={labelClass}>Endereço</span>
                          <input
                            className={inputClass}
                            placeholder="Rua, número e complemento"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            autoComplete="street-address"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </Section>

                <Section number={3} title="Pagamento">
                  <div className="mb-5 grid grid-cols-2 gap-3">
                    <MethodTab active={method === "pix"} onClick={() => setMethod("pix")} icon={<Icons.QrCode className="h-5 w-5" />} label="Pix" />
                    <MethodTab
                      active={method === "card"}
                      onClick={() => setMethod("card")}
                      icon={<Icons.CreditCard className="h-5 w-5" />}
                      label="Cartão de crédito"
                    />
                  </div>

                  {error && (
                    <p className="mb-4 rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">{error}</p>
                  )}

                  {method === "pix" ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Geramos um QR Code e um código copia e cola. Você paga pelo app do seu banco e a confirmação aparece aqui na hora.
                      </p>
                      <button
                        onClick={handlePix}
                        disabled={submitting}
                        className="w-full rounded-full bg-caramel py-4 font-semibold text-primary-foreground shadow-soft transition hover:bg-caramel/90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? "Gerando Pix..." : `Gerar Pix de ${brl(total)}`}
                      </button>
                    </div>
                  ) : !MP_PUBLIC_KEY ? (
                    <p className="text-sm text-muted-foreground">Pagamento com cartão indisponível no momento. Use o Pix.</p>
                  ) : formError ? (
                    <p className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                      Preencha seus dados e a entrega para liberar o pagamento com cartão. <span className="font-medium text-foreground">{formError}</span>
                    </p>
                  ) : (
                    <CardPayment
                      key={total}
                      locale="pt-BR"
                      initialization={{ amount: total, payer: { email: email.trim() } }}
                      customization={{
                        paymentMethods: { maxInstallments: site.checkout.maxInstallments },
                        visual: { style: { theme: "default" } },
                      }}
                      onSubmit={async (formData) => {
                        setError("");
                        const result = await createCardPayment({
                          data: {
                            checkout,
                            expectedTotal: total,
                            card: {
                              token: formData.token,
                              payment_method_id: formData.payment_method_id,
                              issuer_id: formData.issuer_id,
                              installments: formData.installments,
                              payer: {
                                email: formData.payer?.email,
                                identification: formData.payer?.identification as { type: string; number: string } | undefined,
                              },
                            },
                          },
                        });
                        if (!result.ok) {
                          setError(result.error);
                          return;
                        }
                        if (result.data.status === "rejected") {
                          setError(result.data.message);
                          return;
                        }
                        finish(result.data.orderId);
                      }}
                      onError={(e) => console.error("Card Payment Brick:", e)}
                    />
                  )}
                </Section>
              </>
            )}
          </div>

          <aside className="h-fit rounded-[2rem] border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
            <h2 className="mb-4 font-serif text-2xl">Resumo</h2>
            <ul className="mb-5 space-y-3 border-b border-border pb-5">
              {items.map((item) => (
                <li key={`${item.slug}-${item.size ?? ""}-${item.scent ?? ""}`} className="flex justify-between gap-3 text-sm">
                  <span>
                    {item.quantity}× {item.name}
                    {!isDefaultSize(item.size) && <span className="text-muted-foreground"> · {item.size}</span>}
                    {item.scent && <span className="text-muted-foreground"> · {item.scent}</span>}
                  </span>
                  <span className="whitespace-nowrap font-medium">{brl(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={brl(subtotal)} />
              <Row
                label="Entrega"
                value={deliveryType === "pickup" ? "Grátis" : neighborhood ? brl(deliveryFee) : "Escolha o bairro"}
              />
            </div>
            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="font-serif text-xl">Total</span>
              <span className="font-serif text-3xl font-semibold text-caramel-deep dark:text-white">{brl(total)}</span>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Icons.Lock className="h-3.5 w-3.5" /> Pagamento processado com segurança pelo Mercado Pago.
            </p>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function PixPanel({ pix, onPaid }: { pix: PixResult; onPaid: () => void }) {
  const [copied, setCopied] = useState(false);
  const [expired, setExpired] = useState(false);
  const [remaining, setRemaining] = useState("");
  const paidRef = useRef(false);
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  useEffect(() => {
    const expiresAt = new Date(pix.expiresAt).getTime();
    const tick = () => {
      const ms = expiresAt - Date.now();
      if (ms <= 0) {
        setExpired(true);
        setRemaining("0:00");
        return;
      }
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setRemaining(`${m}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    const poll = setInterval(async () => {
      const order = await getOrderStatus({ data: { orderId: pix.orderId } }).catch(() => null);
      if (order?.status === "paid" && !paidRef.current) {
        paidRef.current = true;
        onPaidRef.current();
      }
      if (order && (order.status === "expired" || order.status === "cancelled")) setExpired(true);
    }, 4000);
    return () => {
      clearInterval(timer);
      clearInterval(poll);
    };
  }, [pix]);

  const copy = async () => {
    await navigator.clipboard.writeText(pix.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-[2rem] border border-border bg-card p-6 text-center shadow-soft sm:p-10">
      <p className="mb-2 text-xs uppercase tracking-[0.3em] text-caramel-deep">Pague com Pix</p>
      <h2 className="mb-1 font-serif text-3xl">{brl(pix.total)}</h2>
      <p className="mb-6 text-sm text-muted-foreground">Pedido #{pix.orderId.slice(0, 8)}</p>

      {expired ? (
        <p className="mx-auto max-w-sm rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">
          Este Pix expirou. Volte ao carrinho e gere um novo.
        </p>
      ) : (
        <>
          <img
            src={`data:image/png;base64,${pix.qrCodeBase64}`}
            alt="QR Code do Pix"
            className="mx-auto mb-6 h-56 w-56 rounded-2xl border border-border bg-white p-3"
          />
          <p className="mb-2 text-sm text-muted-foreground">Ou copie o código e cole no app do seu banco:</p>
          <div className="mx-auto mb-4 flex max-w-md items-center gap-2 rounded-2xl border border-border bg-background p-2">
            <code className="flex-1 truncate px-2 text-left text-xs text-muted-foreground">{pix.qrCode}</code>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 rounded-xl bg-caramel px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-caramel/90"
            >
              {copied ? <Icons.Check className="h-4 w-4" /> : <Icons.Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Icons.Loader2 className="h-4 w-4 animate-spin" /> Aguardando pagamento · expira em {remaining}
          </p>
        </>
      )}
    </div>
  );
}

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-border bg-card p-6 shadow-soft sm:p-8">
      <h2 className="mb-5 flex items-center gap-3 font-serif text-2xl">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-caramel/15 font-sans text-sm font-semibold text-caramel-deep">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Choice({ checked, onSelect, title, description }: { checked: boolean; onSelect: () => void; title: string; description: string }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
        checked ? "border-caramel bg-caramel/5" : "border-border hover:bg-secondary/40"
      }`}
    >
      <span className={`mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border-2 ${checked ? "border-caramel bg-caramel shadow-[inset_0_0_0_3px_var(--color-card)]" : "border-border"}`} />
      <span>
        <span className="block font-medium">{title}</span>
        <span className="block text-sm text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

function MethodTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        active ? "border-caramel bg-caramel/10 text-caramel-deep" : "border-border text-foreground hover:bg-secondary/40"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
