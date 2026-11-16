/**
 * Dados da loja em um único lugar.
 * Para trocar telefone, Instagram, e-mail ou textos institucionais, edite só este arquivo.
 */
export const site = {
  name: "Alma e Essência",
  tagline: "Aromaterapia Artesanal",
  description:
    "Velas, sabonetes, home sprays e difusores feitos à mão. Pequenos rituais para perfumar a casa e acalmar a alma.",
  slogan: "Pequenos rituais que perfumam a casa e acalmam a alma.",
  city: "Niterói, RJ",
  contact: {
    whatsapp: "5521987163045",
    whatsappDisplay: "(21) 98716-3045",
    email: "almaeessencia36@gmail.com",
    instagram: "alma_e_essencia",
  },
  checkout: {
    /** Texto mostrado na opção de retirada (sem custo). */
    pickup: "Retirada na feira do Campo de São Bento (Icaraí), aos domingos, das 9h às 15h",
    /** Máximo de parcelas oferecidas no cartão. */
    maxInstallments: 3,
    /** Minutos até o Pix gerado expirar. */
    pixExpirationMinutes: 30,
  },
} as const;

export const instagramUrl = `https://www.instagram.com/${site.contact.instagram}/`;
export const instagramHandle = `@${site.contact.instagram}`;

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${site.contact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
