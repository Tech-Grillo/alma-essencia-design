import { whatsappLink } from "@/lib/products";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function FloatingWhatsApp() {
  const message =
    "Olá! 🌿\n\nGostaria de saber mais sobre os produtos artesanais da Alma e Essência. Poderia me ajudar?";

  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed z-50 right-[5.5rem] bottom-6 inline-flex items-center justify-center rounded-full bg-whatsapp text-white h-14 w-14 shadow-lg hover:shadow-xl transition-all hover:scale-110 hover:-translate-y-1 animate-whatsapp-bounce"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
