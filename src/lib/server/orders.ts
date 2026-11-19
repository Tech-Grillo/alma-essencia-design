// Regras de pedidos e pagamentos. SÓ no servidor.
// O preço é sempre recalculado aqui a partir do banco: o valor enviado pelo navegador
// serve apenas para conferir se o cliente viu o mesmo total que será cobrado.
import { site } from "@/config/site";
import type {
  CardData,
  CardResult,
  CheckoutInput,
  OrderStatus,
  OrderSummary,
  PixResult,
} from "@/lib/checkout/types";
import type { ShippingOption } from "@/lib/shipping";
import { mpCreatePayment, mpGetPayment, type MpPayment } from "./mercadopago";
import { quoteShipping } from "./shipping";
import { supabaseAdmin } from "./supabase-admin";

import { CheckoutError } from "./errors";
export { CheckoutError };

type PricedItem = {
  slug: string;
  name: string;
  size: string | null;
  scent: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type Quote = {
  items: PricedItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  /** Opção de transportadora escolhida (só quando delivery.type === "shipping"). */
  shipping?: ShippingOption;
};

type OrderRow = {
  id: string;
  status: OrderStatus;
  payment_method: "pix" | "card";
  total: number | string;
  created_at: string;
  mp_payment_id: string | null;
};

const money = (n: number) => Math.round(n * 100) / 100;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validação ---------------------------------------------------------------

function validate(input: CheckoutInput): CheckoutInput {
  const name = input.customer?.name?.trim() ?? "";
  const email = input.customer?.email?.trim().toLowerCase() ?? "";
  const phone = (input.customer?.phone ?? "").replace(/\D/g, "");

  if (name.length < 2 || name.length > 80) throw new CheckoutError("Informe seu nome completo.");
  if (!EMAIL_RE.test(email) || email.length > 120) throw new CheckoutError("Informe um e-mail válido.");
  if (phone.length < 10 || phone.length > 11) throw new CheckoutError("Informe um WhatsApp com DDD.");

  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 30) {
    throw new CheckoutError("Seu carrinho está vazio.");
  }
  const items = input.items.map((item) => {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new CheckoutError("Quantidade inválida no carrinho.");
    }
    const scent = item.scent ? String(item.scent).trim().slice(0, 60) : null;
    return { slug: String(item.slug), size: item.size ? String(item.size) : null, scent: scent || null, quantity };
  });

  let delivery: CheckoutInput["delivery"];
  if (input.delivery?.type === "delivery") {
    const neighborhood = input.delivery.neighborhood?.trim() ?? "";
    const address = input.delivery.address?.trim() ?? "";
    if (!neighborhood) throw new CheckoutError("Escolha o bairro de entrega.");
    if (address.length < 5 || address.length > 200) throw new CheckoutError("Informe o endereço completo.");
    delivery = { type: "delivery", neighborhood, address };
  } else if (input.delivery?.type === "shipping") {
    const d = input.delivery;
    const postalCode = String(d.postalCode ?? "").replace(/\D/g, "");
    const a = d.address ?? ({} as Partial<typeof d.address>);
    const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
    const address = {
      street: clean(a.street, 120),
      number: clean(a.number, 20),
      complement: clean(a.complement, 60),
      district: clean(a.district, 80),
      city: clean(a.city, 80),
      state: clean(a.state, 2).toUpperCase(),
    };
    if (postalCode.length !== 8) throw new CheckoutError("Informe um CEP válido.");
    if (!d.serviceId) throw new CheckoutError("Escolha uma opção de frete.");
    if (address.street.length < 3) throw new CheckoutError("Informe a rua.");
    if (!address.number) throw new CheckoutError("Informe o número (ou S/N).");
    if (!address.district) throw new CheckoutError("Informe o bairro.");
    if (!address.city || !/^[A-Z]{2}$/.test(address.state)) throw new CheckoutError("Informe a cidade e o estado (UF).");
    delivery = { type: "shipping", postalCode, serviceId: String(d.serviceId), address };
  } else {
    delivery = { type: "pickup" };
  }

  return { customer: { name, email, phone }, delivery, items };
}

// Preço -------------------------------------------------------------------

async function quote(input: CheckoutInput): Promise<Quote> {
  const db = supabaseAdmin();
  const slugs = [...new Set(input.items.map((i) => i.slug))];
  const { data: products, error } = await db
    .from("products")
    .select("slug, name, price, sizes, scents")
    .in("slug", slugs);
  if (error) throw new Error(`Erro ao buscar produtos: ${error.message}`);

  const items: PricedItem[] = input.items.map((item) => {
    const product = products?.find((p) => p.slug === item.slug);
    if (!product) throw new CheckoutError("Um produto do carrinho não está mais disponível.");

    let unitPrice = Number(product.price);
    if (item.size) {
      const sizes = (Array.isArray(product.sizes) ? product.sizes : []) as Array<{ label: string; price: number }>;
      const size = sizes.find((s) => s.label === item.size);
      if (!size) throw new CheckoutError(`O tamanho "${item.size}" de ${product.name} não está mais disponível.`);
      unitPrice = Number(size.price);
    }
    // Aroma precisa ser um dos aromas cadastrados no produto (se ele tiver aromas).
    const scents = (Array.isArray(product.scents) ? product.scents : []) as string[];
    let scent: string | null = null;
    if (scents.length > 0) {
      scent = item.scent && scents.includes(item.scent) ? item.scent : scents.length === 1 ? scents[0] : null;
      if (!scent) throw new CheckoutError(`Escolha o aroma de ${product.name} na página do produto.`);
    }

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new CheckoutError(`${product.name} está sem preço. Fale com a gente pelo WhatsApp.`);
    }
    return {
      slug: product.slug,
      name: product.name,
      size: item.size,
      scent,
      quantity: item.quantity,
      unitPrice: money(unitPrice),
      lineTotal: money(unitPrice * item.quantity),
    };
  });

  let deliveryFee = 0;
  if (input.delivery.type === "delivery") {
    const { data: zone, error: zoneError } = await db
      .from("delivery_zones")
      .select("fee")
      .eq("neighborhood", input.delivery.neighborhood)
      .eq("active", true)
      .maybeSingle();
    if (zoneError) throw new Error(`Erro ao buscar frete: ${zoneError.message}`);
    if (!zone) throw new CheckoutError("Ainda não entregamos nesse bairro.");
    deliveryFee = money(Number(zone.fee));
  }

  // Frete por transportadora: cota de novo aqui, para o valor não vir do navegador.
  let shipping: ShippingOption | undefined;
  if (input.delivery.type === "shipping") {
    const result = await quoteShipping(input.items, input.delivery.postalCode);
    if (result.blocked.length) {
      throw new CheckoutError(`${result.blocked.join(", ")} não pode ser enviado por transportadora. Escolha retirada na feira.`);
    }
    const serviceId = input.delivery.serviceId;
    shipping = result.options.find((o) => o.id === serviceId);
    if (!shipping) throw new CheckoutError("A opção de frete escolhida não está mais disponível. Calcule o frete de novo.");
    deliveryFee = shipping.price;
  }

  const subtotal = money(items.reduce((sum, i) => sum + i.lineTotal, 0));
  return { items, subtotal, deliveryFee, total: money(subtotal + deliveryFee), shipping };
}

const hasShipping = (q: Quote) => Boolean(q.shipping);

function assertSameTotal(q: Quote, expectedTotal: number) {
  if (Math.abs(q.total - Number(expectedTotal)) > 0.009) {
    throw new CheckoutError(
      hasShipping(q)
        ? "O valor do frete ou dos produtos mudou. Calcule o frete de novo para ver o total atualizado."
        : "Os preços foram atualizados. Recarregue a página para ver o novo total.",
    );
  }
}

function deliveryColumns(input: CheckoutInput, q: Quote) {
  const d = input.delivery;
  if (d.type === "delivery") return { neighborhood: d.neighborhood, address: d.address };
  if (d.type === "shipping") {
    const a = d.address;
    return {
      neighborhood: a.district,
      address: `${a.street}, ${a.number}${a.complement ? ` - ${a.complement}` : ""} - ${a.district}, ${a.city}/${a.state}`,
      postal_code: d.postalCode,
      shipping_carrier: q.shipping?.carrier ?? null,
      shipping_service: q.shipping?.service ?? null,
      shipping_days: q.shipping?.days ?? null,
    };
  }
  return { neighborhood: null, address: null };
}

async function insertOrder(input: CheckoutInput, q: Quote, method: "pix" | "card") {
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .insert({
      payment_method: method,
      customer_name: input.customer.name,
      customer_email: input.customer.email,
      customer_phone: input.customer.phone,
      delivery_type: input.delivery.type,
      ...deliveryColumns(input, q),
      delivery_fee: q.deliveryFee,
      items: q.items,
      subtotal: q.subtotal,
      total: q.total,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Erro ao criar pedido: ${error?.message}`);
  return data.id as string;
}

// Mercado Pago ------------------------------------------------------------

function notificationUrl(origin: string | undefined): string | undefined {
  const base = process.env.SITE_URL || origin;
  if (!base || !base.startsWith("https://")) return undefined; // o MP só aceita https público
  return `${base.replace(/\/$/, "")}/api/mercadopago/webhook`;
}

/** Data no formato que o Mercado Pago aceita: 2026-11-16T13:00:00.000-03:00 */
function mpDate(date: Date): string {
  const brt = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return brt.toISOString().replace("Z", "-03:00");
}

function statusFromPayment(p: MpPayment): OrderStatus {
  switch (p.status) {
    case "approved":
      return "paid";
    case "rejected":
      return "rejected";
    case "cancelled":
      return p.status_detail === "expired" ? "expired" : "cancelled";
    case "refunded":
    case "charged_back":
      return "cancelled";
    default:
      return "pending"; // pending, in_process, authorized
  }
}

const CARD_MESSAGES: Record<string, string> = {
  accredited: "Pagamento aprovado!",
  pending_contingency: "Estamos processando o pagamento. Você recebe a confirmação em instantes.",
  pending_review_manual: "O pagamento está em análise. Avisaremos assim que for aprovado.",
  cc_rejected_bad_filled_card_number: "Confira o número do cartão.",
  cc_rejected_bad_filled_date: "Confira a data de validade.",
  cc_rejected_bad_filled_security_code: "Confira o código de segurança (CVV).",
  cc_rejected_bad_filled_other: "Confira os dados do cartão.",
  cc_rejected_call_for_authorize: "O banco pediu autorização. Ligue para o seu banco e tente de novo.",
  cc_rejected_card_disabled: "Cartão inativo. Ative com o seu banco ou use outro cartão.",
  cc_rejected_duplicated_payment: "Você já fez um pagamento com esse valor. Use outro cartão ou Pix.",
  cc_rejected_high_risk: "Pagamento recusado. Tente outro cartão ou pague com Pix.",
  cc_rejected_insufficient_amount: "Limite insuficiente. Tente outro cartão ou pague com Pix.",
  cc_rejected_max_attempts: "Muitas tentativas. Use outro cartão ou pague com Pix.",
};

/**
 * Atualiza o pedido com o que o Mercado Pago informou.
 * Só marca como pago se o pagamento for desse pedido e do mesmo valor.
 */
export async function applyPayment(payment: MpPayment): Promise<OrderStatus | undefined> {
  const orderId = payment.external_reference;
  if (!orderId) return undefined;
  const db = supabaseAdmin();
  const { data: order } = await db
    .from("orders")
    .select("id, status, total")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return undefined;

  let status = statusFromPayment(payment);
  if (status === "paid" && Math.abs(Number(order.total) - Number(payment.transaction_amount)) > 0.009) {
    console.error(`Valor divergente no pedido ${orderId}: pedido ${order.total}, pago ${payment.transaction_amount}`);
    status = "pending";
  }
  if (order.status === "paid" && status !== "cancelled") return "paid"; // nunca "despaga" um pedido

  await db
    .from("orders")
    .update({
      status,
      mp_payment_id: String(payment.id),
      mp_status: payment.status,
      mp_status_detail: payment.status_detail,
      ...(status === "paid" && order.status !== "paid" ? { paid_at: new Date().toISOString() } : {}),
    })
    .eq("id", orderId);
  return status;
}

// Ações usadas pelas server functions -------------------------------------

export async function createPixOrder(
  raw: CheckoutInput,
  expectedTotal: number,
  origin?: string,
): Promise<PixResult> {
  const input = validate(raw);
  const q = await quote(input);
  assertSameTotal(q, expectedTotal);
  const orderId = await insertOrder(input, q, "pix");

  const expiresAt = new Date(Date.now() + site.checkout.pixExpirationMinutes * 60 * 1000);
  const [firstName, ...rest] = input.customer.name.split(" ");
  const payment = await mpCreatePayment(
    {
      transaction_amount: q.total,
      description: `Pedido ${site.name} #${orderId.slice(0, 8)}`,
      payment_method_id: "pix",
      external_reference: orderId,
      date_of_expiration: mpDate(expiresAt),
      notification_url: notificationUrl(origin),
      payer: { email: input.customer.email, first_name: firstName, last_name: rest.join(" ") || undefined },
    },
    `pix-${orderId}`,
  );
  await applyPayment(payment);

  const data = payment.point_of_interaction?.transaction_data;
  if (!data?.qr_code || !data.qr_code_base64) {
    throw new Error("O Mercado Pago não devolveu o QR Code do Pix. Confira se a conta tem uma chave Pix cadastrada.");
  }
  return {
    orderId,
    total: q.total,
    qrCode: data.qr_code,
    qrCodeBase64: data.qr_code_base64,
    expiresAt: payment.date_of_expiration ?? expiresAt.toISOString(),
  };
}

export async function createCardOrder(
  raw: CheckoutInput,
  expectedTotal: number,
  card: CardData,
  origin?: string,
): Promise<CardResult> {
  const input = validate(raw);
  if (!card?.token || !card.payment_method_id) throw new CheckoutError("Dados do cartão incompletos.");
  const installments = Math.min(Math.max(1, Math.floor(Number(card.installments) || 1)), site.checkout.maxInstallments);

  const q = await quote(input);
  assertSameTotal(q, expectedTotal);
  const orderId = await insertOrder(input, q, "card");

  const payment = await mpCreatePayment(
    {
      transaction_amount: q.total,
      token: card.token,
      description: `Pedido ${site.name} #${orderId.slice(0, 8)}`,
      installments,
      payment_method_id: card.payment_method_id,
      issuer_id: card.issuer_id ? Number(card.issuer_id) : undefined,
      external_reference: orderId,
      notification_url: notificationUrl(origin),
      statement_descriptor: "ALMA ESSENCIA",
      payer: {
        email: card.payer?.email || input.customer.email,
        identification: card.payer?.identification,
      },
    },
    `card-${orderId}`,
  );
  const status = (await applyPayment(payment)) ?? "pending";
  const message =
    CARD_MESSAGES[payment.status_detail] ??
    (status === "rejected" ? "Pagamento recusado. Tente outro cartão ou pague com Pix." : "Pagamento em processamento.");
  return { orderId, status, message };
}

/** Status do pedido. Se ainda estiver pendente, consulta o Mercado Pago (funciona mesmo sem webhook). */
export async function getOrderSummary(orderId: string): Promise<OrderSummary | null> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null;
  const db = supabaseAdmin();
  const { data } = await db
    .from("orders")
    .select("id, status, payment_method, total, created_at, mp_payment_id")
    .eq("id", orderId)
    .maybeSingle<OrderRow>();
  if (!data) return null;

  let status = data.status;
  if (status === "pending" && data.mp_payment_id) {
    try {
      status = (await applyPayment(await mpGetPayment(data.mp_payment_id))) ?? status;
    } catch (error) {
      console.error("Erro ao consultar pagamento", error);
    }
  }
  return {
    id: data.id,
    status,
    paymentMethod: data.payment_method,
    total: Number(data.total),
    createdAt: data.created_at,
  };
}
