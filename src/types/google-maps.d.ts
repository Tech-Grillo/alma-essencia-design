declare namespace google.maps {
  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    styles?: MapTypeStyle[];
  }

  interface MapTypeStyle {
    featureType?: string;
    elementType?: string;
    stylers?: StyleOptions[];
  }

  interface StyleOptions {
    color?: string;
    [key: string]: any;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class Map {
    constructor(mapDiv: Element | null, options?: MapOptions);
  }

  class Marker {
    constructor(options?: { position?: LatLng | LatLngLiteral; map?: Map; title?: string });
  }

  type LatLng = any;
}

interface Window {
  google: typeof google;
}
