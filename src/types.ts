export type VehicleType = 'moto' | 'carro' | 'fiorino' | 'van' | 'carreto' | 'caminhao';

export type UserMode = 'client' | 'driver';

export interface LocationPoint {
  address: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  contactName?: string;
  contactPhone?: string;
  instructions?: string;
}

export type OrderStatus = 
  | 'available'       // Waiting for driver to accept
  | 'to_pickup'       // Driver going to pickup point
  | 'at_pickup'       // Driver arrived at pickup
  | 'in_transit'      // Cargo picked up, driver heading to delivery
  | 'at_delivery'     // Driver arrived at destination
  | 'completed'       // Cargo delivered, finished
  | 'cancelled';

export interface Order {
  id: string;
  code: string;
  createdAt: string;
  vehicleType: VehicleType;
  price: number;
  distanceToPickupKm: number;
  totalDistanceKm: number;
  estimatedMinutes: number;
  paymentMethod: 'app' | 'dinheiro' | 'pix_direto';
  cargoType: string;
  cargoWeightKg?: number;
  status?: OrderStatus;
  pickup: LocationPoint;
  delivery: LocationPoint;
  senderName: string;
  recipientName: string;
  clientNotes?: string;
  expiresInSeconds?: number;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPlate?: string;
  driverModel?: string;
  driverAvatar?: string;
  driverRating?: number;
}

export interface DriverProfile {
  name: string;
  avatar: string;
  rating: number;
  totalTrips: number;
  acceptanceRate: number;
  vehicleType: VehicleType;
  vehiclePlate: string;
  vehicleModel: string;
  phone: string;
  pixKey: string;
  isOnline: boolean;
  walletBalance: number;
  todayEarnings: number;
  weekEarnings: number;
}

export interface WalletTransaction {
  id: string;
  type: 'trip_earning' | 'withdrawal' | 'bonus';
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  time: string;
  orderCode?: string;
}
