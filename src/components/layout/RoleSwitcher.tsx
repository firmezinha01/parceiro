import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { User, Store, ShieldAlert, Bike, ExternalLink } from 'lucide-react';

interface RoleSwitcherProps {
  onOpenCourierApp?: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ onOpenCourierApp }) => {
  const { currentRole, setCurrentRole, orders, dropoffPoints, couriers } = useApp();

  const packagesInDropoff = orders.filter((o) => o.status === 'at_dropoff').length;

  // No Portal Principal, apenas Cliente, Lojista e Painel Central estão presentes
  const roles: {
    id: UserRole;
    name: string;
    subtext: string;
    icon: React.ReactNode;
    badge?: number;
    color: string;
    activeBorder: string;
  }[] = [
    {
      id: 'client',
      name: 'Cliente',
      subtext: 'Cotar, Pagar & Rastrear',
      icon: <User className="w-4 h-4" />,
      color: 'text-emerald-600',
      activeBorder: 'border-emerald-500 bg-emerald-50/80 text-emerald-900',
    },
    {
      id: 'merchant',
      name: 'Ponto Lojista',
      subtext: `${packagesInDropoff} em custódia`,
      icon: <Store className="w-4 h-4" />,
      badge: packagesInDropoff > 0 ? packagesInDropoff : undefined,
      color: 'text-purple-600',
      activeBorder: 'border-purple-500 bg-purple-50/80 text-purple-900',
    },
    {
      id: 'admin',
      name: 'Painel Central',
      subtext: `Gestão de Frotas (${couriers.length}) & Auditoria`,
      icon: <ShieldAlert className="w-4 h-4" />,
      color: 'text-indigo-600',
      activeBorder: 'border-indigo-500 bg-indigo-50/80 text-indigo-900',
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider hidden md:block shrink-0">
              Portal Principal:
            </span>

            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
              {roles.map((role) => {
                const isActive = currentRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setCurrentRole(role.id)}
                    className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl border text-left transition-all relative cursor-pointer ${
                      isActive
                        ? `${role.activeBorder} shadow-sm font-semibold ring-2 ring-indigo-400/20`
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          isActive ? 'bg-white shadow-xs' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {role.icon}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold leading-tight truncate">{role.name}</div>
                        <div className="text-[10px] text-slate-500 truncate font-normal hidden lg:block">
                          {role.subtext}
                        </div>
                      </div>
                    </div>

                    {role.badge !== undefined && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 shrink-0">
                        {role.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botão em destaque para abrir o Aplicativo do Entregador Autônomo */}
          {onOpenCourierApp && (
            <button
              onClick={onOpenCourierApp}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 hover:border-amber-400/50 text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
              title="Acessar o aplicativo autônomo e isolado do entregador parceiro"
            >
              <Bike className="w-4 h-4 text-amber-400" />
              <span>App do Entregador</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
