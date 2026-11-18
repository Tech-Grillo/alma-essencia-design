import { createServerFn } from "@tanstack/react-start";

/** Slugs dos produtos mais vendidos (pedidos pagos). Lista vazia se ainda não há vendas ou se o servidor não tem a chave. */
export const getBestSellers = createServerFn({ method: "GET" }).handler(async (): Promise<string[]> => {
  try {
    const { bestSellerSlugs } = await import("@/lib/server/bestsellers");
    return await bestSellerSlugs();
  } catch (error) {
    console.error("Mais vendidos indisponível:", error);
    return [];
  }
});
