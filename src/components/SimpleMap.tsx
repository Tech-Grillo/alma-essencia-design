// Mapa da feira via Google Maps incorporado (gratuito, sem chave de API).
// Antes usava os servidores do OpenStreetMap, que bloqueiam sites em produção.
import * as Icons from "lucide-react";
import { site } from "@/config/site";

interface SimpleMapProps {
  className?: string;
}

export function SimpleMap({ className = "w-full h-full min-h-[300px]" }: SimpleMapProps) {
  const query = encodeURIComponent(site.location.mapsQuery);
  return (
    <div className={`relative ${className}`}>
      <iframe
        title={`Mapa: ${site.location.name}`}
        src={`https://www.google.com/maps?q=${query}&z=16&output=embed`}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${query}`}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-4 py-2 text-xs font-semibold text-foreground shadow-soft backdrop-blur hover:bg-card"
      >
        <Icons.Navigation className="h-3.5 w-3.5" /> Como chegar
      </a>
    </div>
  );
}
