import { VehicleModal } from '../types';

export interface RouteCalculationResult {
  distanceKm: number;
  durationMin: number;
  originCoords: { lat: number; lng: number };
  destCoords: { lat: number; lng: number };
  method: 'osrm' | 'haversine_cep' | 'nominatim_osrm';
}

export interface AddressInput {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
}

// Tabela de Coordenadas Geográficas de Referência por Faixa de CEP no Brasil
// Cobre as principais capitais e regiões metropolitanas do Brasil para resposta imediata
const BRAZIL_CEP_COORDS: Record<string, { lat: number; lng: number }> = {
  // São Paulo - Capital e Região Metropolitana
  '01': { lat: -23.5505, lng: -46.6333 }, // Centro Histórico / Sé / República
  '013': { lat: -23.5615, lng: -46.6558 }, // Bela Vista / Avenida Paulista
  '014': { lat: -23.5685, lng: -46.6668 }, // Jardins / Cerqueira César
  '040': { lat: -23.5985, lng: -46.6515 }, // Moema / Vila Mariana
  '045': { lat: -23.5935, lng: -46.6855 }, // Itaim Bibi / Vila Olímpia / Faria Lima
  '047': { lat: -23.6350, lng: -46.7020 }, // Santo Amaro / Chácara Santo Antônio
  '054': { lat: -23.5620, lng: -46.6910 }, // Pinheiros / Vila Madalena
  '055': { lat: -23.5780, lng: -46.7210 }, // Butantã / USP
  '056': { lat: -23.6020, lng: -46.7190 }, // Morumbi
  '020': { lat: -23.5020, lng: -46.6250 }, // Santana / Zona Norte
  '024': { lat: -23.4830, lng: -46.6430 }, // Mandaqui / Tremembé
  '030': { lat: -23.5380, lng: -46.6020 }, // Brás / Pari / Belém
  '033': { lat: -23.5450, lng: -46.5710 }, // Tatuapé / Anália Franco
  '031': { lat: -23.5610, lng: -46.6010 }, // Mooca
  '080': { lat: -23.4980, lng: -46.4350 }, // São Miguel Paulista
  '082': { lat: -23.5410, lng: -46.4520 }, // Itaquera
  '060': { lat: -23.5320, lng: -46.7920 }, // Osasco
  '064': { lat: -23.5050, lng: -46.8780 }, // Barueri / Alphaville
  '090': { lat: -23.6600, lng: -46.5300 }, // Santo André
  '097': { lat: -23.6910, lng: -46.5650 }, // São Bernardo do Campo
  '095': { lat: -23.6180, lng: -46.5680 }, // São Caetano do Sul

  // São Paulo - Litoral e Interior
  '11': { lat: -23.9608, lng: -46.3336 }, // Santos / Baixada Santista
  '12': { lat: -23.1896, lng: -45.8841 }, // São José dos Campos / Vale do Paraíba
  '13': { lat: -22.9099, lng: -47.0626 }, // Campinas
  '14': { lat: -21.1775, lng: -47.8103 }, // Ribeirão Preto
  '15': { lat: -20.8113, lng: -49.3758 }, // São José do Rio Preto
  '16': { lat: -21.2089, lng: -50.4328 }, // Araçatuba
  '17': { lat: -22.3145, lng: -49.0587 }, // Bauru
  '18': { lat: -23.5015, lng: -47.4587 }, // Sorocaba
  '19': { lat: -22.1256, lng: -51.3889 }, // Presidente Prudente

  // Rio de Janeiro
  '20': { lat: -22.9068, lng: -43.1729 }, // Centro RJ
  '22': { lat: -22.9838, lng: -43.2065 }, // Copacabana / Ipanema / Zona Sul
  '226': { lat: -23.0003, lng: -43.3659 }, // Barra da Tijuca
  '24': { lat: -22.8832, lng: -43.1034 }, // Niterói / Região Metropolitana RJ
  '28': { lat: -21.7545, lng: -41.3244 }, // Norte Fluminense (Campos)

  // Espírito Santo
  '29': { lat: -20.3155, lng: -40.3128 }, // Vitória / Vila Velha

  // Minas Gerais
  '30': { lat: -19.9208, lng: -43.9378 }, // BH Centro / Savassi
  '31': { lat: -19.8650, lng: -43.9680 }, // Pampulha
  '32': { lat: -19.9321, lng: -44.0539 }, // Contagem
  '36': { lat: -21.7642, lng: -43.3496 }, // Juiz de Fora
  '38': { lat: -18.9186, lng: -48.2772 }, // Uberlândia / Triângulo Mineiro

  // Bahia e Sergipe
  '40': { lat: -12.9777, lng: -38.5016 }, // Salvador Centro
  '49': { lat: -10.9472, lng: -37.0731 }, // Aracaju

  // Nordeste
  '50': { lat: -8.0578, lng: -34.8829 }, // Recife / Olinda (PE)
  '57': { lat: -9.6498, lng: -35.7089 }, // Maceió (AL)
  '58': { lat: -7.1195, lng: -34.8450 }, // João Pessoa (PB)
  '59': { lat: -5.7945, lng: -35.2110 }, // Natal (RN)
  '60': { lat: -3.7172, lng: -38.5433 }, // Fortaleza (CE)
  '64': { lat: -5.0920, lng: -42.8038 }, // Teresina (PI)
  '65': { lat: -2.5391, lng: -44.2829 }, // São Luís (MA)

  // Norte
  '66': { lat: -1.4558, lng: -48.5044 }, // Belém (PA)
  '69': { lat: -3.1190, lng: -60.0217 }, // Manaus (AM)

  // Centro-Oeste
  '70': { lat: -15.7975, lng: -47.8919 }, // Brasília Plano Piloto (DF)
  '72': { lat: -15.8340, lng: -48.0560 }, // Taguatinga / Ceilândia (DF)
  '74': { lat: -16.6869, lng: -49.2648 }, // Goiânia (GO)
  '77': { lat: -10.2491, lng: -48.3243 }, // Palmas (TO)
  '78': { lat: -15.6014, lng: -56.0979 }, // Cuiabá (MT)
  '79': { lat: -20.4697, lng: -54.6201 }, // Campo Grande (MS)

  // Paraná
  '80': { lat: -25.4290, lng: -49.2671 }, // Curitiba Centro / Batel
  '86': { lat: -23.3045, lng: -51.1696 }, // Londrina
  '87': { lat: -23.4209, lng: -51.9331 }, // Maringá

  // Santa Catarina
  '88': { lat: -27.5954, lng: -48.5480 }, // Florianópolis
  '89': { lat: -26.3045, lng: -48.8487 }, // Joinville / Blumenau

  // Rio Grande do Sul
  '90': { lat: -30.0346, lng: -51.2177 }, // Porto Alegre Centro
  '95': { lat: -29.1685, lng: -51.1794 }, // Caxias do Sul / Serra Gaúcha
  '96': { lat: -31.7654, lng: -52.3376 }, // Pelotas
};

// Cache em memória para consultas repetidas
const geocodeCache = new Map<string, { lat: number; lng: number }>();

// Fórmula de Haversine para cálculo de distância esférica entre coordenadas
function calculateHaversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Geocodificação inteligente com cache e múltiplas estratégias
export async function resolveAddressCoordinates(addr: AddressInput): Promise<{ lat: number; lng: number }> {
  // Se o endereço já tem coordenadas válidas
  if (addr.lat && addr.lng && (addr.lat !== 0 || addr.lng !== 0)) {
    return { lat: addr.lat, lng: addr.lng };
  }

  const cleanCep = (addr.zipCode || '').replace(/\D/g, '');
  const cacheKey = `${cleanCep}_${addr.street || ''}_${addr.number || ''}_${addr.city || ''}`.toLowerCase();

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // 1. Tenta consulta ao OpenStreetMap Nominatim
  try {
    const queryParts: string[] = [];
    if (addr.street) queryParts.push(addr.street);
    if (addr.number) queryParts.push(addr.number);
    if (addr.city) queryParts.push(addr.city);
    if (addr.state) queryParts.push(addr.state);
    queryParts.push('Brasil');

    const queryString = queryParts.join(', ');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryString)}&limit=1`;
    const res = await fetch(nominatimUrl, {
      headers: { 'User-Agent': 'CorreiosParceirosApp/2.0' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
        const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        geocodeCache.set(cacheKey, coords);
        return coords;
      }
    }
  } catch {
    // Fallback silencioso para tabela de CEP
  }

  // 2. Consulta na tabela de faixas de CEP brasileiras
  if (cleanCep.length >= 2) {
    const prefix3 = cleanCep.substring(0, 3);
    const prefix2 = cleanCep.substring(0, 2);

    if (BRAZIL_CEP_COORDS[prefix3]) {
      const base = BRAZIL_CEP_COORDS[prefix3];
      // Adiciona pequena variação determinística baseada no número ou final do CEP
      const offset = (parseInt(cleanCep.slice(-3), 10) || 100) / 100000;
      const coords = { lat: base.lat + offset, lng: base.lng - offset };
      geocodeCache.set(cacheKey, coords);
      return coords;
    }

    if (BRAZIL_CEP_COORDS[prefix2]) {
      const base = BRAZIL_CEP_COORDS[prefix2];
      const offset = (parseInt(cleanCep.slice(-3), 10) || 100) / 100000;
      const coords = { lat: base.lat + offset, lng: base.lng - offset };
      geocodeCache.set(cacheKey, coords);
      return coords;
    }
  }

  // Padrão: Centro de São Paulo
  const defaultCoords = { lat: -23.5505, lng: -46.6333 };
  geocodeCache.set(cacheKey, defaultCoords);
  return defaultCoords;
}

/**
 * Calcula a rota real, distância em km e tempo de trânsito em minutos
 * levando em conta o modal de transporte (Moto vs Carro no trânsito urbano brasileiro).
 */
export async function calculateRouteDistanceAndTime(
  origin: AddressInput,
  dest: AddressInput,
  modal: VehicleModal
): Promise<RouteCalculationResult> {
  // Resolve coordenadas de origem e destino
  const [originCoords, destCoords] = await Promise.all([
    resolveAddressCoordinates(origin),
    resolveAddressCoordinates(dest),
  ]);

  let rawDistanceKm = 0;
  let rawCarDurationMin = 0;
  let method: RouteCalculationResult['method'] = 'osrm';

  // 1. Tenta consulta ao serviço OSRM (Open Source Routing Machine)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=false`;
    const response = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0 && data.routes[0].distance > 0) {
        rawDistanceKm = data.routes[0].distance / 1000;
        rawCarDurationMin = data.routes[0].duration / 60;
        method = 'osrm';
      }
    }
  } catch {
    // Falha de rede ou timeout: usará o fallback de Haversine
  }

  // 2. Fallback de cálculo geodésico caso OSRM não responda
  if (rawDistanceKm <= 0) {
    const straightLine = calculateHaversineDistanceKm(
      originCoords.lat,
      originCoords.lng,
      destCoords.lat,
      destCoords.lng
    );

    // Fator de tortuosidade urbana (malha viária real é ~1.36x a linha reta)
    const urbanTortuosityFactor = 1.36;
    rawDistanceKm = Math.max(1.2, straightLine * urbanTortuosityFactor);

    // Velocidade média urbana para carro: 22 km/h + 5 min de semáforos/deslocamento base
    rawCarDurationMin = (rawDistanceKm / 22) * 60 + 5;
    method = 'haversine_cep';
  }

  // 3. Ajuste de tempo de acordo com o Modal de Transporte
  let calculatedDurationMin = 0;
  if (modal === 'moto') {
    // Motocicletas no trânsito urbano brasileiro utilizam corredores entre faixas:
    // Tempo estimado é ~32% menor que o carro no trânsito pesado
    calculatedDurationMin = Math.max(6, Math.round(rawCarDurationMin * 0.68));
  } else {
    // Carros / Utilitários: sujeitos a retenções viárias e tempo de manobra/estacionamento
    calculatedDurationMin = Math.max(10, Math.round(rawCarDurationMin * 1.05 + 3));
  }

  return {
    distanceKm: Math.max(1.0, Math.round(rawDistanceKm * 10) / 10),
    durationMin: calculatedDurationMin,
    originCoords,
    destCoords,
    method,
  };
}
