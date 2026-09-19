import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_PRICING_CONFIG } from '../../services/pricingEngine';
import { Sliders, RotateCcw, Check, Save, Sparkles, ShieldCheck, DollarSign } from 'lucide-react';

export const PricingSettings: React.FC = () => {
  const { pricingConfig, updatePricingConfig } = useApp();
  const [form, setForm] = useState(pricingConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof typeof form, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricingConfig(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setForm(DEFAULT_PRICING_CONFIG);
    updatePricingConfig(DEFAULT_PRICING_CONFIG);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-300 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-900">
            Painel Administrativo de Calibração Dinâmica:
          </h4>
          <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
            Como planejado na arquitetura, os percentuais de repasse por componente (<strong>65% base, 85% km, 75% tempo</strong>) e as tarifas de transporte são totalmente configuráveis aqui. As alterações refletem imediatamente em todas as novas cotações e splits do aplicativo sem alterar o código.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Bloco 1: Percentuais de Repasse ao Entregador (Requisito Principal do Usuário) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>1. Repasse por Componente (% Repassado ao Entregador)</span>
            </h4>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Modelo Km / Tempo Oficial
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Repasse Taxa Base */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Taxa Base (%):</span>
                <span className="font-mono text-amber-800 text-sm">
                  {Math.round(form.courierBaseSharePct * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.40"
                max="0.90"
                step="0.05"
                value={form.courierBaseSharePct}
                onChange={(e) => handleChange('courierBaseSharePct', parseFloat(e.target.value))}
                className="w-full accent-amber-600"
              />
              <p className="text-[10px] text-slate-500">
                Padrão: 65%. Retém 35% no app para cobrir suporte e taxa fixa de aquisição.
              </p>
            </div>

            {/* Repasse Km Rodado */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Valor por Km (%):</span>
                <span className="font-mono text-emerald-700 text-sm">
                  {Math.round(form.courierKmSharePct * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.60"
                max="0.95"
                step="0.05"
                value={form.courierKmSharePct}
                onChange={(e) => handleChange('courierKmSharePct', parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[10px] text-slate-500">
                Padrão: 85%. Repasse alto pois cobre combustível direto e manutenção do veículo.
              </p>
            </div>

            {/* Repasse Tempo */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Valor por Tempo (%):</span>
                <span className="font-mono text-blue-700 text-sm">
                  {Math.round(form.courierTimeSharePct * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.90"
                step="0.05"
                value={form.courierTimeSharePct}
                onChange={(e) => handleChange('courierTimeSharePct', parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
              <p className="text-[10px] text-slate-500">
                Padrão: 75%. Remunera o tempo parado no trânsito compartilhado com o app.
              </p>
            </div>
          </div>
        </div>

        {/* Bloco 2: Parâmetros Tarifários Moto e Carro */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            2. Tarifas Base, Km e Minuto (Cobrança ao Cliente)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarifas Moto */}
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
              <span className="text-xs font-bold text-amber-900 uppercase">Modal Moto (até 2 kg)</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Taxa Base (R$)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    value={form.motoBaseRate}
                    onChange={(e) => handleChange('motoBaseRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    R$ / Km
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    value={form.motoPerKmRate}
                    onChange={(e) => handleChange('motoPerKmRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    R$ / Minuto
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={form.motoPerMinRate}
                    onChange={(e) => handleChange('motoPerMinRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Tarifas Carro */}
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-3">
              <span className="text-xs font-bold text-indigo-900 uppercase">Modal Carro (até 20 kg)</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Taxa Base (R$)
                  </label>
                  <input
                    type="number"
                    step="1.00"
                    value={form.carBaseRate}
                    onChange={(e) => handleChange('carBaseRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    R$ / Km
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    value={form.carPerKmRate}
                    onChange={(e) => handleChange('carPerKmRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    R$ / Minuto
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={form.carPerMinRate}
                    onChange={(e) => handleChange('carPerMinRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 3: Adicionais e Parcerias */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            3. Taxa do Lojista, Urgência e Seguro
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Comissão Fixa Lojista (R$/pacote):
              </label>
              <input
                type="number"
                step="0.50"
                value={form.merchantFixedFee}
                onChange={(e) => handleChange('merchantFixedFee', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500">Padrão: R$ 3,50 (Faixa R$ 2 a R$ 5)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Multiplicador de Urgência:
              </label>
              <input
                type="number"
                step="0.05"
                value={form.urgencyMultiplier}
                onChange={(e) => handleChange('urgencyMultiplier', parseFloat(e.target.value) || 1.25)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500">1.25 representa +25% sobre o frete</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Taxa de Seguro Opcional (R$):
              </label>
              <input
                type="number"
                step="1.00"
                value={form.insuranceFee}
                onChange={(e) => handleChange('insuranceFee', parseFloat(e.target.value) || 7)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500">Padrão: R$ 7,00 (Faixa R$ 5 a R$ 10)</span>
            </div>
          </div>
        </div>

        {/* Ações e Feedback */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Restaurar Valores Padrão</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-emerald-300">
                <Check className="w-4 h-4 text-emerald-600" /> Parâmetros salvos com sucesso!
              </span>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Salvar Parâmetros</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
