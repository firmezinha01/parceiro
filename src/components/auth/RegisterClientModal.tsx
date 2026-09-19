import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchAddressByCep } from '../../services/cepService';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import {
  ShieldCheck,
  User,
  MapPin,
  Camera,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  Upload,
  Sparkles,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegisterClientModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegisterClientModal: React.FC<RegisterClientModalProps> = ({ onClose, onSuccess }) => {
  const { registerClient } = useApp();

  // Dados Pessoais
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('1994-06-18');

  // Endereço
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [zipCode, setZipCode] = useState('');
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Documentos & Biometria (KYC)
  const [documentPhoto, setDocumentPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=300&auto=format&fit=crop&q=80'
  );
  const [selfiePhoto, setSelfiePhoto] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  );
  const [contentDeclarationAccepted, setContentDeclarationAccepted] = useState(false);

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

  // Busca Automática de CEP Real via ViaCEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setZipCode(val);
    const clean = val.replace(/\D/g, '');

    if (clean.length === 8) {
      setIsLoadingCep(true);
      const res = await fetchAddressByCep(clean);
      setIsLoadingCep(false);
      if (res && !res.error) {
        if (res.street) setStreet(res.street);
        if (res.neighborhood) setNeighborhood(res.neighborhood);
        if (res.city) setCity(res.city);
        if (res.state) setState(res.state);
      }
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!contentDeclarationAccepted) {
      alert('Você deve aceitar a Declaração de Conteúdo e Termo de Responsabilidade para enviar encomendas.');
      return;
    }

    registerClient({
      name,
      document,
      email,
      phone,
      birthDate,
      defaultAddress: {
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        zipCode,
        lat: -23.5558,
        lng: -46.6612,
      },
      documentPhoto,
      selfiePhoto,
      contentDeclarationAccepted,
    });

    confetti({ particleCount: 70, spread: 60 });
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 my-0 sm:my-auto overflow-hidden">
        {/* Header com Selo de Segurança */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Cadastro Seguro do Cliente (KYC)</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg sm:text-xl font-black mt-2">Criar Perfil de Remetente Verificado</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Para a segurança dos entregadores parceiros, todos os clientes remetentes passam por validação documental e assinam o termo de conteúdo lícito.
          </p>

          <div className="mt-2.5 hidden sm:block">
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Garante ao entregador parceiro que a encomenda possui remetente identificado e carga lícita
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs">
          {/* Seção 1: Dados Pessoais */}
          <div className="space-y-3">
            <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>1. Dados de Identificação do Remetente</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">CPF (com validação):</label>
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

              <div>
                <label className="block text-slate-700 font-semibold mb-1">E-mail para Recibos:</label>
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Endereço Padrão com Busca por CEP Real */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>2. Endereço Principal (com Busca Automática de CEP)</span>
              </div>
              {isLoadingCep && (
                <span className="text-[10px] text-blue-600 font-semibold animate-pulse">
                  Buscando CEP nos Correios...
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">CEP (Busca Real):</label>
                <input
                  type="text"
                  required
                  placeholder="00000-000"
                  value={zipCode}
                  onChange={handleCepChange}
                  className="w-full px-3 py-2 bg-blue-50/60 border border-blue-300 rounded-xl font-mono font-bold"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Logradouro (Rua/Avenida):</label>
                <input
                  type="text"
                  required
                  placeholder="Rua, Avenida..."
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Número:</label>
                <input
                  type="text"
                  required
                  placeholder="123"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bairro:</label>
                <input
                  type="text"
                  required
                  placeholder="Bairro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cidade / UF:</label>
                <input
                  type="text"
                  required
                  placeholder="Cidade"
                  value={`${city} - ${state}`}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Validação com Câmera Real (Selfie & Documento) */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <Camera className="w-3.5 h-3.5 text-purple-600" />
              <span>3. Comprovação de Identidade com Câmera Real (Webcam / Celular)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Foto do Documento */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Foto do Documento (RG/CNH)</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCameraModalConfig({
                        isOpen: true,
                        title: 'Fotografar Documento (RG ou CNH)',
                        target: 'document',
                        facingMode: 'environment',
                      })
                    }
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Usar Câmera</span>
                  </button>
                </div>
                <div className="h-28 rounded-xl overflow-hidden border border-slate-300 bg-slate-200">
                  <img src={documentPhoto} alt="Documento" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Selfie de Biometria */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Selfie Facial</span>
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
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Tirar Selfie Agora</span>
                  </button>
                </div>
                <div className="h-28 rounded-xl overflow-hidden border border-slate-300 bg-slate-200">
                  <img src={selfiePhoto} alt="Selfie" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 4: Declaração Formal de Conteúdo e Responsabilidade Legal */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Declaração de Conteúdo & Respaldo ao Entregador:</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              Declaro sob as penas da lei que todas as encomendas enviadas por mim contêm produtos de procedência lícita, não contendo substâncias ilícitas, entorpecentes, armas de fogo, inflamáveis, dinheiro em espécie não declarado ou quaisquer artigos proibidos pelo Código Postal Brasileiro, isentando o entregador parceiro de qualquer dolo.
            </p>
            <label className="flex items-center gap-2 pt-1 cursor-pointer font-bold text-slate-900">
              <input
                type="checkbox"
                required
                checked={contentDeclarationAccepted}
                onChange={(e) => setContentDeclarationAccepted(e.target.checked)}
                className="w-4 h-4 accent-amber-600 rounded"
              />
              <span>Li e aceito a Declaração de Conteúdo e Termos de Transporte</span>
            </label>
          </div>

          {/* Botões de Ação Fixos no Rodapé */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-slate-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 shrink-0 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 sm:py-3 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 sm:py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition cursor-pointer text-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir Cadastro Seguro (KYC)</span>
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
