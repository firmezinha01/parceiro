import React from 'react';
import { DeliveryStatus } from '../../types';
import { Clock, CheckCircle2, Bike, Store, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: DeliveryStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  switch (status) {
    case 'created':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200 ${sizeClasses[size]}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Aguardando Coleta
        </span>
      );
    case 'at_dropoff':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-purple-100 text-purple-800 border border-purple-200 ${sizeClasses[size]}`}>
          <Store className="w-3.5 h-3.5 text-purple-600" />
          No Ponto de Coleta
        </span>
      );
    case 'collected':
    case 'in_transit':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-blue-100 text-blue-800 border border-blue-200 animate-pulse ${sizeClasses[size]}`}>
          <Bike className="w-3.5 h-3.5 text-blue-600" />
          Em Trânsito
        </span>
      );
    case 'delivered':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 ${sizeClasses[size]}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Entregue
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-rose-100 text-rose-800 border border-rose-200 ${sizeClasses[size]}`}>
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          Cancelado
        </span>
      );
    default:
      return null;
  }
};
