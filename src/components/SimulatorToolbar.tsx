import React, { useState } from 'react';
import { 
  Sparkles, Smartphone, Monitor, QrCode, Play, Pause, 
  Volume2, Plus, ChevronUp, ChevronDown, Wifi 
} from 'lucide-react';
import { VehicleType } from '../types';
import { sound } from '../sound';

interface SimulatorToolbarProps {
  onTriggerOrder: (vehicle?: VehicleType) => void;
  isAutoSimulating: boolean;
  onToggleAutoSimulate: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  localIp: string;
}

export const SimulatorToolbar: React.FC<SimulatorToolbarProps> = ({
  onTriggerOrder,
  isAutoSimulating,
  onToggleAutoSimulate,
  isMobileFrame,
  onToggleMobileFrame,
  localIp,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  return (
    <>
      {/* Floating trigger button */}
      <div className="fixed top-3 right-3 z-50">
        <button
          onClick={() => {
            sound.playClick();
            setIsOpen(!isOpen);
          }}
          className="bg-zinc-900/90 hover:bg-black text-white px-3 py-1.5 rounded-full shadow-2xl border border-zinc-700 flex items-center gap-1.5 text-xs font-bold transition-all backdrop-blur"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
          <span>Simulador Parceiro</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-900/95 border border-zinc-700 rounded-2xl shadow-2xl p-3 text-white backdrop-blur space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-[11px] font-black uppercase text-lala-orange tracking-wider">
                Painel de Testes
              </span>
              <button
                onClick={() => setShowNetworkModal(true)}
                className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-gray-300 flex items-center gap-1"
                title="Ver link do celular"
              >
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>Abrir no Celular</span>
              </button>
            </div>

            {/* Quick Trigger Buttons */}
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-1.5">
                Disparar Pedido de Teste
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                <button
                  onClick={() => {
                    onTriggerOrder('moto');
                    setIsOpen(false);
                  }}
                  className="bg-zinc-800 hover:bg-lala-orange p-2 rounded-xl text-center transition-colors"
                >
                  🏍️ Moto
                </button>
                <button
                  onClick={() => {
                    onTriggerOrder('fiorino');
                    setIsOpen(false);
                  }}
                  className="bg-zinc-800 hover:bg-lala-orange p-2 rounded-xl text-center transition-colors"
                >
                  🚐 Fiorino
                </button>
                <button
                  onClick={() => {
                    onTriggerOrder('van');
                    setIsOpen(false);
                  }}
                  className="bg-zinc-800 hover:bg-lala-orange p-2 rounded-xl text-center transition-colors"
                >
                  🚚 Carga/Van
                </button>
              </div>
            </div>

            {/* Auto simulate timer */}
            <div className="pt-1 border-t border-zinc-800 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-bold block">Chamados Automáticos</span>
                <span className="text-[10px] text-gray-400">Gera corridas a cada 20s</span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleAutoSimulate();
                }}
                className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                  isAutoSimulating ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-gray-400'
                }`}
              >
                {isAutoSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            {/* Desktop Frame Toggle */}
            <div className="pt-1 border-t border-zinc-800 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-bold block">Modo de Visualização</span>
                <span className="text-[10px] text-gray-400">
                  {isMobileFrame ? 'Moldura de Smartphone' : 'Tela Cheia'}
                </span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleMobileFrame();
                }}
                className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-xl text-gray-200"
              >
                {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Link Info Modal */}
      {showNetworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 text-gray-900 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-lala-orange flex items-center justify-center mx-auto">
              <Smartphone className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-black text-lg">Testar no seu Celular</h3>
              <p className="text-xs text-gray-500 mt-1">
                Conecte seu celular na mesma rede Wi-Fi deste computador e abra o link abaixo no navegador do celular (Chrome ou Safari):
              </p>
            </div>

            <div className="bg-gray-100 p-3 rounded-2xl select-all font-mono font-bold text-sm text-lala-orangeDark border border-gray-200">
              http://{localIp}:5173
            </div>

            <div className="text-[11px] text-gray-500 bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 text-left">
              💡 <b>Dica no Celular:</b> No menu do navegador do celular, toque em <i>"Adicionar à tela de início"</i> para usar como app nativo com tela cheia!
            </div>

            <button
              onClick={() => setShowNetworkModal(false)}
              className="w-full py-3 rounded-xl bg-lala-charcoal text-white font-bold text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
