import React, { useState } from 'react';
import { 
  ShieldCheck, Car, User, Camera, Upload, CheckCircle2, 
  ArrowRight, ArrowLeft, AlertCircle, FileText, Smartphone, Sparkles, Loader2 
} from 'lucide-react';
import { VehicleType, DriverProfile } from '../types';
import { sound } from '../sound';

interface RegistrationFlowProps {
  onCompleteRegistration: (driverData: any) => void;
}

export const RegistrationFlow: React.FC<RegistrationFlowProps> = ({
  onCompleteRegistration,
}) => {
  const [step, setStep] = useState<number>(1); // 1: Personal, 2: Vehicle, 3: Documents, 4: Verification

  // Step 1: Personal info
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pixKey, setPixKey] = useState('');

  // Step 2: Vehicle info
  const [vehicleType, setVehicleType] = useState<VehicleType>('fiorino');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleYear, setVehicleYear] = useState('2022');

  // Step 3: Documents
  const [cnhNumber, setCnhNumber] = useState('');
  const [cnhPhoto, setCnhPhoto] = useState<string | null>(null);
  const [crlvPhoto, setCrlvPhoto] = useState<string | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);

  // Step 4: Verification analysis state
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStepText, setVerificationStepText] = useState('Iniciando análise dos dados...');
  const [isApproved, setIsApproved] = useState(false);

  // Vehicle default suggestions
  const defaultModels: Record<VehicleType, string> = {
    moto: 'Honda CG 160 Cargo',
    carro: 'Chevrolet Onix Plus',
    fiorino: 'Fiat Fiorino 1.4 EVO',
    van: 'Renault Master Furgão',
    carreto: 'Toyota Hilux Cabine Simples',
    caminhao: 'Mercedes-Benz Accelo 815',
  };

  const handleSelectVehicleType = (type: VehicleType) => {
    sound.playClick();
    setVehicleType(type);
    if (!vehicleModel || Object.values(defaultModels).includes(vehicleModel)) {
      setVehicleModel(defaultModels[type]);
    }
  };

  // Simulates uploading a photo
  const handlePhotoUpload = (type: 'cnh' | 'crlv' | 'selfie') => {
    sound.playClick();
    // Simulating instant captured photo or mock file
    const samplePhotoUrl = 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80';
    if (type === 'cnh') setCnhPhoto(samplePhotoUrl);
    if (type === 'crlv') setCrlvPhoto(samplePhotoUrl);
    if (type === 'selfie') setSelfiePhoto(samplePhotoUrl);
  };

  // Start document analysis
  const startVerificationAnalysis = () => {
    sound.playClick();
    setStep(4);
    setVerificationProgress(15);
    setVerificationStepText('Consultando situação cadastral do CPF e CNH...');

    setTimeout(() => {
      setVerificationProgress(45);
      setVerificationStepText('Validando CRLV do veículo junto aos órgãos reguladores...');
    }, 1500);

    setTimeout(() => {
      setVerificationProgress(75);
      setVerificationStepText('Checando biometria facial e conformidade de segurança...');
    }, 3000);

    setTimeout(() => {
      setVerificationProgress(100);
      setVerificationStepText('Cadastro averiguado e aprovado com sucesso!');
      setIsApproved(true);
      sound.playCashSuccess();
    }, 4500);
  };

  const handleFinishAndEnter = () => {
    sound.playClick();
    onCompleteRegistration({
      name: name.trim() || 'Motorista Parceiro',
      phone: phone.trim() || '(11) 98765-4321',
      email: email.trim() || 'motorista@parceiro.com',
      cpf: cpf.trim() || '123.456.789-00',
      pix_key: pixKey.trim() || phone || 'parceiro@pix.com.br',
      vehicle_type: vehicleType,
      vehicle_model: vehicleModel.trim() || defaultModels[vehicleType],
      vehicle_plate: vehiclePlate.trim().toUpperCase() || 'BRA-2E19',
      cnh_number: cnhNumber.trim() || '01234567890',
      avatar_url: selfiePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      is_online: true,
      wallet_balance: 0.00,
      today_earnings: 0.00,
      week_earnings: 0.00,
      rating: 5.0,
      total_trips: 0,
      acceptance_rate: 100,
      verification_status: 'approved',
      is_verified: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[840px] sm:rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border-[8px] sm:border-zinc-800">
        
        {/* Header */}
        <div className="bg-lala-charcoal text-white p-5 sticky top-0 z-20 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white p-0.5 flex items-center justify-center shadow overflow-hidden shrink-0 border border-orange-500/30">
                <img src="/logo-character.png" alt="Parceiro" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-black text-sm tracking-tight flex items-center">
                  <span>PAR</span><span className="text-lala-orange">CEIRO</span>
                </h1>
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">
                  Cadastro de Novo Motorista
                </span>
              </div>
            </div>

            <div className="bg-white/10 px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-300">
              Passo {step} de 4
            </div>
          </div>

          {/* Stepper Progress indicator */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-lala-orange' : 'bg-zinc-700'}`} />
            <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-lala-orange' : 'bg-zinc-700'}`} />
            <div className={`h-1.5 rounded-full ${step >= 3 ? 'bg-lala-orange' : 'bg-zinc-700'}`} />
            <div className={`h-1.5 rounded-full ${step >= 4 ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 overflow-y-auto">
          
          {/* STEP 1: Personal Data */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-gray-900">Seus Dados Pessoais</h2>
                <p className="text-xs text-gray-500">
                  Cadastre-se para começar a receber corridas de entrega com o Parceiro.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Alberto da Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-lala-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">CPF</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-lala-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Celular / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-lala-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-lala-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Chave Pix para Saques</label>
                  <input
                    type="text"
                    required
                    placeholder="CPF, E-mail ou Telefone Pix"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-lala-orange focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    Os ganhos das suas entregas poderão ser transferidos na hora para essa chave Pix.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!name) {
                    alert('Por favor, informe seu nome completo.');
                    return;
                  }
                  sound.playClick();
                  setStep(2);
                }}
                className="w-full py-4 rounded-2xl bg-lala-orange hover:bg-lala-orangeDark active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all mt-4"
              >
                <span>Avançar para Veículo</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 2: Vehicle Data */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-gray-900">Seu Veículo de Trabalho</h2>
                <p className="text-xs text-gray-500">
                  Selecione a categoria e os dados do veículo que você utilizará para as entregas.
                </p>
              </div>

              {/* Vehicle Type Selection Cards */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'moto', label: 'Moto', icon: '🏍️', desc: 'Até 20kg' },
                  { type: 'carro', label: 'Carro Comum', icon: '🚗', desc: 'Até 50kg' },
                  { type: 'fiorino', label: 'Fiorino / Utilitário', icon: '🚐', desc: 'Até 650kg' },
                  { type: 'van', label: 'Van de Carga', icon: '🚚', desc: 'Até 1.500kg' },
                  { type: 'carreto', label: 'Carreto / Picape', icon: '🛻', desc: 'Até 1.000kg' },
                  { type: 'caminhao', label: 'Caminhão 3/4', icon: '🚛', desc: 'Carga pesada' },
                ].map((v) => (
                  <button
                    key={v.type}
                    type="button"
                    onClick={() => handleSelectVehicleType(v.type as VehicleType)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      vehicleType === v.type
                        ? 'border-lala-orange bg-orange-50/70 shadow-sm ring-1 ring-lala-orange'
                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{v.icon}</span>
                    <span className="text-xs font-extrabold text-gray-900 block leading-tight">{v.label}</span>
                    <span className="text-[10px] text-gray-500 block">{v.desc}</span>
                  </button>
                ))}
              </div>

              {/* Vehicle specific fields */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Modelo do Veículo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Fiat Fiorino 1.4 EVO"
                    value={vehicleModel || defaultModels[vehicleType]}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-lala-orange focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Placa</label>
                    <input
                      type="text"
                      required
                      placeholder="BRA-2E19"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm uppercase font-mono font-bold focus:ring-2 focus:ring-lala-orange focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Ano</label>
                    <input
                      type="number"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-lala-orange focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStep(1);
                  }}
                  className="w-1/3 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStep(3);
                  }}
                  className="w-2/3 py-3.5 rounded-2xl bg-lala-orange hover:bg-lala-orangeDark text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5"
                >
                  <span>Enviar Documentos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Documents Upload */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-gray-900">Documentos e Averiguação</h2>
                <p className="text-xs text-gray-500">
                  Para garantir a segurança dos clientes e parceiros, valide seus documentos para aprovação de cadastro.
                </p>
              </div>

              {/* CNH Field */}
              <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-lala-orange" />
                    <span className="text-xs font-bold text-gray-900">1. Foto da CNH (com EAR)</span>
                  </div>
                  {cnhPhoto ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Anexada
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-semibold">Obrigatório</span>
                  )}
                </div>

                <div 
                  onClick={() => handlePhotoUpload('cnh')}
                  className={`w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    cnhPhoto ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800' : 'border-gray-300 hover:border-lala-orange text-gray-500'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-xs font-bold">
                    {cnhPhoto ? 'CNH Anexada com Sucesso' : 'Tirar Foto ou Anexar CNH'}
                  </span>
                </div>
              </div>

              {/* CRLV Field */}
              <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-gray-900">2. Documento do Veículo (CRLV)</span>
                  </div>
                  {crlvPhoto ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Anexado
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-semibold">Obrigatório</span>
                  )}
                </div>

                <div 
                  onClick={() => handlePhotoUpload('crlv')}
                  className={`w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    crlvPhoto ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800' : 'border-gray-300 hover:border-blue-500 text-gray-500'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-xs font-bold">
                    {crlvPhoto ? 'CRLV Anexado com Sucesso' : 'Anexar Documento do Veículo'}
                  </span>
                </div>
              </div>

              {/* Selfie Biometry */}
              <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-gray-900">3. Selfie Facial (Prova de Vida)</span>
                  </div>
                  {selfiePhoto ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Concluída
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-semibold">Obrigatório</span>
                  )}
                </div>

                <div 
                  onClick={() => handlePhotoUpload('selfie')}
                  className={`w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    selfiePhoto ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800' : 'border-gray-300 hover:border-emerald-500 text-gray-500'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-xs font-bold">
                    {selfiePhoto ? 'Selfie Capturada' : 'Tirar Selfie Agora'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStep(2);
                  }}
                  className="w-1/3 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={startVerificationAnalysis}
                  className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>ANALISAR & VALIDAR</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Real-time Verification & Approval */}
          {step === 4 && (
            <div className="space-y-5 text-center py-4 animate-fade-in">
              <div className="relative mb-2">
                {isApproved ? (
                  <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-orange-100 text-lala-orange flex items-center justify-center mx-auto shadow-xl shadow-orange-500/20">
                    <Loader2 className="w-10 h-10 animate-spin" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {isApproved ? 'Cadastro Aprovado com Sucesso!' : 'Averiguação de Documentos em Andamento'}
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  {isApproved 
                    ? 'Todos os seus dados foram validados e você está apto a iniciar as entregas na plataforma Parceiro.'
                    : 'Estamos validando suas certidões, CNH, antecedentes e dados do veículo.'}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 text-left max-w-xs mx-auto">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-600">
                  <span>Progresso da Validação</span>
                  <span className={isApproved ? 'text-emerald-600' : 'text-lala-orange'}>
                    {verificationProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 rounded-full ${
                      isApproved ? 'bg-emerald-500' : 'bg-lala-orange'
                    }`}
                    style={{ width: `${verificationProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 block italic">
                  {verificationStepText}
                </span>
              </div>

              {/* Verification Checklist */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 text-left space-y-2.5 max-w-xs mx-auto text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-semibold">1. Regularidade CNH / DETRAN</span>
                  {verificationProgress >= 45 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">✓ Válido</span>
                  ) : (
                    <span className="text-gray-400">Analisando...</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-semibold">2. Vistoria e CRLV do Veículo</span>
                  {verificationProgress >= 75 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">✓ Aprovado</span>
                  ) : (
                    <span className="text-gray-400">Pendente...</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-semibold">3. Biometria e Prova de Vida</span>
                  {verificationProgress >= 100 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">✓ Confirmada</span>
                  ) : (
                    <span className="text-gray-400">Pendente...</span>
                  )}
                </div>
              </div>

              {/* Action Button: Enter Delivery Panel */}
              <div className="pt-2">
                {isApproved ? (
                  <button
                    type="button"
                    onClick={handleFinishAndEnter}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all animate-pulse"
                  >
                    <span>ACESSAR PAINEL DE ENTREGAS</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled
                      className="w-full py-3.5 rounded-2xl bg-gray-200 text-gray-400 font-bold text-xs uppercase"
                    >
                      Aguardando Conclusão da Averiguação...
                    </button>
                    {/* Direct quick bypass for testing immediately */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsApproved(true);
                        setVerificationProgress(100);
                        setVerificationStepText('Aprovado pelo administrador de testes!');
                        sound.playCashSuccess();
                      }}
                      className="text-[11px] text-lala-orange font-bold hover:underline block mx-auto"
                    >
                      ⚡ Forçar Aprovação Imediata de Teste
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
