import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScanEvent } from '../../types';
import {
  ShieldCheck,
  Search,
  Filter,
  MapPin,
  Clock,
  User,
  Hash,
  FileCheck,
  ExternalLink,
} from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { allScanLogs, setActiveOrderForTracking, orders, setCurrentRole } = useApp();
  const [filterText, setFilterText] = useState('');
  const [filterStep, setFilterStep] = useState<string>('all');

  const filteredLogs = allScanLogs.filter((log) => {
    const matchesText =
      log.trackingCode.toLowerCase().includes(filterText.toLowerCase()) ||
      log.operatorName.toLowerCase().includes(filterText.toLowerCase()) ||
      log.description.toLowerCase().includes(filterText.toLowerCase()) ||
      log.auditHash.toLowerCase().includes(filterText.toLowerCase());

    const matchesStep = filterStep === 'all' || log.stepType === filterStep;
    return matchesText && matchesStep;
  });

  const handleInspectOrder = (trackingCode: string) => {
    const found = orders.find((o) => o.trackingCode === trackingCode);
    if (found) {
      setActiveOrderForTracking(found);
      setCurrentRole('client');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Explicação de Auditoria */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black">Registro Imutável de Auditoria (Logs de QR Code)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Cada escaneamento de QR Code grava um evento imutável contendo timestamp atômico, geolocalização por GPS obrigatória, identificação do operador parceiro e hash criptográfico para resolução de disputas e controle de SLA.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total de Baixas Gravadas:</span>
          <div className="text-2xl font-black font-mono text-amber-400">
            {allScanLogs.length} eventos
          </div>
        </div>
      </div>

      {/* Filtros de Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por código, operador ou hash..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterStep}
            onChange={(e) => setFilterStep(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-700 outline-hidden w-full sm:w-auto"
          >
            <option value="all">Todos os tipos de baixa</option>
            <option value="created">Geração da Etiqueta</option>
            <option value="dropoff_in">Entrada no Ponto Lojista</option>
            <option value="pickup_courier">Coleta pelo Entregador (Baixa 1)</option>
            <option value="dropoff_out">Saída do Ponto Lojista</option>
            <option value="final_delivery">Entrega Final (Assinatura)</option>
          </select>
        </div>
      </div>

      {/* Tabela de Eventos de Auditoria */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp / Hash</th>
                <th className="px-4 py-3">Código do Pacote</th>
                <th className="px-4 py-3">Tipo de Baixa</th>
                <th className="px-4 py-3">Operador / Papel</th>
                <th className="px-4 py-3">Geolocalização GPS</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-mono font-bold text-slate-900">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]" title={log.auditHash}>
                      {log.auditHash.substring(0, 16)}...
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-mono font-bold text-slate-900 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                      {log.trackingCode}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-800">{log.description}</div>
                    <span className="text-[10px] text-slate-400 font-mono capitalize">
                      {log.stepType.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{log.operatorName}</div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {log.operatorRole} ({log.operatorId})
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate max-w-[160px]">{log.locationName}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      lat: {log.coordinates.lat.toFixed(4)}, lng: {log.coordinates.lng.toFixed(4)}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => handleInspectOrder(log.trackingCode)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                      title="Ver detalhes da encomenda no rastreio"
                    >
                      <span>Inspecionar</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
