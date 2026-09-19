import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  User,
  Store,
  Bike,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Eye,
  Camera,
  FileText,
  MapPin,
} from 'lucide-react';

export const AdminVerificationView: React.FC = () => {
  const {
    clients,
    couriers,
    dropoffPoints,
    approveVerification,
    rejectVerification,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'clients' | 'merchants' | 'couriers'>('clients');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<{ title: string; url: string } | null>(null);

  return (
    <div className="space-y-6">
      {/* Banner de Compliance */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Central de Compliance & Auditoria de Cadastros</span>
          </div>
          <h3 className="text-base font-black mt-1">
            Validação Documental dos 3 Atores da Rede
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Aqui você audita e valida os documentos dos <strong>Clientes Remetentes</strong> (RG/CNH e selfie contra ilícitos), dos <strong>Pontos Lojistas</strong> (CNPJ, comprovante de endereço e foto da fachada) e dos <strong>Entregadores</strong> (CNH e veículo).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center px-3 py-2 bg-slate-800 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Clientes</span>
            <div className="text-sm font-black font-mono text-emerald-400">{clients.length}</div>
          </div>
          <div className="text-center px-3 py-2 bg-slate-800 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Lojistas</span>
            <div className="text-sm font-black font-mono text-purple-400">{dropoffPoints.length}</div>
          </div>
          <div className="text-center px-3 py-2 bg-slate-800 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Entregadores</span>
            <div className="text-sm font-black font-mono text-amber-400">{couriers.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs de Seleção de Ator */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('clients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'clients'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Clientes Remetentes ({clients.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('merchants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'merchants'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Pontos Lojistas ({dropoffPoints.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('couriers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'couriers'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Entregadores ({couriers.length})</span>
        </button>
      </div>

      {/* ========================================================
          1. LISTA DE CLIENTES REMETENTES
      ======================================================== */}
      {activeSubTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clients.map((cli) => (
            <div
              key={cli.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{cli.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cli.verificationStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cli.verificationStatus === 'verified' ? '✓ Remetente Verificado' : 'Em Análise'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    CPF: {cli.document} • Tel: {cli.phone}
                  </p>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  Cadastrado em: {new Date(cli.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    {cli.defaultAddress.street}, {cli.defaultAddress.number} — {cli.defaultAddress.neighborhood}, {cli.defaultAddress.city}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Declaração de Carga Lícita Aceita</span>
                </div>
              </div>

              {/* Documentos Anexados */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Documentação Auditável:
                </span>
                <div className="flex items-center gap-3">
                  {cli.documentPhoto && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoModal({
                          title: `Documento de ${cli.name}`,
                          url: cli.documentPhoto!,
                        })
                      }
                      className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Documento</span>
                    </button>
                  )}

                  {cli.selfiePhoto && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoModal({
                          title: `Selfie Biométrica de ${cli.name}`,
                          url: cli.selfiePhoto!,
                        })
                      }
                      className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Ver Selfie</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Ações de Aprovação */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                {cli.verificationStatus !== 'verified' ? (
                  <button
                    onClick={() => approveVerification('client', cli.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprovar Cadastro</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Remetente 100% Auditado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          2. LISTA DE PONTOS LOJISTAS
      ======================================================== */}
      {activeSubTab === 'merchants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dropoffPoints.map((dp) => (
            <div
              key={dp.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{dp.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                      Ponto Credenciado
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    CNPJ: {dp.cnpj || 'Informado na adesão'} • Resp: {dp.ownerName}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                  {dp.category || 'Comércio Local'}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    {dp.address.street}, {dp.address.number} — {dp.address.neighborhood} ({dp.address.city})
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Horário: {dp.openingHours} | Chave Pix: {dp.pixKey || dp.cnpj || 'Definida'}
                </div>
              </div>

              {/* Documentos do Lojista */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Documentação Comercial Auditada:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {dp.facadePhoto && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoModal({
                          title: `Foto da Fachada da Loja (${dp.name})`,
                          url: dp.facadePhoto!,
                        })
                      }
                      className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-purple-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Fachada da Loja</span>
                    </button>
                  )}

                  {dp.documentPhoto && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoModal({
                          title: `Documento do Titular (${dp.ownerName})`,
                          url: dp.documentPhoto!,
                        })
                      }
                      className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-purple-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Documento do Sócio</span>
                    </button>
                  )}

                  {dp.addressProofPhoto && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoModal({
                          title: `Comprovante de Endereço Comercial (${dp.name})`,
                          url: dp.addressProofPhoto!,
                        })
                      }
                      className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-purple-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Comprovante Endereço</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  {dp.packageCount} pacotes custodiados no histórico
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Estabelecimento Habilitado
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          3. LISTA DE ENTREGADORES PARCEIROS
      ======================================================== */}
      {activeSubTab === 'couriers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {couriers.map((cou) => (
            <div
              key={cou.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={cou.avatarUrl}
                    alt={cou.name}
                    className="w-11 h-11 rounded-xl object-cover border-2 border-amber-400"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{cou.name}</span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                        {cou.modal}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      CPF: {cou.document} • CNH: {cou.cnh}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Avaliação</span>
                  <div className="text-xs font-bold text-amber-700 font-mono">
                    ★ {cou.rating.toFixed(2)} ({cou.totalDeliveries} corridas)
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  <strong>Veículo:</strong> {cou.vehicleModel || 'Modelo Cadastrado'} •{' '}
                  <span className="font-mono uppercase font-bold">{cou.vehiclePlate}</span>
                </div>
                <div>
                  <strong>Chave Pix:</strong> <span className="font-mono">{cou.pixKey}</span>
                </div>
              </div>

              {/* Documentos */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Documentação Auditável:
                </span>
                <div className="flex items-center gap-3">
                  {cou.documentPhoto && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoModal({
                          title: `CNH de ${cou.name}`,
                          url: cou.documentPhoto!,
                        })
                      }
                      className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-amber-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Foto da CNH</span>
                    </button>
                  )}

                  {cou.selfiePhoto && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoModal({
                          title: `Selfie do Motorista (${cou.name})`,
                          url: cou.selfiePhoto!,
                        })
                      }
                      className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-amber-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Selfie Facial</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Saldo em carteira: R$ {cou.balanceAvailable.toFixed(2)}
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Entregador Credenciado
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Exibição de Foto de Auditoria */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold truncate">{selectedPhotoModal.title}</span>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex items-center justify-center">
              <img
                src={selectedPhotoModal.url}
                alt={selectedPhotoModal.title}
                className="max-h-96 rounded-xl border border-slate-300 object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
