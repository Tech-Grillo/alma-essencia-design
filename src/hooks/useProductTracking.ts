import { useCallback } from "react";
import { trackProductClick } from "@/lib/analytics";

export function useProductTracking(productSlug: string, productName: string) {
  const handleClick = useCallback(() => {
    if (!productSlug || !productName) return;
    trackProductClick(productSlug, productName);
  }, [productSlug, productName]);

  return { handleClick };
}
