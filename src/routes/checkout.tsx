import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { isDefaultSize, useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase";
import { site } from "@/config/site";
import { createCardPayment, createPixPayment, getOrderStatus, getShippingOptions } from "@/lib/checkout/functions";
import type { CheckoutDelivery, CheckoutInput, PixResult } from "@/lib/checkout/types";
import { formatCep, formatDays, lookupCep, onlyDigits, saveCep, savedCep, type ShippingQuote } from "@/lib/shipping";
import { ShippingOptions } from "@/components/ShippingOptions";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: `Finalizar compra — ${site.name}` }, { name: "robots", content: "noindex" }] }),
  component: CheckoutPage,
});

type Zone = { neighborhood: string; fee: number };
type Method = "pix" | "card";

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY as string | undefined;
let mpInitialized = false;

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function formatPhone(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

const inputClass =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition focus:border-caramel focus:ring-2 focus:ring-caramel/20";
const labelClass = "mb-1.5 block text-sm font-semibold text-foreground/80";

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart, ready } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<CheckoutDelivery["type"]>("pickup");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [zones, setZones] = useState<Zone[]>([]);
  // Envio por transportadora
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [quotedCep, setQuotedCep] = useState("");
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [serviceId, setServiceId] = useState("");
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
    setCep(formatCep(savedCep()));
  }, []);

  const checkoutItems = items.map((i) => ({ slug: i.slug, size: i.size ?? null, scent: i.scent ?? null, quantity: i.quantity }));
  const itemsKey = JSON.stringify(checkoutItems);

  // Carrinho mudou: o frete calculado não vale mais.
  useEffect(() => {
    setShippingQuote(null);
    setQuotedCep("");
  }, [itemsKey]);

  const calculateShipping = async (value = cep) => {
    const digits = onlyDigits(value);
    if (digits.length !== 8) return setQuoteError("Informe um CEP com 8 números.");
    setQuoting(true);
    setQuoteError("");
    const [result, found] = await Promise.all([
      getShippingOptions({ data: { items: checkoutItems, postalCode: digits } }).catch(() => null),
      lookupCep(digits),
    ]);
    setQuoting(false);
    if (found) {
      setStreet(found.street);
      setDistrict(found.district);
      setCity(found.city);
      setUf(found.state);
    }
    if (!result) return setQuoteError("Não foi possível calcular o frete agora. Tente de novo.");
    if (!result.ok) return setQuoteError(result.error);
    saveCep(digits);
    setQuotedCep(digits);
    setShippingQuote(result.data);
    const options = result.data.options;
    setServiceId((current) => (options.some((o) => o.id === current) ? current : options[0]?.id ?? ""));
  };

  // Ao escolher envio com um CEP já preenchido, calcula sozinho.
  useEffect(() => {
    if (deliveryType === "shipping" && !shippingQuote && !quoting && onlyDigits(cep).length === 8) calculateShipping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryType, shippingQuote]);

  const shippingOption =
    shippingQuote && quotedCep === onlyDigits(cep) ? shippingQuote.options.find((o) => o.id === serviceId) : undefined;

  const subtotal = getTotal();
  const deliveryFee =
    deliveryType === "delivery"
      ? zones.find((z) => z.neighborhood === neighborhood)?.fee ?? 0
      : deliveryType === "shipping"
        ? shippingOption?.price ?? 0
        : 0;
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
    if (deliveryType === "shipping") {
      if (!shippingOption) return "Calcule o frete pelo CEP e escolha uma opção.";
      if (street.trim().length < 3) return "Informe a rua.";
      if (!number.trim()) return "Informe o número (ou S/N).";
      if (!district.trim()) return "Informe o bairro.";
      if (!city.trim() || !/^[A-Za-z]{2}$/.test(uf.trim())) return "Informe a cidade e o estado (UF).";
    }
    return "";
  }, [name, email, phone, deliveryType, neighborhood, address, shippingOption, street, number, district, city, uf]);

  const delivery: CheckoutDelivery =
    deliveryType === "delivery"
      ? { type: "delivery", neighborhood, address }
      : deliveryType === "shipping"
        ? {
            type: "shipping",
            postalCode: onlyDigits(cep),
            serviceId,
            address: { street, number, complement, district, city, state: uf.trim().toUpperCase() },
          }
        : { type: "pickup" };

  const checkout: CheckoutInput = { customer: { name, email, phone }, delivery, items: checkoutItems };

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
                      title="Retirada na feira — grátis"
                      description={site.checkout.pickup}
                    />
                    {zones.length > 0 && (
                      <Choice
                        checked={deliveryType === "delivery"}
                        onSelect={() => setDeliveryType("delivery")}
                        title="Entrega em Niterói"
                        description="Taxa fixa por bairro"
                      />
                    )}
                    <Choice
                      checked={deliveryType === "shipping"}
                      onSelect={() => setDeliveryType("shipping")}
                      title="Envio por transportadora"
                      description="Para todo o Brasil. O frete é calculado pelo CEP."
                    />
                    {deliveryType === "shipping" && (
                      <div className="space-y-4 pt-2">
                        <div>
                          <span className={labelClass}>CEP</span>
                          <div className="flex gap-2">
                            <input
                              className={`${inputClass} max-w-[12rem]`}
                              inputMode="numeric"
                              placeholder="00000-000"
                              value={cep}
                              onChange={(e) => {
                                const next = formatCep(e.target.value);
                                setCep(next);
                                setQuoteError("");
                                if (onlyDigits(next).length === 8 && onlyDigits(next) !== quotedCep) calculateShipping(next);
                              }}
                              autoComplete="postal-code"
                              aria-label="CEP"
                            />
                            <button
                              type="button"
                              onClick={() => calculateShipping()}
                              disabled={quoting}
                              className="rounded-2xl border border-caramel px-5 text-base font-semibold text-caramel-deep transition hover:bg-caramel/10 disabled:opacity-60 dark:text-caramel"
                            >
                              {quoting ? <Icons.Loader2 className="h-5 w-5 animate-spin" /> : "Calcular"}
                            </button>
                          </div>
                          <a
                            href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1.5 inline-block text-sm text-foreground/70 underline-offset-2 hover:underline"
                          >
                            Não sei meu CEP
                          </a>
                        </div>

                        {quoteError && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-base font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">{quoteError}</p>}

                        {shippingQuote && quotedCep === onlyDigits(cep) && (
                          shippingQuote.blocked.length > 0 ? (
                            <p className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-base">
                              <span className="font-semibold">{shippingQuote.blocked.join(", ")}</span> não pode ser enviado por
                              transportadora. Escolha a retirada na feira ou tire o item do carrinho.
                            </p>
                          ) : shippingQuote.options.length === 0 ? (
                            <p className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-base">
                              Nenhuma transportadora atende esse CEP com estes produtos. Fale com a gente pelo WhatsApp que buscamos outra forma de envio.
                            </p>
                          ) : (
                            <ShippingOptions options={shippingQuote.options} selected={serviceId} onSelect={setServiceId} />
                          )
                        )}

                        {shippingOption && (
                          <div className="grid gap-4 sm:grid-cols-6">
                            <label className="sm:col-span-4">
                              <span className={labelClass}>Rua</span>
                              <input className={inputClass} value={street} onChange={(e) => setStreet(e.target.value)} autoComplete="address-line1" />
                            </label>
                            <label className="sm:col-span-2">
                              <span className={labelClass}>Número</span>
                              <input className={inputClass} value={number} onChange={(e) => setNumber(e.target.value)} placeholder="123 ou S/N" />
                            </label>
                            <label className="sm:col-span-6">
                              <span className={labelClass}>Complemento (opcional)</span>
                              <input className={inputClass} value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, bloco, referência" autoComplete="address-line2" />
                            </label>
                            <label className="sm:col-span-2">
                              <span className={labelClass}>Bairro</span>
                              <input className={inputClass} value={district} onChange={(e) => setDistrict(e.target.value)} />
                            </label>
                            <label className="sm:col-span-3">
                              <span className={labelClass}>Cidade</span>
                              <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
                            </label>
                            <label className="sm:col-span-1">
                              <span className={labelClass}>UF</span>
                              <input className={inputClass} value={uf} maxLength={2} onChange={(e) => setUf(e.target.value.toUpperCase())} autoComplete="address-level1" />
                            </label>
                          </div>
                        )}
                      </div>
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
                    <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-base font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">{error}</p>
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
                <li key={`${item.slug}-${item.size ?? ""}-${item.scent ?? ""}`} className="flex justify-between gap-3 text-base">
                  <span>
                    {item.quantity}× {item.name}
                    {!isDefaultSize(item.size) && <span className="text-muted-foreground"> · {item.size}</span>}
                    {item.scent && <span className="text-muted-foreground"> · {item.scent}</span>}
                  </span>
                  <span className="whitespace-nowrap font-medium">{brl(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 text-base">
              <Row label="Subtotal" value={brl(subtotal)} />
              <Row
                label={deliveryType === "shipping" && shippingOption ? `Frete · ${shippingOption.carrier}` : "Entrega"}
                value={
                  deliveryType === "pickup"
                    ? "Grátis"
                    : deliveryType === "delivery"
                      ? neighborhood ? brl(deliveryFee) : "Escolha o bairro"
                      : shippingOption ? brl(deliveryFee) : "Informe o CEP"
                }
              />
              {deliveryType === "shipping" && shippingOption?.days && (
                <p className="text-right text-sm text-muted-foreground">Chega em {formatDays(shippingOption.days)}</p>
              )}
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
        <p className="mx-auto max-w-sm rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-base font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
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
        <span className="block text-lg font-semibold">{title}</span>
        <span className="block text-base text-foreground/75">{description}</span>
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
