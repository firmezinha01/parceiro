import { DropoffPoint, CourierProfile, Order, PricingConfig, ClientProfile } from '../types';

// Em ambiente de Produção: todas as coleções iniciam limpas para receber dados autênticos
export const MOCK_CLIENTS: ClientProfile[] = [];
export const MOCK_DROPOFF_POINTS: DropoffPoint[] = [];
export const MOCK_COURIERS: CourierProfile[] = [];

export const MOCK_COURIER: CourierProfile = {
  id: 'courier_unregistered',
  name: 'Nenhum Entregador Credenciado',
  document: '',
  cnh: '',
  phone: '',
  modal: 'moto',
  vehiclePlate: '---',
  vehicleModel: '---',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  rating: 5.0,
  totalDeliveries: 0,
  balanceAvailable: 0,
  balancePending: 0,
  pixKey: '',
  isOnline: true,
  verificationStatus: 'pending',
};

export const getInitialOrders = (_config?: PricingConfig): Order[] => [];
