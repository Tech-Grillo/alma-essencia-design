import { supabase, uploadImage, deleteImage, fetchProducts, createProduct, updateProduct, fetchProductBySlug, deleteProduct } from './supabase';
import {
  getAllProducts as getAllProductsLocal,
  saveCustomProduct as saveCustomProductLocal,
  updateProduct as updateProductLocal,
  deleteProduct as deleteProductLocal,
} from './products';
export type SizeOption = { label: string; unit?: string; price: number };

export type Product = { 
  id?: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  images: string[];
  short: string;
  description: string;
  purchaseLink: string;
  scents: string[];
  sizes: SizeOption[];
  created_at?: string;
  updated_at?: string;
};

// Verificar se Supabase está configurado
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && url !== 'https://your-project-id.supabase.co';
};

// Categorias principais organizadas por linha de produto
export const categories = [
  // Velas
  "Velas aromáticas",
  "Velas de massagem",
  "Velas",
  // Sabonetes
  "Sabonetes",
  "Sabonetes glicerinados",
  "Sabonetes fitoterápicos",
  "Sabonete líquido",
  // Home Spray
  "Home Spray",
  "Home spray 250ml",
  "Home spray 60ml",
  // Difusores
  "Difusores",
  "Difusores de ambiente 250ml",
  // Hidratantes
  "Hidratantes",
  "Sugar Cream",
  "Creme para mãos e pés",
  "Manteigas corporais",
  "Óleo corporal",
  // Esfoliantes
  "Esfoliante corporal",
  // Kits
  "Kits",
  // Águas de lençóis
  "Águas de lençóis",
  // Body Splash
  "Body Splash",
  // Banho
  "Geleia de banho",
  "Escalda-pés",
  "Whalts Melts",
  "Sais de banho",
  // Cabelo
  "Perfume para cabelo",
  // Spa
  "Spa para os pés",
  // Aromáticos
  "Sachês aromáticos",
  "Pastilhas aromáticas",
];

// Cache de produtos
let productsCache: Product[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 1000; // 10 segundos (cache mais agressivo)

// Produtos locais (fallback)
function getLocalProducts(): Product[] {
  return getAllProductsLocal() as unknown as Product[];
}

// Buscar produtos (do Supabase ou cache local)
export async function getAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return getLocalProducts();
  }

  try {
    const now = Date.now();
    if (productsCache && now - cacheTimestamp < CACHE_DURATION) {
      return productsCache;
    }

    const dbProducts = await fetchProducts();
    const withLinks = dbProducts.map((p: any) => ({
      ...p,
      purchaseLink: `/produtos/${p.slug}#comprar`,
    }));
    productsCache = withLinks;
    cacheTimestamp = now;

    return withLinks;
  } catch (error) {
    console.error('Error fetching products from Supabase:', error);
    return getLocalProducts();
  }
}

/**
 * Catálogo direto do banco, sem a lista local de reserva.
 * Retorna null se o Supabase não estiver configurado; lança erro se o banco não responder.
 * Usado pelo carrinho para conferir preços sem correr o risco de comparar com dados de exemplo.
 */
export async function getLiveCatalog(): Promise<Product[] | null> {
  if (!isSupabaseConfigured()) return null;
  return (await fetchProducts()) as Product[];
}

export function getAllCategories(): string[] {
  return categories;
}

// Salvar produto (criar ou atualizar)
export async function saveProduct(product: any): Promise<Product> {
  if (!isSupabaseConfigured()) {
    return saveCustomProductLocal(product);
  }

  try {
    // Upload de imagens
    const imageUrls: string[] = [];
    
    for (const imageUrl of product.images) {
      if (imageUrl.startsWith('data:')) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        const uploadedUrl = await uploadImage(file, 'products');
        imageUrls.push(uploadedUrl);
      } else if (imageUrl.startsWith('http')) {
        imageUrls.push(imageUrl);
      } else {
        imageUrls.push(imageUrl);
      }
    }

    const slug = product.slug && product.slug.trim() !== ''
      ? product.slug
      : slugifyProductName(product.name);

    // purchaseLink não existe como coluna no banco — é sempre derivado do slug,
    // então não deve ser enviado no insert.
    const { purchaseLink, ...rest } = product;
    const shortFallback = (rest.description && rest.description.slice(0, 120)) || rest.name || "";
    const productData = {
      ...rest,
      slug,
      images: imageUrls,
      short: rest.short || shortFallback,
    };

    const saved = await createProduct(productData);

    // Limpar cache
    productsCache = null;
    return { ...saved, purchaseLink: `/produtos/${saved.slug}#comprar` };
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
}

// Atualizar produto
export async function updateProductInDb(id: number, product: any): Promise<Product> {
   if (!isSupabaseConfigured()) {
    return updateProductLocal(product);
  }

  try {
    const productData: any = { ...product };

    // Busca as imagens que o produto tinha ANTES da edição
    const { data: currentProduct } = await supabase
      .from('products')
      .select('images')
      .eq('id', id)
      .single();

    const oldImages: string[] = currentProduct?.images || [];

    if (product.images) {
      const imageUrls: string[] = [];

      for (const imageUrl of product.images) {
        if (imageUrl.startsWith('data:')) {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
          const uploadedUrl = await uploadImage(file, 'products');
          imageUrls.push(uploadedUrl);
        } else {
          imageUrls.push(imageUrl);
        }
      }

      productData.images = imageUrls;

      // Apaga do Storage as imagens antigas que não estão mais na lista nova
      const imagesToDelete = oldImages.filter((old) => !imageUrls.includes(old));
      for (const imageUrl of imagesToDelete) {
        if (imageUrl.includes('product-images')) {
          try {
            const path = new URL(imageUrl).pathname.split('/').slice(-2).join('/');
            await deleteImage(path);
          } catch (imgError) {
            console.error('Error deleting old image from storage:', imgError);
            // não trava a atualização do produto por causa disso
          }
        }
      }
    }

    const slug = productData.slug || slugifyProductName(productData.name);
    productData.slug = slug;
    // Ensure short is set (some forms may omit the resumo field)
    productData.short = productData.short || (productData.description && (productData.description as string).slice(0, 120)) || productData.name || "";
    delete productData.purchaseLink;

    const updated = await updateProduct(id, productData);
    productsCache = null;
    return { ...updated, purchaseLink: `/produtos/${updated.slug}#comprar` };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Buscar um produto por slug
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!isSupabaseConfigured()) {
    return (await getAllProducts()).find((product) => product.slug === slug);
  }

  try {
    const product = await fetchProductBySlug(slug);
    if (product) return { ...product, purchaseLink: `/produtos/${product.slug}#comprar` };
    return (await getAllProducts()).find((item) => item.slug === slug);
  } catch (error) {
    console.error('Error fetching product by slug from Supabase:', error);
    return (await getAllProducts()).find((item) => item.slug === slug);
  }
}

// Deletar produto
// Deletar produto
export async function deleteProductFromDb(slug: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return deleteProductLocal(slug);
  }

  try {
    const products = await getAllProducts();
    const product = products.find((p: any) => p.slug === slug);

    if (product && product.id) {
      for (const imageUrl of product.images) {
        if (imageUrl.includes('product-images')) {
          try {
            const path = new URL(imageUrl).pathname.split('/').slice(-2).join('/');
            await deleteImage(path);
          } catch (imgError) {
            console.error('Error deleting image from storage:', imgError);
            // segue o fluxo mesmo se essa imagem não puder ser apagada
          }
        }
      }

      await deleteProduct(product.id);
      productsCache = null;
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Função para slugify
export function slugifyProductName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Função WhatsApp
export { whatsappLink } from "@/config/site";


export interface WhatsappProductParams {
  productName: string;
  quantity: number;
  price: number;
  size?: string;
  scent?: string;
}

export function buildProductWhatsappMessage(params: WhatsappProductParams): string {
  const { productName, quantity, price, size, scent } = params;

  const formattedPrice = (price * quantity)
    .toFixed(2)
    .replace(".", ",");

  const lines: string[] = [
    "Olá! Estou interessado em comprar um produto da Alma Essência. 🌿",
    "",
    `🛍️ *Produto:* ${productName}`,
  ];

  if (scent) lines.push(`🌸 *Aroma:* ${scent}`);
  if (size)  lines.push(`📦 *Tamanho:* ${size}`);

  lines.push(`🔢 *Quantidade:* ${quantity}`);
  lines.push(`💰 *Preço total:* R$ ${formattedPrice}`);
  lines.push("");
  lines.push("Por favor, me informe sobre disponibilidade e formas de envio. Obrigado! 😊");

  return lines.join("\n");
}