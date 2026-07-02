import { useEffect, useRef } from "react";

interface SimpleMapProps {
  lat: number;
  lng: number;
  title: string;
  className?: string;
}

export function SimpleMap({ lat, lng, title, className = "w-full h-full min-h-[300px]" }: SimpleMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Carregar Leaflet CSS e JS dinamicamente
    const loadLeaflet = async () => {
      // Carregar CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Carregar JS
      if (!(window as any).L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Inicializar mapa
      if (mapContainer.current && !mapRef.current) {
        const L = (window as any).L;
        
        mapRef.current = L.map(mapContainer.current).setView([lat, lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current);

        L.marker([lat, lng])
          .addTo(mapRef.current)
          .bindPopup(title)
          .openPopup();
      }
    };

    loadLeaflet();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, title]);

  return <div ref={mapContainer} className={className} />;
}