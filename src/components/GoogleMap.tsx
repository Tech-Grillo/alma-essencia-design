import { useEffect, useRef, useState } from "react";

interface GoogleMapProps {
  lat: number;
  lng: number;
  title: string;
  className?: string;
}

export function GoogleMap({ lat, lng, title, className = "w-full h-full min-h-[300px]" }: GoogleMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const checkMapsLoaded = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).google && (window as any).google.maps) {
        clearInterval(checkMapsLoaded);
        setMapLoaded(true);
      }
    }, 100);

    return () => clearInterval(checkMapsLoaded);
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapContainer.current) return;

    const google = (window as any).google;
    
    const mapOptions: any = {
      center: { lat, lng },
      zoom: 15,
      mapTypeId: "roadmap",
      styles: [
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [{ color: "#8B7355" }],
        },
        {
          featureType: "water",
          stylers: [{ color: "#E8D6C8" }],
        },
      ],
    };

    map.current = new google.maps.Map(mapContainer.current, mapOptions);

    new google.maps.Marker({
      position: { lat, lng },
      map: map.current,
      title,
    });
  }, [lat, lng, title, mapLoaded]);

  if (!mapLoaded) {
    return <div className={className}>Carregando mapa...</div>;
  }

  return <div ref={mapContainer} className={className} />;
}