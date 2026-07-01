import { useEffect } from "react";
import { trackProductClick } from "@/lib/analytics";

export function useProductTracking(productSlug: string, productName: string) {
  useEffect(() => {
    // Não executa tracking se os dados estiverem vazios
    if (!productSlug || !productName) return;
    
    // Track quando o componente montar (usuário viu o produto)
    trackProductClick(productSlug, productName);
  }, [productSlug, productName]);
}
