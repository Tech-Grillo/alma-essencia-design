import p1 from "@/assets/imagens_produtos/p1.jpg";
import p2 from "@/assets/imagens_produtos/p2.jpg";
import p3 from "@/assets/imagens_produtos/p3.jpg";
import p4 from "@/assets/imagens_produtos/p4.jpg";

export type SizeOption = { label: string; unit?: string; price: number };

export type Product = { 
  slug: string;
  name: string;
  category: string;
  price: number; // fallback / default price
  images: string[]; // primeira imagem é a principal (capa), as demais são da galeria
  short: string;
  description: string;
  purchaseLink: string;
  scents: string[];
  sizes: SizeOption[];
};

export const products: Product[] = [
  {
    slug: "vela-aromatica-lavanda",
    name: "Vela Aromática de Soja",
    category: "Velas aromáticas",
    // price kept as medium size price
    price: 79.9,
    images: [p1],
    short: "Cera de soja natural, queima limpa por até 40 horas.",
    description:
      "Vela artesanal feita com cera de soja 100% natural e óleos essenciais puros. Acende rituais de calma e perfuma o ambiente com delicadeza.",
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
    description:
      "Sabonete artesanal nutritivo, com glicerina vegetal e óleos botânicos. Perfuma a pele e transforma o banho em um momento de cuidado.",
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
    description:
      "Bruma aromática feita com extratos botânicos e álcool de cereais. Perfuma tecidos, cortinas e ambientes com frescor sereno.",
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
    description:
      "Difusor de varetas com fragrância concentrada. Liberação suave e contínua, ideal para espaços íntimos como quartos e salas de leitura.",
    purchaseLink: "/produtos/difusor-baunilha#comprar",
    scents: ["Baunilha", "Madeira", "Flor de Cerejeira"],
    sizes: [
      { label: "Pequeno", price: 89.0 },
      { label: "Médio", price: 119.0 },
      { label: "Grande", price: 149.0 },
    ],
  },
];

// Categorias principais (nível superior) - organizadas por linha de produto
export const topLevelCategories = [
  "Velas aromáticas",
  "Sabonetes",
  "Home Spray",
  "Difusores",
  "Hidratantes",
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

// Grupos de categorias com subcategorias
export const categoryGroups = [
  { 
    parent: "Velas aromáticas", 
    children: ["Velas de massagem"] 
  },
  { 
    parent: "Sabonetes", 
    children: ["Sabonetes glicerinados", "Sabonetes fitoterápicos", "Sabonete líquido"] 
  },
  { 
    parent: "Home Spray", 
    children: ["Home spray 250ml", "Home spray 60ml"] 
  },
  { 
    parent: "Difusores", 
    children: ["Difusores de ambiente 250ml"] 
  },
  { 
    parent: "Hidratantes", 
    children: ["Sugar Cream", "Creme para mãos e pés", "Manteigas corporais", "Óleo corporal"] 
  },
];

// Lista completa de categorias (para compatibilidade)
export const categories = [
  ...topLevelCategories,
  ...categoryGroups.flatMap((group) => group.children),
];


export function getCategoryGroup(category: string) {
  return categoryGroups.find((group) => group.parent === category || group.children.includes(category));
}

export function getCategoryChildren(parent: string) {
  return categoryGroups.find((group) => group.parent === parent)?.children ?? [];
}

export const categoryImagePaths: Record<string, string> = {
  "Velas aromáticas": "/src/assets/imagens_produtos/velas/",
  "Sabonetes": "/src/assets/imagens_produtos/sabonetes/",
  "Home Spray": "/src/assets/imagens_produtos/home-spray/",
  "Difusores": "/src/assets/imagens_produtos/difusores/",
  "Kits": "/src/assets/imagens_produtos/kits/",
  "Hidratantes": "/src/assets/imagens_produtos/hidratantes/",
  "Esfoliante corporal": "/src/assets/imagens_produtos/hidratantes/",
  "Home spray 250ml": "/src/assets/imagens_produtos/home-spray/",
  "Home spray 60ml": "/src/assets/imagens_produtos/home-spray/",
  "Difusores de ambiente 250ml": "/src/assets/imagens_produtos/difusores/",
};

export function getCategoryImagePath(category: string): string {
  return categoryImagePaths[category] || "/src/assets/imagens_produtos/";
}

export const WHATSAPP_NUMBER = "+55 (21) 98716-3045";
const CUSTOM_PRODUCTS_KEY = "almaEssenciaCustomProducts";
const EDITED_PRODUCTS_KEY = "almaEssenciaEditedProducts";
const DELETED_PRODUCTS_KEY = "almaEssenciaDeletedProducts";

function isBrowser() {
  return typeof window !== "undefined";
}

export function slugifyProductName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function getCustomProducts(): Product[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((product): product is Product => {
      return Boolean(
        product &&
          typeof product.slug === "string" &&
          typeof product.name === "string" &&
          typeof product.category === "string" &&
          typeof product.price === "number" &&
          Array.isArray(product.images) &&
          Array.isArray(product.scents) &&
          Array.isArray(product.sizes),
      );
    });
  } catch {
    return [];
  }
}

function getEditedProducts(): Product[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(EDITED_PRODUCTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((product): product is Product => {
      return Boolean(
        product &&
          typeof product.slug === "string" &&
          typeof product.name === "string" &&
          typeof product.category === "string" &&
          typeof product.price === "number" &&
          Array.isArray(product.images) &&
          Array.isArray(product.scents) &&
          Array.isArray(product.sizes),
      );
    });
  } catch {
    return [];
  }
}

function getDeletedProductSlugs(): string[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(DELETED_PRODUCTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((slug): slug is string => typeof slug === "string");
  } catch {
    return [];
  }
}

export function getAllProducts() {
  const editedProducts = new Map(getEditedProducts().map((product) => [product.slug, product]));
  const deletedSlugs = new Set(getDeletedProductSlugs());

  return [...products, ...getCustomProducts()]
    .filter((product) => !deletedSlugs.has(product.slug))
    .map((product) => {
      const edited = editedProducts.get(product.slug);
      if (edited) {
        // Garantir que produtos editados tenham o campo images
        return {
          ...edited,
          images: edited.images || product.images,
        };
      }
      return product;
    });
}

export function getAllCategories() {
  return Array.from(new Set([...categories, ...getAllProducts().map((product) => product.category)]));
}

export function saveCustomProduct(product: Omit<Product, "slug" | "purchaseLink">) {
  const customProducts = getCustomProducts();
  const baseSlug = slugifyProductName(product.name) || "produto";
  const existingSlugs = new Set([...products, ...customProducts].map((item) => item.slug));
  let slug = baseSlug;
  let count = 2;

  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${count}`;
    count += 1;
  }

  const savedProduct: Product = {
    ...product,
    slug,
    purchaseLink: `/produtos/${slug}#comprar`,
    images: product.images && product.images.length > 0 
      ? product.images 
      : ["/src/assets/imagens_inicio/hero.jpg"],
  };

  if (isBrowser()) {
    window.localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify([...customProducts, savedProduct]));
  }

  return savedProduct;
}

export function updateProduct(updatedProduct: Product) {
  const customProducts = getCustomProducts();
  const customProductIndex = customProducts.findIndex((product) => product.slug === updatedProduct.slug);
  const productToSave = {
    ...updatedProduct,
    purchaseLink: `/produtos/${updatedProduct.slug}#comprar`,
  };

  if (!isBrowser()) return productToSave;

  if (customProductIndex >= 0) {
    const nextCustomProducts = [...customProducts];
    nextCustomProducts[customProductIndex] = productToSave;
    window.localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(nextCustomProducts));
    return productToSave;
  }

  const editedProducts = getEditedProducts().filter((product) => product.slug !== updatedProduct.slug);
  window.localStorage.setItem(EDITED_PRODUCTS_KEY, JSON.stringify([...editedProducts, productToSave]));
  return productToSave;
}

export function deleteProduct(slug: string) {
  if (!isBrowser()) return;

  const nextCustomProducts = getCustomProducts().filter((product) => product.slug !== slug);
  const nextEditedProducts = getEditedProducts().filter((product) => product.slug !== slug);
  const nextDeletedSlugs = Array.from(new Set([...getDeletedProductSlugs(), slug]));

  window.localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(nextCustomProducts));
  window.localStorage.setItem(EDITED_PRODUCTS_KEY, JSON.stringify(nextEditedProducts));
  window.localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(nextDeletedSlugs));
}


export function whatsappLink(message: string) {
  const phone = WHATSAPP_NUMBER.replace(/\D/g, ""); // limpa o número: 5521987163045
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export interface WhatsappProductParams {
  productName: string;
  quantity: number;
  price: number;
  size?: string;   // tamanho (Pequeno / Médio / Grande)
  scent?: string;  // aroma selecionado
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
