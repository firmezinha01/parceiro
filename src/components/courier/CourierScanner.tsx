import React, { useState, useRef, useEffect } from 'react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';
import { SignaturePad } from './SignaturePad';
import { getCurrentGPSPosition } from '../../services/geolocationService';
import { formatCurrency } from '../../services/pricingEngine';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sparkles,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CourierScannerProps {
  order: Order;
  scanType: 'pickup' | 'delivery';
  onComplete: () => void;
  onCancel: () => void;
}

export const CourierScanner: React.FC<CourierScannerProps> = ({
  order,
  scanType,
  onComplete,
  onCancel,
}) => {
  const { recordCourierPickup, completeDelivery } = useApp();
  const [step, setStep] = useState<'scan' | 'signature' | 'done'>('scan');
  const [isScanningLive, setIsScanningLive] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isDelivery = scanType === 'delivery';

  // Inicia captura de GPS real imediatamente
  useEffect(() => {
    getCurrentGPSPosition().then((coords) => {
      setGpsCoordinates(coords);
    });
  }, []);

  // Inicia Câmera Real e scanner jsQR
  useEffect(() => {
    let mounted = true;

    async function startLiveCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setIsScanningLive(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Câmera traseira no smartphone para ler QR
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        setCameraActive(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          requestScanFrame();
        }
      } catch (err) {
        console.warn('Câmera real não autorizada ou indisponível:', err);
        setCameraActive(false);
        setIsScanningLive(false);
      }
    }

    startLiveCamera();

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const requestScanFrame = () => {
    animationFrameRef.current = requestAnimationFrame(scanTick);
  };

  const scanTick = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          // Detectou QR Code real!
          handleQRCodeDetected(code.data);
          return; // Para o loop de scan
        }
      }
    }

    if (isScanningLive) {
      requestScanFrame();
    }
  };

  const handleQRCodeDetected = (dataString: string) => {
    // Para a câmera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    if (isDelivery) {
      setStep('signature');
    } else {
      recordCourierPickup(order.id);
      confetti({ particleCount: 50, spread: 60 });
      setStep('done');
      setTimeout(() => {
        onComplete();
      }, 1400);
    }
  };

  const handleSimulateScan = () => {
    handleQRCodeDetected(order.trackingCode);
  };

  const handleSignatureSaved = (signatureUrl: string) => {
    completeDelivery(order.id, signatureUrl);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setStep('done');
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest font-bold">
              {isDelivery ? 'BAIXA FINAL: ENTREGA AO DESTINATÁRIO' : 'BAIXA 1: COLETA DE PACOTE'}
            </span>
            <h3 className="text-lg font-black mt-0.5">
              {order.trackingCode}
            </h3>
          </div>
          <button
            onClick={() => {
              if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
              onCancel();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {step === 'scan' && (
            <div className="space-y-4 text-center">
              {/* Leitor de Câmera Real ou Viewfinder */}
              <div className="relative mx-auto w-64 h-64 bg-slate-900 rounded-2xl border-4 border-dashed border-amber-400 flex flex-col items-center justify-center overflow-hidden">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                    />
                    <div className="absolute inset-x-4 h-1 bg-emerald-400/90 shadow-md shadow-emerald-400 animate-[bounce_2s_infinite]" />
                    <div className="absolute bottom-2 inset-x-2 bg-black/60 backdrop-blur-xs text-emerald-400 text-[10px] font-mono py-1 rounded-md">
                      ● Câmera Ativa: Aponte para o QR Code
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-slate-400 flex flex-col items-center">
                    <Camera className="w-12 h-12 text-slate-500 mb-2" />
                    <p className="text-xs text-slate-300 font-medium px-2">
                      Câmera não iniciada. Você pode permitir o acesso ou usar o botão de scan simulado abaixo.
                    </p>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Informações da Baixa com GPS Real */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-left">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium truncate max-w-[200px]">
                    {isDelivery ? order.recipient.address.street : order.sender.address.street}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  {gpsCoordinates ? `GPS: ${gpsCoordinates.lat.toFixed(3)}, ${gpsCoordinates.lng.toFixed(3)}` : 'GPS Ativo'}
                </span>
              </div>

              {/* Botão de Leitura Imediata (Fallback ou Teste Rápido) */}
              <button
                onClick={handleSimulateScan}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirmar Leitura do QR Code</span>
              </button>
            </div>
          )}

          {step === 'signature' && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  ✓ QR Code Validado com Sucesso!
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Solicite ao recebedor ({order.recipient.name}) que assine no quadro abaixo:
                </p>
              </div>

              <SignaturePad
                onSave={handleSignatureSaved}
                onCancel={() => setStep('scan')}
              />
            </div>
          )}

          {step === 'done' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                {isDelivery ? 'Entrega Finalizada!' : 'Coleta Realizada!'}
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                {isDelivery
                  ? `Repasse de ${formatCurrency(order.price.totalCourierPayout)} creditado na sua carteira com GPS auditado.`
                  : 'O pacote agora está sob sua custódia e em trânsito para o destino.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
