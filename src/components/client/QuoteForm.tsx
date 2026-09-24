import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleModal, PickupMethod, Address, Order } from '../../types';
import { calculatePricing, formatCurrency } from '../../services/pricingEngine';
import { MapPreview } from '../common/MapPreview';
import { PaymentModal } from './PaymentModal';
import { RegisterClientModal } from '../auth/RegisterClientModal';
import { fetchAddressByCep } from '../../services/cepService';
import { calculateRouteDistanceAndTime } from '../../services/routingService';
import {
  Bike,
  Car,
  MapPin,
  Clock,
  Shield,
  Zap,
  Store,
  Home,
  CheckCircle,
  ArrowRight,
  Info,
  ShieldCheck,
  UserCheck,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  Navigation,
  XCircle,
} from 'lucide-react';

interface QuoteFormProps {
  onOrderCreated: (order: Order) => void;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({ onOrderCreated }) => {
  const {
    pricingConfig,
    dropoffPoints,
    createOrder,
    cancelOrder,
    currentClient,
    setCurrentClient,
    clients,
    setCurrentRole,
  } = useApp();

  // Controle do Modal de Cadastro Seguro de Cliente
  const [isRegisterClientOpen, setIsRegisterClientOpen] = useState(false);
  const [createdOrderForDispatch, setCreatedOrderForDispatch] = useState<Order | null>(null);

  // Modal e Dimensões
  const [modal, setModal] = useState<VehicleModal>('moto');
  const [weightKg, setWeightKg] = useState<number>(1.5);
  const [packageDesc, setPackageDesc] = useState<string>('Documentos e encomendas');

  // Trajeto e Distância (calculados dinamicamente)
  const [distanceKm, setDistanceKm] = useState<number>(3.5);
  const [durationMin, setDurationMin] = useState<number>(12);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);
  const [routeCalculationStatus, setRouteCalculationStatus] = useState<string | null>(null);

  // Coordenadas calculadas da rota
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({
    lat: -23.5658,
    lng: -46.6621,
  });
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({
    lat: -23.5671,
    lng: -46.6852,
  });

  // Opções de Serviço
  const [pickupMethod, setPickupMethod] = useState<PickupMethod>('doorstep');
  const [selectedDropoffId, setSelectedDropoffId] = useState<string>(dropoffPoints[0]?.id || '');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [hasInsurance, setHasInsurance] = useState<boolean>(false);
  const [declaredValue, setDeclaredValue] = useState<number>(250);
  const [contentAccepted, setContentAccepted] = useState(true);

  // Dados do Remetente (Origem)
  const isUnregistered = !currentClient || currentClient.id === 'cli_unregistered';
  const [senderName, setSenderName] = useState(isUnregistered ? '' : currentClient.name);
  const [senderPhone, setSenderPhone] = useState(isUnregistered ? '' : currentClient.phone);
  const [senderDoc, setSenderDoc] = useState(isUnregistered ? '' : currentClient.document);
  const [senderStreet, setSenderStreet] = useState(isUnregistered ? '' : currentClient.defaultAddress.street);
  const [senderNumber, setSenderNumber] = useState(isUnregistered ? '' : currentClient.defaultAddress.number);
  const [senderNeighborhood, setSenderNeighborhood] = useState(isUnregistered ? '' : currentClient.defaultAddress.neighborhood);
  const [senderCity, setSenderCity] = useState(isUnregistered ? 'São Paulo' : currentClient.defaultAddress.city);
  const [senderState, setSenderState] = useState(isUnregistered ? 'SP' : currentClient.defaultAddress.state || 'SP');
  const [senderZip, setSenderZip] = useState(isUnregistered ? '' : currentClient.defaultAddress.zipCode);

  // Sincroniza campos quando o cliente ativo muda
  useEffect(() => {
    if (currentClient && currentClient.id !== 'cli_unregistered') {
      setSenderName(currentClient.name);
      setSenderPhone(currentClient.phone);
      setSenderDoc(currentClient.document);
      setSenderStreet(currentClient.defaultAddress.street);
      setSenderNumber(currentClient.defaultAddress.number);
      setSenderNeighborhood(currentClient.defaultAddress.neighborhood);
      setSenderCity(currentClient.defaultAddress.city);
      setSenderState(currentClient.defaultAddress.state || 'SP');
      setSenderZip(currentClient.defaultAddress.zipCode);
    } else if (currentClient?.id === 'cli_unregistered') {
      setSenderName('');
      setSenderPhone('');
      setSenderDoc('');
      setSenderStreet('');
      setSenderNumber('');
      setSenderNeighborhood('');
      setSenderCity('São Paulo');
      setSenderState('SP');
      setSenderZip('');
    }
  }, [currentClient]);

  // Sincroniza dropoff selecionado quando lista mudar
  useEffect(() => {
    if (dropoffPoints.length > 0 && (!selectedDropoffId || !dropoffPoints.find((d) => d.id === selectedDropoffId))) {
      setSelectedDropoffId(dropoffPoints[0].id);
    }
  }, [dropoffPoints, selectedDropoffId]);

  // Dados do Destinatário (Destino)
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientStreet, setRecipientStreet] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [recipientNeighborhood, setRecipientNeighborhood] = useState('');
  const [recipientCity, setRecipientCity] = useState('São Paulo');
  const [recipientState, setRecipientState] = useState('SP');
  const [recipientZip, setRecipientZip] = useState('');

  // =========================================================================
  // CÁLCULO AUTOMÁTICO DE DISTÂNCIA E TEMPO COM BASE NOS ENDEREÇOS E NO MODAL
  // =========================================================================
  useEffect(() => {
    const hasOrigin =
      (senderZip && senderZip.replace(/\D/g, '').length >= 5) ||
      (senderStreet && senderStreet.trim().length >= 3);
    const hasDest =
      (recipientZip && recipientZip.replace(/\D/g, '').length >= 5) ||
      (recipientStreet && recipientStreet.trim().length >= 3);

    if (!hasOrigin || !hasDest) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsCalculatingRoute(true);
      setRouteCalculationStatus('Calculando rota e tempo real via malha viária...');

      try {
        const result = await calculateRouteDistanceAndTime(
          {
            street: senderStreet,
            number: senderNumber,
            neighborhood: senderNeighborhood,
            city: senderCity,
            state: senderState || 'SP',
            zipCode: senderZip,
          },
          {
            street: recipientStreet,
            number: recipientNumber,
            neighborhood: recipientNeighborhood,
            city: recipientCity,
            state: recipientState || 'SP',
            zipCode: recipientZip,
          },
          modal
        );

        setDistanceKm(result.distanceKm);
        setDurationMin(result.durationMin);
        setOriginCoords(result.originCoords);
        setDestCoords(result.destCoords);
        setRouteCalculationStatus(
          `Rota atualizada: ${result.distanceKm} km • ~${result.durationMin} min (${modal === 'moto' ? 'Moto Express' : 'Carro/Utilitário'})`
        );
      } catch (err) {
        console.warn('Erro ao calcular rota:', err);
      } finally {
        setIsCalculatingRoute(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    senderStreet,
    senderNumber,
    senderCity,
    senderState,
    senderZip,
    recipientStreet,
    recipientNumber,
    recipientCity,
    recipientState,
    recipientZip,
    modal,
  ]);

  // Modal de Pagamento
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Cálculo Dinâmico de Preço e Repasse ao Entregador
  const priceBreakdown = useMemo(() => {
    return calculatePricing(
      modal,
      distanceKm,
      durationMin,
      pickupMethod,
      isUrgent,
      hasInsurance,
      pricingConfig
    );
  }, [modal, distanceKm, durationMin, pickupMethod, isUrgent, hasInsurance, pricingConfig]);

  // Endereços formatados para o componente de mapa
  const originAddress: Address = {
    street: senderStreet,
    number: senderNumber,
    neighborhood: senderNeighborhood,
    city: senderCity,
    state: senderState || 'SP',
    zipCode: senderZip,
    lat: originCoords.lat,
    lng: originCoords.lng,
  };

  const destAddress: Address = {
    street: recipientStreet,
    number: recipientNumber,
    neighborhood: recipientNeighborhood,
    city: recipientCity,
    state: recipientState || 'SP',
    zipCode: recipientZip,
    lat: destCoords.lat,
    lng: destCoords.lng,
  };

  const selectedDropoff = dropoffPoints.find((d) => d.id === selectedDropoffId);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderStreet) {
      alert('Por favor, informe os dados de origem do Remetente ou conclua o cadastro.');
      return;
    }
    if (!recipientName || !recipientStreet) {
      alert('Por favor, informe o nome e endereço de entrega do Destinatário.');
      return;
    }
    if (!contentAccepted) {
      alert('Você precisa aceitar a Declaração de Conteúdo Lícito para proteger o entregador.');
      return;
    }
    setIsPaymentOpen(true);
  };

  const handlePaymentConfirmed = (method: 'pix' | 'credit_card' | 'cash_on_delivery') => {
    setIsPaymentOpen(false);

    const newOrder = createOrder({
      modal,
      packageDescription: packageDesc,
      weightKg,
      dimensions: {
        lengthCm: modal === 'moto' ? 25 : 50,
        widthCm: modal === 'moto' ? 20 : 40,
        heightCm: modal === 'moto' ? 10 : 30,
      },
      pickupMethod,
      dropoffPointId: pickupMethod === 'dropoff_point' ? selectedDropoffId : undefined,
      isUrgent,
      hasInsurance,
      declaredValue: hasInsurance ? declaredValue : undefined,
      contentDeclarationAccepted: contentAccepted,
      price: priceBreakdown,
      paymentMethod: method,
      paymentStatus: method === 'cash_on_delivery' ? 'pending' : 'paid',
      sender: {
        name: senderName,
        phone: senderPhone,
        document: senderDoc,
        address: originAddress,
        isVerified: currentClient.verificationStatus === 'verified',
      },
      recipient: {
        name: recipientName,
        phone: recipientPhone,
        address: destAddress,
      },
    });

    setCreatedOrderForDispatch(newOrder);
  };

  return (
    <div className="space-y-6">
      {/* Banner de Identificação Segura do Cliente Remetente (KYC) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {isUnregistered || clients.length === 0 ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 uppercase">Remetente:</span>
                <strong className="text-sm font-black text-slate-900">Nenhum Remetente Selecionado</strong>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cadastre seus dados ou informe o endereço de origem abaixo para emissão da etiqueta.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Remetente Atual:</span>
                <strong className="text-sm font-black text-slate-900">{currentClient.name}</strong>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verificado (CPF + Documento)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                CPF: {currentClient.document} • Tel: {currentClient.phone}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {clients.length > 1 && (
            <select
              value={currentClient.id}
              onChange={(e) => {
                const found = clients.find((c) => c.id === e.target.value);
                if (found) setCurrentClient(found);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 outline-hidden"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setIsRegisterClientOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{clients.length === 0 ? 'Cadastrar Meu Remetente' : 'Cadastrar Novo'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Formulário de Cotação */}
        <div className="lg:col-span-7 space-y-6">
          {/* Escolha do Modal de Transporte */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                1. Tipo de Transporte (Modal)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Altera o tempo estimado e as faixas de preço/repasse
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Opção Moto */}
              <button
                type="button"
                onClick={() => {
                  setModal('moto');
                  if (weightKg > 2) setWeightKg(2);
                }}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  modal === 'moto'
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${
                    modal === 'moto' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">Moto Express</div>
                  <div className="text-xs text-slate-600 mt-0.5">Até 2 kg • Corredor rápido</div>
                  <div className="text-xs font-bold text-amber-700 mt-1">
                    Base R$ {pricingConfig.motoBaseRate.toFixed(2)} + R${' '}
                    {pricingConfig.motoPerKmRate.toFixed(2)}/km
                  </div>
                </div>
              </button>

              {/* Opção Carro */}
              <button
                type="button"
                onClick={() => setModal('car')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  modal === 'car'
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${
                    modal === 'car' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">Carro / Utilitário</div>
                  <div className="text-xs text-slate-600 mt-0.5">Até 20 kg • Caixas e volumes</div>
                  <div className="text-xs font-bold text-amber-700 mt-1">
                    Base R$ {pricingConfig.carBaseRate.toFixed(2)} + R${' '}
                    {pricingConfig.carPerKmRate.toFixed(2)}/km
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peso Declarado (kg):
                </label>
                <input
                  type="number"
                  min="0.1"
                  max={modal === 'moto' ? '2.0' : '30.0'}
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0.5)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição do Conteúdo:
                </label>
                <input
                  type="text"
                  value={packageDesc}
                  onChange={(e) => setPackageDesc(e.target.value)}
                  placeholder="Ex: Documentos, Peças, Roupas, Eletrônico"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  required
                />
              </div>
            </div>
          </div>

          {/* Origem e Destino com Busca ViaCEP e Cálculo Automático */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                2. Endereços de Coleta & Entrega
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Digite os CEPs para preenchimento e cálculo imediato da rota
              </span>
            </div>

            {/* Endereço de Coleta (Origem) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Origem (Endereço de Coleta):</span>
                </div>
                {senderZip.length >= 8 && (
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-full">
                    CEP Identificado
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder="CEP Coleta (8 dígitos)"
                    value={senderZip}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setSenderZip(val);
                      const clean = val.replace(/\D/g, '');
                      if (clean.length === 8) {
                        const res = await fetchAddressByCep(clean);
                        if (res && !res.error) {
                          if (res.street) setSenderStreet(res.street);
                          if (res.neighborhood) setSenderNeighborhood(res.neighborhood);
                          if (res.city) setSenderCity(res.city);
                          if (res.state) setSenderState(res.state);
                        }
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-blue-50/60 border border-blue-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Rua / Logradouro de Coleta"
                  value={senderStreet}
                  onChange={(e) => setSenderStreet(e.target.value)}
                  className="col-span-2 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Nº"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Bairro de Coleta"
                  value={senderNeighborhood}
                  onChange={(e) => setSenderNeighborhood(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Nome do Remetente"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="CPF ou CNPJ Remetente"
                  value={senderDoc}
                  onChange={(e) => setSenderDoc(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                  required
                />
              </div>
            </div>

            {/* Endereço de Entrega (Destino) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Destino (Endereço de Entrega):</span>
                </div>
                {recipientZip.length >= 8 && (
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    CEP Identificado
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder="CEP Entrega (8 dígitos)"
                    value={recipientZip}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setRecipientZip(val);
                      const clean = val.replace(/\D/g, '');
                      if (clean.length === 8) {
                        const res = await fetchAddressByCep(clean);
                        if (res && !res.error) {
                          if (res.street) setRecipientStreet(res.street);
                          if (res.neighborhood) setRecipientNeighborhood(res.neighborhood);
                          if (res.city) setRecipientCity(res.city);
                          if (res.state) setRecipientState(res.state);
                        }
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-emerald-50/60 border border-emerald-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Rua / Logradouro de Entrega"
                  value={recipientStreet}
                  onChange={(e) => setRecipientStreet(e.target.value)}
                  className="col-span-2 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Nº"
                  value={recipientNumber}
                  onChange={(e) => setRecipientNumber(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Bairro de Entrega"
                  value={recipientNeighborhood}
                  onChange={(e) => setRecipientNeighborhood(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Nome de quem vai receber"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Telefone / WhatsApp"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            {/* Painel do Cálculo Automático de Rota, Distância e Tempo */}
            <div className="p-4 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-slate-50 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Cálculo Automático de Rota & Deslocamento
                  </span>
                </div>
                {isCalculatingRoute ? (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Calculando via satélite...
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Rota Atualizada ({modal === 'moto' ? 'Moto' : 'Carro'})
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Distância Calculada</span>
                  <div className="text-2xl font-black font-mono text-slate-900">
                    {distanceKm} <span className="text-xs font-bold text-slate-500">km</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Via malha viária real</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Tempo Estimado</span>
                  <div className="text-2xl font-black font-mono text-amber-600">
                    ~{durationMin} <span className="text-xs font-bold text-slate-500">min</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {modal === 'moto' ? 'Corredor ágil de moto' : 'Trânsito de carro/utilitário'}
                  </span>
                </div>
              </div>

              {routeCalculationStatus && (
                <p className="text-[11px] text-slate-600 font-medium text-center">
                  {routeCalculationStatus}
                </p>
              )}
            </div>
          </div>

          {/* Modalidade de Coleta, Urgência e Seguro */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              3. Modalidade de Coleta & Adicionais
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPickupMethod('doorstep')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                  pickupMethod === 'doorstep'
                    ? 'border-amber-500 bg-amber-50/70 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Home className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Coleta em Domicílio</div>
                  <div className="text-[11px] text-slate-600">Entregador retira no seu endereço</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPickupMethod('dropoff_point')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                  pickupMethod === 'dropoff_point'
                    ? 'border-purple-500 bg-purple-50/70 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-purple-900">Levar ao Ponto Lojista</div>
                  <div className="text-[11px] text-emerald-600 font-bold">Desconto de R$ 2,50</div>
                </div>
              </button>
            </div>

            {pickupMethod === 'dropoff_point' && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2 animate-in fade-in">
                {dropoffPoints.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-purple-950">
                        Selecione o Ponto Lojista Credenciado:
                      </label>
                      <span className="text-[10px] text-purple-700 bg-purple-200 px-2 py-0.5 rounded-full font-bold">
                        Auditado ✓
                      </span>
                    </div>
                    <select
                      value={selectedDropoffId}
                      onChange={(e) => setSelectedDropoffId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-purple-300 rounded-lg text-slate-800 font-medium"
                    >
                      {dropoffPoints.map((dp) => (
                        <option key={dp.id} value={dp.id}>
                          {dp.name} ({dp.category || 'Ponto Físico'}) — {dp.address.street}, {dp.address.number}
                        </option>
                      ))}
                    </select>
                    {selectedDropoff && (
                      <p className="text-[11px] text-purple-800">
                        🕒 Horário: {selectedDropoff.openingHours} | CNPJ: {selectedDropoff.cnpj || 'Verificado'}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="py-2 text-center text-xs text-purple-900 space-y-1">
                    <p className="font-bold">Nenhum Ponto Lojista parceiro cadastrado no momento.</p>
                    <p className="text-[11px] text-purple-700">
                      Você pode selecionar "Coleta em Domicílio" ou cadastrar uma loja parceira na visão Ponto Lojista.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Opcionais: Urgência e Seguro */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  isUrgent ? 'border-red-400 bg-red-50/70' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-400"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-red-500" />
                    <span>Entrega Prioritária (+25%)</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Alocação imediata no radar de motoristas
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  hasInsurance ? 'border-emerald-400 bg-emerald-50/70' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={hasInsurance}
                  onChange={(e) => setHasInsurance(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-400"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Seguro de Carga (+R$ 7,00)</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Proteção contra perdas ou danos materiais
                  </div>
                </div>
              </label>
            </div>

            {hasInsurance && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                <label className="block text-slate-700 font-semibold mb-1">
                  Valor Declarado dos Bens (R$):
                </label>
                <input
                  type="number"
                  min="50"
                  max="15000"
                  step="50"
                  value={declaredValue}
                  onChange={(e) => setDeclaredValue(parseFloat(e.target.value) || 0)}
                  className="w-full sm:w-48 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg font-mono font-bold"
                />
              </div>
            )}

            {/* Termo de Carga Lícita */}
            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contentAccepted}
                  onChange={(e) => setContentAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-400"
                />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong>Declaração de Carga Lícita:</strong> Declaro sob as penas da lei que esta
                  encomenda não contém artigos ilícitos, entorpecentes ou inflamáveis, responsabilizando-me
                  pelo conteúdo e garantindo a segurança do entregador parceiro.
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Mapa e Resumo com Repasse Transparente */}
        <div className="lg:col-span-5 space-y-6">
          {/* Prévia da Rota em Mapa */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Prévia da Rota e Deslocamento:</span>
              <span className="text-blue-600 font-mono font-bold">{distanceKm} km</span>
            </div>
            <MapPreview
              origin={originAddress}
              destination={destAddress}
              dropoffAddress={pickupMethod === 'dropoff_point' ? selectedDropoff?.address : undefined}
              modal={modal}
              distanceKm={distanceKm}
              durationMin={durationMin}
            />
          </div>

          {/* Resumo da Cotação */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="bg-slate-900 text-white p-5">
              <span className="text-xs uppercase font-mono tracking-wider text-amber-400">
                Resumo da Cotação
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-semibold text-slate-300">Total a Pagar (Cliente):</span>
                <span className="text-3xl font-black text-amber-400 font-mono">
                  {formatCurrency(priceBreakdown.totalCustomerCharge)}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-4 text-xs">
              {/* Composição do Preço do Cliente */}
              <div className="space-y-1.5 pb-3 border-b border-slate-200">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Detalhamento do Frete:
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxa Base ({modal === 'moto' ? 'Moto' : 'Carro'}):</span>
                  <span className="font-mono">{formatCurrency(priceBreakdown.baseRateCharge)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Distância calculada ({distanceKm} km):</span>
                  <span className="font-mono">{formatCurrency(priceBreakdown.kmRateCharge)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tempo estimado de trajeto (~{durationMin} min):</span>
                  <span className="font-mono">{formatCurrency(priceBreakdown.timeRateCharge)}</span>
                </div>
                {isUrgent && (
                  <div className="flex justify-between text-red-600 font-semibold">
                    <span>Taxa de Urgência (+25%):</span>
                    <span className="font-mono">{formatCurrency(priceBreakdown.urgencyCharge)}</span>
                  </div>
                )}
                {hasInsurance && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Seguro de Carga Declarada:</span>
                    <span className="font-mono">{formatCurrency(priceBreakdown.insuranceCharge)}</span>
                  </div>
                )}
                {pickupMethod === 'dropoff_point' && (
                  <div className="flex justify-between text-purple-700 font-bold">
                    <span>Desconto Ponto de Coleta:</span>
                    <span className="font-mono">-{formatCurrency(priceBreakdown.dropoffDiscount)}</span>
                  </div>
                )}
              </div>

              {/* Botão de Concluir Pedido */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
              >
                <span>Avançar para Pagamento & Etiqueta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de Pagamento Integrado (Modo Demo/Simulado Conforme Solicitado) */}
      {isPaymentOpen && (
        <PaymentModal
          amount={priceBreakdown.totalCustomerCharge}
          orderDescription={`Envio via ${modal === 'moto' ? 'Moto Express' : 'Carro'} • ${distanceKm} km`}
          onPaymentConfirmed={handlePaymentConfirmed}
          onCancel={() => setIsPaymentOpen(false)}
        />
      )}

      {/* Modal de Despacho e Busca de Entregadores na Região */}
      {createdOrderForDispatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping"></span>
              <span className="absolute inset-2 rounded-full bg-amber-400/30 animate-pulse"></span>
              <div className="relative w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                <Bike className="w-6 h-6 animate-bounce" />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 block">
                Pedido Gerado: {createdOrderForDispatch.trackingCode}
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Localizando Entregadores na Região...
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                O chamado foi enviado com alerta sonoro para os entregadores parceiros em um raio de 5 km da coleta ({createdOrderForDispatch.sender.address.neighborhood}).
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Coleta:</span>
                <strong className="text-slate-900">{createdOrderForDispatch.sender.address.neighborhood}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Entrega:</span>
                <strong className="text-slate-900">{createdOrderForDispatch.recipient.address.neighborhood}</strong>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                <span>Total Pago:</span>
                <span>{formatCurrency(createdOrderForDispatch.price.totalCustomerCharge)}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza de que deseja cancelar esta corrida?')) {
                    const ord = createdOrderForDispatch;
                    cancelOrder(ord.id, 'Cancelado pelo cliente antes da coleta');
                    setCreatedOrderForDispatch(null);
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancelar Corrida</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const ord = createdOrderForDispatch;
                  setCreatedOrderForDispatch(null);
                  onOrderCreated(ord);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Acompanhar Rastreamento do Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
