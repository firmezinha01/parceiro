// Serviço de Geolocalização Real via GPS do Dispositivo (navigator.geolocation)

export interface Coordinates {
  lat: number;
  lng: number;
  accuracyMeters?: number;
}

export async function getCurrentGPSPosition(): Promise<Coordinates> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      // Fallback para coordenadas padrão caso o navegador não suporte
      resolve({ lat: -23.5505, lng: -46.6333, accuracyMeters: 50 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracyMeters: Math.round(position.coords.accuracy),
        });
      },
      (error) => {
        console.warn('Geolocalização não concedida ou indisponível:', error.message);
        // Fallback gracioso
        resolve({ lat: -23.5505, lng: -46.6333, accuracyMeters: 100 });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  });
}
