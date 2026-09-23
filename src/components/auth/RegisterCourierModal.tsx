import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleModal } from '../../types';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import {
  Bike,
  Car,
  Camera,
  ShieldCheck,
  CheckCircle2,
  FileText,
  DollarSign,
  Sparkles,
  X,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegisterCourierModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegisterCourierModal: React.FC<RegisterCourierModalProps> = ({ onClose, onSuccess }) => {
  const { registerCourier } = useApp();

  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [cnh, setCnh] = useState('');
  const [phone, setPhone] = useState('');
  const [modal, setModal] = useState<VehicleModal>('moto');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [pixKey, setPixKey] = useState('');

  // Documentos e Biometria
  const [documentPhoto, setDocumentPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=300&auto=format&fit=crop&q=80'
  );
  const [selfiePhoto, setSelfiePhoto] = useState<string>(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  );
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Modal de Câmera Real
  const [cameraModalConfig, setCameraModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    target: 'selfie' | 'document';
    facingMode: 'user' | 'environment';
  }>({
    isOpen: false,
    title: '',
    target: 'selfie',
    facingMode: 'user',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      alert('Você deve aceitar os Termos de Prestação de Serviços de Entregas.');
      return;
    }

    registerCourier({
      name,
      document,
      cnh,
      phone,
      modal,
      vehiclePlate,
      vehicleModel,
      avatarUrl: selfiePhoto,
      pixKey,
      documentPhoto,
      selfiePhoto,
    });

    confetti({ particleCount: 70, spread: 60 });
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 my-0 sm:my-auto overflow-hidden">
        {/* Header com Selo de Credenciamento */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Bike className="w-4 h-4" />
              <span>Cadastro de Entregador Parceiro (Moto / Carro)</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg sm:text-xl font-black mt-2">Quero ser um Entregador Credenciado</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Cadastro simplificado com identificação via CPF, CNH e validação biométrica (selfie). Repasse justo por componente (65% base, 85% km, 75% tempo).
          </p>

          <div className="mt-2.5 hidden sm:block">
            <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Receba repasses imediatos via Pix direto na sua conta bancária a cada entrega realizada
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs">
          {/* Seção 1: Dados Pessoais & Habilitação */}
          <div className="space-y-3">
            <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>1. Identificação do Motorista / Entregador</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">CPF:</label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">CNH (com categoria):</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 04981928312 (Cat. A)"
                  value={cnh}
                  onChange={(e) => setCnh(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Telefone / WhatsApp:</label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 90000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Modal e Dados do Veículo */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <Bike className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Modal de Atuação & Veículo</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModal('moto')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                  modal === 'moto'
                    ? 'border-amber-500 bg-amber-50 font-bold text-slate-900 ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Bike className="w-5 h-5 text-amber-600" />
                <div>
                  <div>Moto Express</div>
                  <div className="text-[10px] text-slate-500 font-normal">Pacotes até 2 kg</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setModal('car')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                  modal === 'car'
                    ? 'border-amber-500 bg-amber-50 font-bold text-slate-900 ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Car className="w-5 h-5 text-indigo-600" />
                <div>
                  <div>Carro / Utilitário</div>
                  <div className="text-[10px] text-slate-500 font-normal">Caixas até 20 kg</div>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Placa do Veículo:</label>
                <input
                  type="text"
                  required
                  placeholder="BRA-1A23"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Modelo / Ano:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Honda CG 160 Fan"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Chave Pix para Saques:</label>
                <input
                  type="text"
                  required
                  placeholder="CPF, E-mail ou Telefone"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Validação com Câmera Real (Foto da CNH e Selfie Facial) */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <Camera className="w-3.5 h-3.5 text-purple-600" />
              <span>3. Validação de Segurança com Câmera Real (CNH e Selfie Facial)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">Foto da CNH Aberta</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCameraModalConfig({
                        isOpen: true,
                        title: 'Fotografar CNH Aberta',
                        target: 'document',
                        facingMode: 'environment',
                      })
                    }
                    className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Câmera</span>
                  </button>
                </div>
                <div className="h-24 rounded-lg overflow-hidden border border-slate-300 bg-slate-200">
                  <img src={documentPhoto} alt="CNH" className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-slate-500">Documento original nítido e válido.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">Selfie do Entregador</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCameraModalConfig({
                        isOpen: true,
                        title: 'Tirar Selfie Facial em Tempo Real',
                        target: 'selfie',
                        facingMode: 'user',
                      })
                    }
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Tirar Selfie</span>
                  </button>
                </div>
                <div className="h-24 rounded-lg overflow-hidden border border-slate-300 bg-slate-200">
                  <img src={selfiePhoto} alt="Selfie" className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-slate-500">Foto nítida para confirmação nas entregas.</p>
              </div>
            </div>
          </div>

          {/* Termo */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-slate-800 text-[11px] space-y-1.5">
            <p className="font-bold text-amber-950">
              Compromisso de Entrega & Repasse por Componente:
            </p>
            <p className="text-slate-600">
              Concordo com os percentuais de <strong>65% da taxa base</strong>, <strong>85% do valor por km</strong> e <strong>75% do valor por tempo</strong>, com pagamento automático creditado após a comprovação da entrega via QR Code e assinatura.
            </p>
            <label className="flex items-center gap-2 pt-1 cursor-pointer font-bold text-slate-900">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 accent-amber-600 rounded"
              />
              <span>Li e aceito os termos do programa Parceiro</span>
            </label>
          </div>

          {/* Ações Sticky */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-slate-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 shrink-0 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-3 sm:px-4 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition text-xs sm:text-sm cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-3 sm:px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-amber-500/30 transition cursor-pointer text-xs sm:text-sm"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Concluir Cadastro de Entregador</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Câmera Real */}
      {cameraModalConfig.isOpen && (
        <CameraCaptureModal
          title={cameraModalConfig.title}
          facingMode={cameraModalConfig.facingMode}
          onCapture={(photoUrl) => {
            if (cameraModalConfig.target === 'selfie') {
              setSelfiePhoto(photoUrl);
            } else {
              setDocumentPhoto(photoUrl);
            }
          }}
          onClose={() => setCameraModalConfig((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
};
