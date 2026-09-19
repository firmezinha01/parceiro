import React from 'react';
import { Order } from '../../types';
import { QRCodeViewer } from '../common/QRCodeViewer';
import { createQRCodePayload } from '../../services/trackingService';
import { Printer, Download, Share2, PackageCheck, AlertTriangle } from 'lucide-react';

interface DigitalLabelProps {
  order: Order;
  onClose?: () => void;
}

export const DigitalLabel: React.FC<DigitalLabelProps> = ({ order, onClose }) => {
  const qrPayload = createQRCodePayload(order);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto my-4">
      {/* Top Action Bar (hidden on print) */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <PackageCheck className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-sm">Etiqueta Oficial de Transporte</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Etiqueta</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Fechar
            </button>
          )}
        </div>
      </div>

      {/* Printable Label Section */}
      <div className="printable-shipping-label p-6 bg-white text-slate-900 border-4 border-black m-4 rounded-lg font-sans">
        {/* Header da Etiqueta */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tighter">CORREIOS</span>
              <span className="text-xs font-black uppercase bg-black text-white px-1.5 py-0.5 rounded-xs">
                PARCEIROS
              </span>
            </div>
            <div className="text-[10px] font-bold text-slate-700 tracking-wider mt-0.5">
              REDE DE LOGÍSTICA COLABORATIVA LOCAL
            </div>
          </div>

          <div className="text-right">
            <div className="inline-block border-2 border-black px-2 py-0.5 font-black text-xs uppercase bg-amber-300">
              MODAL: {order.modal === 'moto' ? 'MOTO EXPRESS' : 'CARRO UTILITÁRIO'}
            </div>
            {order.isUrgent && (
              <div className="text-[10px] font-black text-red-600 tracking-wider mt-0.5 uppercase">
                ⚡ ENTREGA URGENTE
              </div>
            )}
          </div>
        </div>

        {/* Bloco Central: QR Code + Código de Rastreamento */}
        <div className="grid grid-cols-3 gap-4 py-4 border-b-2 border-black items-center">
          <div className="col-span-1 flex flex-col items-center justify-center">
            <QRCodeViewer value={qrPayload} size={140} />
            <span className="text-[9px] text-slate-500 font-mono mt-1 text-center">
              Scan para Coleta / Baixas
            </span>
          </div>

          <div className="col-span-2 flex flex-col justify-center">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Código de Rastreamento
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-slate-900 my-1">
              {order.trackingCode}
            </div>

            {/* Simulated Barcode */}
            <div className="w-full h-8 bg-slate-900 flex items-center justify-around px-2 my-1">
              {Array.from({ length: 45 }).map((_, i) => (
                <span
                  key={i}
                  className="h-full bg-white inline-block"
                  style={{ width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1px' : '2px' }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mt-2">
              <span>PESO: {order.weightKg} kg</span>
              <span>ROTA: {order.price.distanceKm} km (~{order.price.durationMin}m)</span>
              {order.hasInsurance && (
                <span className="text-emerald-700 bg-emerald-50 px-1 border border-emerald-300 rounded text-[10px]">
                  ✓ SEGURO ATIVO
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Destinatário */}
        <div className="py-3 border-b-2 border-black bg-slate-50 p-3 my-2 rounded">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
            DESTINATÁRIO:
          </div>
          <div className="text-base font-black text-slate-950 uppercase mt-0.5">
            {order.recipient.name}
          </div>
          <div className="text-sm font-semibold text-slate-800 mt-1">
            {order.recipient.address.street}, {order.recipient.address.number}
            {order.recipient.address.complement ? ` - ${order.recipient.address.complement}` : ''}
          </div>
          <div className="text-xs text-slate-700 font-medium">
            {order.recipient.address.neighborhood} — {order.recipient.address.city}/{order.recipient.address.state}
          </div>
          <div className="text-xs font-mono font-bold text-slate-900 mt-1">
            CEP: {order.recipient.address.zipCode} | Tel: {order.recipient.phone}
          </div>
        </div>

        {/* Remetente Seguro e Verificado */}
        <div className="py-2.5 px-3 border border-dashed border-slate-400 rounded text-slate-700 text-xs bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="text-[9px] font-bold uppercase text-slate-600">
              REMETENTE:
            </div>
            <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
              ✓ REMETENTE VERIFICADO (KYC CPF + SELFIE APROVADOS)
            </span>
          </div>
          <div className="font-bold text-slate-900 mt-0.5">
            {order.sender.name} — CPF: {order.sender.document}
          </div>
          <div>
            {order.sender.address.street}, {order.sender.address.number} — {order.sender.address.neighborhood},{' '}
            {order.sender.address.city}/{order.sender.address.state} — CEP: {order.sender.address.zipCode}
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
            Declaração de Conteúdo Lícito Postal: Aceita e Vinculada via Token Digital
          </div>
        </div>


        {/* Instruções de Coleta */}
        <div className="mt-3 pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-700">
          <span>
            {order.pickupMethod === 'dropoff_point'
              ? '📦 ENTREGAR NO PONTO DE COLETA PARCEIRO'
              : '🏠 RETIRADA EM DOMICÍLIO PELO ENTREGADOR'}
          </span>
          <span className="font-mono">EMISSÃO: {new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
};
