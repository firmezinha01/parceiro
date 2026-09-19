import React, { useState, useRef } from 'react';
import { Order } from '../../types';
import { formatCurrency } from '../../services/pricingEngine';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import confetti from 'canvas-confetti';
import {
  X,
  Navigation,
  MapPin,
  Phone,
  CheckCircle2,
  ExternalLink,
  Camera,
  Bike,
  Car,
  Package,
  ArrowRight,
  ShieldCheck,
  Check,
  RotateCcw,
} from 'lucide-react';

interface CourierNavigationModalProps {
  order: Order;
  onClose: () => void;
  onPickupComplete: (orderId: string, proofPhoto?: string) => void;
  onDeliveryComplete: (orderId: string, signatureDataUrl: string, proofPhoto?: string) => void;
}

export const CourierNavigationModal: React.FC<CourierNavigationModalProps> = ({
  order,
  onClose,
  onPickupComplete,
  onDeliveryComplete,
}) => {
  // Passo 1 = A caminho da Coleta; Passo 2 = A caminho da Entrega; Passo 3 = Concluído
  const isCollected = order.status === 'in_transit' || order.status === 'delivered';
  const isFinished = order.status === 'delivered';

  const [pickupPhoto, setPickupPhoto] = useState<string | null>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [recipientNameInput, setRecipientNameInput] = useState(order.recipient.name);
  const [recipientDocInput, setRecipientDocInput] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'pickup' | 'delivery'>('pickup');
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  // Canvas de Assinatura
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Endereço alvo atual
  const currentStep = !isCollected ? 'pickup' : !isFinished ? 'delivery' : 'done';
  const targetAddress = currentStep === 'pickup' ? order.sender.address : order.recipient.address;
  const targetPerson = currentStep === 'pickup' ? order.sender : order.recipient;

  // URLs de Navegação GPS
  const formattedDestination = `${targetAddress.street}, ${targetAddress.number}, ${targetAddress.neighborhood}, ${targetAddress.city} - ${targetAddress.state}, ${targetAddress.zipCode}`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formattedDestination)}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(`${targetAddress.street}, ${targetAddress.number}, ${targetAddress.city}`)}&navigate=yes`;

  // Canvas Handlers para Assinatura do Recebedor
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirmPickup = () => {
    onPickupComplete(order.id, pickupPhoto || undefined);
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleConfirmDelivery = () => {
    const canvas = canvasRef.current;
    let signatureUrl = '';
    if (canvas && hasSignature) {
      signatureUrl = canvas.toDataURL('image/png');
    } else {
      signatureUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="35" font-family="sans-serif" font-size="16" fill="black">Assinado por ' + recipientNameInput + '</text></svg>';
    }

    onDeliveryComplete(order.id, signatureUrl, deliveryPhoto || undefined);
    confetti({ particleCount: 90, spread: 80 });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 my-0 sm:my-auto">
        {/* Header com Status do Trajeto */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <div className="font-black text-sm text-amber-400 font-mono">
                {order.trackingCode}
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {order.modal === 'moto' ? 'Moto Express' : 'Carro'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Visual: 1. Coleta ➔ 2. Entrega */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div
              className={`p-2 rounded-xl flex items-center gap-2 border transition ${
                currentStep === 'pickup'
                  ? 'bg-blue-600/30 border-blue-400 text-white font-black'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                isCollected ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-blue-500 text-white font-bold'
              }`}>
                {isCollected ? <Check className="w-3 h-3" /> : '1'}
              </div>
              <span className="truncate">1. Rumo à Coleta</span>
            </div>

            <div
              className={`p-2 rounded-xl flex items-center gap-2 border transition ${
                currentStep === 'delivery'
                  ? 'bg-emerald-600/30 border-emerald-400 text-white font-black'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                isFinished ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-300 font-bold'
              }`}>
                {isFinished ? <Check className="w-3 h-3" /> : '2'}
              </div>
              <span className="truncate">2. Rumo à Entrega</span>
            </div>
          </div>
        </div>

        {/* Corpo com Mapa & Painel de Navegação */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Valor a Receber em Destaque */}
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                Seu Repasse Desta Corrida:
              </span>
              <div className="text-xl font-black text-emerald-700 font-mono">
                {formatCurrency(order.price.totalCourierPayout)}
              </div>
            </div>
            <div className="text-right text-slate-600 text-[11px] font-mono font-medium">
              <div>{order.price.distanceKm} km no total</div>
              <div>~{order.price.durationMin} min estimados</div>
            </div>
          </div>

          {/* Mapa Esquemático de Trajeto com Ruas e Marcador */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 shadow-inner">
            <svg className="w-full h-44 sm:h-52" viewBox="0 0 600 240" preserveAspectRatio="xMidYMid slice">
              <rect width="600" height="240" fill="#f8fafc" />
              {/* Ruas simuladas */}
              <path d="M 0 80 L 600 80" stroke="#cbd5e1" strokeWidth="16" />
              <path d="M 0 160 L 600 160" stroke="#cbd5e1" strokeWidth="12" />
              <path d="M 160 0 L 160 240" stroke="#cbd5e1" strokeWidth="16" />
              <path d="M 420 0 L 420 240" stroke="#cbd5e1" strokeWidth="14" />
              
              {/* Rota traçada */}
              {currentStep === 'pickup' ? (
                <>
                  <path d="M 60 160 L 160 160 L 160 80 L 420 80" fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray="6 4" />
                  {/* Entregador */}
                  <g transform="translate(48, 148)">
                    <circle cx="12" cy="12" r="14" fill="#3b82f6" opacity="0.3" />
                    <circle cx="12" cy="12" r="8" fill="#1d4ed8" />
                  </g>
                  {/* Ponto de Coleta */}
                  <g transform="translate(408, 68)">
                    <circle cx="12" cy="12" r="14" fill="#ef4444" opacity="0.3" />
                    <circle cx="12" cy="12" r="8" fill="#dc2626" />
                  </g>
                </>
              ) : (
                <>
                  <path d="M 160 80 L 420 80 L 420 160 L 540 160" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="6 4" />
                  {/* Coleta realizada */}
                  <g transform="translate(148, 68)">
                    <circle cx="12" cy="12" r="12" fill="#3b82f6" />
                  </g>
                  {/* Destinatário */}
                  <g transform="translate(528, 148)">
                    <circle cx="12" cy="12" r="14" fill="#10b981" opacity="0.3" />
                    <circle cx="12" cy="12" r="8" fill="#059669" />
                  </g>
                </>
              )}
            </svg>

            <div className="absolute top-2.5 left-2.5 px-3 py-1 bg-slate-900/90 text-white rounded-xl backdrop-blur-xs text-[11px] font-bold flex items-center gap-1.5 shadow-md">
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {currentStep === 'pickup' ? 'Rumo ao Ponto de Coleta' : 'Rumo à Residência / Destino'}
              </span>
            </div>
          </div>

          {/* Botões para Iniciar Navegação Externa (Google Maps / Waze) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Iniciar Navegação por GPS Externo:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Navegar no Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
              </a>

              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 transition cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Navegar no Waze</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
              </a>
            </div>
          </div>

          {/* Cartão de Detalhes do Endereço Alvo */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {currentStep === 'pickup' ? 'Dados para Retirada (Remetente):' : 'Dados para Entrega (Destinatário):'}
              </span>
              <a
                href={`tel:${targetPerson.phone}`}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition"
              >
                <Phone className="w-3 h-3" />
                <span>Ligar ({targetPerson.phone})</span>
              </a>
            </div>

            <div>
              <div className="font-black text-slate-900 text-sm">{targetPerson.name}</div>
              <div className="text-slate-600 text-xs mt-0.5">
                {targetAddress.street}, {targetAddress.number}
                {targetAddress.complement ? ` - ${targetAddress.complement}` : ''}
              </div>
              <div className="text-slate-500 text-[11px]">
                {targetAddress.neighborhood} • {targetAddress.city} - {targetAddress.state} • CEP {targetAddress.zipCode}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Carga: <strong>{order.packageDescription}</strong> ({order.weightKg} kg)
              </span>
            </div>
          </div>

          {/* Seção de Check-in de Retirada (Etapa 1) */}
          {currentStep === 'pickup' && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Check-in da Coleta (Cheguei ao Ponto de Retirada)</span>
              </div>

              <p className="text-slate-600 text-[11px] leading-relaxed">
                Após chegar ao endereço do remetente e conferir o pacote físico, confirme a retirada para iniciar a rota até a entrega.
              </p>

              {pickupPhoto && (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-blue-300">
                  <img src={pickupPhoto} alt="Comprovante de coleta" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPickupPhoto(null)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCameraTarget('pickup');
                    setIsCameraOpen(true);
                  }}
                  className="py-2 px-3 rounded-xl border border-blue-300 bg-white hover:bg-blue-100 text-blue-800 font-bold flex items-center gap-1.5 transition text-xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{pickupPhoto ? 'Trocar Foto do Pacote' : 'Foto do Pacote (Opcional)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPickup}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition text-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Retirada / Check-in</span>
                </button>
              </div>
            </div>
          )}

          {/* Seção de Check-in de Entrega e Assinatura Digital (Etapa 2) */}
          {currentStep === 'delivery' && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Check-in da Entrega Final (Cheguei ao Destinatário)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Nome do Recebedor:
                  </label>
                  <input
                    type="text"
                    value={recipientNameInput}
                    onChange={(e) => setRecipientNameInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs"
                    placeholder="Nome de quem recebeu"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    RG ou CPF do Recebedor (Opcional):
                  </label>
                  <input
                    type="text"
                    value={recipientDocInput}
                    onChange={(e) => setRecipientDocInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs"
                    placeholder="Documento"
                  />
                </div>
              </div>

              {/* Assinatura na Tela */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-700 font-bold">
                  <span>Assinatura Digital do Recebedor na Tela:</span>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpar</span>
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-32 bg-white rounded-xl border-2 border-dashed border-emerald-400 cursor-crosshair touch-none"
                />
              </div>

              <button
                type="button"
                onClick={handleConfirmDelivery}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Concluir Entrega & Receber Repasse Pix</span>
              </button>
            </div>
          )}

          {/* Seção de Concluído */}
          {currentStep === 'done' && (
            <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-300">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-emerald-900">Entrega Concluída com Sucesso!</h4>
              <p className="text-xs text-emerald-700">
                O repasse de {formatCurrency(order.price.totalCourierPayout)} foi creditado na sua carteira Pix.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition"
              >
                Fechar Janela
              </button>
            </div>
          )}
        </div>

        {/* Rodapé Fixo */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition text-xs cursor-pointer"
          >
            Fechar
          </button>
          <div className="text-[11px] text-slate-500 font-medium">
            Status Atual: <strong className="uppercase text-slate-800">{order.status}</strong>
          </div>
        </div>
      </div>

      {/* Modal de Câmera */}
      {isCameraOpen && (
        <CameraCaptureModal
          title={cameraTarget === 'pickup' ? 'Foto da Encomenda Coletada' : 'Foto do Comprovante de Entrega'}
          onCapture={(photoUrl) => {
            if (cameraTarget === 'pickup') {
              setPickupPhoto(photoUrl);
            } else {
              setDeliveryPhoto(photoUrl);
            }
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
};
