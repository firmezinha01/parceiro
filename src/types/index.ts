// Tipos do Sistema de Retirada e Entrega (Modelo Correios via Parceiros)

export type UserRole = 'client' | 'courier' | 'merchant' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
  createdAt: string;
}

export type VehicleModal = 'moto' | 'car';

export type PickupMethod = 'doorstep' | 'dropoff_point';

export type VerificationStatus = 'verified' | 'pending' | 'rejected';

export type DeliveryStatus =
  | 'created'          // Etiqueta gerada, aguardando coleta
  | 'at_dropoff'       // Deixado no ponto de coleta pelo cliente
  | 'collected'        // Coletado pelo entregador (Baixa 1)
  | 'in_transit'       // Em trânsito para o destino final
  | 'delivered'        // Entregue ao destinatário com assinatura/foto (Baixa Final)
  | 'cancelled';

export type PaymentMethod = 'pix' | 'credit_card' | 'cash_on_delivery';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
  lat: number;
  lng: number;
}

export interface ClientProfile {
  id: string;
  name: string;
  document: string; // CPF
  email: string;
  phone: string;
  birthDate?: string;
  defaultAddress: Address;
  documentPhoto?: string; // RG / CNH
  selfiePhoto?: string;   // Selfie de biometria
  contentDeclarationAccepted: boolean;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface DropoffPoint {
  id: string;
  name: string;              // Nome Fantasia
  businessName?: string;      // Razão Social
  cnpj?: string;              // CNPJ ou MEI
  category?: string;          // Papelaria, Conveniência, Farmácia, Mercado, etc.
  ownerName: string;          // Responsável
  ownerDocument?: string;     // CPF do Responsável
  address: Address;
  phone: string;
  openingHours: string;
  packageCount: number;
  totalEarnings: number;
  pixKey?: string;
  documentPhoto?: string;     // Documento do Titular
  facadePhoto?: string;       // Foto da Fachada/Balcão da loja
  addressProofPhoto?: string; // Comprovante de endereço comercial
  verificationStatus: VerificationStatus;
  custodyTermAccepted?: boolean;
}

export interface CourierProfile {
  id: string;
  name: string;
  document: string; // CPF
  cnh: string;
  modal: VehicleModal;
  vehiclePlate: string;
  vehicleModel?: string;
  phone: string;
  avatarUrl: string;
  rating: number;
  totalDeliveries: number;
  balanceAvailable: number;
  balancePending: number;
  pixKey: string;
  isOnline: boolean;
  documentPhoto?: string; // Foto CNH
  selfiePhoto?: string;   // Selfie com CNH
  verificationStatus: VerificationStatus;
}

export interface PricingConfig {
  // Parâmetros de Tarifa Moto
  motoBaseRate: number;      // ex: R$ 6.00
  motoPerKmRate: number;     // ex: R$ 1.20
  motoPerMinRate: number;    // ex: R$ 0.20
  
  // Parâmetros de Tarifa Carro
  carBaseRate: number;       // ex: R$ 12.00
  carPerKmRate: number;      // ex: R$ 2.20
  carPerMinRate: number;     // ex: R$ 0.40

  // Repasse por Componente (% repassado ao entregador)
  courierBaseSharePct: number; // ex: 65% (0.65)
  courierKmSharePct: number;   // ex: 85% (0.85)
  courierTimeSharePct: number; // ex: 75% (0.75)

  // Adicionais & Taxas
  urgencyMultiplier: number;   // ex: 1.25 (+25%)
  insuranceFee: number;        // ex: R$ 7.00
  merchantFixedFee: number;    // ex: R$ 3.50 por pacote
}

export interface PriceBreakdown {
  modal: VehicleModal;
  distanceKm: number;
  durationMin: number;
  
  // Componentes brutos cobrados do cliente
  baseRateCharge: number;
  kmRateCharge: number;
  timeRateCharge: number;
  subtotal: number;
  urgencyCharge: number;
  insuranceCharge: number;
  dropoffDiscount: number;
  totalCustomerCharge: number;

  // Split de Repasse
  courierBasePayout: number;
  courierKmPayout: number;
  courierTimePayout: number;
  courierUrgencyBonus: number;
  totalCourierPayout: number;

  merchantPayout: number;
  platformRetention: number;
  effectiveCourierPct: number; // % efetivo sobre o valor da corrida
}

export interface ScanEvent {
  id: string;
  orderId: string;
  trackingCode: string;
  stepType: 'created' | 'dropoff_in' | 'pickup_courier' | 'dropoff_out' | 'final_delivery';
  description: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  operatorRole: 'client' | 'courier' | 'merchant' | 'admin';
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  recipientSignature?: string; // Data URL ou hash
  proofPhoto?: string;         // Data URL ou imagem
  auditHash: string;           // Hash criptográfico simulado para integridade
}

export interface Order {
  id: string;
  trackingCode: string; // Ex: BR847291039SP
  createdAt: string;
  status: DeliveryStatus;

  // Remetente & Destinatário
  sender: {
    name: string;
    phone: string;
    document: string; // CPF
    address: Address;
    isVerified?: boolean;
  };
  recipient: {
    name: string;
    phone: string;
    document?: string;
    address: Address;
  };

  // Carga & Modal
  modal: VehicleModal;
  packageDescription: string;
  weightKg: number;
  dimensions: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  pickupMethod: PickupMethod;
  dropoffPointId?: string;
  isUrgent: boolean;
  hasInsurance: boolean;
  declaredValue?: number;
  contentDeclarationAccepted?: boolean;

  // Financeiro
  price: PriceBreakdown;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  pixQrCodePayload?: string;

  // Responsáveis
  courierId?: string;
  courierName?: string;
  courierPhone?: string;

  // Trilha de Auditoria e Baixas
  scanHistory: ScanEvent[];
  finalDeliverySignature?: string;
  finalDeliveryPhoto?: string;
  deliveredAt?: string;
}
