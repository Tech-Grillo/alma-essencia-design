// Server functions do checkout. O navegador chama estas funções como se fossem locais,
// mas o corpo de cada handler roda só no servidor. Os módulos de servidor são importados
// dentro do handler para que a chave secreta e o Access Token nunca entrem no bundle do site.
import { createServerFn } from "@tanstack/react-start";
import type { CardData, CardResult, CheckoutInput, OrderSummary, PixResult } from "./types";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(fn: () => Promise<T>): Promise<Result<T>> {
  const { CheckoutError } = await import("@/lib/server/orders");
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof CheckoutError) return { ok: false, error: error.message };
    console.error("Erro no checkout:", error);
    return { ok: false, error: "Não foi possível processar o pagamento agora. Tente de novo ou fale com a gente pelo WhatsApp." };
  }
}

async function origin(): Promise<string | undefined> {
  try {
    const { getRequestUrl } = await import("@tanstack/react-start/server");
    return getRequestUrl().origin;
  } catch {
    return undefined;
  }
}

export const createPixPayment = createServerFn({ method: "POST" })
  .inputValidator((data: { checkout: CheckoutInput; expectedTotal: number }) => data)
  .handler(async ({ data }): Promise<Result<PixResult>> => {
    const { createPixOrder } = await import("@/lib/server/orders");
    return run(async () => createPixOrder(data.checkout, data.expectedTotal, await origin()));
  });

export const createCardPayment = createServerFn({ method: "POST" })
  .inputValidator((data: { checkout: CheckoutInput; expectedTotal: number; card: CardData }) => data)
  .handler(async ({ data }): Promise<Result<CardResult>> => {
    const { createCardOrder } = await import("@/lib/server/orders");
    return run(async () => createCardOrder(data.checkout, data.expectedTotal, data.card, await origin()));
  });

export const getOrderStatus = createServerFn({ method: "GET" })
  .inputValidator((data: { orderId: string }) => data)
  .handler(async ({ data }): Promise<OrderSummary | null> => {
    const { getOrderSummary } = await import("@/lib/server/orders");
    return getOrderSummary(String(data.orderId));
  });
