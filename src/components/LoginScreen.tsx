import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown, Sparkles, ShieldCheck, Truck, Package, ArrowRight } from 'lucide-react';
import { sound } from '../sound';

interface LoginScreenProps {
  onLogin: (phone: string, password?: string) => void;
  onGoToDriverRegister: () => void;
  onGoToClientRegister: () => void;
  roleChoiceModal?: {
    isOpen: boolean;
    onSelectRole: (role: 'driver' | 'client') => void;
  };
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onGoToDriverRegister,
  onGoToClientRegister,
  roleChoiceModal,
}) => {
  const [phone, setPhone] = useState('11984352781');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+55');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const isValid = phone.trim().length >= 8 && password.trim().length >= 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    sound.playClick();
    onLogin(phone.trim(), password.trim());
  };

  const handleSendResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[840px] sm:rounded-[40px] shadow-2xl flex flex-col justify-between overflow-hidden relative border-0 sm:border-[8px] sm:border-zinc-800">
        
        {/* Top Content */}
        <div className="flex-1 flex flex-col">
          
          {/* Header Brand */}
          <div className="pt-6 px-6 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-sm overflow-hidden shrink-0 border border-orange-500/20">
                <img 
                  src="/logo-character.png" 
                  alt="Parceiro Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="font-black text-xl tracking-tight text-gray-900 flex items-center">
                <span className="text-[#0e3b6e]">PAR</span>
                <span className="text-lala-orange">CEIRO</span>
              </h1>
            </div>
            <span className="bg-orange-50 text-lala-orange text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-orange-200 uppercase tracking-wider">
              Acesso Único
            </span>
          </div>

          {/* Hero Illustration */}
          <div className="relative w-full h-52 px-4 flex items-end justify-center overflow-hidden">
            {/* City Silhouette Background */}
            <svg 
              className="absolute bottom-0 inset-x-0 w-full h-28 opacity-20 text-gray-400 pointer-events-none" 
              viewBox="0 0 500 150" 
              preserveAspectRatio="none" 
              fill="currentColor"
            >
              <path d="M0,150 L0,80 L20,80 L20,60 L45,60 L45,85 L70,85 L70,40 L100,40 L100,85 L130,85 L130,30 L160,30 L160,70 L180,70 L180,50 L210,50 L210,90 L240,90 L240,20 L270,20 L270,75 L300,75 L300,45 L330,45 L330,90 L360,90 L360,60 L390,60 L390,85 L420,85 L420,35 L450,35 L450,75 L480,75 L480,55 L500,55 L500,150 Z" />
            </svg>

            {/* Mascot in Delivery Vehicle */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative">
                <img 
                  src="/logo-character.png" 
                  alt="Mascote Parceiro Entregas" 
                  className="h-40 object-contain filter drop-shadow-xl transform hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="px-6 pt-2 space-y-3.5">
            
            {/* Phone Number Input */}
            <div className="border border-gray-200 rounded-2xl p-2.5 focus-within:border-lala-orange focus-within:ring-2 focus-within:ring-orange-100 transition-all bg-white shadow-sm">
              <label className="text-[11px] font-semibold text-gray-500 block px-1">
                Número de celular
              </label>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1 text-gray-800 font-bold text-sm px-1 shrink-0 cursor-pointer">
                  <span>{countryCode}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div className="h-5 w-[1px] bg-gray-200" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="11984352781"
                  className="w-full text-sm font-semibold text-gray-900 bg-transparent focus:outline-none placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="border border-gray-200 rounded-2xl p-2.5 focus-within:border-lala-orange focus-within:ring-2 focus-within:ring-orange-100 transition-all bg-white shadow-sm flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <label className="text-[11px] font-semibold text-gray-500 block px-1">
                  Senha
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm font-semibold text-gray-900 bg-transparent focus:outline-none px-1"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 p-1.5 shrink-0 transition-colors"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Forgot password link */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowForgotModal(true);
                }}
                className="text-xs font-bold text-lala-orange hover:text-lala-orangeDark transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={!isValid}
                className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.98] ${
                  isValid
                    ? 'bg-gradient-to-r from-lala-orange to-lala-orangeDark hover:brightness-105 text-white shadow-orange-500/30'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                Iniciar sessão
              </button>

              {/* Registration Options Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Novo por aqui? Cadastre-se:
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Button: Register as Driver */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onGoToDriverRegister();
                }}
                className="w-full py-3 rounded-2xl border-2 border-lala-orange bg-white hover:bg-orange-50/60 active:scale-[0.98] text-lala-orange font-black text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Cadastre-se como motorista parceiro</span>
              </button>

              {/* Button: Register as Client */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onGoToClientRegister();
                }}
                className="w-full py-3 rounded-2xl border-2 border-emerald-600 bg-white hover:bg-emerald-50/60 active:scale-[0.98] text-emerald-700 font-black text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>Cadastre-se como cliente</span>
              </button>
            </div>

          </form>

        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="text-[11px] text-gray-400 font-medium">
            <span className="hover:underline cursor-pointer">Termos e Condições</span>
            {' • '}
            <span className="hover:underline cursor-pointer">Política de Privacidade</span>
          </p>
        </div>

      </div>

      {/* Role Selection Modal (If user is registered as BOTH Driver and Client) */}
      {roleChoiceModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-lala-orange flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-black text-base text-gray-900">Dois Perfis Identificados!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Seu número possui cadastro ativo tanto como <b>Motorista Parceiro</b> quanto como <b>Cliente Solicitante</b>.
              </p>
              <p className="text-xs font-bold text-gray-700 mt-2">
                Como você deseja entrar hoje?
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  roleChoiceModal.onSelectRole('driver');
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-lala-orange hover:bg-lala-orangeDark text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-between shadow-md active:scale-95 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  <span>Entrar como Motorista</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  roleChoiceModal.onSelectRole('client');
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-between shadow-md active:scale-95 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span>Entrar como Cliente</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-sm text-gray-900">Recuperar Senha</h3>
              <button 
                onClick={() => setShowForgotModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {forgotSent ? (
              <div className="py-6 text-center space-y-2">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-gray-900">Código Enviado!</h4>
                <p className="text-xs text-gray-500">
                  Enviamos um SMS com as instruções para redefinir sua senha.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendResetCode} className="space-y-3">
                <p className="text-xs text-gray-500">
                  Informe o seu número de celular para enviarmos o código de recuperação por SMS:
                </p>
                <input
                  type="tel"
                  required
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  placeholder="(11) 98435-2781"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-lala-orange focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-lala-orange hover:bg-lala-orangeDark text-white font-bold text-xs"
                >
                  Enviar Código por SMS
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
