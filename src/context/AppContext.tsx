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

export interface AppContextType {
  // Autenticação Principal (Cliente / Admin / Merchant)
  authUser: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;

  // Autenticação & Sessão Exclusiva do Aplicativo do Entregador
  courierSession: CourierProfile | null;
  loginCourier: (credential: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logoutCourier: () => void;
  selectCourierSession: (courierId: string) => void;
  toggleCourierOnline: (courierId: string, isOnline?: boolean) => void;
  blockCourier: (courierId: string) => void;
  unblockCourier: (courierId: string) => void;
  deleteCourier: (courierId: string) => void;

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
  acceptOrder: (orderId: string, customCourier?: CourierProfile) => void;
  recordDropoffIn: (orderId: string, merchantId: string) => void;
  recordDropoffOut: (orderId: string, merchantId: string) => void;
  recordCourierPickup: (orderId: string, proofPhoto?: string) => void;
  completeDelivery: (orderId: string, signatureDataUrl: string, proofPhoto?: string) => void;
  withdrawCourierBalance: (amount: number, courierId?: string) => void;
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
  COURIER_AUTH_SESSION: 'correios_prod_courier_session',
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

export const DEFAULT_DEMO_COURIERS: CourierProfile[] = [
  {
    id: 'courier_moto_01',
    name: 'Marcos Silva',
    document: '382.910.482-10',
    email: 'marcos.moto@entregas.com',
    password: '1234',
    cnh: '05928194021',
    modal: 'moto',
    vehiclePlate: 'BRA-2E19',
    vehicleModel: 'Honda CG 160 Cargo',
    phone: '(11) 98765-4321',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    rating: 4.9,
    totalDeliveries: 32,
    balanceAvailable: 145.5,
    balancePending: 0,
    pixKey: 'marcos.moto@entregas.com',
    isOnline: true,
    isBlocked: false,
    registeredAt: '2026-03-01T10:00:00.000Z',
    verificationStatus: 'verified',
  },
  {
    id: 'courier_carro_02',
    name: 'Carlos Souza',
    document: '291.849.192-34',
    email: 'carlos.utilitarios@entregas.com',
    password: '1234',
    cnh: '04829103948',
    modal: 'car',
    vehiclePlate: 'CAR-4F90',
    vehicleModel: 'Fiat Fiorino 1.4 EVO',
    phone: '(11) 97654-3210',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 5.0,
    totalDeliveries: 19,
    balanceAvailable: 210.0,
    balancePending: 0,
    pixKey: '291.849.192-34',
    isOnline: true,
    isBlocked: false,
    registeredAt: '2026-03-05T14:30:00.000Z',
    verificationStatus: 'verified',
  },
];

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
  return DEFAULT_DEMO_COURIERS;
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
  const [courierSession, setCourierSession] = useState<CourierProfile | null>(() => {
    try {
      const saved = localStorage.getItem(PROD_STORAGE_KEYS.COURIER_AUTH_SESSION);
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  const [courierProfileState, setCourierProfileState] = useState<CourierProfile | null>(() => {
    try {
      const saved = localStorage.getItem(PROD_STORAGE_KEYS.CURRENT_COURIER);
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  const [dropoffPoints, setDropoffPoints] = useState<DropoffPoint[]>(loadInitialDropoffs);
  const [orders, setOrders] = useState<Order[]>(loadInitialOrders);

  // Sincronização em tempo real entre abas do navegador (Cliente e Entregador)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PROD_STORAGE_KEYS.ORDERS && e.newValue) {
        try {
          const updatedOrders = JSON.parse(e.newValue);
          if (Array.isArray(updatedOrders)) {
            setOrders(updatedOrders);
          }
        } catch (err) {
          console.warn('Erro ao sincronizar pedidos via storage event:', err);
        }
      }
      if (e.key === PROD_STORAGE_KEYS.COURIERS && e.newValue) {
        try {
          const updatedCouriers = JSON.parse(e.newValue);
          if (Array.isArray(updatedCouriers)) {
            setCouriers(updatedCouriers);
          }
        } catch (err) {
          console.warn('Erro ao sincronizar entregadores via storage event:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
    if (courierSession) {
      safeSetItem(PROD_STORAGE_KEYS.COURIER_AUTH_SESSION, JSON.stringify(courierSession));
    } else {
      localStorage.removeItem(PROD_STORAGE_KEYS.COURIER_AUTH_SESSION);
    }
  }, [courierSession]);

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
  const courierProfile: CourierProfile = courierSession || courierProfileState || couriers[0] || EMPTY_COURIER;

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
    setCourierSession(courier);
  };

  const loginCourier = async (credential: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const clean = credential.trim().toLowerCase().replace(/[.\-\/\s]/g, '');
    const found = couriers.find((c) => {
      const cDoc = c.document.replace(/[.\-\/\s]/g, '');
      const cEmail = (c.email || '').toLowerCase().trim();
      const cPhone = c.phone.replace(/[.\-\/\s()]/g, '');
      return cDoc === clean || cEmail === credential.trim().toLowerCase() || cPhone === clean;
    });

    if (!found) {
      return { success: false, message: 'Entregador não encontrado. Verifique seu CPF ou E-mail, ou cadastre-se como parceiro.' };
    }

    if (found.isBlocked) {
      return { success: false, message: 'Seu cadastro de parceiro está suspenso temporariamente pela administração.' };
    }

    if (found.password && password && found.password !== password) {
      return { success: false, message: 'Senha incorreta. Verifique e tente novamente.' };
    }

    setCourierSession(found);
    setCourierProfileState(found);
    safeSetItem(PROD_STORAGE_KEYS.COURIER_AUTH_SESSION, JSON.stringify(found));
    return { success: true };
  };

  const logoutCourier = () => {
    setCourierSession(null);
    localStorage.removeItem(PROD_STORAGE_KEYS.COURIER_AUTH_SESSION);
  };

  const selectCourierSession = (courierId: string) => {
    const found = couriers.find((c) => c.id === courierId);
    if (found) {
      setCourierSession(found);
      setCourierProfileState(found);
      safeSetItem(PROD_STORAGE_KEYS.COURIER_AUTH_SESSION, JSON.stringify(found));
    }
  };

  const toggleCourierOnline = (courierId: string, isOnline?: boolean) => {
    setCouriers((prev) =>
      prev.map((c) => {
        if (c.id === courierId) {
          const nextState = isOnline !== undefined ? isOnline : !c.isOnline;
          return { ...c, isOnline: nextState };
        }
        return c;
      })
    );
    if (courierSession?.id === courierId) {
      setCourierSession((prev) => (prev ? { ...prev, isOnline: isOnline !== undefined ? isOnline : !prev.isOnline } : null));
    }
  };

  const blockCourier = (courierId: string) => {
    setCouriers((prev) =>
      prev.map((c) => (c.id === courierId ? { ...c, isBlocked: true, isOnline: false } : c))
    );
    if (courierSession?.id === courierId) {
      setCourierSession((prev) => (prev ? { ...prev, isBlocked: true, isOnline: false } : null));
    }
  };

  const unblockCourier = (courierId: string) => {
    setCouriers((prev) =>
      prev.map((c) => (c.id === courierId ? { ...c, isBlocked: false } : c))
    );
    if (courierSession?.id === courierId) {
      setCourierSession((prev) => (prev ? { ...prev, isBlocked: false } : null));
    }
  };

  const deleteCourier = (courierId: string) => {
    setCouriers((prev) => prev.filter((c) => c.id !== courierId));
    if (courierSession?.id === courierId) {
      setCourierSession(null);
      localStorage.removeItem(PROD_STORAGE_KEYS.COURIER_AUTH_SESSION);
    }
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
      isBlocked: false,
      registeredAt: new Date().toISOString(),
      verificationStatus: 'verified',
    };

    setCouriers((prev) => {
      const next = [newCourier, ...prev.filter((c) => c.document !== newCourier.document)];
      safeSetItem(PROD_STORAGE_KEYS.COURIERS, JSON.stringify(next));
      return next;
    });
    setCourierSession(newCourier);
    setCourierProfileState(newCourier);
    safeSetItem(PROD_STORAGE_KEYS.COURIER_AUTH_SESSION, JSON.stringify(newCourier));

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

  const acceptOrder = (orderId: string, customCourier?: CourierProfile) => {
    let effectiveCourier = customCourier || courierSession || courierProfile;
    if (!effectiveCourier || effectiveCourier.id === 'courier_unregistered') {
      const fallbackCourier = couriers[0] || DEFAULT_DEMO_COURIERS[0];
      effectiveCourier = fallbackCourier;
      setCourierSession(fallbackCourier);
      setCourierProfileState(fallbackCourier);
    }

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const scan = createScanEvent({
            orderId: ord.id,
            trackingCode: ord.trackingCode,
            stepType: 'created',
            description: `Corrida aceita pelo entregador credenciado ${effectiveCourier.name} (${effectiveCourier.modal.toUpperCase()})`,
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
          const assignedCourier = couriers.find((c) => c.id === ord.courierId) || courierSession || courierProfile;
          const scan = createScanEvent({
            orderId: ord.id,
            trackingCode: ord.trackingCode,
            stepType: 'pickup_courier',
            description: `Baixa 1: Pacote coletado com conferência por ${assignedCourier.name}`,
            operatorId: assignedCourier.id,
            operatorName: assignedCourier.name,
            operatorRole: 'courier',
            locationName: `${ord.sender.address.street}, ${ord.sender.address.number}`,
            coordinates: { lat: ord.sender.address.lat, lng: ord.sender.address.lng },
            proofPhoto,
          });

          return {
            ...ord,
            status: 'in_transit',
            courierId: assignedCourier.id,
            courierName: assignedCourier.name,
            courierPhone: assignedCourier.phone,
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
    let targetCourierId = '';

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          payoutToAdd = ord.price.totalCourierPayout;
          const assignedCourier = couriers.find((c) => c.id === ord.courierId) || courierSession || courierProfile;
          targetCourierId = assignedCourier.id;

          const scan = createScanEvent({
            orderId: ord.id,
            trackingCode: ord.trackingCode,
            stepType: 'final_delivery',
            description: `Baixa Final: Entregue ao destinatário com assinatura digital auditada`,
            operatorId: assignedCourier.id,
            operatorName: assignedCourier.name,
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

    if (payoutToAdd > 0 && targetCourierId) {
      setCouriers((prev) => {
        const next = prev.map((c) => {
          if (c.id === targetCourierId) {
            return {
              ...c,
              balanceAvailable: Math.round((c.balanceAvailable + payoutToAdd) * 100) / 100,
              totalDeliveries: c.totalDeliveries + 1,
            };
          }
          return c;
        });
        safeSetItem(PROD_STORAGE_KEYS.COURIERS, JSON.stringify(next));
        return next;
      });

      if (courierSession?.id === targetCourierId) {
        setCourierSession((prev) =>
          prev
            ? {
                ...prev,
                balanceAvailable: Math.round((prev.balanceAvailable + payoutToAdd) * 100) / 100,
                totalDeliveries: prev.totalDeliveries + 1,
              }
            : null
        );
      }
      if (courierProfileState?.id === targetCourierId) {
        setCourierProfileState((prev) =>
          prev
            ? {
                ...prev,
                balanceAvailable: Math.round((prev.balanceAvailable + payoutToAdd) * 100) / 100,
                totalDeliveries: prev.totalDeliveries + 1,
              }
            : null
        );
      }
    }
  };

  const withdrawCourierBalance = (amount: number, courierId?: string) => {
    const targetId = courierId || courierSession?.id || courierProfile.id;
    setCouriers((prev) => {
      const next = prev.map((c) => {
        if (c.id === targetId) {
          return {
            ...c,
            balanceAvailable: Math.max(0, Math.round((c.balanceAvailable - amount) * 100) / 100),
          };
        }
        return c;
      });
      safeSetItem(PROD_STORAGE_KEYS.COURIERS, JSON.stringify(next));
      return next;
    });

    if (courierSession?.id === targetId) {
      setCourierSession((prev) =>
        prev
          ? {
              ...prev,
              balanceAvailable: Math.max(0, Math.round((prev.balanceAvailable - amount) * 100) / 100),
            }
          : null
      );
    }
    if (courierProfileState?.id === targetId) {
      setCourierProfileState((prev) =>
        prev
          ? {
              ...prev,
              balanceAvailable: Math.max(0, Math.round((prev.balanceAvailable - amount) * 100) / 100),
            }
          : null
      );
    }
  };

  // Limpeza de dados mantendo padrão de produção limpo
  const resetAllData = () => {
    localStorage.clear();
    setPricingConfig(DEFAULT_PRICING_CONFIG);
    setOrders([]);
    setClients([]);
    setCurrentClientState(null);
    setCouriers(DEFAULT_DEMO_COURIERS);
    setCourierProfileState(null);
    setCourierSession(null);
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
        courierSession,
        loginCourier,
        logoutCourier,
        selectCourierSession,
        toggleCourierOnline,
        blockCourier,
        unblockCourier,
        deleteCourier,
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
