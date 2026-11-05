import React, { useState } from 'react';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, DollarSign, 
  TrendingUp, Calendar, CheckCircle2, ChevronRight, CreditCard, Sparkles 
} from 'lucide-react';
import { DriverProfile, WalletTransaction } from '../types';
import { sound } from '../sound';

interface WalletTabProps {
  driver: DriverProfile;
  transactions: WalletTransaction[];
  onWithdrawPix: (amount: number) => void;
}

export const WalletTab: React.FC<WalletTabProps> = ({
  driver,
  transactions,
  onWithdrawPix,
}) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const handleConfirmWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(withdrawAmount.replace(',', '.'));
    if (!val || val <= 0 || val > driver.walletBalance) {
      alert('Por favor, informe um valor válido até o limite do seu saldo.');
      return;
    }

    sound.playCashSuccess();
    onWithdrawPix(val);
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    }, 1800);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-y-auto pb-24">
      {/* Balance Card */}
      <div className="p-4 bg-gradient-to-br from-lala-charcoal via-zinc-900 to-zinc-950 text-white shadow-lg">
        <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
            <Wallet className="w-4 h-4 text-lala-orange" />
            <span>Saldo Disponível na Carteira</span>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            PIX Imediato 24h
          </span>
        </div>

        <div className="text-3xl font-black tracking-tight text-white mt-1 mb-4">
          R$ {driver.walletBalance.toFixed(2).replace('.', ',')}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setShowWithdrawModal(true);
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-lala-orange hover:bg-lala-orangeDark active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            <span>SOLICITAR SAQUE PIX</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-200/80">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Hoje</span>
            <Calendar className="w-3.5 h-3.5 text-lala-orange" />
          </div>
          <div className="text-xl font-extrabold text-gray-900">
            R$ {driver.todayEarnings.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18% vs ontem</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-200/80">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Esta Semana</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-gray-900">
            R$ {driver.weekEarnings.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block font-medium">
            Meta: R$ 1.800 (78%)
          </span>
        </div>
      </div>

      {/* Bonus / Campaign Banner */}
      <div className="px-4 pb-2">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-5 h-5 text-yellow-200" />
            </div>
            <div>
              <span className="text-xs font-black block leading-tight">Campanha Fim de Semana Turbo</span>
              <span className="text-[11px] text-orange-100">Faça mais 3 corridas e ganhe bônus de R$ 50</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
        </div>
      </div>

      {/* Transactions History */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">
            Extrato de Atividades Recentes
          </h3>
          <span className="text-[11px] text-gray-400 font-medium">Últimos lançamentos</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 divide-y divide-gray-100 overflow-hidden">
          {transactions.map((tx) => {
            const isCredit = tx.amount > 0;
            return (
              <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{tx.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{tx.subtitle}</p>
                    <span className="text-[10px] text-gray-400">
                      {tx.date} às {tx.time}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-black ${
                    isCredit ? 'text-emerald-600' : 'text-gray-900'
                  }`}>
                    {isCredit ? '+' : ''} R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
                  </span>
                  <span className="block text-[9px] text-gray-400">Concluído</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PIX Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-lala-orange" />
                <h3 className="font-extrabold text-gray-900 text-base">Transferência Pix Express</h3>
              </div>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="font-extrabold text-gray-900 text-base">Pix Enviado com Sucesso!</h4>
                <p className="text-xs text-gray-500">
                  O valor já foi transferido para a sua chave Pix cadastrada.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmWithdraw} className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Chave Pix Destino</span>
                  <p className="text-xs font-bold text-gray-900">{driver.pixKey}</p>
                  <p className="text-[11px] text-gray-500">Beneficiário: {driver.name}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">Valor do Saque (R$):</label>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(driver.walletBalance.toFixed(2))}
                      className="text-xs font-bold text-lala-orange hover:underline"
                    >
                      Sacar Tudo (R$ {driver.walletBalance.toFixed(2).replace('.', ',')})
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-gray-500 text-base">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      max={driver.walletBalance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 text-lg font-bold focus:ring-2 focus:ring-lala-orange focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/60 text-emerald-900">
                  ✓ Sem taxa de transferência. Saldo cai na hora via Pix Banco Central.
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-lala-orange hover:bg-lala-orangeDark active:scale-95 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>CONFIRMAR TRANSFERÊNCIA PIX</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
