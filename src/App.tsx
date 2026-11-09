import React, { useState, useEffect } from 'react';
import { initialDriver, generateRandomOrder } from './mockData';
import { DriverProfile, Order, WalletTransaction, VehicleType, OrderStatus, UserMode } from './types';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { OrdersTab } from './components/OrdersTab';
import { ActiveOrderView } from './components/ActiveOrderView';
import { WalletTab } from './components/WalletTab';
import { MapTab } from './components/MapTab';
import { ProfileTab } from './components/ProfileTab';
import { OrderIncomingModal } from './components/OrderIncomingModal';
import { SimulatorToolbar } from './components/SimulatorToolbar';
import { RegistrationFlow } from './components/RegistrationFlow';
import { LoginScreen } from './components/LoginScreen';
import { ClientOrderFlow } from './components/ClientOrderFlow';
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

  const [driver, setDriver] = useState<DriverProfile>(initialDriver);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isViewingActiveOrder, setIsViewingActiveOrder] = useState<boolean>(true);
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('orders');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(false);
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

  // Periodic automatic order generator when simulator is on (creates real rows in Supabase)
  useEffect(() => {
    if (!isAutoSimulating || !driver.isOnline || activeOrder || authView !== 'panel') return;

    const timer = setInterval(() => {
      const generated = generateRandomOrder(driver.vehicleType);
      createRealOrderInSupabase(generated).then(createdOrder => {
        if (!createdOrder) {
          setOrders(prev => [generated, ...prev]);
          setIncomingOrder(generated);
        }
      });
    }, 25000);

    return () => clearInterval(timer);
  }, [isAutoSimulating, driver.isOnline, activeOrder, driver.vehicleType, authView]);

  // Handler for login from LoginScreen
  const handleLogin = async (phoneInput: string) => {
    sound.playClick();
    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const found = data[0];
        setDriver(mapDbDriverToProfile(found));
        setDriverId(found.id);
        localStorage.setItem('parceiro_driver_id', found.id);
        setAuthView('panel');
        sound.playCashSuccess();
        return;
      }
    }

    const newDriverData = {
      name: 'Carlos Alberto Silva',
      phone: phoneInput || '(11) 98435-2781',
      vehicle_type: 'fiorino',
      vehicle_model: 'Fiat Fiorino 1.4 EVO',
      vehicle_plate: 'BRA-2E19',
      pix_key: phoneInput || 'carlos.silva@pix.com',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    };
    const created = await createDriverInSupabase(newDriverData);
    if (created) {
      setDriver(created.driver);
      setDriverId(created.id);
      localStorage.setItem('parceiro_driver_id', created.id);
    } else {
      const fallbackId = `drv-${Date.now()}`;
      setDriverId(fallbackId);
      localStorage.setItem('parceiro_driver_id', fallbackId);
    }
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
    setDriverId(null);
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

  const handleTriggerManualOrder = async (vehicle?: VehicleType) => {
    sound.playClick();
    if (!driver.isOnline) {
      setDriver(prev => ({ ...prev, isOnline: true }));
      if (driverId) updateDriverInSupabase(driverId, { isOnline: true });
    }
    const newOrd = generateRandomOrder(vehicle || driver.vehicleType);

    const createdInDb = await createRealOrderInSupabase(newOrd);
    if (!createdInDb) {
      setOrders(prev => [newOrd, ...prev.filter(o => o.id !== newOrd.id)]);
      setIncomingOrder(newOrd);
    }
  };

  const handleAcceptOrder = (order: Order) => {
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

  // 0. MODO SOLICITANTE / CLIENTE (Chamar Fretes & Entregas)
  if (userMode === 'client') {
    return (
      <div className={`min-h-screen bg-slate-900 flex items-center justify-center ${isMobileFrame ? 'p-0 sm:p-6' : 'p-0'}`}>
        <SimulatorToolbar
          onTriggerOrder={handleTriggerManualOrder}
          isAutoSimulating={isAutoSimulating}
          onToggleAutoSimulate={() => setIsAutoSimulating(!isAutoSimulating)}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          localIp={localIp}
          userMode={userMode}
          onToggleUserMode={() => handleSetUserMode('driver')}
        />

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
            onSwitchToDriver={() => handleSetUserMode('driver')}
          />
        </div>
      </div>
    );
  }

  // 1. TELA INICIAL MOTORISTA (Login conforme a foto enviada)
  if (authView === 'login') {
    return (
      <>
        <SimulatorToolbar
          onTriggerOrder={handleTriggerManualOrder}
          isAutoSimulating={isAutoSimulating}
          onToggleAutoSimulate={() => setIsAutoSimulating(!isAutoSimulating)}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          localIp={localIp}
          userMode={userMode}
          onToggleUserMode={() => handleSetUserMode('client')}
        />
        <LoginScreen
          onLogin={handleLogin}
          onGoToRegister={() => setAuthView('register')}
          onSwitchToClient={() => handleSetUserMode('client')}
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

  // 3. PAINEL PRINCIPAL DE ENTREGAS (Motorista)
  return (
    <div className={`min-h-screen bg-slate-900 flex items-center justify-center ${isMobileFrame ? 'p-0 sm:p-6' : 'p-0'}`}>
      
      {/* Simulator Quick Action Toolbar */}
      <SimulatorToolbar
        onTriggerOrder={handleTriggerManualOrder}
        isAutoSimulating={isAutoSimulating}
        onToggleAutoSimulate={() => setIsAutoSimulating(!isAutoSimulating)}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        localIp={localIp}
        userMode={userMode}
        onToggleUserMode={() => handleSetUserMode('client')}
      />

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

        {/* Global App Header */}
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
          onSwitchToClient={() => handleSetUserMode('client')}
        />

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden">
          {/* Active Order view takes precedence ONLY when isViewingActiveOrder is true */}
          {activeOrder && isViewingActiveOrder ? (
            <ActiveOrderView
              order={activeOrder}
              onUpdateStatus={(status) => updateOrderStatusInDb(activeOrder.id, status, driverId || undefined)}
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
