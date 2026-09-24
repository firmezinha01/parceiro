import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/pricingEngine';
import { Wallet, ArrowDownRight, ArrowUpRight, TrendingUp, DollarSign, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CourierWallet: React.FC = () => {
  const { courierProfile, courierSession, withdrawCourierBalance, orders } = useApp();
  const currentCourier = courierSession || courierProfile;
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const completedOrders = orders.filter((o) => o.status === 'delivered' && o.courierId === currentCourier.id);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > (currentCourier.balanceAvailable ?? 0)) {
      alert('Valor inválido para saque.');
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      withdrawCourierBalance(amount, currentCourier.id);
      setIsWithdrawing(false);
      setWithdrawAmount('');
      setSuccessMsg(`Transferência Pix de ${formatCurrency(amount)} realizada com sucesso para sua chave!`);
      confetti({ particleCount: 70, spread: 60 });
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Saldo e Desempenho */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Saldo Disponível para Saque</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono mt-2">
            {formatCurrency(currentCourier.balanceAvailable ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Chave Pix: <strong className="text-slate-300 font-mono truncate">{currentCourier.pixKey || 'Não cadastrada'}</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Entregas Concluídas</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-2">
            {currentCourier.totalDeliveries ?? 0}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-2">
            ★ {(currentCourier.rating ?? 5.0).toFixed(2)} / 5.0 (Score Excelente)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Modal & Veículo Cadastrado</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-base font-black text-slate-900 mt-2 uppercase">
            {currentCourier.modal === 'moto' ? 'Moto Express' : 'Carro / Utilitário'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {currentCourier.vehiclePlate}
          </div>
        </div>
      </div>

      {/* Box Explicativo do Modelo de Repasse por Componente (Solicitado pelo Usuário) */}
      <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h4 className="text-xs font-bold text-slate-900">
            Regra Oficial de Repasse Transparente por Componente (Km/Tempo):
          </h4>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          Nesta plataforma, o valor que você recebe não é um percentual genérico, mas calculado de forma justa em cada item da corrida:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 bg-white rounded-xl border border-amber-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Taxa Base</div>
            <div className="text-base font-black text-amber-800 mt-0.5">65% Repassado</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Cobre custos de partida e partida rápida</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-amber-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Valor por Km</div>
            <div className="text-base font-black text-emerald-700 mt-0.5">85% Repassado</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Remunera combustível e desgaste do veículo</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-amber-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Valor por Tempo</div>
            <div className="text-base font-black text-blue-700 mt-0.5">75% Repassado</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Compensa o tempo investido no trânsito</div>
          </div>
        </div>
      </div>

      {/* Solicitar Saque Pix */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Solicitar Transferência Pix Instantânea</span>
        </h4>

        {successMsg && (
          <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleWithdraw} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              R$
            </span>
            <input
              type="number"
              step="0.01"
              min="1"
              max={courierProfile.balanceAvailable}
              placeholder="0,00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
            />
          </div>

          <button
            type="button"
            onClick={() => setWithdrawAmount(courierProfile.balanceAvailable.toString())}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Sacar Tudo
          </button>

          <button
            type="submit"
            disabled={isWithdrawing || courierProfile.balanceAvailable <= 0}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {isWithdrawing ? 'Processando Pix...' : 'Confirmar Saque Pix'}
          </button>
        </form>
      </div>

      {/* Histórico Detalhado de Corridas e Splits */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Histórico Recente de Entregas & Discriminação do Split
          </h4>
          <span className="text-[11px] font-semibold text-slate-500">
            {completedOrders.length} entregas registradas
          </span>
        </div>

        {completedOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Nenhuma entrega finalizada ainda nesta sessão. Complete corridas no radar para ver os splits creditados aqui.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {completedOrders.map((ord) => (
              <div key={ord.id} className="p-4 hover:bg-slate-50/60 transition space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {ord.trackingCode}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {ord.modal}
                    </span>
                  </div>
                  <div className="text-sm font-black font-mono text-emerald-700">
                    + {formatCurrency(ord.price.totalCourierPayout)}
                  </div>
                </div>

                <div className="text-xs text-slate-600">
                  {ord.sender.address.neighborhood} ➔ {ord.recipient.address.neighborhood} ({ord.price.distanceKm} km, ~{ord.price.durationMin}m)
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                  <span>Base (65%): {formatCurrency(ord.price.courierBasePayout)}</span>
                  <span>Km (85%): {formatCurrency(ord.price.courierKmPayout)}</span>
                  <span>Tempo (75%): {formatCurrency(ord.price.courierTimePayout)}</span>
                  {ord.price.courierUrgencyBonus > 0 && (
                    <span className="text-red-600 font-bold">Urgência: +{formatCurrency(ord.price.courierUrgencyBonus)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
