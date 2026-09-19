import { ScanEvent, Order } from '../types';

export function generateTrackingCode(): string {
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
  return `BR${randomDigits}SP`;
}

export function generateAuditHash(orderId: string, timestamp: string, step: string): string {
  // Simulação de hash SHA-256 criptográfico para prova imutável de baixa
  const data = `${orderId}:${step}:${timestamp}:${Math.random()}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const salt = Math.random().toString(16).substring(2, 10);
  return `0x${hex}${salt}${Date.now().toString(16)}`;
}

export function createQRCodePayload(order: Order): string {
  // Payload compacto para leitura ultrarrápida no leitor de QR
  return JSON.stringify({
    pkg: order.trackingCode,
    id: order.id,
    modal: order.modal,
    to: order.recipient.name,
    dest: `${order.recipient.address.street}, ${order.recipient.address.number}`,
    w: order.weightKg,
    urg: order.isUrgent,
    sig: generateAuditHash(order.id, order.createdAt, 'SIG').substring(0, 12),
  });
}

export function createScanEvent(params: {
  orderId: string;
  trackingCode: string;
  stepType: ScanEvent['stepType'];
  description: string;
  operatorId: string;
  operatorName: string;
  operatorRole: ScanEvent['operatorRole'];
  locationName: string;
  coordinates: { lat: number; lng: number };
  recipientSignature?: string;
  proofPhoto?: string;
}): ScanEvent {
  const timestamp = new Date().toISOString();
  return {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    orderId: params.orderId,
    trackingCode: params.trackingCode,
    stepType: params.stepType,
    description: params.description,
    timestamp,
    operatorId: params.operatorId,
    operatorName: params.operatorName,
    operatorRole: params.operatorRole,
    locationName: params.locationName,
    coordinates: params.coordinates,
    recipientSignature: params.recipientSignature,
    proofPhoto: params.proofPhoto,
    auditHash: generateAuditHash(params.orderId, timestamp, params.stepType),
  };
}
