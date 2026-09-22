import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, CourierProfile } from '../types';

function sanitizeSupabaseUrl(rawUrl: string): string {
  let url = (rawUrl || '').trim();
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url;
}

// Credenciais padrão oficiais do projeto Supabase
const DEFAULT_SUPABASE_URL = 'https://rrqodbmavuxvggvqqivz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycW9kYm1hdnV4dmdndnFxaXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwOTc3MjksImV4cCI6MjEwNTY3MzcyOX0.fnyMtQRDNiQbJWyoTjz3cro1WEy3JY1JsXXv9ffOptE';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
const supabaseAnonKey = rawKey;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey.length > 20
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// ==============================================================================
// CONVERSORES DE DADOS (BANCO SNAKE_CASE <-> APLICAÇÃO CAMELCASE)
// ==============================================================================

export function mapDbOrderToOrder(row: any): Order {
  return {
    id: row.id,
    trackingCode: row.tracking_code,
    createdAt: row.created_at,
    status: row.status,
    sender: row.sender,
    recipient: row.recipient,
    modal: row.modal,
    packageDescription: row.package_description || '',
    weightKg: Number(row.weight_kg) || 1,
    dimensions: row.dimensions || { lengthCm: 20, widthCm: 15, heightCm: 10 },
    pickupMethod: row.pickup_method || 'doorstep',
    dropoffPointId: row.dropoff_point_id,
    isUrgent: Boolean(row.is_urgent),
    hasInsurance: Boolean(row.has_insurance),
    declaredValue: Number(row.declared_value) || 0,
    price: row.price,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status || 'paid',
    pixQrCodePayload: row.pix_qr_code_payload,
    courierId: row.courier_id,
    courierName: row.courier_name,
    courierPhone: row.courier_phone,
    scanHistory: Array.isArray(row.scan_history) ? row.scan_history : [],
    finalDeliverySignature: row.final_delivery_signature,
    finalDeliveryPhoto: row.final_delivery_photo,
    deliveredAt: row.delivered_at,
  };
}

export function mapOrderToDbOrder(ord: Order): any {
  return {
    id: ord.id,
    tracking_code: ord.trackingCode,
    created_at: ord.createdAt,
    status: ord.status,
    sender: ord.sender,
    recipient: ord.recipient,
    modal: ord.modal,
    package_description: ord.packageDescription,
    weight_kg: ord.weightKg,
    dimensions: ord.dimensions,
    pickup_method: ord.pickupMethod,
    dropoff_point_id: ord.dropoffPointId || null,
    is_urgent: ord.isUrgent,
    has_insurance: ord.hasInsurance,
    declared_value: ord.declaredValue || 0,
    price: ord.price,
    payment_method: ord.paymentMethod,
    payment_status: ord.paymentStatus,
    pix_qr_code_payload: ord.pixQrCodePayload || null,
    courier_id: ord.courierId || null,
    courier_name: ord.courierName || null,
    courier_phone: ord.courierPhone || null,
    scan_history: ord.scanHistory,
    final_delivery_signature: ord.finalDeliverySignature || null,
    final_delivery_photo: ord.finalDeliveryPhoto || null,
    delivered_at: ord.deliveredAt || null,
  };
}

export function mapDbCourierToCourier(row: any): CourierProfile {
  return {
    id: row.id,
    name: row.name,
    document: row.document,
    email: row.email,
    password: row.password || '1234',
    cnh: row.cnh,
    modal: row.modal,
    vehiclePlate: row.vehicle_plate,
    vehicleModel: row.vehicle_model,
    phone: row.phone,
    avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    rating: Number(row.rating) || 5.0,
    totalDeliveries: Number(row.total_deliveries) || 0,
    balanceAvailable: Number(row.balance_available) || 0,
    balancePending: Number(row.balance_pending) || 0,
    pixKey: row.pix_key || '',
    isOnline: Boolean(row.is_online),
    isBlocked: Boolean(row.is_blocked),
    registeredAt: row.registered_at,
    verificationStatus: row.verification_status || 'verified',
    documentPhoto: row.document_photo,
    selfiePhoto: row.selfie_photo,
  };
}

export function mapCourierToDbCourier(c: CourierProfile): any {
  return {
    id: c.id,
    name: c.name,
    document: c.document,
    email: c.email || null,
    password: c.password || '1234',
    cnh: c.cnh,
    modal: c.modal,
    vehicle_plate: c.vehiclePlate,
    vehicle_model: c.vehicleModel || null,
    phone: c.phone,
    avatar_url: c.avatarUrl,
    rating: c.rating,
    total_deliveries: c.totalDeliveries,
    balance_available: c.balanceAvailable,
    balance_pending: c.balancePending,
    pix_key: c.pixKey,
    is_online: c.isOnline,
    is_blocked: c.isBlocked || false,
    registered_at: c.registeredAt || new Date().toISOString(),
    verification_status: c.verificationStatus,
    document_photo: c.documentPhoto || null,
    selfie_photo: c.selfiePhoto || null,
  };
}

// ==============================================================================
// OPERAÇÕES NO BANCO DE DADOS SUPABASE
// ==============================================================================

export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Erro ao buscar pedidos:', error.message);
      return null;
    }
    return (data || []).map(mapDbOrderToOrder);
  } catch (err) {
    console.warn('[Supabase] Falha de conexão ao buscar pedidos:', err);
    return null;
  }
}

export async function saveOrderToSupabase(order: Order): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbOrder = mapOrderToDbOrder(order);
    const { error } = await supabase
      .from('orders')
      .upsert(dbOrder, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Erro ao salvar pedido:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Falha de conexão ao salvar pedido:', err);
    return false;
  }
}

export async function fetchCouriersFromSupabase(): Promise<CourierProfile[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('couriers')
      .select('*')
      .order('registered_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Erro ao buscar entregadores:', error.message);
      return null;
    }
    return (data || []).map(mapDbCourierToCourier);
  } catch (err) {
    console.warn('[Supabase] Falha de conexão ao buscar entregadores:', err);
    return null;
  }
}

export async function saveCourierToSupabase(courier: CourierProfile): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbCourier = mapCourierToDbCourier(courier);
    const { error } = await supabase
      .from('couriers')
      .upsert(dbCourier, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Erro ao salvar entregador:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Falha de conexão ao salvar entregador:', err);
    return false;
  }
}
