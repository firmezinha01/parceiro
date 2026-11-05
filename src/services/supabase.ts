import { createClient } from '@supabase/supabase-js';
import { DriverProfile, Order, WalletTransaction, VehicleType } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://efvchaahbshqjlmlrzta.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_PZXJCGxsjMnEH-cp8mzRuQ_AD6mHxAL';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseAnonKey.length > 10
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Map database row to Order interface
export function mapDbOrderToOrder(row: any): Order {
  return {
    id: row.id,
    code: row.code || `PRC-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: 'Agora',
    vehicleType: (row.vehicle_type as VehicleType) || 'fiorino',
    price: Number(row.price) || 25,
    distanceToPickupKm: Number(row.distance_pickup_km) || 1.5,
    totalDistanceKm: Number(row.total_distance_km) || 8.0,
    estimatedMinutes: Number(row.estimated_minutes) || 25,
    paymentMethod: row.payment_method || 'app',
    cargoType: row.cargo_type || 'Volumes e Caixas',
    cargoWeightKg: row.cargo_weight_kg ? Number(row.cargo_weight_kg) : undefined,
    pickup: {
      address: row.pickup_address,
      neighborhood: row.pickup_neighborhood || 'Centro',
      city: row.pickup_city || 'São Paulo - SP',
      lat: Number(row.pickup_lat) || -23.5615,
      lng: Number(row.pickup_lng) || -46.6559,
      contactName: row.pickup_contact_name,
      contactPhone: row.pickup_contact_phone,
      instructions: row.pickup_instructions,
    },
    delivery: {
      address: row.delivery_address,
      neighborhood: row.delivery_neighborhood || 'Bairro',
      city: row.delivery_city || 'São Paulo - SP',
      lat: Number(row.delivery_lat) || -23.5552,
      lng: Number(row.delivery_lng) || -46.6621,
      contactName: row.delivery_contact_name,
      contactPhone: row.delivery_contact_phone,
      instructions: row.delivery_instructions,
    },
    senderName: row.pickup_contact_name || 'Remetente',
    recipientName: row.delivery_contact_name || 'Destinatário',
    clientNotes: row.client_notes,
    expiresInSeconds: 25,
  };
}

// Fetch all available orders from Supabase
export async function getAvailableOrdersFromSupabase(): Promise<Order[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return null;
    return data.map(mapDbOrderToOrder);
  } catch (err) {
    console.warn('Supabase fetch orders fallback:', err);
    return null;
  }
}

// Update order status in Supabase
export async function updateOrderStatusInDb(orderId: string, status: string, driverId?: string) {
  if (!isSupabaseConfigured) return;
  try {
    const updatePayload: Record<string, any> = { status };
    if (driverId) updatePayload.driver_id = driverId;
    if (status === 'completed') updatePayload.completed_at = new Date().toISOString();

    await supabase.from('orders').update(updatePayload).eq('id', orderId);
  } catch (err) {
    console.warn('Supabase update order error:', err);
  }
}

// Save transaction in Supabase
export async function saveTransactionInDb(tx: WalletTransaction, driverId?: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('wallet_transactions').insert({
      driver_id: driverId || null,
      type: tx.type,
      title: tx.title,
      subtitle: tx.subtitle,
      amount: tx.amount,
      order_code: tx.orderCode,
    });
  } catch (err) {
    console.warn('Supabase insert transaction error:', err);
  }
}
