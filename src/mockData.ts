import { DriverProfile, Order, WalletTransaction, VehicleType } from './types';

export const initialDriver: DriverProfile = {
  name: 'Carlos Alberto Silva',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  rating: 4.97,
  totalTrips: 1842,
  acceptanceRate: 98,
  vehicleType: 'fiorino',
  vehicleModel: 'Fiat Fiorino 1.4 EVO',
  vehiclePlate: 'BRA-2E19',
  phone: '(11) 98452-9011',
  pixKey: 'carlos.silva.entregas@gmail.com',
  isOnline: true,
  walletBalance: 348.50,
  todayEarnings: 186.20,
  weekEarnings: 1420.00,
};

export const sampleOrders: Order[] = [
  {
    id: 'ord-101',
    code: 'PRC-8921',
    createdAt: 'Agora mesmo',
    vehicleType: 'fiorino',
    price: 48.90,
    distanceToPickupKm: 1.4,
    totalDistanceKm: 7.8,
    estimatedMinutes: 24,
    paymentMethod: 'app',
    cargoType: 'Caixas de E-commerce (12 volumes)',
    cargoWeightKg: 45,
    pickup: {
      address: 'Av. Paulista, 1578 - Bela Vista',
      neighborhood: 'Bela Vista',
      city: 'São Paulo - SP',
      lat: -23.5615,
      lng: -46.6559,
      contactName: 'Mariana Santos (Loja Moda & Cia)',
      contactPhone: '(11) 97123-4567',
      instructions: 'Retirar na doca de carga subsolo 1. Falar com Marcão.'
    },
    delivery: {
      address: 'Rua Augusta, 2400 - Jardins',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo - SP',
      lat: -23.5552,
      lng: -46.6621,
      contactName: 'Juliana Paes',
      contactPhone: '(11) 98844-3322',
      instructions: 'Entregar na recepção comercial. Assinar protocolo.'
    },
    senderName: 'Loja Moda & Cia',
    recipientName: 'Juliana Paes',
    clientNotes: 'Carga frágil, favor não tombar as caixas.',
    expiresInSeconds: 25,
  },
  {
    id: 'ord-102',
    code: 'PRC-8922',
    createdAt: 'Há 2 min',
    vehicleType: 'moto',
    price: 26.50,
    distanceToPickupKm: 0.8,
    totalDistanceKm: 4.2,
    estimatedMinutes: 15,
    paymentMethod: 'app',
    cargoType: 'Documentos e Contratos Jurídicos',
    cargoWeightKg: 1,
    pickup: {
      address: 'Rua Funchal, 418 - Vila Olímpia',
      neighborhood: 'Vila Olímpia',
      city: 'São Paulo - SP',
      lat: -23.5935,
      lng: -46.6874,
      contactName: 'Advocacia Pinheiro',
      contactPhone: '(11) 99182-3400',
    },
    delivery: {
      address: 'Av. Brigadeiro Faria Lima, 3477 - Itaim Bibi',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo - SP',
      lat: -23.5852,
      lng: -46.6801,
      contactName: 'Cartório Silva',
      contactPhone: '(11) 99876-1122',
    },
    senderName: 'Advocacia Pinheiro',
    recipientName: 'Cartório Silva',
    clientNotes: 'Entregar envelope lacrado em mãos.',
    expiresInSeconds: 30,
  },
  {
    id: 'ord-103',
    code: 'PRC-8923',
    createdAt: 'Há 5 min',
    vehicleType: 'van',
    price: 94.00,
    distanceToPickupKm: 2.9,
    totalDistanceKm: 18.2,
    estimatedMinutes: 42,
    paymentMethod: 'app',
    cargoType: 'Peças Automotivas e Acessórios',
    cargoWeightKg: 120,
    pickup: {
      address: 'Av. do Estado, 5500 - Cambuci',
      neighborhood: 'Cambuci',
      city: 'São Paulo - SP',
      lat: -23.5700,
      lng: -46.6200,
      contactName: 'Distribuidora AutoMax',
      contactPhone: '(11) 98777-6655',
    },
    delivery: {
      address: 'Av. Giovanni Gronchi, 3800 - Morumbi',
      neighborhood: 'Morumbi',
      city: 'São Paulo - SP',
      lat: -23.6150,
      lng: -46.7280,
      contactName: 'Oficina do Alemão',
      contactPhone: '(11) 97654-3210',
    },
    senderName: 'Distribuidora AutoMax',
    recipientName: 'Oficina do Alemão',
    clientNotes: 'Ajudante no local para descarregar.',
    expiresInSeconds: 40,
  }
];

export const initialTransactions: WalletTransaction[] = [
  {
    id: 'tx-1',
    type: 'trip_earning',
    title: 'Corrida Concluída',
    subtitle: 'Pedido PRC-8914 • Bela Vista > Pinheiros',
    amount: 52.40,
    date: 'Hoje',
    time: '13:45',
    orderCode: 'PRC-8914',
  },
  {
    id: 'tx-2',
    type: 'trip_earning',
    title: 'Corrida Concluída',
    subtitle: 'Pedido PRC-8910 • Moema > Vila Mariana',
    amount: 38.80,
    date: 'Hoje',
    time: '11:20',
    orderCode: 'PRC-8910',
  },
  {
    id: 'tx-3',
    type: 'bonus',
    title: 'Bônus de Incentivo Hora de Pico',
    subtitle: 'Campanha 5 corridas completadas',
    amount: 35.00,
    date: 'Hoje',
    time: '09:00',
  },
  {
    id: 'tx-4',
    type: 'trip_earning',
    title: 'Corrida Concluída',
    subtitle: 'Pedido PRC-8890 • Tatuapé > Santana',
    amount: 60.00,
    date: 'Hoje',
    time: '08:15',
    orderCode: 'PRC-8890',
  },
  {
    id: 'tx-5',
    type: 'withdrawal',
    title: 'Transferência Pix Realizada',
    subtitle: 'Para conta Nubank (carlos.silva...)',
    amount: -450.00,
    date: 'Ontem',
    time: '19:30',
  }
];

export function generateRandomOrder(forcedVehicle?: VehicleType): Order {
  const codes = Math.floor(1000 + Math.random() * 9000);
  const vehicles: VehicleType[] = ['moto', 'carro', 'fiorino', 'van', 'carreto'];
  const vType = forcedVehicle || vehicles[Math.floor(Math.random() * vehicles.length)];

  const samplePickups = [
    { address: 'Av. Engenheiro Luís Carlos Berrini, 1200', n: 'Brooklin', lat: -23.606, lng: -46.696, sender: 'Tech Supplies' },
    { address: 'Rua Oscar Freire, 915', n: 'Cerqueira César', lat: -23.563, lng: -46.671, sender: 'Boutique Prime' },
    { address: 'Av. Ibirapuera, 3103', n: 'Moema', lat: -23.608, lng: -46.666, sender: 'Shopping Ibirapuera' },
    { address: 'Rua Teodoro Sampaio, 1850', n: 'Pinheiros', lat: -23.560, lng: -46.684, sender: 'Livraria Central' },
    { address: 'Rua da Mooca, 2100', n: 'Mooca', lat: -23.555, lng: -46.602, sender: 'Distribuidora São Paulo' },
  ];

  const sampleDeliveries = [
    { address: 'Av. das Nações Unidas, 14261', n: 'Vila Gertrudes', lat: -23.626, lng: -46.702, recipient: 'Escritório Alfa' },
    { address: 'Rua Pamplona, 145', n: 'Jardim Paulista', lat: -23.566, lng: -46.654, recipient: 'Edifício Horizon' },
    { address: 'Av. Rebouças, 3970', n: 'Pinheiros', lat: -23.571, lng: -46.695, recipient: 'Dra. Vanessa Mendes' },
    { address: 'Rua Domingos de Morais, 2564', n: 'Vila Mariana', lat: -23.598, lng: -46.637, recipient: 'Condomínio Solar' },
    { address: 'Av. Cruzeiro do Sul, 1100', n: 'Canindé', lat: -23.522, lng: -46.626, recipient: 'Depósito Norte' },
  ];

  const pick = samplePickups[Math.floor(Math.random() * samplePickups.length)];
  const deliv = sampleDeliveries[Math.floor(Math.random() * sampleDeliveries.length)];

  let basePrice = 22;
  let cargoType = 'Volumes e Pacotes';
  let weight = 8;

  if (vType === 'moto') {
    basePrice = 18 + Math.floor(Math.random() * 15);
    cargoType = 'Documentos / Pequenas Encomendas';
    weight = 3;
  } else if (vType === 'carro') {
    basePrice = 28 + Math.floor(Math.random() * 25);
    cargoType = 'Caixas e Sacolas Médias';
    weight = 18;
  } else if (vType === 'fiorino') {
    basePrice = 45 + Math.floor(Math.random() * 40);
    cargoType = 'Carga Fracionada e E-commerce';
    weight = 65;
  } else if (vType === 'van') {
    basePrice = 85 + Math.floor(Math.random() * 60);
    cargoType = 'Mercadorias Volumosas';
    weight = 180;
  } else {
    basePrice = 120 + Math.floor(Math.random() * 90);
    cargoType = 'Móveis e Carga Pesada';
    weight = 350;
  }

  const distToPick = Number((0.5 + Math.random() * 2.5).toFixed(1));
  const totDist = Number((3.5 + Math.random() * 16.0).toFixed(1));

  return {
    id: `ord-${Date.now()}`,
    code: `PRC-${codes}`,
    createdAt: 'Agora mesmo',
    vehicleType: vType,
    price: Number(basePrice.toFixed(2)),
    distanceToPickupKm: distToPick,
    totalDistanceKm: totDist,
    estimatedMinutes: Math.round(totDist * 2.2) + 5,
    paymentMethod: 'app',
    cargoType,
    cargoWeightKg: weight,
    pickup: {
      address: pick.address,
      neighborhood: pick.n,
      city: 'São Paulo - SP',
      lat: pick.lat,
      lng: pick.lng,
      contactName: pick.sender,
      contactPhone: '(11) 9988-7766',
      instructions: 'Apresentar documento na portaria.'
    },
    delivery: {
      address: deliv.address,
      neighborhood: deliv.n,
      city: 'São Paulo - SP',
      lat: deliv.lat,
      lng: deliv.lng,
      contactName: deliv.recipient,
      contactPhone: '(11) 9123-4567',
      instructions: 'Entregar direto ao destinatário.'
    },
    senderName: pick.sender,
    recipientName: deliv.recipient,
    clientNotes: 'Confirmar nome de quem receber no destino.',
    expiresInSeconds: 25,
  };
}
