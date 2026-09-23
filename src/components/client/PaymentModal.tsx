import React, { useState } from 'react';
import { QRCodeViewer } from '../common/QRCodeViewer';
import { formatCurrency } from '../../services/pricingEngine';
import { QrCode, CreditCard, Banknote, CheckCircle, Copy, Check, ShieldCheck, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  amount: number;
  orderDescription: string;
  onPaymentConfirmed: (method: 'pix' | 'credit_card' | 'cash_on_delivery') => void;
  onCancel: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  amount,
  orderDescription,
  onPaymentConfirmed,
  onCancel,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'credit_card' | 'cash_on_delivery'>('pix');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const pixKeySimulated = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}520400005303986540${amount.toFixed(2)}5802BR5908PARCEIRO6009SAO PAULO62070503***6304`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKeySimulated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      onPaymentConfirmed(selectedMethod);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
              Checkout Seguro
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> Criptografia 256-bit
            </span>
          </div>
          <h3 className="text-xl font-black mt-1">Concluir Pagamento do Envio</h3>
          <p className="text-xs text-slate-300 mt-1 truncate">{orderDescription}</p>

          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Valor Total do Frete:</span>
            <span className="text-2xl font-black text-amber-400">{formatCurrency(amount)}</span>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSelectedMethod('pix')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition ${
                selectedMethod === 'pix'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4 mb-1 text-emerald-600" />
              <span>Pix (Instantâneo)</span>
            </button>

            <button
              onClick={() => setSelectedMethod('credit_card')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition ${
                selectedMethod === 'credit_card'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4 mb-1 text-blue-600" />
              <span>Cartão</span>
            </button>

            <button
              onClick={() => setSelectedMethod('cash_on_delivery')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition ${
                selectedMethod === 'cash_on_delivery'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Banknote className="w-4 h-4 mb-1 text-amber-600" />
              <span>Na Entrega</span>
            </button>
          </div>

          {/* Pix Tab Content */}
          {selectedMethod === 'pix' && (
            <div className="flex flex-col items-center text-center space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <QRCodeViewer value={pixKeySimulated} size={150} caption="Pix QR Code" />

              <div className="w-full">
                <div className="text-xs font-semibold text-slate-700 mb-1">
                  Pix Copia e Cola:
                </div>
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    readOnly
                    value={pixKeySimulated}
                    className="text-[10px] font-mono text-slate-500 bg-transparent flex-1 outline-hidden truncate"
                  />
                  <button
                    onClick={handleCopyPix}
                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Credit Card Tab Content */}
          {selectedMethod === 'credit_card' && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Número do Cartão (Simulado)
                </label>
                <input
                  type="text"
                  defaultValue="4532 •••• •••• 8821"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Validade</label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">CVV</label>
                  <input
                    type="password"
                    defaultValue="842"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cash on Delivery Tab Content */}
          {selectedMethod === 'cash_on_delivery' && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-slate-800 text-xs space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <Banknote className="w-4 h-4 text-amber-700" />
                Pagamento em dinheiro na retirada ou entrega
              </p>
              <p className="text-slate-600 leading-relaxed">
                O entregador parceiro efetuará a cobrança de <strong>{formatCurrency(amount)}</strong> diretamente no momento da entrega e realizará o acerto de contas pelo aplicativo.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
            >
              Voltar
            </button>

            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="flex-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Aprovando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {selectedMethod === 'cash_on_delivery'
                      ? 'Confirmar Pedido'
                      : 'Simular Aprovação Imediata'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
