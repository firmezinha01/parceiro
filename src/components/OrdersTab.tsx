import React from 'react';
import { Power, MapPin, Package, ArrowRight, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { Order, DriverProfile, VehicleType } from '../types';
import { sound } from '../sound';

interface OrdersTabProps {
  orders: Order[];
  driver: DriverProfile;
  onAcceptOrder: (order: Order) => void;
  onViewOrderDetails: (order: Order) => void;
  onToggleOnline: () => void;
  onRefreshOrders: () => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  driver,
  onAcceptOrder,
  onViewOrderDetails,
  onToggleOnline,
  onRefreshOrders,
}) => {
  const [filterVehicle, setFilterVehicle] = React.useState<string>('all');

  const filteredOrders = orders.filter((o) => {
    if (filterVehicle === 'all') return true;
    return o.vehicleType === filterVehicle;
  });

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-y-auto pb-24">
      {/* Offline Banner */}
      {!driver.isOnline && (
        <div className="p-4">
          <div className="bg-zinc-900 text-white rounded-3xl p-6 text-center space-y-4 shadow-xl border border-zinc-800">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-gray-400">
              <Power className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Você está Offline</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Fique online para que o algoritmo do Parceiro direcione as corridas mais lucrativas para o seu veículo.
              </p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onToggleOnline();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 font-extrabold text-xs text-white uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              FICAR ONLINE AGORA
            </button>
          </div>
        </div>
      )}

      {/* Online Status Bar */}
      {driver.isOnline && (
        <div className="p-3 bg-white border-b border-gray-200/80 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <span className="w-3 h-3 rounded-full bg-emerald-500 block animate-radar" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block leading-tight">
                  Radar de Corridas Ativo
                </span>
                <span className="text-[10px] text-gray-500">
                  Raio de 15 km • {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido disponível' : 'pedidos disponíveis'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onRefreshOrders();
              }}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 active:rotate-180 transition-all"
              title="Atualizar lista"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Vehicle Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 scrollbar-none text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setFilterVehicle('all');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                filterVehicle === 'all'
                  ? 'bg-lala-charcoal text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFilterVehicle(driver.vehicleType);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                filterVehicle === driver.vehicleType
                  ? 'bg-lala-orange text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Seu Veículo ({driver.vehicleType.toUpperCase()})
            </button>
            {['moto', 'carro', 'fiorino', 'van'].map((type) => {
              if (type === driver.vehicleType) return null;
              return (
                <button
                  key={type}
                  onClick={() => {
                    sound.playClick();
                    setFilterVehicle(type);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                    filterVehicle === type
                      ? 'bg-lala-charcoal text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Online with No Orders State */}
      {driver.isOnline && filteredOrders.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-orange-100/70 flex items-center justify-center animate-ping opacity-60" />
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-tr from-lala-orange to-amber-400 flex items-center justify-center text-white shadow-xl shadow-orange-500/30">
              <Zap className="w-10 h-10 animate-bounce" />
            </div>
          </div>
          <h4 className="font-extrabold text-gray-900 text-base">Buscando pedidos...</h4>
          <p className="text-xs text-gray-500 max-w-xs mt-1">
            Você receberá um alerta sonoro alto assim que um cliente chamar uma entrega para {driver.vehicleType.toUpperCase()}.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-[11px] font-semibold text-gray-600 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>GPS conectado em Alta Precisão</span>
          </div>
        </div>
      )}

      {/* Orders List */}
      {driver.isOnline && filteredOrders.length > 0 && (
        <div className="p-3 space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/80 hover:shadow-md transition-all space-y-3"
            >
              {/* Card Header: Price & Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Ganho Líquido</span>
                  <div className="text-2xl font-black text-lala-charcoal tracking-tight">
                    R$ {order.price.toFixed(2).replace('.', ',')}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <span className="bg-lala-orangeLight text-lala-orangeDark border border-orange-200 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    {order.vehicleType}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">
                    {order.distanceToPickupKm} km da sua posição
                  </span>
                </div>
              </div>

              {/* Route Summary */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    A
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{order.pickup.address}</p>
                    <p className="text-[11px] text-gray-500">{order.pickup.neighborhood}</p>
                  </div>
                </div>

                <div className="ml-2.5 border-l-2 border-dashed border-gray-300 h-2" />

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-red-500 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    B
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{order.delivery.address}</p>
                    <p className="text-[11px] text-gray-500">{order.delivery.neighborhood}</p>
                  </div>
                </div>
              </div>

              {/* Cargo metadata & Estimated Time */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <div className="flex items-center gap-1.5 truncate">
                  <Package className="w-3.5 h-3.5 text-lala-orange shrink-0" />
                  <span className="truncate">{order.cargoType}</span>
                </div>
                <span className="font-bold text-gray-700 shrink-0">
                  {order.totalDistanceKm} km (~{order.estimatedMinutes} min)
                </span>
              </div>

              {/* Anti-self acceptance check */}
              {Boolean(
                (order.pickup.contactPhone && driver.phone && order.pickup.contactPhone.replace(/\D/g, '') === driver.phone.replace(/\D/g, '')) ||
                (order.senderName && driver.name && order.senderName.trim().toLowerCase() === driver.name.trim().toLowerCase())
              ) && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Você é o solicitante deste pedido (Auto-atendimento proibido).</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                <button
                  onClick={() => {
                    sound.playClick();
                    onViewOrderDetails(order);
                  }}
                  className="w-1/3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-bold text-xs transition-all"
                >
                  Detalhes
                </button>
                {Boolean(
                  (order.pickup.contactPhone && driver.phone && order.pickup.contactPhone.replace(/\D/g, '') === driver.phone.replace(/\D/g, '')) ||
                  (order.senderName && driver.name && order.senderName.trim().toLowerCase() === driver.name.trim().toLowerCase())
                ) ? (
                  <button
                    disabled
                    className="w-2/3 py-2.5 rounded-xl bg-gray-200 text-gray-400 font-black text-xs uppercase tracking-wider cursor-not-allowed text-center"
                    title="Não é permitido aceitar corridas solicitadas por você mesmo"
                  >
                    SEU PRÓPRIO PEDIDO
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onAcceptOrder(order);
                    }}
                    className="w-2/3 py-2.5 rounded-xl bg-lala-orange hover:bg-lala-orangeDark active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>ACEITAR CORRIDA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
