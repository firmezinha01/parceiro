import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  X,
  Share2,
  MoreVertical,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  ShieldCheck,
  QrCode,
  PackageCheck
} from 'lucide-react';
import { QRCodeViewer } from './QRCodeViewer';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lanUrl: string;
  lanIp?: string;
  publicUrl?: string | null;
  onUpdateIp?: (newIp: string) => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  lanUrl,
  lanIp,
  publicUrl,
  onUpdateIp,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'apk'>('android');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [ipInput, setIpInput] = useState(lanIp || '192.168.15.5');
  const targetUrl = publicUrl || lanUrl;

  useEffect(() => {
    if (lanIp) {
      setIpInput(lanIp);
    }
  }, [lanIp]);

  useEffect(() => {
    // Detecta se já está rodando em modo standalone (app instalado)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS navigator property
      window.navigator.standalone === true;

    setIsInstalled(isStandalone);

    // Detecta se o dispositivo atual é móvel
    const userAgent = navigator.userAgent || navigator.vendor;
    const isMobile = /android|ipad|iphone|ipod/i.test(userAgent);
    setIsMobileDevice(isMobile);

    if (/iphone|ipad|ipod/i.test(userAgent)) {
      setActiveTab('ios');
    } else {
      setActiveTab('android');
    }

    // Captura o evento nativo de instalação do Chrome/Edge/Android
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 text-slate-900 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-sm overflow-hidden shrink-0">
              <img src="/pwa-192x192.png" alt="Parceiro" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                Instalar App Parceiro no Celular
              </h2>
              <p className="text-[11px] text-slate-500">
                Acesse como aplicativo nativo (PWA) em tela cheia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 pt-4 pr-1">
          {/* Se o app já estiver instalado */}
          {isInstalled && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>O aplicativo já está instalado e rodando em modo standalone!</span>
            </div>
          )}

          {/* Botão de Instalação Direta (se o navegador suportar o evento) */}
          {deferredPrompt && !isInstalled && (
            <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl text-slate-950 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Instalação Automática Disponível
                </div>
                <span className="text-[10px] bg-slate-950/20 px-2 py-0.5 rounded-full font-bold">
                  1 Clique
                </span>
              </div>
              <p className="text-xs font-medium text-slate-900 leading-snug">
                Seu navegador suporta instalação imediata na tela de início do seu dispositivo.
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                Instalar Aplicativo Agora
              </button>
            </div>
          )}

          {/* QR Code para abrir no celular se estiver acessando do PC */}
          {!isMobileDevice && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>1º Passo: Aponte a câmera do celular para o código</span>
              </div>
              
              {publicUrl ? (
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Link Seguro HTTPS Liberado (Wi-Fi ou 4G)
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Conecte o celular no <strong>mesmo Wi-Fi</strong> deste computador e aponte a câmera:
                </p>
              )}

              <div className="flex justify-center py-1">
                <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <QRCodeViewer value={targetUrl} size={155} />
                </div>
              </div>

              <div className="flex items-center gap-1.5 max-w-sm mx-auto">
                <input
                  type="text"
                  readOnly
                  value={targetUrl}
                  className="w-full px-2.5 py-1.5 text-[11px] font-mono bg-white border border-slate-200 rounded-lg text-slate-700 text-center select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-lg font-bold shrink-0 transition cursor-pointer"
                >
                  {copiedLink ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              {onUpdateIp && (
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-left space-y-1.5 max-w-sm mx-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">IP do Computador na Rede Wi-Fi:</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Ativo: {lanIp}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={ipInput}
                      onChange={(e) => setIpInput(e.target.value.trim())}
                      placeholder="Ex: 192.168.15.5"
                      className="text-xs font-mono px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg w-full outline-hidden focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => onUpdateIp(ipInput)}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg shrink-0 transition cursor-pointer"
                    >
                      Atualizar
                    </button>
                  </div>
                  <span className="text-[9px] text-slate-400 block leading-tight">
                    O sistema detecta o IP dinamicamente. Se seu roteador Wi-Fi mudar o IP após reiniciar, altere aqui.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Seletor de Instruções por Plataforma */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Como instalar no aparelho:</span>
              <span className="text-[11px] text-slate-400">Escolha o seu sistema</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'android'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                Android
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'ios'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                iPhone / iOS
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('apk')}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'apk'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                Gerar APK
              </button>
            </div>

            {/* Guia Android */}
            {activeTab === 'android' && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-700 space-y-3 animate-in fade-in">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Passo a passo no Google Chrome do Android:
                </div>
                <ol className="space-y-2 list-decimal list-inside pl-1 text-[11px] leading-relaxed text-slate-700">
                  <li>
                    Abra o link <span className="font-mono font-bold break-all">{targetUrl}</span> no <strong>Google Chrome</strong> do celular.
                  </li>
                  <li>
                    Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior direito da tela.
                  </li>
                  <li>
                    Procure e selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </li>
                  <li>
                    Confirme tocando em <strong>"Instalar"</strong>.
                  </li>
                </ol>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>O ícone oficial do <strong>Parceiro</strong> será criado na sua tela inicial e funcionará como um app nativo, com câmera e scanner liberados!</span>
                </div>
              </div>
            )}

            {/* Guia iOS */}
            {activeTab === 'ios' && (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-slate-700 space-y-3 animate-in fade-in">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Passo a passo no Safari do iPhone / iPad:
                </div>
                <ol className="space-y-2 list-decimal list-inside pl-1 text-[11px] leading-relaxed text-slate-700">
                  <li>
                    Abra o endereço <span className="font-mono font-bold break-all">{targetUrl}</span> no <strong>Safari</strong> (navegador oficial da Apple).
                  </li>
                  <li>
                    Toque no botão de <strong>Compartilhar</strong> (ícone de um quadrado com uma seta apontando para cima na barra inferior).
                  </li>
                  <li>
                    Role as opções para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> (com ícone de <strong>+</strong>).
                  </li>
                  <li>
                    No topo direito, toque em <strong>"Adicionar"</strong>.
                  </li>
                </ol>
                <div className="p-2.5 bg-white rounded-xl border border-blue-200 text-[11px] text-blue-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>O app abrirá em tela cheia (sem barra de endereço do Safari), proporcionando experiência 100% nativa.</span>
                </div>
              </div>
            )}

            {/* Guia APK Nativo */}
            {activeTab === 'apk' && (
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs text-slate-700 space-y-3 animate-in fade-in">
                <div className="font-bold text-purple-950 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Como transformar em arquivo APK Android (.apk):
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Para gerar um arquivo instalador independente <code className="font-mono bg-purple-100 px-1 py-0.5 rounded text-purple-900 font-bold">.apk</code> para enviar via WhatsApp, e-mail ou publicar na Google Play Store:
                </p>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 bg-white rounded-xl border border-purple-200">
                    <strong className="text-purple-950 block">Método 1: Capacitor (Recomendado)</strong>
                    <span className="text-slate-600">Empacota este projeto React diretamente em um projeto Android Studio nativo com suporte total a notificações push e hardware.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-purple-200">
                    <strong className="text-purple-950 block">Método 2: PWA Builder (Microsoft)</strong>
                    <span className="text-slate-600">Basta publicar o app em um link público (ex: Vercel) e colar no <a href="https://pwabuilder.com" target="_blank" rel="noreferrer" className="text-purple-700 underline font-bold">PWABuilder.com</a> para baixar o pacote APK assinado em 2 minutos.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dica de Produção na Nuvem */}
          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <strong>Dica para uso com clientes reais:</strong> Publicando o aplicativo em hospedagem gratuita com HTTPS (ex: Vercel, Netlify ou Render), o Google Chrome exibirá o banner automático de instalação para qualquer pessoa que acessar no Brasil.
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end shrink-0 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Entendido, Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
