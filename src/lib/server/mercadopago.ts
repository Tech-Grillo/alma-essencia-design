// Chamadas à API do Mercado Pago. SÓ no servidor: usa o Access Token secreto.
const API = "https://api.mercadopago.com";

export type MpPayment = {
  id: number;
  status: string; // approved | pending | in_process | rejected | cancelled | refunded | charged_back
  status_detail: string;
  external_reference: string | null;
  transaction_amount: number;
  point_of_interaction?: {
    transaction_data?: { qr_code?: string; qr_code_base64?: string; ticket_url?: string };
  };
  date_of_expiration?: string | null;
};

function accessToken(): string {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN não configurado no servidor");
  return token;
}

async function mpFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Mercado Pago", res.status, JSON.stringify(body));
    throw new Error(`Mercado Pago respondeu ${res.status}`);
  }
  return body as T;
}

export function mpCreatePayment(payload: Record<string, unknown>, idempotencyKey: string) {
  return mpFetch<MpPayment>("/v1/payments", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "X-Idempotency-Key": idempotencyKey },
  });
}

export function mpGetPayment(id: string | number) {
  return mpFetch<MpPayment>(`/v1/payments/${encodeURIComponent(String(id))}`);
}
