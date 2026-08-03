import { supabase, uploadImage, deleteImage, fetchProducts, createProduct, updateProduct, fetchProductBySlug, deleteProduct } from './supabase';
import {
  getAllProducts as getAllProductsLocal,
  saveCustomProduct as saveCustomProductLocal,
  updateProduct as updateProductLocal,
  deleteProduct as deleteProductLocal,
} from './products';
export type SizeOption = { label: string; price: number };

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

// Produtos padrão (fallback quando Supabase não está configurado)
import p1 from "@/assets/imagens_produtos/p1.jpg";
import p2 from "@/assets/imagens_produtos/p2.jpg";
import p3 from "@/assets/imagens_produtos/p3.jpg";
import p4 from "@/assets/imagens_produtos/p4.jpg";

const defaultProducts: Product[] = [
  {
    slug: "vela-aromatica-lavanda",
    name: "Vela Aromática de Soja",
    category: "Velas aromáticas",
    price: 79.9,
    images: [p1],
    short: "Cera de soja natural, queima limpa por até 40 horas.",
    description: "Vela artesanal feita com cera de soja 100% natural e óleos essenciais puros.",
    purchaseLink: "/produtos/vela-aromatica-lavanda#comprar",
    scents: ["Lavanda", "Baunilha", "Rosa", "Eucalipto"],
    sizes: [
      { label: "Pequeno", price: 59.9 },
      { label: "Médio", price: 79.9 },
      { label: "Grande", price: 99.9 },
    ],
  },
  {
    slug: "sabonete-rosa",
    name: "Sabonete em Barra de Rosas",
    category: "Sabonetes",
    price: 32.0,
    images: [p2],
    short: "Glicerina pura com pétalas de rosa para um banho ritual.",
    description: "Sabonete artesanal nutritivo, com glicerina vegetal e óleos botânicos.",
    purchaseLink: "/produtos/sabonete-rosa#comprar",
    scents: ["Rosa", "Jasmim", "Camélia"],
    sizes: [
      { label: "Pequeno", price: 22.0 },
      { label: "Médio", price: 32.0 },
      { label: "Grande", price: 42.0 },
    ],
  },
  {
    slug: "home-spray-eucalipto",
    name: "Home Spray Eucalipto",
    category: "Home Spray",
    price: 64.5,
    images: [p3],
    short: "Bruma perfumada para tecidos e ambientes.",
    description: "Bruma aromática feita com extratos botânicos e álcool de cereais.",
    purchaseLink: "/produtos/home-spray-eucalipto#comprar",
    scents: ["Eucalipto", "Capim-Limão", "Hortelã"],
    sizes: [
      { label: "Pequeno", price: 44.5 },
      { label: "Médio", price: 64.5 },
      { label: "Grande", price: 84.5 },
    ],
  },
  {
    slug: "difusor-baunilha",
    name: "Difusor de Ambiente",
    category: "Difusores",
    price: 119.0,
    images: [p4],
    short: "Aroma contínuo por até 9 dias com varetas de rattan.",
    description: "Difusor de varetas com fragrância concentrada.",
    purchaseLink: "/produtos/difusor-baunilha#comprar",
    scents: ["Baunilha", "Madeira", "Flor de Cerejeira"],
    sizes: [
      { label: "Pequeno", price: 89.0 },
      { label: "Médio", price: 119.0 },
      { label: "Grande", price: 149.0 },
    ],
  },
];

export const categories = [
  "Velas aromáticas",
  "Velas de massagem",
  "Sabonetes",
  "Sabonetes glicerinados",
  "Sabonetes fitoterápicos",
  "Sabonete líquido",
  "Home Spray",
  "Home spray 250ml",
  "Home spray 60ml",
  "Difusores",
  "Difusores de ambiente 250ml",
  "Hidratantes",
  "Sugar Cream",
  "Creme para mãos e pés",
  "Manteigas corporais",
  "Óleo corporal",
  "Esfoliante corporal",
  "Kits",
  "Águas de lençóis",
  "Body Splash",
  "Geleia de banho",
  "Escalda-pés",
  "Whalts Melts",
  "Sais de banho",
  "Velas",
  "Perfume para cabelo",
  "Spa para os pés",
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
    const productData = {
      ...rest,
      slug,
      images: imageUrls,
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
export const WHATSAPP_NUMBER = "+55 (21) 98716-3045";

export function whatsappLink(message: string): string {
  const phone = WHATSAPP_NUMBER.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

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