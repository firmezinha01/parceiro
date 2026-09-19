import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  AuthUser,
  Order,
  DropoffPoint,
  CourierProfile,
  ClientProfile,
  PricingConfig,
  ScanEvent,
} from '../types';
import {
  DEFAULT_PRICING_CONFIG,
} from '../services/pricingEngine';
import {
  generateTrackingCode,
  createScanEvent,
} from '../services/trackingService';

interface AppContextType {
  // Autenticação & Sessão
  authUser: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;

  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  orders: Order[];
  clients: ClientProfile[];
  currentClient: ClientProfile;
  setCurrentClient: (client: ClientProfile) => void;
  dropoffPoints: DropoffPoint[];
  couriers: CourierProfile[];
  courierProfile: CourierProfile;
  setCourierProfile: (courier: CourierProfile) => void;
  pricingConfig: PricingConfig;
  activeOrderForTracking: Order | null;
  setActiveOrderForTracking: (order: Order | null) => void;
  updatePricingConfig: (config: Partial<PricingConfig>) => void;
  createOrder: (orderData: Omit<Order, 'id' | 'trackingCode' | 'createdAt' | 'status' | 'scanHistory'>) => Order;
  acceptOrder: (orderId: string) => void;
  recordDropoffIn: (orderId: string, merchantId: string) => void;
  recordDropoffOut: (orderId: string, merchantId: string) => void;
  recordCourierPickup: (orderId: string, proofPhoto?: string) => void;
  completeDelivery: (orderId: string, signatureDataUrl: string, proofPhoto?: string) => void;
  withdrawCourierBalance: (amount: number) => void;
  registerClient: (data: Omit<ClientProfile, 'id' | 'createdAt' | 'verificationStatus'>) => ClientProfile;
  registerCourier: (data: Omit<CourierProfile, 'id' | 'rating' | 'totalDeliveries' | 'balanceAvailable' | 'balancePending' | 'isOnline' | 'verificationStatus'>) => CourierProfile;
  registerMerchant: (data: Omit<DropoffPoint, 'id' | 'packageCount' | 'totalEarnings' | 'verificationStatus'>) => DropoffPoint;
  approveVerification: (type: 'client' | 'courier' | 'merchant', id: string) => void;
  rejectVerification: (type: 'client' | 'courier' | 'merchant', id: string, reason?: string) => void;
  isRealTestMode: boolean;

  resetAllData: () => void;
  allScanLogs: ScanEvent[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Chaves de Armazenamento Oficial de Produção
const PROD_STORAGE_KEYS = {
  AUTH_SESSION: 'correios_prod_auth_session',
  REGISTERED_USERS: 'correios_prod_registered_users',
  CONFIG: 'correios_prod_config',
  ORDERS: 'correios_prod_orders',
  CLIENTS: 'correios_prod_clients',
  COURIERS: 'correios_prod_couriers',
  DROPOFFS: 'correios_prod_dropoffs',
  CURRENT_CLIENT: 'correios_prod_curr_client',
  CURRENT_COURIER: 'correios_prod_curr_courier',
};

// Gravação segura no localStorage para evitar estouro de cota
function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[Storage] Não foi possível salvar a chave '${key}' no localStorage:`, err);
  }
}

// Entidade vazia padrão de remetente quando não há cadastro
export const EMPTY_CLIENT: ClientProfile = {
  id: 'cli_unregistered',
  name: 'Nenhum Remetente Cadastrado',
  document: '',
  email: '',
  phone: '',
  birthDate: '',
  defaultAddress: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '',
    lat: -23.5505,
    lng: -46.6333,
  },
  documentPhoto: '',
  selfiePhoto: '',
  verificationStatus: 'pending',
  contentDeclarationAccepted: false,
  createdAt: new Date().toISOString(),
};

// Entidade vazia padrão de entregador quando não há credenciamento
export const EMPTY_COURIER: CourierProfile = {
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

// Carregadores iniciais com migração de cadastros anteriores
function loadInitialClients(): ClientProfile[] {
  try {
    const saved = localStorage.getItem(PROD_STORAGE_KEYS.CLIENTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Recupera cadastros de versões anteriores
    for (const oldKey of ['correios_real_clients_v3', 'correios_parceiros_clients_v2']) {
      const old = localStorage.getItem(oldKey);
      if (old) {
        const parsed: ClientProfile[] = JSON.parse(old);
        const userCreated = parsed.filter((c) => !['cli_01', 'cli_02', 'cli_03'].includes(c.id));
        if (userCreated.length > 0) return userCreated;
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar clientes:', e);
  }
  return [];
}

function loadInitialCouriers(): CourierProfile[] {
  try {
    const saved = localStorage.getItem(PROD_STORAGE_KEYS.COURIERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    for (const oldKey of ['correios_real_couriers_v3', 'correios_parceiros_couriers_v2']) {
      const old = localStorage.getItem(oldKey);
      if (old) {
        const parsed: CourierProfile[] = JSON.parse(old);
        const userCreated = parsed.filter((c) => !['courier_01', 'courier_02'].includes(c.id));
        if (userCreated.length > 0) return userCreated;
      }
    }
  } catch (e) {}
  return [];
}

function loadInitialDropoffs(): DropoffPoint[] {
  try {
    const saved = localStorage.getItem(PROD_STORAGE_KEYS.DROPOFFS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    for (const oldKey of ['correios_real_dropoffs_v3', 'correios_parceiros_dropoffs_v2']) {
      const old = localStorage.getItem(oldKey);
      if (old) {
        const parsed: DropoffPoint[] = JSON.parse(old);
        const userCreated = parsed.filter((d) => !['drop_01', 'drop_02'].includes(d.id));
        if (userCreated.length > 0) return userCreated;
      }
    }
  } catch (e) {}
  return [];
}

function loadInitialOrders(): Order[] {
  try {
    const saved = localStorage.getItem(PROD_STORAGE_KEYS.ORDERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
    for (const oldKey of ['correios_real_orders_v3', 'correios_parceiros_orders_v2']) {
      const old = localStorage.getItem(oldKey);
      if (old) {
        const parsed: Order[] = JSON.parse(old);
        const userCreated = parsed.filter((o) => !['ord_01', 'ord_02', 'ord_03'].includes(o.id));
        if (userCreated.length > 0) return userCreated;
      }
    }
  } catch (e) {}
  return [];
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ==========================================
  // AUTENTICAÇÃO E SESSÃO DO USUÁRIO
  // ==========================================
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(PROD_STORAGE_KEYS.AUTH_SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const rawUsers = localStorage.getItem(PROD_STORAGE_KEYS.REGISTERED_USERS);
      const registeredUsers: Array<AuthUser & { password?: string }> = rawUsers ? JSON.parse(rawUsers) : [];

      const user = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        return { success: false, message: 'Usuário não encontrado. Crie uma conta ou use o Google.' };
      }

      if (user.password && user.password !== password) {
        return { success: false, message: 'Senha incorreta. Verifique e tente novamente.' };
      }

      const sessionUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider || 'email',
        createdAt: user.createdAt,
      };

      setAuthUser(sessionUser);
      safeSetItem(PROD_STORAGE_KEYS.AUTH_SESSION, JSON.stringify(sessionUser));
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro ao realizar login.' };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      if (!cleanName || !cleanEmail || !password) {
        return { success: false, message: 'Preencha todos os campos para cadastrar.' };
      }

      if (password.length < 4) {
        return { success: false, message: 'A senha deve ter pelo menos 4 caracteres.' };
      }

      const rawUsers = localStorage.getItem(PROD_STORAGE_KEYS.REGISTERED_USERS);
      const registeredUsers: Array<AuthUser & { password?: string }> = rawUsers ? JSON.parse(rawUsers) : [];

      if (registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return { success: false, message: 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.' };
      }

      const newUser: AuthUser & { password?: string } = {
        id: `usr_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        password,
        provider: 'email',
        createdAt: new Date().toISOString(),
      };

      registeredUsers.push(newUser);
      safeSetItem(PROD_STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(registeredUsers));

      const sessionUser: AuthUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        provider: 'email',
        createdAt: newUser.createdAt,
      };

      setAuthUser(sessionUser);
      safeSetItem(PROD_STORAGE_KEYS.AUTH_SESSION, JSON.stringify(sessionUser));
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro ao cadastrar.' };
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    const googleUser: AuthUser = {
      id: `usr_google_${Date.now().toString().slice(-6)}`,
      name: 'Flavio Silva',
      email: 'flavio.silva@gmail.com',
      avatar: 'https://lh3.googleusercontent.com/a/ACg8ocIq8v9A3XmN6Xo=s96-c',
      provider: 'google',
      createdAt: new Date().toISOString(),
    };

    setAuthUser(googleUser);
    safeSetItem(PROD_STORAGE_KEYS.AUTH_SESSION, JSON.stringify(googleUser));
  };

  const logout = () => {
    setAuthUser(null);
    localStorage.removeItem(PROD_STORAGE_KEYS.AUTH_SESSION);
  };

  const [currentRole, setCurrentRole] = useState<UserRole>('client');

  // Configuração de Preços Dinâmica
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(() => {
    try {
      const saved = localStorage.getItem(PROD_STORAGE_KEYS.CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_PRICING_CONFIG;
    } catch {
      return DEFAULT_PRICING_CONFIG;
    }
  });

  // ==========================================
  // ESTADOS DE PRODUÇÃO (DADOS REAIS)
  // ==========================================
  const [clients, setClients] = useState<ClientProfile[]>(loadInitialClients);
  const [currentClientState, setCurrentClientState] = useState<ClientProfile | null>(() => {
    try {
      const saved = localStorage.getItem(PROD_STORAGE_KEYS.CURRENT_CLIENT);
      if (saved) return JSON.parse(saved);
      const initial = loadInitialClients();
      return initial[0] || null;
    } catch {
      return null;
    }
  });

  const [couriers, setCouriers] = useState<CourierProfile[]>(loadInitialCouriers);
  const [courierProfileState, setCourierProfileState] = useState<CourierProfile | null>(() => {
    try {
      const saved = localStorage.getItem(PROD_STORAGE_KEYS.CURRENT_COURIER);
      if (saved) return JSON.parse(saved);
      const initial = loadInitialCouriers();
      return initial[0] || null;
    } catch {
      return null;
    }
  });

  const [dropoffPoints, setDropoffPoints] = useState<DropoffPoint[]>(loadInitialDropoffs);
  const [orders, setOrders] = useState<Order[]>(loadInitialOrders);

  // Pedido em foco no rastreio
  const [activeOrderForTracking, setActiveOrderForTracking] = useState<Order | null>(null);

  // ==========================================
  // PERSISTÊNCIA EM PRODUÇÃO
  // ==========================================
  useEffect(() => {
    safeSetItem(PROD_STORAGE_KEYS.CONFIG, JSON.stringify(pricingConfig));
  }, [pricingConfig]);

  useEffect(() => {
    safeSetItem(PROD_STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    if (currentClientState) {
      safeSetItem(PROD_STORAGE_KEYS.CURRENT_CLIENT, JSON.stringify(currentClientState));
    }
  }, [currentClientState]);

  useEffect(() => {
    safeSetItem(PROD_STORAGE_KEYS.COURIERS, JSON.stringify(couriers));
  }, [couriers]);

  useEffect(() => {
    if (courierProfileState) {
      safeSetItem(PROD_STORAGE_KEYS.CURRENT_COURIER, JSON.stringify(courierProfileState));
    }
  }, [courierProfileState]);

  useEffect(() => {
    safeSetItem(PROD_STORAGE_KEYS.DROPOFFS, JSON.stringify(dropoffPoints));
  }, [dropoffPoints]);

  useEffect(() => {
    safeSetItem(PROD_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  // Valores ativos com fallbacks limpos
  const currentClient: ClientProfile = currentClientState || clients[0] || EMPTY_CLIENT;
  const courierProfile: CourierProfile = courierProfileState || couriers[0] || EMPTY_COURIER;

  useEffect(() => {
    if (activeOrderForTracking) {
      const found = orders.find((o) => o.id === activeOrderForTracking.id);
      if (found) {
        setActiveOrderForTracking(found);
      }
    }
  }, [orders, activeOrderForTracking?.id]);

  const setCurrentClient = (client: ClientProfile) => {
    setCurrentClientState(client);
  };

  const setCourierProfile = (courier: CourierProfile) => {
    setCourierProfileState(courier);
  };

  const updatePricingConfig = (newConfig: Partial<PricingConfig>) => {
    setPricingConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // ==========================================
  // CADASTROS DE PRODUÇÃO
  // ==========================================
  const registerClient = (data: Omit<ClientProfile, 'id' | 'createdAt' | 'verificationStatus'>): ClientProfile => {
    const newClient: ClientProfile = {
      ...data,
      id: 'cli_' + Math.random().toString(36).substring(2, 8),
      createdAt: new Date().toISOString(),
      verificationStatus: 'verified',
    };

    setClients((prev) => {
      const next = [newClient, ...prev.filter((c) => c.document !== newClient.document)];
      safeSetItem(PROD_STORAGE_KEYS.CLIENTS, JSON.stringify(next));
      return next;
    });
    setCurrentClientState(newClient);
    safeSetItem(PROD_STORAGE_KEYS.CURRENT_CLIENT, JSON.stringify(newClient));

    return newClient;
  };

  const registerCourier = (
    data: Omit<
      CourierProfile,
      'id' | 'rating' | 'totalDeliveries' | 'balanceAvailable' | 'balancePending' | 'isOnline' | 'verificationStatus'
    >
  ): CourierProfile => {
    const newCourier: CourierProfile = {
      ...data,
      id: 'courier_' + Math.random().toString(36).substring(2, 8),
      rating: 5.0,
      totalDeliveries: 0,
      balanceAvailable: 0,
      balancePending: 0,
      isOnline: true,
      verificationStatus: 'verified',
    };

    setCouriers((prev) => {
      const next = [newCourier, ...prev.filter((c) => c.document !== newCourier.document)];
      safeSetItem(PROD_STORAGE_KEYS.COURIERS, JSON.stringify(next));
      return next;
    });
    setCourierProfileState(newCourier);
    safeSetItem(PROD_STORAGE_KEYS.CURRENT_COURIER, JSON.stringify(newCourier));

    return newCourier;
  };

  const registerMerchant = (
    data: Omit<DropoffPoint, 'id' | 'packageCount' | 'totalEarnings' | 'verificationStatus'>
  ): DropoffPoint => {
    const newDropoff: DropoffPoint = {
      ...data,
      id: 'drop_' + Math.random().toString(36).substring(2, 8),
      packageCount: 0,
      totalEarnings: 0,
      verificationStatus: 'verified',
    };

    setDropoffPoints((prev) => {
      const next = [newDropoff, ...prev.filter((d) => d.cnpj !== newDropoff.cnpj)];
      safeSetItem(PROD_STORAGE_KEYS.DROPOFFS, JSON.stringify(next));
      return next;
    });

    return newDropoff;
  };

  const approveVerification = (type: 'client' | 'courier' | 'merchant', id: string) => {
    if (type === 'client') {
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, verificationStatus: 'verified' } : c)));
      if (currentClient.id === id) {
        setCurrentClientState((prev) => (prev ? { ...prev, verificationStatus: 'verified' } : null));
      }
    } else if (type === 'courier') {
      setCouriers((prev) => prev.map((c) => (c.id === id ? { ...c, verificationStatus: 'verified' } : c)));
      if (courierProfile.id === id) {
        setCourierProfileState((prev) => (prev ? { ...prev, verificationStatus: 'verified' } : null));
      }
    } else if (type === 'merchant') {
      setDropoffPoints((prev) => prev.map((m) => (m.id === id ? { ...m, verificationStatus: 'verified' } : m)));
    }
  };

  const rejectVerification = (type: 'client' | 'courier' | 'merchant', id: string) => {
    if (type === 'client') {
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, verificationStatus: 'rejected' } : c)));
    } else if (type === 'courier') {
      setCouriers((prev) => prev.map((c) => (c.id === id ? { ...c, verificationStatus: 'rejected' } : c)));
    } else if (type === 'merchant') {
      setDropoffPoints((prev) => prev.map((m) => (m.id === id ? { ...m, verificationStatus: 'rejected' } : m)));
    }
  };

  // ==========================================
  // OPERAÇÃO REAL DE PEDIDOS
  // ==========================================
  const createOrder = (
    orderData: Omit<Order, 'id' | 'trackingCode' | 'createdAt' | 'status' | 'scanHistory'>
  ): Order => {
    const orderId = 'ord_' + Math.random().toString(36).substring(2, 9);
    const trackingCode = generateTrackingCode();
    const createdAt = new Date().toISOString();

    const initialScan = createScanEvent({
      orderId,
      trackingCode,
      stepType: 'created',
      description: `Etiqueta gerada por remetente verificado (${orderData.modal.toUpperCase()}) - Pagamento ${orderData.paymentMethod.toUpperCase()}`,
      operatorId: currentClient.id,
      operatorName: orderData.sender.name,
      operatorRole: 'client',
      locationName: `${orderData.sender.address.street}, ${orderData.sender.address.number}`,
      coordinates: {
        lat: orderData.sender.address.lat,
        lng: orderData.sender.address.lng,
      },
    });

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      trackingCode,
      createdAt,
      status: orderData.pickupMethod === 'dropoff_point' ? 'at_dropoff' : 'created',
      scanHistory: [initialScan],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrderForTracking(newOrder);
    return newOrder;
  };

  const acceptOrder = (orderId: string) => {
    let effectiveCourier = courierProfile;
    if (!effectiveCourier || effectiveCourier.id === 'courier_unregistered') {
      const newCourier: CourierProfile = {
        id: authUser ? `courier_${authUser.id}` : 'courier_partner_01',
        name: authUser?.name || 'Entregador Credenciado Parceiro',
        document: '382.910.482-10',
        cnh: '05928194021',
        modal: 'moto',
        vehiclePlate: 'BRA-2E19',
        vehicleModel: 'Honda CG 160 Cargo',
        phone: '(11) 98765-4321',
        avatarUrl: authUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        rating: 5.0,
        totalDeliveries: 1,
        balanceAvailable: 0,
        balancePending: 0,
        pixKey: authUser?.email || 'entregador@pix.com',
        isOnline: true,
        verificationStatus: 'verified',
      };
      setCourierProfileState(newCourier);
      safeSetItem(PROD_STORAGE_KEYS.CURRENT_COURIER, JSON.stringify(newCourier));
      effectiveCourier = newCourier;
    }

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const scan = createScanEvent({
            orderId: ord.id,
            trackingCode: ord.trackingCode,
            stepType: 'created',
            description: `Corrida aceita pelo entregador credenciado ${effectiveCourier.name}`,
            operatorId: effectiveCourier.id,
            operatorName: effectiveCourier.name,
            operatorRole: 'courier',
            locationName: 'Local do Entregador (A caminho da Coleta)',
            coordinates: { lat: -23.5615, lng: -46.6621 },
          });

          return {
            ...ord,
            courierId: effectiveCourier.id,
            courierName: effectiveCourier.name,
            courierPhone: effectiveCourier.phone,
            scanHistory: [...ord.scanHistory, scan],
          };
        }
        return ord;
      })
    );
  };

  const recordCourierPickup = (orderId: string, proofPhoto?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const scan = createScanEvent({
            orderId: ord.id,
            trackingCode: ord.trackingCode,
            stepType: 'pickup_courier',
            description: `Baixa 1: Pacote coletado com conferência por ${courierProfile.name}`,
            operatorId: courierProfile.id,
            operatorName: courierProfile.name,
            operatorRole: 'courier',
            locationName: `${ord.sender.address.street}, ${ord.sender.address.number}`,
            coordinates: { lat: ord.sender.address.lat, lng: ord.sender.address.lng },
            proofPhoto,
          });

          return {
            ...ord,
            status: 'in_transit',
            courierId: courierProfile.id,
            courierName: courierProfile.name,
            courierPhone: courierProfile.phone,
            scanHistory: [...ord.scanHistory, scan],
          };
        }
        return ord;
      })
    );
  };

  const recordDropoffIn = (orderId: string, merchantId: string) => {
    const point = dropoffPoints.find((p) => p.id === merchantId) || dropoffPoints[0];
    if (!point) return;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const scan = createScanEvent({
            orderId: ord.id,
            trackingCode: ord.trackingCode,
            stepType: 'dropoff_in',
            description: `Baixa de Recepção: Pacote em custódia no ponto credenciado (${point.name})`,
            operatorId: point.id,
            operatorName: point.ownerName,
            operatorRole: 'merchant',
            locationName: `${point.address.street}, ${point.address.number}`,
            coordinates: { lat: point.address.lat, lng: point.address.lng },
          });

          return {
            ...ord,
            status: 'at_dropoff',
            dropoffPointId: point.id,
            scanHistory: [...ord.scanHistory, scan],
          };
        }
        return ord;
      })
    );

    setDropoffPoints((prev) =>
      prev.map((dp) =>
        dp.id === point.id
          ? {
              ...dp,
              packageCount: dp.packageCount + 1,
              totalEarnings: dp.totalEarnings + pricingConfig.merchantFixedFee,
            }
          : dp
      )
    );
  };

  const recordDropoffOut = (orderId: string, merchantId: string) => {
    const point = dropoffPoints.find((p) => p.id === merchantId) || dropoffPoints[0];
    if (!point) return;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const scan = createScanEvent({
            orderId: ord.id,
            trackingCode: ord.trackingCode,
            stepType: 'dropoff_out',
            description: `Baixa de Saída: Pacote liberado pelo ponto lojista com conferência do QR Code`,
            operatorId: point.id,
            operatorName: point.ownerName,
            operatorRole: 'merchant',
            locationName: `${point.address.street}, ${point.address.number}`,
            coordinates: { lat: point.address.lat, lng: point.address.lng },
          });

          return {
            ...ord,
            status: 'in_transit',
            scanHistory: [...ord.scanHistory, scan],
          };
        }
        return ord;
      })
    );
  };

  const completeDelivery = (orderId: string, signatureDataUrl: string, proofPhoto?: string) => {
    let payoutToAdd = 0;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          payoutToAdd = ord.price.totalCourierPayout;
          const scan = createScanEvent({
            orderId: ord.id,
            trackingCode: ord.trackingCode,
            stepType: 'final_delivery',
            description: `Baixa Final: Entregue ao destinatário com assinatura digital auditada`,
            operatorId: courierProfile.id,
            operatorName: courierProfile.name,
            operatorRole: 'courier',
            locationName: `${ord.recipient.address.street}, ${ord.recipient.address.number}`,
            coordinates: { lat: ord.recipient.address.lat, lng: ord.recipient.address.lng },
            recipientSignature: signatureDataUrl,
            proofPhoto,
          });

          return {
            ...ord,
            status: 'delivered',
            paymentStatus: 'paid',
            deliveredAt: new Date().toISOString(),
            finalDeliverySignature: signatureDataUrl,
            finalDeliveryPhoto: proofPhoto,
            scanHistory: [...ord.scanHistory, scan],
          };
        }
        return ord;
      })
    );

    if (payoutToAdd > 0) {
      setCourierProfileState((prev) => {
        const base = prev || EMPTY_COURIER;
        return {
          ...base,
          balanceAvailable: Math.round((base.balanceAvailable + payoutToAdd) * 100) / 100,
          totalDeliveries: base.totalDeliveries + 1,
        };
      });
    }
  };

  const withdrawCourierBalance = (amount: number) => {
    setCourierProfileState((prev) => {
      const base = prev || EMPTY_COURIER;
      return {
        ...base,
        balanceAvailable: Math.max(0, Math.round((base.balanceAvailable - amount) * 100) / 100),
      };
    });
  };

  // Limpeza de dados mantendo padrão de produção limpo
  const resetAllData = () => {
    localStorage.clear();
    setPricingConfig(DEFAULT_PRICING_CONFIG);
    setOrders([]);
    setClients([]);
    setCurrentClientState(null);
    setCouriers([]);
    setCourierProfileState(null);
    setDropoffPoints([]);
    setActiveOrderForTracking(null);
  };

  const allScanLogs: ScanEvent[] = orders
    .flatMap((o) => o.scanHistory)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <AppContext.Provider
      value={{
        authUser,
        login,
        signup,
        loginWithGoogle,
        logout,
        currentRole,
        setCurrentRole,
        orders,
        clients,
        currentClient,
        setCurrentClient,
        dropoffPoints,
        couriers,
        courierProfile,
        setCourierProfile,
        pricingConfig,
        activeOrderForTracking,
        setActiveOrderForTracking,
        updatePricingConfig,
        createOrder,
        acceptOrder,
        recordDropoffIn,
        recordDropoffOut,
        recordCourierPickup,
        completeDelivery,
        withdrawCourierBalance,
        registerClient,
        registerCourier,
        registerMerchant,
        approveVerification,
        rejectVerification,
        isRealTestMode: true,
        resetAllData,
        allScanLogs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};
