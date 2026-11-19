// Regras de envio compartilhadas entre o site, o admin e o servidor.
import { site } from "@/config/site";

/**
 * any    → pode ir por qualquer transportadora (Correios inclusive)
 * ground → tem álcool: só transportadoras rodoviárias de site.shipping.groundCarriers
 * local  → não é enviado: só retirada na feira ou entrega local
 */
export type ShippingMode = "any" | "ground" | "local";

export type ProductShipping = {
  mode?: ShippingMode;
  weightGrams?: number;
  widthCm?: number;
  heightCm?: number;
  lengthCm?: number;
};

export type ShippingOption = {
  id: string;
  carrier: string;
  service: string;
  price: number;
  /** Prazo em dias úteis, já com o tempo de preparo. */
  days: number | null;
};

export type ShippingQuote = {
  options: ShippingOption[];
  /** Produtos do carrinho que não podem ser enviados por transportadora. */
  blocked: string[];
};

export const SHIPPING_MODES: { id: ShippingMode; label: string; description: string }[] = [
  { id: "any", label: "Qualquer transportadora", description: "Correios e transportadoras. Para velas, sabonetes, wax melts." },
  { id: "ground", label: "Só transportadora rodoviária", description: "Produtos com álcool, como home spray e difusor." },
  { id: "local", label: "Não enviar", description: "Só retirada na feira ou entrega local." },
];

const RANK: Record<ShippingMode, number> = { any: 0, ground: 1, local: 2 };

/** Home spray e difusor costumam levar álcool: por padrão só vão por transportadora rodoviária. */
export function defaultShippingMode(category: string | null | undefined): ShippingMode {
  return /spray|difusor|aromatizador|perfume|[áa]lcool/i.test(category ?? "") ? "ground" : "any";
}

export function shippingModeOf(product: { category?: string | null; shipping?: ProductShipping | null }): ShippingMode {
  const mode = product.shipping?.mode;
  return mode === "any" || mode === "ground" || mode === "local" ? mode : defaultShippingMode(product.category);
}

/** O modo mais restrito entre os produtos do carrinho vale para o pedido todo. */
export function strictestMode(modes: ShippingMode[]): ShippingMode {
  return modes.reduce<ShippingMode>((acc, m) => (RANK[m] > RANK[acc] ? m : acc), "any");
}

const positive = (n: unknown, fallback: number) => {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

/** Peso (kg) e medidas (cm) de uma unidade, com a embalagem padrão onde faltar dado. */
export function packageOf(shipping: ProductShipping | null | undefined) {
  const d = site.shipping.defaultPackage;
  return {
    weightKg: positive(shipping?.weightGrams, d.weightGrams) / 1000,
    widthCm: positive(shipping?.widthCm, d.widthCm),
    heightCm: positive(shipping?.heightCm, d.heightCm),
    lengthCm: positive(shipping?.lengthCm, d.lengthCm),
  };
}

export const onlyDigits = (s: string) => s.replace(/\D/g, "");

export function formatCep(value: string) {
  const d = onlyDigits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function formatDays(days: number | null) {
  if (!days) return "";
  return `até ${days} ${days === 1 ? "dia útil" : "dias úteis"}`;
}

export type CepAddress = { street: string; district: string; city: string; state: string };

/** Endereço pelo CEP (ViaCEP). Retorna null se o CEP não existir ou o serviço falhar. */
export async function lookupCep(cep: string): Promise<CepAddress | null> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return { street: data.logradouro ?? "", district: data.bairro ?? "", city: data.localidade ?? "", state: data.uf ?? "" };
  } catch {
    return null;
  }
}

/** CEP salvo para não pedir de novo entre carrinho e checkout. */
const CEP_KEY = "cep_v1";
export function savedCep(): string {
  try {
    return localStorage.getItem(CEP_KEY) ?? "";
  } catch {
    return "";
  }
}
export function saveCep(cep: string) {
  try {
    localStorage.setItem(CEP_KEY, onlyDigits(cep));
  } catch {
    // sem armazenamento: só não lembra o CEP
  }
}
