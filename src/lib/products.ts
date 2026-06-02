import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";

export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  short: string;
  description: string;
  purchaseLink: string;
  scents: string[];
  sizes: string[];
};

export const products: Product[] = [
  {
    slug: "vela-aromatica-lavanda",
    name: "Vela Aromática de Soja",
    category: "Velas",
    price: 79.9,
    image: p1,
    short: "Cera de soja natural, queima limpa por até 40 horas.",
    description:
      "Vela artesanal feita com cera de soja 100% natural e óleos essenciais puros. Acende rituais de calma e perfuma o ambiente com delicadeza.",
    purchaseLink: "/produtos/vela-aromatica-lavanda#comprar",
    scents: ["Lavanda", "Baunilha", "Rosa", "Eucalipto"],
    sizes: ["P", "M", "G"],
  },
  {
    slug: "sabonete-rosa",
    name: "Sabonete em Barra de Rosas",
    category: "Sabonetes",
    price: 32.0,
    image: p2,
    short: "Glicerina pura com pétalas de rosa para um banho ritual.",
    description:
      "Sabonete artesanal nutritivo, com glicerina vegetal e óleos botânicos. Perfuma a pele e transforma o banho em um momento de cuidado.",
    purchaseLink: "/produtos/sabonete-rosa#comprar",
    scents: ["Rosa", "Jasmim", "Camélia"],
    sizes: ["100g", "150g"],
  },
  {
    slug: "home-spray-eucalipto",
    name: "Home Spray Eucalipto",
    category: "Home Spray",
    price: 64.5,
    image: p3,
    short: "Bruma perfumada para tecidos e ambientes.",
    description:
      "Bruma aromática feita com extratos botânicos e álcool de cereais. Perfuma tecidos, cortinas e ambientes com frescor sereno.",
    purchaseLink: "/produtos/home-spray-eucalipto#comprar",
    scents: ["Eucalipto", "Capim-Limão", "Hortelã"],
    sizes: ["120ml", "240ml"],
  },
  {
    slug: "difusor-baunilha",
    name: "Difusor de Ambiente",
    category: "Difusores",
    price: 119.0,
    image: p4,
    short: "Aroma contínuo por até 9 dias com varetas de rattan.",
    description:
      "Difusor de varetas com fragrância concentrada. Liberação suave e contínua, ideal para espaços íntimos como quartos e salas de leitura.",
    purchaseLink: "/produtos/difusor-baunilha#comprar",
    scents: ["Baunilha", "Madeira", "Flor de Cerejeira"],
    sizes: ["120ml", "250ml"],
  },
];

export const categories = [
  "Velas",
  "Hidratantes",
  "Home Spray",
  "Difusores",
  "Sabonetes",
  "Kits",
];

export const WHATSAPP_NUMBER = "+55 (21) 98716-3045";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
