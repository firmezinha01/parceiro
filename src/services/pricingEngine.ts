import { PricingConfig, PriceBreakdown, VehicleModal, PickupMethod } from '../types';

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  // Moto (até 2 kg)
  motoBaseRate: 6.0,
  motoPerKmRate: 1.2,
  motoPerMinRate: 0.2,

  // Carro (até 20 kg)
  carBaseRate: 14.0,
  carPerKmRate: 2.4,
  carPerMinRate: 0.4,

  // Repasse por Componente configurável
  courierBaseSharePct: 0.65, // 65% da taxa base
  courierKmSharePct: 0.85,   // 85% do valor por km
  courierTimeSharePct: 0.75, // 75% do valor por tempo

  // Adicionais
  urgencyMultiplier: 1.25,   // +25%
  insuranceFee: 7.0,         // R$ 7,00 fixo
  merchantFixedFee: 3.5,     // R$ 3,50 fixo por pacote movimentado
};

export function calculatePricing(
  modal: VehicleModal,
  distanceKm: number,
  durationMin: number,
  pickupMethod: PickupMethod,
  isUrgent: boolean,
  hasInsurance: boolean,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): PriceBreakdown {
  // 1. Determina as taxas de acordo com o modal
  const baseRate = modal === 'moto' ? config.motoBaseRate : config.carBaseRate;
  const perKmRate = modal === 'moto' ? config.motoPerKmRate : config.carPerKmRate;
  const perMinRate = modal === 'moto' ? config.motoPerMinRate : config.carPerMinRate;

  // 2. Componentes base da corrida
  const baseRateCharge = baseRate;
  const kmRateCharge = Math.round(distanceKm * perKmRate * 100) / 100;
  const timeRateCharge = Math.round(durationMin * perMinRate * 100) / 100;

  const rawRideSubtotal = baseRateCharge + kmRateCharge + timeRateCharge;

  // 3. Adicional de urgência (+25%)
  let urgencyCharge = 0;
  if (isUrgent) {
    urgencyCharge = Math.round(rawRideSubtotal * (config.urgencyMultiplier - 1.0) * 100) / 100;
  }

  // 4. Seguro Opcional
  const insuranceCharge = hasInsurance ? config.insuranceFee : 0;

  // 5. Desconto se o cliente levar ao Ponto de Coleta
  const dropoffDiscount = pickupMethod === 'dropoff_point' ? 2.5 : 0;

  // 6. Total cobrado do cliente
  const totalCustomerCharge = Math.max(
    8.0,
    Math.round((rawRideSubtotal + urgencyCharge + insuranceCharge - dropoffDiscount) * 100) / 100
  );

  // 7. Cálculo do Repasse ao Entregador por Componente
  const courierBasePayout = Math.round(baseRateCharge * config.courierBaseSharePct * 100) / 100;
  const courierKmPayout = Math.round(kmRateCharge * config.courierKmSharePct * 100) / 100;
  const courierTimePayout = Math.round(timeRateCharge * config.courierTimeSharePct * 100) / 100;
  const courierUrgencyBonus = isUrgent ? Math.round(urgencyCharge * 0.8 * 100) / 100 : 0;

  const totalCourierPayout = Math.round(
    (courierBasePayout + courierKmPayout + courierTimePayout + courierUrgencyBonus) * 100
  ) / 100;

  // 8. Repasse ao Lojista (se houver ponto de coleta)
  const merchantPayout = pickupMethod === 'dropoff_point' ? config.merchantFixedFee : 0;

  // 9. Retenção líquida da plataforma
  const platformRetention = Math.max(
    0,
    Math.round((totalCustomerCharge - totalCourierPayout - merchantPayout) * 100) / 100
  );

  // 10. Percentual efetivo do entregador sobre o valor da corrida
  const effectiveCourierPct = Math.round((totalCourierPayout / totalCustomerCharge) * 100);

  return {
    modal,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMin: Math.round(durationMin),
    baseRateCharge,
    kmRateCharge,
    timeRateCharge,
    subtotal: Math.round(rawRideSubtotal * 100) / 100,
    urgencyCharge,
    insuranceCharge,
    dropoffDiscount,
    totalCustomerCharge,

    courierBasePayout,
    courierKmPayout,
    courierTimePayout,
    courierUrgencyBonus,
    totalCourierPayout,

    merchantPayout,
    platformRetention,
    effectiveCourierPct,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}
