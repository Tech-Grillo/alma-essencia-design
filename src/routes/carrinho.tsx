import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { useCart, isDefaultSize, type CartItem } from "@/lib/cart";
import { reconcileCart } from "@/lib/cart-sync";
import { getLiveCatalog } from "@/lib/products-supabase";
import { getShippingOptions } from "@/lib/checkout/functions";
import { formatCep, onlyDigits, saveCep, savedCep, type ShippingQuote } from "@/lib/shipping";
import { ShippingOptions } from "@/components/ShippingOptions";
import { site, whatsappLink } from "@/config/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import placeholderProduto from "@/assets/placeholder-produto.webp";

export const Route = createFileRoute("/carrinho")({
  component: CartPage,
  head: () => ({ meta: [{ title: `Carrinho — ${site.name}` }] }),
});

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** "Lavanda · 250ml" — só o que o cliente escolheu. */
const variantOf = (item: CartItem) => [item.scent, isDefaultSize(item.size) ? null : item.size].filter(Boolean).join(" · ");

function buildWhatsAppMessage(items: CartItem[], total: number) {
  const lines = ["*Olá! Gostaria de fazer este pedido:*", ""];
  items.forEach((item, i) => {
    lines.push(`*${i + 1}. ${item.name}*`);
    if (item.scent) lines.push(`   Aroma: ${item.scent}`);
    if (!isDefaultSize(item.size)) lines.push(`   Tamanho: ${item.size}`);
    lines.push(`   ${item.quantity} × ${brl(item.price)} = ${brl(item.price * item.quantity)}`, "");
  });
  lines.push(`*Total: ${brl(total)}*`, "", "Pode confirmar a disponibilidade e a forma de entrega? Obrigado!");
  return lines.join("\n");
}

function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, replaceItems, getTotal, getCount, ready } = useCart();
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const synced = useRef(false);

  const total = getTotal();
  const count = getCount();

  // Ao abrir, confere preços, nomes e fotos com o catálogo atual.
  // Se o banco não responder, mantém o carrinho como está (o checkout confere de novo no servidor).
  useEffect(() => {
    if (!ready || synced.current || items.length === 0) return;
    synced.current = true;
    getLiveCatalog()
      .then((catalog) => {
        if (!catalog) return;
        const result = reconcileCart(items, catalog);
        if (!result.changed) return;
        replaceItems(result.items);
        const parts: string[] = [];
        if (result.removed.length) parts.push(
            `${result.removed.join(", ")} ${result.removed.length === 1 ? "não está mais disponível e saiu" : "não estão mais disponíveis e saíram"} do carrinho.`,
          );
        if (result.repriced.length) parts.push(`O preço de ${result.repriced.join(", ")} foi atualizado.`);
        if (parts.length) setNotice(parts.join(" "));
      })
      .catch((error) => console.error("Não foi possível conferir o carrinho:", error));
  }, [ready, items, replaceItems]);

  const loading = !ready;
  const empty = ready && items.length === 0;

  return (
    <div className={`min-h-screen bg-background ${items.length ? "pb-28 lg:pb-0" : ""}`}>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <h1 className="font-serif text-5xl font-semibold sm:text-6xl">Carrinho</h1>
        {!empty && !loading && (
          <p className="mt-2 text-lg text-foreground/75">
            {count} {count === 1 ? "item" : "itens"}
          </p>
        )}

        {notice && (
          <div role="status" className="mt-6 flex items-start gap-3 rounded-2xl border border-caramel/40 bg-caramel/10 px-5 py-4 text-base text-foreground">
            <Icons.Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-caramel-deep dark:text-caramel" />
            <p className="flex-1">{notice}</p>
            <button onClick={() => setNotice(null)} aria-label="Fechar aviso" className="rounded-full p-1 hover:bg-caramel/15">
              <Icons.X className="h-4 w-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-8 space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex animate-pulse gap-4 rounded-2xl border border-border p-4">
                <div className="h-24 w-24 rounded-xl bg-secondary/70" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-5 w-2/3 rounded bg-secondary/70" />
                  <div className="h-4 w-1/3 rounded bg-secondary/70" />
                </div>
              </div>
            ))}
          </div>
        ) : empty ? (
          <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-border bg-secondary/30 px-6 py-14 text-center">
            <Icons.ShoppingBag className="mx-auto h-14 w-14 text-caramel-deep/50 dark:text-caramel/60" />
            <p className="mt-5 font-serif text-4xl font-semibold">Seu carrinho está vazio</p>
            <p className="mt-3 text-lg text-foreground/75">Velas, sabonetes e difusores feitos à mão esperando por você.</p>
            <Link
              to="/produtos"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-caramel px-8 py-4 text-lg font-semibold text-primary-foreground transition hover:bg-caramel/90"
            >
              Ver produtos <Icons.ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
            {/* Itens */}
            <section aria-label="Itens do carrinho">
              <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
                {items.map((item) => {
                  const variant = variantOf(item);
                  return (
                    <li key={`${item.slug}|${item.size ?? ""}|${item.scent ?? ""}`} className="flex gap-3 p-4 sm:gap-6 sm:p-6">
                      <Link
                        to="/produtos/$slug"
                        params={{ slug: item.slug }}
                        className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-secondary/50 sm:h-28 sm:w-28"
                      >
                        <img src={item.image || placeholderProduto} alt={item.name} className="h-full w-full object-cover" />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <Link
                              to="/produtos/$slug"
                              params={{ slug: item.slug }}
                              className="line-clamp-2 text-lg font-semibold leading-snug text-foreground hover:text-caramel-deep sm:text-xl"
                            >
                              {item.name}
                            </Link>
                            {variant && <p className="mt-1 text-base text-foreground/75">{variant}</p>}
                            <p className="mt-1 text-base text-foreground/75">{brl(item.price)} cada</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.slug, item.size ?? null, item.scent)}
                            aria-label={`Remover ${item.name}`}
                            className="-mr-2 -mt-1 rounded-full p-2 text-foreground/60 transition-colors hover:bg-secondary hover:text-destructive"
                          >
                            <Icons.Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                          <div className="inline-flex items-center rounded-full border border-border" role="group" aria-label={`Quantidade de ${item.name}`}>
                            <button
                              onClick={() => updateQuantity(item.slug, item.size ?? null, item.quantity - 1, item.scent)}
                              disabled={item.quantity <= 1}
                              aria-label="Diminuir quantidade"
                              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <Icons.Minus className="h-4 w-4" />
                            </button>
                            <span className="w-9 text-center text-lg font-semibold tabular-nums" aria-live="polite">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.slug, item.size ?? null, item.quantity + 1, item.scent)}
                              aria-label="Aumentar quantidade"
                              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-secondary"
                            >
                              <Icons.Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">{brl(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <Link to="/produtos" className="inline-flex items-center gap-2 text-base font-semibold text-caramel-deep hover:underline dark:text-caramel">
                  <Icons.ArrowLeft className="h-5 w-5" /> Continuar comprando
                </Link>
                {confirmClear ? (
                  <span className="flex items-center gap-3 text-base">
                    Tirar todos os itens?
                    <button
                      onClick={() => {
                        clearCart();
                        setConfirmClear(false);
                      }}
                      className="font-semibold text-destructive hover:underline"
                    >
                      Sim, esvaziar
                    </button>
                    <button onClick={() => setConfirmClear(false)} className="font-semibold text-foreground/70 hover:underline">
                      Não
                    </button>
                  </span>
                ) : (
                  <button onClick={() => setConfirmClear(true)} className="text-base text-foreground/70 hover:text-destructive hover:underline">
                    Esvaziar carrinho
                  </button>
                )}
              </div>
            </section>

            {/* Resumo */}
            <aside aria-label="Resumo do pedido" className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-border bg-secondary/40 p-6 sm:p-7">
                <h2 className="font-serif text-3xl font-semibold">Resumo</h2>

                <dl className="mt-5 space-y-3 border-b border-border pb-5 text-lg">
                  <div className="flex justify-between gap-4">
                    <dt className="text-foreground/75">
                      Subtotal ({count} {count === 1 ? "item" : "itens"})
                    </dt>
                    <dd className="font-semibold tabular-nums">{brl(total)}</dd>
                  </div>
                </dl>

                <ShippingEstimator items={items} />

                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <span className="text-xl font-semibold">Total</span>
                  <span className="text-3xl font-bold tabular-nums text-caramel-deep dark:text-white">{brl(total)}</span>
                </div>
                <p className="mt-2 text-base text-foreground/70">Sem o frete. Retirada na feira é grátis; o envio você escolhe no checkout.</p>

                <Link
                  to="/checkout"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-caramel py-4 text-lg font-semibold text-primary-foreground shadow-soft transition hover:bg-caramel/90"
                >
                  <Icons.Lock className="h-5 w-5" /> Finalizar compra
                </Link>
                <p className="mt-3 text-center text-sm text-foreground/70">Pix ou cartão · pagamento seguro pelo Mercado Pago</p>

                <div className="my-5 flex items-center gap-3 text-sm text-foreground/60">
                  <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
                </div>

                <a
                  href={whatsappLink(buildWhatsAppMessage(items, total))}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-whatsapp py-3.5 text-lg font-semibold text-whatsapp transition hover:bg-whatsapp hover:text-white"
                >
                  <WhatsAppIcon className="h-5 w-5" /> Pedir pelo WhatsApp
                </a>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Barra fixa no celular: total sempre à vista */}
      {ready && items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-4">
            <div className="min-w-0">
              <p className="text-sm text-foreground/70">Total</p>
              <p className="text-2xl font-bold tabular-nums leading-tight">{brl(total)}</p>
            </div>
            <Link
              to="/checkout"
              className="ml-auto flex items-center gap-2 whitespace-nowrap rounded-full bg-caramel px-5 py-3.5 text-lg font-semibold text-primary-foreground transition hover:bg-caramel/90"
            >
              Finalizar compra <Icons.ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

/** Simulação de frete pelo CEP. A escolha final (e a cobrança) é no checkout. */
function ShippingEstimator({ items }: { items: CartItem[] }) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const itemsKey = JSON.stringify(items.map((i) => [i.slug, i.size, i.scent, i.quantity]));

  useEffect(() => setCep(formatCep(savedCep())), []);
  // Mudou o carrinho: a simulação anterior não vale mais.
  useEffect(() => setQuote(null), [itemsKey]);

  const calculate = async (value = cep) => {
    const digits = onlyDigits(value);
    if (digits.length !== 8) return setError("Informe um CEP com 8 números.");
    setLoading(true);
    setError("");
    const result = await getShippingOptions({
      data: {
        postalCode: digits,
        items: items.map((i) => ({ slug: i.slug, size: i.size ?? null, scent: i.scent ?? null, quantity: i.quantity })),
      },
    }).catch(() => null);
    setLoading(false);
    if (!result) return setError("Não foi possível calcular o frete agora. Tente de novo.");
    if (!result.ok) return setError(result.error);
    saveCep(digits);
    setQuote(result.data);
  };

  return (
    <div className="border-b border-border py-5">
      <p className="mb-2 flex items-center gap-2 text-lg font-semibold">
        <Icons.Truck className="h-5 w-5 text-caramel-deep dark:text-caramel" /> Calcular frete
      </p>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          calculate();
        }}
      >
        <input
          value={cep}
          onChange={(e) => {
            setCep(formatCep(e.target.value));
            setError("");
          }}
          inputMode="numeric"
          placeholder="Seu CEP"
          aria-label="CEP"
          autoComplete="postal-code"
          className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-base outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full border border-caramel px-5 text-base font-semibold text-caramel-deep transition hover:bg-caramel/10 disabled:opacity-60 dark:text-caramel"
        >
          {loading ? <Icons.Loader2 className="h-5 w-5 animate-spin" /> : "OK"}
        </button>
      </form>
      {error && <p className="mt-2 text-base text-rose">{error}</p>}
      {quote && (
        <div className="mt-3">
          {quote.blocked.length > 0 ? (
            <p className="text-base text-foreground/80">
              <span className="font-semibold">{quote.blocked.join(", ")}</span> não pode ser enviado por transportadora. Só retirada na feira.
            </p>
          ) : quote.options.length === 0 ? (
            <p className="text-base text-foreground/80">Nenhuma transportadora atende esse CEP. Fale com a gente pelo WhatsApp.</p>
          ) : (
            <ShippingOptions options={quote.options.slice(0, 4)} />
          )}
        </div>
      )}
    </div>
  );
}
