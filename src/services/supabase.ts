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

// Map database row to DriverProfile
export function mapDbDriverToProfile(row: any): DriverProfile {
  return {
    name: row.name || 'Motorista Parceiro',
    avatar: row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    rating: Number(row.rating) || 5.0,
    totalTrips: Number(row.total_trips) || 0,
    acceptanceRate: Number(row.acceptance_rate) || 100,
    vehicleType: (row.vehicle_type as VehicleType) || 'fiorino',
    vehiclePlate: row.vehicle_plate || 'BRA-2E19',
    vehicleModel: row.vehicle_model || 'Fiat Fiorino 1.4 EVO',
    phone: row.phone || '(11) 98452-9011',
    pixKey: row.pix_key || row.phone || 'pix@parceiro.com',
    isOnline: Boolean(row.is_online),
    walletBalance: Number(row.wallet_balance) || 0.00,
    todayEarnings: Number(row.today_earnings) || 0.00,
    weekEarnings: Number(row.week_earnings) || 0.00,
  };
}

// Map database row to Order interface
export function mapDbOrderToOrder(row: any): Order {
  let meta: any = {};
  let displayNotes = row.client_notes || '';
  if (displayNotes.includes('__META__:')) {
    try {
      const parts = displayNotes.split('__META__:');
      displayNotes = parts[0].trim();
      meta = JSON.parse(parts[1] || '{}');
    } catch (e) {
      // ignore
    }
  }

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
    status: row.status || 'available',
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
    clientNotes: displayNotes || undefined,
    expiresInSeconds: 25,
    driverId: row.driver_id,
    driverName: row.driver?.name || row.drivers?.name,
    driverPhone: row.driver?.phone || row.drivers?.phone,
    driverPlate: row.driver?.vehicle_plate || row.drivers?.vehicle_plate,
    driverModel: row.driver?.vehicle_model || row.drivers?.vehicle_model,
    driverAvatar: row.driver?.avatar_url || row.drivers?.avatar_url,
    driverRating: Number(row.driver?.rating || row.drivers?.rating || 4.97),
    pickupSecurityCode: row.pickup_security_code || meta.pickupSecurityCode || '1234',
    deliverySecurityCode: row.delivery_security_code || meta.deliverySecurityCode || '5678',
    pickupPhotoUrl: row.pickup_photo_url || meta.pickupPhotoUrl,
    deliveryPhotoUrl: row.delivery_photo_url || meta.deliveryPhotoUrl,
    waitingTimeSeconds: row.waiting_time_seconds || meta.waitingTimeSeconds || 0,
    arrivedPickupAt: row.arrived_pickup_at || meta.arrivedPickupAt,
    arrivedDeliveryAt: row.arrived_delivery_at || meta.arrivedDeliveryAt,
  };
}

// Create a new driver in Supabase during registration
export async function createDriverInSupabase(data: any): Promise<{ driver: DriverProfile; id: string } | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const payload: any = {
      name: data.name,
      phone: data.phone,
      vehicle_type: data.vehicle_type,
      vehicle_model: data.vehicle_model,
      vehicle_plate: data.vehicle_plate,
      pix_key: data.pix_key,
      avatar_url: data.avatar_url,
      is_online: true,
      wallet_balance: 0.00,
      today_earnings: 0.00,
      week_earnings: 0.00,
      rating: 5.0,
      total_trips: 0,
      acceptance_rate: 100,
    };

    const { data: inserted, error } = await supabase
      .from('drivers')
      .insert(payload)
      .select()
      .single();

    if (error || !inserted) {
      console.warn('Supabase driver insert error:', error);
      return null;
    }

    return {
      driver: mapDbDriverToProfile(inserted),
      id: inserted.id,
    };
  } catch (err) {
    console.error('Driver creation exception:', err);
    return null;
  }
}

// Fetch driver from Supabase
export async function getDriverFromSupabase(driverId: string): Promise<DriverProfile | null> {
  if (!isSupabaseConfigured || !driverId) return null;
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', driverId)
      .single();

    if (error || !data) return null;
    return mapDbDriverToProfile(data);
  } catch (err) {
    console.warn('Driver fetch error:', err);
    return null;
  }
}

// Update driver profile in Supabase
export async function updateDriverInSupabase(driverId: string, updates: Partial<DriverProfile>) {
  if (!isSupabaseConfigured || !driverId) return;
  try {
    const payload: any = {};
    if (updates.isOnline !== undefined) payload.is_online = updates.isOnline;
    if (updates.vehicleType !== undefined) payload.vehicle_type = updates.vehicleType;
    if (updates.vehicleModel !== undefined) payload.vehicle_model = updates.vehicleModel;
    if (updates.vehiclePlate !== undefined) payload.vehicle_plate = updates.vehiclePlate;
    if (updates.walletBalance !== undefined) payload.wallet_balance = updates.walletBalance;
    if (updates.todayEarnings !== undefined) payload.today_earnings = updates.todayEarnings;
    if (updates.weekEarnings !== undefined) payload.week_earnings = updates.weekEarnings;
    if (updates.totalTrips !== undefined) payload.total_trips = updates.totalTrips;

    await supabase.from('drivers').update(payload).eq('id', driverId);
  } catch (err) {
    console.warn('Driver update error:', err);
  }
}

// Fetch available orders from Supabase
export async function getAvailableOrdersFromSupabase(): Promise<Order[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    return data.map(mapDbOrderToOrder);
  } catch (err) {
    console.warn('Supabase fetch orders fallback:', err);
    return null;
  }
}

// Create a real order in Supabase
export async function createRealOrderInSupabase(order: Order): Promise<Order | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const meta = {
      pickupSecurityCode: order.pickupSecurityCode || Math.floor(1000 + Math.random() * 9000).toString(),
      deliverySecurityCode: order.deliverySecurityCode || Math.floor(1000 + Math.random() * 9000).toString(),
    };
    const clientNotesWithMeta = order.clientNotes 
      ? `${order.clientNotes.trim()}\n__META__:${JSON.stringify(meta)}`
      : `__META__:${JSON.stringify(meta)}`;

    const payload = {
      code: order.code,
      vehicle_type: order.vehicleType,
      price: order.price,
      distance_pickup_km: order.distanceToPickupKm,
      total_distance_km: order.totalDistanceKm,
      estimated_minutes: order.estimatedMinutes,
      cargo_type: order.cargoType,
      cargo_weight_kg: order.cargoWeightKg || null,
      client_notes: clientNotesWithMeta,
      payment_method: order.paymentMethod,
      status: 'available',
      pickup_address: order.pickup.address,
      pickup_neighborhood: order.pickup.neighborhood,
      pickup_city: order.pickup.city,
      pickup_lat: order.pickup.lat,
      pickup_lng: order.pickup.lng,
      pickup_contact_name: order.pickup.contactName,
      pickup_contact_phone: order.pickup.contactPhone,
      delivery_address: order.delivery.address,
      delivery_neighborhood: order.delivery.neighborhood,
      delivery_city: order.delivery.city,
      delivery_lat: order.delivery.lat,
      delivery_lng: order.delivery.lng,
      delivery_contact_name: order.delivery.contactName,
      delivery_contact_phone: order.delivery.contactPhone,
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(payload)
      .select()
      .single();

    if (error || !data) {
      console.warn('Create real order error:', error);
      return null;
    }
    return mapDbOrderToOrder(data);
  } catch (err) {
    console.error('Exception creating order:', err);
    return null;
  }
}

// Update order status in Supabase
export async function updateOrderStatusInDb(
  orderId: string, 
  status: string, 
  driverId?: string,
  extra?: {
    pickupPhotoUrl?: string;
    deliveryPhotoUrl?: string;
    waitingTimeSeconds?: number;
    pickupSecurityCode?: string;
    deliverySecurityCode?: string;
  }
) {
  if (!isSupabaseConfigured) return;
  try {
    const updatePayload: Record<string, any> = { status };
    if (driverId) updatePayload.driver_id = driverId;
    if (status === 'completed') updatePayload.completed_at = new Date().toISOString();

    // If extra fields provided, persist them in meta inside client_notes
    if (extra && Object.keys(extra).length > 0) {
      try {
        const { data: existing } = await supabase.from('orders').select('client_notes').eq('id', orderId).single();
        if (existing) {
          let currentNotes = existing.client_notes || '';
          let currentMeta: any = {};
          if (currentNotes.includes('__META__:')) {
            const parts = currentNotes.split('__META__:');
            currentNotes = parts[0].trim();
            try { currentMeta = JSON.parse(parts[1] || '{}'); } catch (e) {}
          }
          const mergedMeta = { ...currentMeta, ...extra };
          updatePayload.client_notes = `${currentNotes}\n__META__:${JSON.stringify(mergedMeta)}`.trim();
        }
      } catch (e) {
        console.warn('Meta update fallback:', e);
      }
    }

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
