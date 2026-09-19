import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchAddressByCep } from '../../services/cepService';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import {
  Store,
  MapPin,
  FileText,
  Camera,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Clock,
  Sparkles,
  X,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegisterMerchantModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegisterMerchantModal: React.FC<RegisterMerchantModalProps> = ({ onClose, onSuccess }) => {
  const { registerMerchant } = useApp();

  // Dados da Loja
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [category, setCategory] = useState('Papelaria & Conveniência');
  const [ownerName, setOwnerName] = useState('');
  const [ownerDocument, setOwnerDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [openingHours, setOpeningHours] = useState('Seg a Sex: 08h às 19h | Sáb: 08h às 14h');
  const [pixKey, setPixKey] = useState('');

  // Endereço
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [zipCode, setZipCode] = useState('');
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Documentos de Auditoria Comercial
  const [facadePhoto, setFacadePhoto] = useState<string>(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80'
  );
  const [documentPhoto, setDocumentPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=300&auto=format&fit=crop&q=80'
  );
  const [addressProofPhoto, setAddressProofPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&auto=format&fit=crop&q=80'
  );
  const [custodyTermAccepted, setCustodyTermAccepted] = useState(false);

  // Modal de Câmera Real
  const [cameraModalConfig, setCameraModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    target: 'facade' | 'document' | 'address';
    facingMode: 'user' | 'environment';
  }>({
    isOpen: false,
    title: '',
    target: 'facade',
    facingMode: 'environment',
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

    if (!custodyTermAccepted) {
      alert('Você deve aceitar o Termo de Custódia e Guarda Temporária para credenciar sua loja.');
      return;
    }

    registerMerchant({
      name,
      businessName,
      cnpj,
      category,
      ownerName,
      ownerDocument,
      phone,
      openingHours,
      pixKey,
      address: {
        street,
        number,
        neighborhood,
        city,
        state,
        zipCode,
        lat: -23.5512,
        lng: -46.6542,
      },
      facadePhoto,
      documentPhoto,
      addressProofPhoto,
      custodyTermAccepted,
    });

    confetti({ particleCount: 70, spread: 60 });
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 my-0 sm:my-auto overflow-hidden">
        {/* Header com Selo de Ponto Credenciado */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Store className="w-4 h-4" />
              <span>Credenciamento de Ponto Lojista (Drop-Off Auditado)</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg sm:text-xl font-black mt-2">Cadastrar Minha Loja como Ponto de Coleta</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Como o ponto de coleta é o intermediário que recebe fisicamente os pacotes, a plataforma exige documentação do comércio, foto da fachada e comprovante de endereço para auditoria.
          </p>

          <div className="mt-2.5 hidden sm:block">
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Remuneração de R$ 3,50 fixos por pacote movimentado + novos clientes presenciais na sua loja
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs">
          {/* Seção 1: Dados do Comércio */}
          <div className="space-y-3">
            <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <Store className="w-3.5 h-3.5 text-purple-600" />
              <span>1. Informações do Estabelecimento Comercial</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome Fantasia (Letreiro da Loja):</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Papelaria & Café Estrela"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Razão Social:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Estrela Comércio de Livros Ltda"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">CNPJ ou Certificado MEI:</label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tipo de Comércio:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="Papelaria & Conveniência">Papelaria & Conveniência</option>
                  <option value="Drogaria & Farmácia">Drogaria & Farmácia</option>
                  <option value="Banca & Revistaria">Banca & Revistaria</option>
                  <option value="Mercado & Mercearia">Mercado & Mercearia</option>
                  <option value="Cafeteria & Lanchonete">Cafeteria & Lanchonete</option>
                  <option value="Outros Serviços de Varejo">Outros Serviços de Varejo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção 2: Responsável Legal & Pix */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>2. Titular Responsável & Dados de Repasse</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome do Titular/Sócio:</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do Responsável"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">CPF do Titular:</label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={ownerDocument}
                  onChange={(e) => setOwnerDocument(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Chave Pix para Comissões:</label>
                <input
                  type="text"
                  required
                  placeholder="CNPJ, E-mail ou Telefone"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Telefone / WhatsApp Comercial:</label>
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
                <label className="block text-slate-700 font-semibold mb-1">Horário de Funcionamento:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Seg a Sex 08h às 19h"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Endereço com Busca Automática por CEP Real */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>3. Endereço Comercial Físico (com Busca por CEP Real)</span>
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
                <label className="block text-slate-700 font-semibold mb-1">Logradouro Comercial:</label>
                <input
                  type="text"
                  required
                  placeholder="Rua ou Avenida..."
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

          {/* Seção 4: Documentos de Validação com Câmera Real */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
              <span>4. Auditoria Comercial com Câmera Real (Fachada e Documentos)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Foto da Fachada da Loja */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">Fachada da Loja</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCameraModalConfig({
                        isOpen: true,
                        title: 'Tirar Foto da Fachada / Balcão da Loja',
                        target: 'facade',
                        facingMode: 'environment',
                      })
                    }
                    className="text-[10px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-0.5"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Câmera</span>
                  </button>
                </div>
                <div className="h-20 rounded-lg overflow-hidden border border-slate-300 bg-slate-200">
                  <img src={facadePhoto} alt="Fachada da Loja" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Documento do Titular */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">Documento Titular</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCameraModalConfig({
                        isOpen: true,
                        title: 'Fotografar Documento do Titular (RG/CNH)',
                        target: 'document',
                        facingMode: 'environment',
                      })
                    }
                    className="text-[10px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-0.5"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Câmera</span>
                  </button>
                </div>
                <div className="h-20 rounded-lg overflow-hidden border border-slate-300 bg-slate-200">
                  <img src={documentPhoto} alt="Documento do Titular" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Comprovante de Endereço Comercial */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">Comprovante Endereço</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCameraModalConfig({
                        isOpen: true,
                        title: 'Fotografar Comprovante de Endereço / CNPJ',
                        target: 'address',
                        facingMode: 'environment',
                      })
                    }
                    className="text-[10px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-0.5"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Câmera</span>
                  </button>
                </div>
                <div className="h-20 rounded-lg overflow-hidden border border-slate-300 bg-slate-200">
                  <img src={addressProofPhoto} alt="Comprovante de Endereço" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 5: Termo de Custódia */}
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
            <div className="flex items-center gap-2 text-purple-950 font-bold">
              <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
              <span>Termo de Custódia e Guarda Temporária:</span>
            </div>
            <p className="text-purple-900 leading-relaxed text-[11px]">
              O estabelecimento parceiro compromete-se a armazenar os pacotes recebidos em local seco, seguro e sob vigilância, liberando os mesmos exclusivamente mediante conferência do QR Code pelo entregador ou cliente cadastrado.
            </p>
            <label className="flex items-center gap-2 pt-1 cursor-pointer font-bold text-purple-950">
              <input
                type="checkbox"
                required
                checked={custodyTermAccepted}
                onChange={(e) => setCustodyTermAccepted(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded"
              />
              <span>Concordo com os Termos de Credenciamento e Custódia</span>
            </label>
          </div>

          {/* Botões de Ação Sticky */}
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
              className="flex-2 py-3 px-3 sm:px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer text-xs sm:text-sm"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Concluir Credenciamento do Ponto</span>
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
            if (cameraModalConfig.target === 'facade') {
              setFacadePhoto(photoUrl);
            } else if (cameraModalConfig.target === 'document') {
              setDocumentPhoto(photoUrl);
            } else {
              setAddressProofPhoto(photoUrl);
            }
          }}
          onClose={() => setCameraModalConfig((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
};
