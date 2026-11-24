// Cotação de frete pelo Melhor Envio. SÓ no servidor: usa o token secreto.
// Os produtos (preço, peso, medidas e tipo de envio) vêm sempre do banco, nunca do navegador.
import { site } from "@/config/site";
import type { CheckoutItemInput } from "@/lib/checkout/types";
import {
  onlyDigits,
  packageOf,
  shippingModeOf,
  strictestMode,
  type ProductShipping,
  type ShippingMode,
  type ShippingOption,
  type ShippingQuote,
} from "@/lib/shipping";
import { CheckoutError } from "./errors";
import { supabaseAdmin } from "./supabase-admin";

type MeService = {
  id: number;
  name: string;
  price?: string | number;
  custom_price?: string | number;
  delivery_time?: number;
  custom_delivery_time?: number;
  error?: string;
  company?: { id: number; name: string };
};

type ProductRow = {
  slug: string;
  name: string;
  category: string | null;
  price: number | string;
  sizes: Array<{ label: string; price: number }> | null;
  shipping: ProductShipping | null;
};

function config() {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  const from = onlyDigits(process.env.MELHOR_ENVIO_CEP_ORIGEM ?? "");
  if (!token || from.length !== 8) {
    throw new Error("Melhor Envio não configurado: defina MELHOR_ENVIO_TOKEN e MELHOR_ENVIO_CEP_ORIGEM");
  }
  const base =
    process.env.MELHOR_ENVIO_API_URL ||
    (process.env.MELHOR_ENVIO_SANDBOX === "true" ? "https://sandbox.melhorenvio.com.br" : "https://melhorenvio.com.br");
  return { token, from, base: base.replace(/\/$/, "") };
}

const matches = (company: string, names: readonly string[]) =>
  names.some((n) => company.toLowerCase().includes(n.toLowerCase()));

/** Quais transportadoras podem levar este pedido. */
export function carrierAllowed(company: string, mode: ShippingMode): boolean {
  if (mode === "local") return false;
  if (matches(company, site.shipping.disabledCarriers)) return false;
  if (mode === "ground") return matches(company, site.shipping.groundCarriers);
  return true;
}

/** Transforma a resposta do Melhor Envio nas opções mostradas ao cliente. */
export function toOptions(services: MeService[], mode: ShippingMode): ShippingOption[] {
  return services
    .filter((s) => !s.error && s.company?.name && carrierAllowed(s.company.name, mode))
    .map((s) => {
      const price = Number(s.custom_price ?? s.price);
      const days = Number(s.custom_delivery_time ?? s.delivery_time);
      return {
        id: String(s.id),
        carrier: s.company!.name,
        service: s.name,
        price: Math.round(price * 100) / 100,
        days: Number.isFinite(days) && days > 0 ? days + site.shipping.handlingDays : null,
      };
    })
    .filter((o) => Number.isFinite(o.price) && o.price > 0)
    .sort((a, b) => a.price - b.price);
}

export async function quoteShipping(rawItems: CheckoutItemInput[], postalCode: string): Promise<ShippingQuote> {
  const to = onlyDigits(postalCode ?? "");
  if (to.length !== 8) throw new CheckoutError("Informe um CEP válido, com 8 números.");
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 30) {
    throw new CheckoutError("Seu carrinho está vazio.");
  }
  const items = rawItems.map((i) => {
    const quantity = Number(i.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new CheckoutError("Quantidade inválida no carrinho.");
    return { slug: String(i.slug), size: i.size ? String(i.size) : null, quantity };
  });

  const slugs = [...new Set(items.map((i) => i.slug))];
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("slug, name, category, price, sizes, shipping")
    .in("slug", slugs);
  if (error) throw new Error(`Erro ao buscar produtos: ${error.message}`);
  const products = (data ?? []) as ProductRow[];

  const lines = items.map((item) => {
    const product = products.find((p) => p.slug === item.slug);
    if (!product) throw new CheckoutError("Um produto do carrinho não está mais disponível.");
    const size = item.size ? (product.sizes ?? []).find((s) => s.label === item.size) : undefined;
    return { item, product, unitPrice: Number(size?.price ?? product.price), mode: shippingModeOf(product) };
  });

  const blocked = [...new Set(lines.filter((l) => l.mode === "local").map((l) => l.product.name))];
  if (blocked.length) return { options: [], blocked };
  const mode = strictestMode(lines.map((l) => l.mode));

  const { token, from, base } = config();
  const res = await fetch(`${base}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": `${site.name} (${site.contact.email})`,
    },
    body: JSON.stringify({
      from: { postal_code: from },
      to: { postal_code: to },
      products: lines.map(({ item, unitPrice, product }) => {
        const pkg = packageOf(product.shipping);
        return {
          id: item.slug,
          width: pkg.widthCm,
          height: pkg.heightCm,
          length: pkg.lengthCm,
          weight: pkg.weightKg,
          insurance_value: Math.round(unitPrice * 100) / 100,
          quantity: item.quantity,
        };
      }),
      options: { receipt: false, own_hand: false },
    }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !Array.isArray(body)) {
    console.error("Melhor Envio", res.status, JSON.stringify(body));
    if (res.status === 422) throw new CheckoutError("Não encontramos esse CEP. Confira e tente de novo.");
    throw new Error(`Melhor Envio respondeu ${res.status}`);
  }
  const services = body as MeService[];
  const options = toOptions(services, mode);
  if (options.length === 0) {
    // Ajuda a entender por que nada apareceu (erro da transportadora ou filtro de produto com álcool).
    console.warn(
      `Frete sem opções para o CEP ${to} (tipo de envio: ${mode}):\n` +
        services
          .map((s) => {
            const name = `${s.company?.name ?? "?"} ${s.name}`;
            if (s.error) return `  - ${name}: ${s.error}`;
            const allowed = s.company?.name ? carrierAllowed(s.company.name, mode) : false;
            return `  - ${name}: R$ ${s.custom_price ?? s.price}${allowed ? "" : " (bloqueada para este tipo de produto)"}`;
          })
          .join("\n"),
    );
  }
  return { options, blocked: [] };
}
