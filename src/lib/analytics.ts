// Sistema de analytics para tracking de cliques e vendas

export interface ProductClick {
  productSlug: string;
  productName: string;
  timestamp: number;
  date: string;
}

export interface Sale {
  id: string;
  productSlug: string;
  productName: string;
  price: number;
  quantity: number;
  timestamp: number;
  date: string;
}

const CLICKS_KEY = 'alma_essencia_clicks';
const SALES_KEY = 'alma_essencia_sales';

// Tracking de cliques nos produtos
export function trackProductClick(productSlug: string, productName: string) {
  if (typeof window === 'undefined') return;

  const click: ProductClick = {
    productSlug,
    productName,
    timestamp: Date.now(),
    date: new Date().toISOString().split('T')[0],
  };

  const clicks = getClicks();
  clicks.push(click);
  localStorage.setItem(CLICKS_KEY, JSON.stringify(clicks));
}

export function getClicks(): ProductClick[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(CLICKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getClicksByProduct(): Map<string, { clicks: number; productName: string }> {
  const clicks = getClicks();
  const map = new Map<string, { clicks: number; productName: string }>();

  clicks.forEach(click => {
    const existing = map.get(click.productSlug);
    if (existing) {
      existing.clicks++;
    } else {
      map.set(click.productSlug, {
        clicks: 1,
        productName: click.productName,
      });
    }
  });

  return map;
}

export function getTopClickedProducts(limit: number = 10) {
  const byProduct = getClicksByProduct();
  return Array.from(byProduct.entries())
    .map(([slug, data]) => ({ slug, ...data }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, limit);
}

// Sistema de vendas
export function registerSale(sale: Omit<Sale, 'id' | 'timestamp' | 'date'>) {
  if (typeof window === 'undefined') return;

  const newSale: Sale = {
    ...sale,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    date: new Date().toISOString().split('T')[0],
  };

  const sales = getSales();
  sales.push(newSale);
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}

export function getSales(): Sale[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(SALES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getSalesByProduct(): Map<string, { quantity: number; revenue: number; productName: string }> {
  const sales = getSales();
  const map = new Map<string, { quantity: number; revenue: number; productName: string }>();

  sales.forEach(sale => {
    const existing = map.get(sale.productSlug);
    if (existing) {
      existing.quantity += sale.quantity;
      existing.revenue += sale.price * sale.quantity;
    } else {
      map.set(sale.productSlug, {
        quantity: sale.quantity,
        revenue: sale.price * sale.quantity,
        productName: sale.productName,
      });
    }
  });

  return map;
}

const REVIEW_KEY_PREFIX = "alma-essencia-reviews:";

export function getCommentCountsByProduct(): Map<string, { comments: number; productName: string }> {
  if (typeof window === 'undefined') return new Map();

  const map = new Map<string, { comments: number; productName: string }>();

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key?.startsWith(REVIEW_KEY_PREFIX)) continue;

    const productSlug = key.slice(REVIEW_KEY_PREFIX.length);
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      const reviews = JSON.parse(raw) as Array<{ name: string; rating: number; comment: string; createdAt: string }>;
      const comments = Array.isArray(reviews) ? reviews.length : 0;
      const productName = reviews?.[0]?.productName || "";

      map.set(productSlug, {
        comments,
        productName: productName || "",
      });
    } catch {
      // ignore invalid stored review data
    }
  }

  return map;
}

export function getTopFavoriteProducts(limit: number = 10) {
  const clicks = getClicksByProduct();
  const sales = getSalesByProduct();
  const comments = getCommentCountsByProduct();

  const allSlugs = new Set<string>([
    ...Array.from(clicks.keys()),
    ...Array.from(sales.keys()),
    ...Array.from(comments.keys()),
  ]);

  return Array.from(allSlugs.values())
    .map((slug) => {
      const clickData = clicks.get(slug);
      const saleData = sales.get(slug);
      const commentData = comments.get(slug);

      const clicksCount = clickData?.clicks ?? 0;
      const quantity = saleData?.quantity ?? 0;
      const commentsCount = commentData?.comments ?? 0;
      const productName = clickData?.productName ?? saleData?.productName ?? commentData?.productName ?? "";

      const score = clicksCount + commentsCount + quantity * 2;

      return {
        slug,
        productName,
        clicks: clicksCount,
        quantity,
        comments: commentsCount,
        score,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.quantity !== a.quantity) return b.quantity - a.quantity;
      if (b.clicks !== a.clicks) return b.clicks - a.clicks;
      return b.comments - a.comments;
    })
    .slice(0, limit);
}

export function getTopSellingProducts(limit: number = 10) {
  const sales = getSales();
  return sales.reduce((total, sale) => total + (sale.price * sale.quantity), 0);
}

export function getTotalSales(): number {
  return getSales().length;
}

export function getSalesByDate(): Map<string, number> {
  const sales = getSales();
  const map = new Map<string, number>();

  sales.forEach(sale => {
    const existing = map.get(sale.date);
    map.set(sale.date, (existing || 0) + sale.quantity);
  });

  return map;
}

// Limpar dados (útil para desenvolvimento)
export function clearAnalytics() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CLICKS_KEY);
  localStorage.removeItem(SALES_KEY);
}