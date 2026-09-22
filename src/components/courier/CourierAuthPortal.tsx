import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleModal } from '../../types';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import {
  Bike,
  Car,
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  ArrowRight,
  Sparkles,
  Phone,
  CreditCard,
  Camera,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CourierAuthPortalProps {
  onBackToMain?: () => void;
}

export const CourierAuthPortal: React.FC<CourierAuthPortalProps> = () => {
  const {
    loginCourier,
    registerCourier,
    couriers,
    selectCourierSession,
    isCloudConnected,
  } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Formulário de Login
  const [loginCredential, setLoginCredential] = useState('');
  const [loginPassword, setLoginPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Formulário de Cadastro de Novo Parceiro
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [document, setDocument] = useState('');
  const [cnh, setCnh] = useState('');
  const [phone, setPhone] = useState('');
  const [modal, setModal] = useState<VehicleModal>('moto');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Fotos de Documento e Selfie
  const [documentPhoto, setDocumentPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=300&auto=format&fit=crop&q=80'
  );
  const [selfiePhoto, setSelfiePhoto] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  // Modal de Câmera
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    try {
      const res = await loginCourier(loginCredential, loginPassword);
      if (!res.success) {
        setLoginError(res.message || 'Erro ao realizar login.');
      } else {
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch {
      setLoginError('Não foi possível conectar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!name || !document || !cnh || !vehiclePlate) {
      alert('Por favor, preencha os campos obrigatórios (Nome, CPF, CNH e Placa).');
      return;
    }

    if (!termsAccepted) {
      alert('É necessário aceitar os termos de prestação de serviços para se cadastrar.');
      return;
    }

    registerCourier({
      name,
      email,
      password: password || '1234',
      document,
      cnh,
      phone,
      modal,
      vehiclePlate: vehiclePlate.toUpperCase(),
      vehicleModel,
      avatarUrl: selfiePhoto,
      pixKey: pixKey || email || document,
      documentPhoto,
      selfiePhoto,
    });

    confetti({ particleCount: 70, spread: 70 });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* Barra Superior Discreta */}
      <header className="p-4 border-b border-slate-900 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight flex items-center gap-1.5 text-white">
              Correios Parceiros
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                App do Entregador
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Portal Independente de Operações e Corridas</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isCloudConnected ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold" title="Banco Supabase Conectado em Tempo Real">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Nuvem Ativa</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold" title="Operando localmente. Configure VITE_SUPABASE_URL na Vercel para sincronizar entre aparelhos.">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Modo Local</span>
            </span>
          )}
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 flex flex-col justify-center">
        {/* Dica de Instalação no Celular / Baixar App */}
        <div className="mb-4 p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shrink-0 shadow-md">
            📲
          </div>
          <div className="text-xs">
            <strong className="text-white block font-bold">Baixar o App no seu Celular:</strong>
            <span className="text-slate-300 text-[11px] leading-relaxed block">
              No navegador, toque em Compartilhar (ou no menu ⋮) e selecione <strong>"Adicionar à Tela de Início"</strong> para instalar o App.
            </span>
          </div>
        </div>

        {/* Card Principal */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Abas de Modo (Login / Cadastro) */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
            <button
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Entrar no App</span>
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setLoginError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Novo Parceiro</span>
            </button>
          </div>

          {/* ========================================================
              MODO 1: LOGIN DO ENTREGADOR
          ======================================================== */}
          {authMode === 'login' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-white">Área Exclusiva do Entregador</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Acesse com seu CPF ou E-mail para receber chamados na sua região.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    CPF ou E-mail do Entregador
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Ex: 382.910.482-10 ou marcos.moto@entregas.com"
                      value={loginCredential}
                      onChange={(e) => setLoginCredential(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Senha de Acesso
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua senha de entregador"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Autenticando...' : 'Acessar Meu Painel de Corridas'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* SEÇÃO DE TESTE RÁPIDO COM 1 CLIQUE */}
              <div className="pt-4 border-t border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 text-center">
                  ⚡ Atalhos de Teste — Entrar com 1 Clique:
                </span>

                <div className="grid grid-cols-1 gap-2">
                  {couriers.slice(0, 2).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => selectCourierSession(c.id)}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/40 rounded-xl flex items-center justify-between text-left transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={c.avatarUrl}
                          alt={c.name}
                          className="w-8 h-8 rounded-lg object-cover border border-amber-400/50"
                        />
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-amber-400 flex items-center gap-1.5">
                            {c.name}
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                              {c.modal}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {c.vehicleModel || c.vehiclePlate} • R$ {c.balanceAvailable.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                        <span>Acessar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              MODO 2: CADASTRO DE NOVO ENTREGADOR PARCEIRO
          ======================================================== */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-white">Quero ser Entregador Parceiro</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cadastre seu veículo e receba pagamentos por componente diretamente via Pix.
                </p>
              </div>

              {/* Escolha do Modal */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Selecione seu Modal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModal('moto')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                      modal === 'moto'
                        ? 'border-amber-400 bg-amber-400/10 text-amber-400 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Bike className="w-5 h-5" />
                    <span className="text-xs">Motocicleta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal('car')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                      modal === 'car'
                        ? 'border-amber-400 bg-amber-400/10 text-amber-400 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Car className="w-5 h-5" />
                    <span className="text-xs">Carro / Utilitário</span>
                  </button>
                </div>
              </div>

              {/* Dados Pessoais */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: João da Silva Santos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={document}
                      onChange={(e) => setDocument(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      CNH *
                    </label>
                    <input
                      type="text"
                      placeholder="Nº da CNH"
                      value={cnh}
                      onChange={(e) => setCnh(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      WhatsApp / Celular
                    </label>
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Placa do Veículo *
                    </label>
                    <input
                      type="text"
                      placeholder="ABC-1D23"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Modelo do Veículo
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Honda Fan 160"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Chave Pix para Recebimento de Corridas
                  </label>
                  <input
                    type="text"
                    placeholder="Chave CPF, E-mail ou Telefone"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Botões de Foto de CNH e Selfie */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setCameraModalConfig({
                      isOpen: true,
                      title: 'Foto da CNH (Frente e Verso)',
                      target: 'document',
                      facingMode: 'environment',
                    })
                  }
                  className="p-2 bg-slate-950 border border-slate-800 hover:border-amber-400/50 rounded-xl flex items-center justify-center gap-1.5 text-xs text-slate-300 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Foto CNH</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCameraModalConfig({
                      isOpen: true,
                      title: 'Selfie de Biometria',
                      target: 'selfie',
                      facingMode: 'user',
                    })
                  }
                  className="p-2 bg-slate-950 border border-slate-800 hover:border-amber-400/50 rounded-xl flex items-center justify-center gap-1.5 text-xs text-slate-300 cursor-pointer"
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Selfie</span>
                </button>
              </div>

              {/* Termos */}
              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                />
                <span className="text-[11px] text-slate-400 leading-tight">
                  Declaro que possuo CNH válida e aceito os Termos de Prestação de Serviços como Entregador Parceiro Autônomo.
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <span>Concluir Credenciamento e Iniciar</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Modal de Câmera */}
      {cameraModalConfig.isOpen && (
        <CameraCaptureModal
          title={cameraModalConfig.title}
          facingMode={cameraModalConfig.facingMode}
          onClose={() => setCameraModalConfig((prev) => ({ ...prev, isOpen: false }))}
          onCapture={(photoDataUrl) => {
            if (cameraModalConfig.target === 'selfie') {
              setSelfiePhoto(photoDataUrl);
            } else {
              setDocumentPhoto(photoDataUrl);
            }
            setCameraModalConfig((prev) => ({ ...prev, isOpen: false }));
          }}
        />
      )}

      {/* Footer */}
      <footer className="p-4 text-center text-[11px] text-slate-500 border-t border-slate-900">
        Correios Parceiros • Aplicativo Exclusivo para Entregadores Credenciados
      </footer>
    </div>
  );
};
