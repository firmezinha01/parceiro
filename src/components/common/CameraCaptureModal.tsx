import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Upload, AlertCircle } from 'lucide-react';
import { compressImage } from '../../utils/imageCompression';

interface CameraCaptureModalProps {
  title: string;
  description?: string;
  onCapture: (photoDataUrl: string) => void;
  onClose: () => void;
  facingMode?: 'user' | 'environment';
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  title,
  description,
  onCapture,
  onClose,
  facingMode = 'user',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>(facingMode);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        setCameraError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError('Câmera não suportada neste navegador.');
          return;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: currentFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } catch (err: any) {
        console.warn('Erro ao acessar câmera:', err);
        setCameraError('Não foi possível acessar a câmera. Você pode fazer upload de uma foto do dispositivo.');
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [currentFacingMode]);

  const handleTakePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // Para o stream da câmera
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Comprime imagem para economizar espaço e evitar estouro de cota
    const compressed = await compressImage(rawDataUrl, 420, 420, 0.65);
    setCapturedPhoto(compressed);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setCurrentFacingMode((prev) => (prev === 'user' ? 'user' : 'environment'));
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, 420, 420, 0.65);
      if (compressed) {
        setCapturedPhoto(compressed);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 my-0 sm:my-auto overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h3 className="text-sm font-black">{title}</h3>
              {description && <p className="text-[11px] text-slate-400">{description}</p>}
            </div>
          </div>
          <button
            onClick={() => {
              if (stream) stream.getTracks().forEach((t) => t.stop());
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder ou Foto Capturada */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="relative aspect-4/3 max-h-[48vh] sm:max-h-none bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 mx-auto w-full">
            {capturedPhoto ? (
              <img src={capturedPhoto} alt="Captura" className="w-full h-full object-cover" />
            ) : cameraError ? (
              <div className="p-6 text-center space-y-3 text-slate-300">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <p className="text-xs">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-xs"
                >
                  Selecionar Foto do Arquivo
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${currentFacingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
            )}

            {/* Canvas oculto para tirar snapshot */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Alternar Câmera Frontal / Traseira no Celular */}
            {!capturedPhoto && !cameraError && (
              <button
                type="button"
                onClick={() =>
                  setCurrentFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
                }
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80"
                title="Alternar Câmera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {!capturedPhoto ? (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Do Dispositivo</span>
                </button>

                <button
                  type="button"
                  onClick={handleTakePhoto}
                  disabled={!!cameraError}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Tirar Foto Agora</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tirar Outra</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Usar Esta Foto</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
