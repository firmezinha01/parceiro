import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown, Sparkles, ShieldCheck } from 'lucide-react';
import { sound } from '../sound';

interface LoginScreenProps {
  onLogin: (phone: string) => void;
  onGoToRegister: () => void;
  onSwitchToClient?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onGoToRegister,
  onSwitchToClient,
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
    onLogin(phone.trim());
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
              Motorista
            </span>
          </div>

          {/* Hero Illustration */}
          <div className="relative w-full h-56 px-4 flex items-end justify-center overflow-hidden">
            {/* City Silhouette Background */}
            <svg 
              className="absolute bottom-0 inset-x-0 w-full h-32 opacity-20 text-gray-400 pointer-events-none" 
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
                  className="h-44 object-contain filter drop-shadow-xl transform hover:scale-105 transition-transform"
                />
                {/* Speed lines */}
                <div className="absolute left-[-20px] top-1/2 flex flex-col gap-1.5 opacity-60">
                  <div className="w-6 h-1 bg-lala-orange rounded-full animate-pulse" />
                  <div className="w-10 h-1 bg-lala-orange rounded-full" />
                  <div className="w-4 h-1 bg-lala-orange rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="px-6 pt-3 space-y-4">
            
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
            <div className="space-y-3 pt-4">
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

              {/* Secondary Register Button */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onGoToRegister();
                }}
                className="w-full py-3.5 rounded-2xl border-2 border-lala-orange bg-white hover:bg-orange-50/60 active:scale-[0.98] text-lala-orange font-black text-sm tracking-wide transition-all shadow-sm"
              >
                Cadastre-se como motorista parceiro
              </button>

              {/* Client Mode Switcher Button */}
              {onSwitchToClient && (
                <div className="pt-2">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">ou para enviar</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onSwitchToClient();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black active:scale-[0.98] text-white font-extrabold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>📦</span>
                    <span>Solicitar Entrega como Cliente</span>
                  </button>
                </div>
              )}
            </div>

          </form>

        </div>

        {/* Footer */}
        <div className="p-5 text-center">
          <p className="text-[11px] text-gray-400 font-medium">
            <span className="hover:underline cursor-pointer">Termos e Condições</span>
            {' • '}
            <span className="hover:underline cursor-pointer">Política de Privacidade</span>
          </p>
        </div>

      </div>

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
