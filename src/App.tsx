import React, { useState, useEffect } from 'react';
import { initialDriver } from './mockData';
import { DriverProfile, Order, WalletTransaction, VehicleType, OrderStatus, UserMode } from './types';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { OrdersTab } from './components/OrdersTab';
import { ActiveOrderView } from './components/ActiveOrderView';
import { WalletTab } from './components/WalletTab';
import { MapTab } from './components/MapTab';
import { ProfileTab } from './components/ProfileTab';
import { OrderIncomingModal } from './components/OrderIncomingModal';
import { RegistrationFlow } from './components/RegistrationFlow';
import { LoginScreen } from './components/LoginScreen';
import { ClientOrderFlow } from './components/ClientOrderFlow';
import { ClientRegistrationModal } from './components/ClientRegistrationModal';
import { sound } from './sound';
import { 
  supabase, 
  isSupabaseConfigured, 
  getAvailableOrdersFromSupabase, 
  mapDbOrderToOrder, 
  createDriverInSupabase,
  getDriverFromSupabase,
  updateDriverInSupabase,
  createRealOrderInSupabase,
  updateOrderStatusInDb, 
  saveTransactionInDb,
  mapDbDriverToProfile
} from './services/supabase';

type AuthView = 'login' | 'register' | 'panel';

export function App() {
  const [userMode, setUserMode] = useState<UserMode>(() => {
    const saved = localStorage.getItem('parceiro_user_mode');
    return (saved === 'client' || saved === 'driver') ? (saved as UserMode) : 'driver';
  });

  const [authView, setAuthView] = useState<AuthView>(() => {
    return localStorage.getItem('parceiro_driver_id') ? 'panel' : 'login';
  });
  const [driverId, setDriverId] = useState<string | null>(() => {
    return localStorage.getItem('parceiro_driver_id');
  });

  const [isClientRegisterOpen, setIsClientRegisterOpen] = useState(false);
  const [roleChoice, setRoleChoice] = useState<{
    isOpen: boolean;
    driverData?: any;
    clientData?: any;
  } | null>(null);

  const [currentClient, setCurrentClient] = useState<{ name: string; phone: string; address?: string } | null>(() => {
    const saved = localStorage.getItem('parceiro_current_client');
    return saved ? JSON.parse(saved) : null;
  });

  const [driver, setDriver] = useState<DriverProfile>(initialDriver);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isViewingActiveOrder, setIsViewingActiveOrder] = useState<boolean>(true);
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('orders');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [isLoadingDriver, setIsLoadingDriver] = useState<boolean>(true);
  const localIp = typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.hostname : '192.168.15.174';

  // Check if screen is desktop to optionally toggle mobile frame
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsMobileFrame(true);
    }
  }, []);

  // Load existing driver from Supabase if stored
  useEffect(() => {
    const savedDriverId = localStorage.getItem('parceiro_driver_id');
    if (savedDriverId && isSupabaseConfigured) {
      getDriverFromSupabase(savedDriverId).then(dbDriver => {
        if (dbDriver) {
          setDriver(dbDriver);
          setAuthView('panel');
        } else {
          localStorage.removeItem('parceiro_driver_id');
          setAuthView('login');
        }
        setIsLoadingDriver(false);
      });
    } else {
      setIsLoadingDriver(false);
    }
  }, []);

  // Supabase Real-Time Orders Sync
  useEffect(() => {
    if (!isSupabaseConfigured || authView !== 'panel') return;

    // Load available orders from database
    getAvailableOrdersFromSupabase().then(dbOrders => {
      if (dbOrders) {
        setOrders(dbOrders);
      }
    });

    // Realtime subscription for instant new orders
    const channel = supabase
      .channel('realtime:orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = mapDbOrderToOrder(payload.new);
          if (newOrder.status === 'available') {
            setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
            setIncomingOrder(newOrder);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = mapDbOrderToOrder(payload.new);
          if (updated.status !== 'available') {
            setOrders(prev => prev.filter(o => o.id !== updated.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authView]);

  // Smart Login Resolution
  const handleSmartLogin = async (phoneInput: string, passwordInput?: string) => {
    sound.playClick();
    const cleanPhone = phoneInput.replace(/\D/g, '');

    // 1. Check if registered as driver in Supabase
    let foundDriver: any = null;
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('drivers').select('*');
        if (data && data.length > 0) {
          foundDriver = data.find((d: any) => d.phone && d.phone.replace(/\D/g, '').includes(cleanPhone.slice(-8)));
        }
      } catch (e) {
        console.warn('Driver check error:', e);
      }
    }

    // 2. Check if registered as client in localStorage or previous orders
    const savedClientsRaw = localStorage.getItem('parceiro_registered_clients');
    let savedClients: any[] = [];
    try { savedClients = savedClientsRaw ? JSON.parse(savedClientsRaw) : []; } catch(e){}
    let foundClient = savedClients.find((c: any) => c.phone && c.phone.replace(/\D/g, '').includes(cleanPhone.slice(-8)));

    if (!foundClient && isSupabaseConfigured) {
      try {
        const { data: orderData } = await supabase
          .from('orders')
          .select('pickup_contact_name, pickup_contact_phone, pickup_address')
          .order('created_at', { ascending: false });
        if (orderData && orderData.length > 0) {
          const matchingOrder = orderData.find((o: any) => o.pickup_contact_phone && o.pickup_contact_phone.replace(/\D/g, '').includes(cleanPhone.slice(-8)));
          if (matchingOrder) {
            foundClient = {
              name: matchingOrder.pickup_contact_name || 'Cliente Parceiro',
              phone: matchingOrder.pickup_contact_phone || phoneInput,
              address: matchingOrder.pickup_address || '',
            };
          }
        }
      } catch (e) {
        console.warn('Order client check error:', e);
      }
    }

    // 3. Resolve role:
    if (foundDriver && foundClient) {
      // Both profiles found! Open modal for user to choose
      setRoleChoice({
        isOpen: true,
        driverData: foundDriver,
        clientData: foundClient,
      });
      return;
    }

    if (foundDriver) {
      // ONLY driver
      setDriver(mapDbDriverToProfile(foundDriver));
      setDriverId(foundDriver.id);
      localStorage.setItem('parceiro_driver_id', foundDriver.id);
      setUserMode('driver');
      localStorage.setItem('parceiro_user_mode', 'driver');
      setAuthView('panel');
      sound.playCashSuccess();
      return;
    }

    if (foundClient) {
      // ONLY client
      setCurrentClient(foundClient);
      localStorage.setItem('parceiro_current_client', JSON.stringify(foundClient));
      setUserMode('client');
      localStorage.setItem('parceiro_user_mode', 'client');
      setAuthView('panel');
      sound.playCashSuccess();
      return;
    }

    // If neither exists yet:
    alert('Telefone não cadastrado. Por favor, clique em "Cadastre-se como motorista parceiro" ou "Cadastre-se como cliente" para criar sua conta!');
  };

  const handleSelectRole = (role: 'driver' | 'client') => {
    if (!roleChoice) return;
    if (role === 'driver') {
      if (roleChoice.driverData) {
        setDriver(mapDbDriverToProfile(roleChoice.driverData));
        setDriverId(roleChoice.driverData.id);
        localStorage.setItem('parceiro_driver_id', roleChoice.driverData.id);
      }
      setUserMode('driver');
      localStorage.setItem('parceiro_user_mode', 'driver');
    } else {
      if (roleChoice.clientData) {
        setCurrentClient(roleChoice.clientData);
        localStorage.setItem('parceiro_current_client', JSON.stringify(roleChoice.clientData));
      }
      setUserMode('client');
      localStorage.setItem('parceiro_user_mode', 'client');
    }
    setRoleChoice(null);
    setAuthView('panel');
    sound.playCashSuccess();
  };

  // Handler for completing the registration & document verification flow
  const handleCompleteRegistration = async (driverData: any) => {
    const result = await createDriverInSupabase(driverData);
    if (result) {
      setDriver(result.driver);
      setDriverId(result.id);
      localStorage.setItem('parceiro_driver_id', result.id);
    } else {
      setDriver(driverData);
      const fallbackId = `drv-${Date.now()}`;
      setDriverId(fallbackId);
      localStorage.setItem('parceiro_driver_id', fallbackId);
    }
    setAuthView('panel');
    sound.playCashSuccess();
  };

  const handleLogout = () => {
    localStorage.removeItem('parceiro_driver_id');
    localStorage.removeItem('parceiro_current_client');
    setDriverId(null);
    setCurrentClient(null);
    setActiveOrder(null);
    setAuthView('login');
  };

  const handleSetUserMode = (mode: UserMode) => {
    setUserMode(mode);
    localStorage.setItem('parceiro_user_mode', mode);
  };

  const handleToggleOnline = () => {
    const nextOnline = !driver.isOnline;
    if (!nextOnline) {
      setIncomingOrder(null);
    }
    setDriver(prev => ({ ...prev, isOnline: nextOnline }));

    if (driverId) {
      updateDriverInSupabase(driverId, { isOnline: nextOnline });
    }
  };

  const handleChangeVehicle = (type: VehicleType) => {
    const models: Record<VehicleType, string> = {
      moto: 'Honda CG 160 Cargo',
      carro: 'Chevrolet Onix Plus',
      fiorino: 'Fiat Fiorino 1.4 EVO',
      van: 'Renault Master Furgão',
      carreto: 'Toyota Hilux Cabine Simples',
      caminhao: 'Mercedes-Benz Accelo 815',
    };
    const updated = {
      vehicleType: type,
      vehicleModel: models[type],
    };
    setDriver(prev => ({ ...prev, ...updated }));
    if (driverId) {
      updateDriverInSupabase(driverId, updated);
    }
  };

  const handleUpdateDriver = (updated: Partial<DriverProfile>) => {
    setDriver(prev => ({ ...prev, ...updated }));
    if (driverId) {
      updateDriverInSupabase(driverId, updated);
    }
  };

  const handleUpdateActiveOrderStatus = (status: OrderStatus, extra?: any) => {
    if (!activeOrder) return;
    updateOrderStatusInDb(activeOrder.id, status, driverId || undefined, extra);
    setActiveOrder(prev => prev ? { ...prev, status, ...extra } : null);
  };

  const handleAcceptOrder = (order: Order) => {
    // Anti-self acceptance rule: cannot accept an order you requested yourself
    const isSelfOrder = Boolean(
      (order.pickup.contactPhone && driver.phone && order.pickup.contactPhone.replace(/\D/g, '') === driver.phone.replace(/\D/g, '')) ||
      (order.senderName && driver.name && order.senderName.trim().toLowerCase() === driver.name.trim().toLowerCase())
    );

    if (isSelfOrder) {
      sound.playClick();
      alert('Operação não permitida: Você não pode aceitar uma corrida que você mesmo solicitou como cliente!');
      return;
    }

    setIncomingOrder(null);
    setActiveOrder(order);
    setIsViewingActiveOrder(true);
    setOrders(prev => prev.filter(o => o.id !== order.id));
    setActiveTab('orders');

    updateOrderStatusInDb(order.id, 'to_pickup', driverId || undefined);
  };

  const handleDeclineOrder = (orderId: string) => {
    setIncomingOrder(null);
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleCompleteOrder = (order: Order, receiptName: string) => {
    setActiveOrder(null);
    setIsViewingActiveOrder(false);
    
    const newWalletBalance = driver.walletBalance + order.price;
    const newToday = driver.todayEarnings + order.price;
    const newWeek = driver.weekEarnings + order.price;
    const newTrips = driver.totalTrips + 1;

    setDriver(prev => ({
      ...prev,
      walletBalance: newWalletBalance,
      todayEarnings: newToday,
      weekEarnings: newWeek,
      totalTrips: newTrips,
    }));

    if (driverId) {
      updateDriverInSupabase(driverId, {
        walletBalance: newWalletBalance,
        todayEarnings: newToday,
        weekEarnings: newWeek,
        totalTrips: newTrips,
      });
    }

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'trip_earning',
      title: 'Corrida Finalizada com Sucesso',
      subtitle: `Pedido ${order.code} • Entregue para ${receiptName}`,
      amount: order.price,
      date: 'Hoje',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      orderCode: order.code,
    };
    setTransactions(prev => [newTx, ...prev]);
    setActiveTab('wallet');

    updateOrderStatusInDb(order.id, 'completed', driverId || undefined);
    saveTransactionInDb(newTx, driverId || undefined);
  };

  const handleCancelActiveOrder = (orderId: string) => {
    sound.playClick();
    setActiveOrder(null);
    setIsViewingActiveOrder(false);
    updateOrderStatusInDb(orderId, 'available');
  };

  const handleWithdrawPix = (amount: number) => {
    const newBalance = Math.max(0, driver.walletBalance - amount);
    setDriver(prev => ({
      ...prev,
      walletBalance: newBalance,
    }));

    if (driverId) {
      updateDriverInSupabase(driverId, { walletBalance: newBalance });
    }

    const newTx: WalletTransaction = {
      id: `tx-pix-${Date.now()}`,
      type: 'withdrawal',
      title: 'Transferência Pix Realizada',
      subtitle: `Para conta vinculada (${driver.pixKey})`,
      amount: -amount,
      date: 'Hoje',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setTransactions(prev => [newTx, ...prev]);
    saveTransactionInDb(newTx, driverId || undefined);
  };

  const handleRefreshOrders = () => {
    if (isSupabaseConfigured) {
      getAvailableOrdersFromSupabase().then(dbOrders => {
        if (dbOrders) {
          setOrders(dbOrders);
        }
      });
    }
  };

  // If loading driver state
  if (isLoadingDriver) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-white space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-lala-orange border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Conectando ao Parceiro...
          </p>
        </div>
      </div>
    );
  }

  // 1. TELA DE LOGIN UNIFICADA (Identifica se é Cliente, Motorista ou Ambos)
  if (authView === 'login') {
    return (
      <>
        <LoginScreen
          onLogin={handleSmartLogin}
          onGoToDriverRegister={() => setAuthView('register')}
          onGoToClientRegister={() => setIsClientRegisterOpen(true)}
          roleChoiceModal={roleChoice ? { isOpen: true, onSelectRole: handleSelectRole } : undefined}
        />
        <ClientRegistrationModal
          isOpen={isClientRegisterOpen}
          onClose={() => setIsClientRegisterOpen(false)}
          onRegisterSuccess={(clientData) => {
            setCurrentClient(clientData);
            setUserMode('client');
            localStorage.setItem('parceiro_user_mode', 'client');
            setAuthView('panel');
            setIsClientRegisterOpen(false);
          }}
        />
      </>
    );
  }

  // 2. TELA DE CADASTRO MOTORISTA & AVERIGUAÇÃO DE DOCUMENTOS (Upload Real)
  if (authView === 'register') {
    return (
      <RegistrationFlow 
        onCompleteRegistration={handleCompleteRegistration}
        onBackToLogin={() => setAuthView('login')}
      />
    );
  }

  // 3. PAINEL DO CLIENTE / SOLICITANTE (Chamar Fretes & Entregas)
  if (userMode === 'client') {
    return (
      <div className={`min-h-screen bg-slate-900 flex items-center justify-center ${isMobileFrame ? 'p-0 sm:p-6' : 'p-0'}`}>
        <div 
          className={`w-full bg-white flex flex-col relative overflow-hidden transition-all duration-300 ${
            isMobileFrame 
              ? 'max-w-[440px] h-[100dvh] sm:h-[880px] sm:rounded-[44px] shadow-2xl border-0 sm:border-[10px] sm:border-zinc-800' 
              : 'max-w-2xl h-[100dvh] shadow-none'
          }`}
        >
          {isMobileFrame && (
            <div className="hidden sm:flex absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-zinc-900 rounded-full z-40 items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
            </div>
          )}

          <ClientOrderFlow
            onLogout={handleLogout}
            currentClient={currentClient || undefined}
          />
        </div>
      </div>
    );
  }

  // 4. PAINEL PRINCIPAL DE ENTREGAS (Motorista)
  return (
    <div className={`min-h-screen bg-slate-900 flex items-center justify-center ${isMobileFrame ? 'p-0 sm:p-6' : 'p-0'}`}>
      
      {/* Main Container / Mobile Frame */}
      <div 
        className={`w-full bg-white flex flex-col relative overflow-hidden transition-all duration-300 ${
          isMobileFrame 
            ? 'max-w-[440px] h-[100dvh] sm:h-[880px] sm:rounded-[44px] shadow-2xl border-0 sm:border-[10px] sm:border-zinc-800' 
            : 'max-w-2xl h-[100dvh] shadow-none'
        }`}
      >
        {/* Smartphone top camera pill indicator (only in mobile frame mode on desktop) */}
        {isMobileFrame && (
          <div className="hidden sm:flex absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-zinc-900 rounded-full z-40 items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          </div>
        )}

        {/* Global App Header (Exclusivo Motorista) */}
        <Header
          driver={driver}
          onToggleOnline={handleToggleOnline}
          onChangeVehicle={handleChangeVehicle}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            sound.setSoundEnabled(next);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden">
          {/* Active Order view takes precedence ONLY when isViewingActiveOrder is true */}
          {activeOrder && isViewingActiveOrder ? (
            <ActiveOrderView
              order={activeOrder}
              onUpdateStatus={handleUpdateActiveOrderStatus}
              onComplete={handleCompleteOrder}
              onCancel={handleCancelActiveOrder}
              onMinimize={() => setIsViewingActiveOrder(false)}
            />
          ) : (
            <>
              {activeTab === 'orders' && (
                <OrdersTab
                  orders={orders}
                  driver={driver}
                  onAcceptOrder={handleAcceptOrder}
                  onViewOrderDetails={(o) => setIncomingOrder(o)}
                  onToggleOnline={handleToggleOnline}
                  onRefreshOrders={handleRefreshOrders}
                />
              )}

              {activeTab === 'map' && (
                <MapTab driver={driver} />
              )}

              {activeTab === 'wallet' && (
                <WalletTab
                  driver={driver}
                  transactions={transactions}
                  onWithdrawPix={handleWithdrawPix}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileTab
                  driver={driver}
                  onChangeVehicle={handleChangeVehicle}
                  onUpdateDriver={handleUpdateDriver}
                  onLogout={handleLogout}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setIsViewingActiveOrder(false);
            setActiveTab(tab);
          }}
          availableOrdersCount={driver.isOnline ? orders.length : 0}
          hasActiveOrder={Boolean(activeOrder && !isViewingActiveOrder)}
          onOpenActiveOrder={() => {
            setIsViewingActiveOrder(true);
            setActiveTab('orders');
          }}
        />

        {/* Incoming Order Flash Modal */}
        <OrderIncomingModal
          order={incomingOrder}
          onAccept={handleAcceptOrder}
          onDecline={handleDeclineOrder}
        />
      </div>
    </div>
  );
}

export default App;
