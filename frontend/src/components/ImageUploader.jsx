import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Link as LinkIcon, X, Check, RefreshCw, Eye, Sparkles } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function ImageUploader({ value, onChange, label = "Imagen del producto" }) {
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'camera', 'url'
  const [urlInput, setUrlInput] = useState(value || '');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const fileInputRef = useRef(null);
  const mobileCameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleStartCamera = async () => {
    setCameraError('');
    try {
      stopCameraStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('getUserMedia error:', err);
      setCameraError('No se pudo acceder a la webcam/cámara en este navegador.');
      // Fallback: trigger native mobile camera input
      if (mobileCameraInputRef.current) {
        mobileCameraInputRef.current.click();
      }
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      stopCameraStream();
      uploadBase64(dataUrl);
    } catch (e) {
      toast.error('Error al capturar foto');
    }
  };

  const uploadBase64 = async (base64) => {
    setUploading(true);
    try {
      const res = await api.post('/admin/upload-image', { image: base64 });
      if (res.data.success) {
        onChange(res.data.imageUrl);
        toast.success('¡Imagen cargada exitosamente!');
      } else {
        toast.error(res.data.message || 'Error al subir la imagen');
      }
    } catch (err) {
      console.error('Error uploading image', err);
      toast.error('Error al subir imagen al servidor');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      uploadBase64(event.target.result);
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    toast.success('URL de imagen aplicada');
  };

  const handleRemoveImage = () => {
    onChange('');
    setUrlInput('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-zinc-700">{label}</label>
        {value && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
          >
            <X size={14} /> Quitar imagen
          </button>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={mobileCameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Preview if image exists */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center p-3">
          <img
            src={value}
            alt="Vista previa"
            className="h-44 w-full object-contain rounded-xl"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/400x300?text=Error+de+Carga';
            }}
          />
          <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-zinc-800 px-3 py-1.5 rounded-lg font-bold text-xs shadow-md hover:bg-zinc-100 flex items-center gap-1.5"
            >
              <Upload size={14} /> Cambiar archivo
            </button>
            <button
              type="button"
              onClick={handleStartCamera}
              className="bg-white text-zinc-800 px-3 py-1.5 rounded-lg font-bold text-xs shadow-md hover:bg-zinc-100 flex items-center gap-1.5"
            >
              <Camera size={14} /> Tomar foto
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="bg-red-600 text-white p-1.5 rounded-lg font-bold text-xs shadow-md hover:bg-red-700"
              title="Eliminar"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Selector Box */
        <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-4 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <RefreshCw className="animate-spin text-emerald-600 mb-2" size={32} />
              <p className="text-sm font-bold text-zinc-700">Subiendo imagen al servidor...</p>
              <p className="text-xs text-zinc-400">Por favor, espera un momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 bg-white border border-zinc-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group shadow-xs cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload size={20} />
                  </div>
                  <span className="text-xs font-bold text-zinc-800">Desde tu ordenador</span>
                  <span className="text-[11px] text-zinc-400">Archivos JPG, PNG, WEBP</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="flex flex-col items-center justify-center p-4 bg-white border border-zinc-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group shadow-xs cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Camera size={20} />
                  </div>
                  <span className="text-xs font-bold text-zinc-800">Tomar foto</span>
                  <span className="text-[11px] text-zinc-400">Cámara o dispositivo</span>
                </button>
              </div>

              {/* URL fallback */}
              <div className="pt-2 border-t border-zinc-200">
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1 flex items-center gap-1">
                  <LinkIcon size={12} /> O ingresar URL directa:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://ejemplo.com/foto.jpg"
                    className="flex-1 px-3 py-1.5 text-xs border border-zinc-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Webcam / Camera Modal */}
      {cameraActive && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 rounded-3xl overflow-hidden max-w-lg w-full border border-zinc-800 shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Camera className="text-emerald-400" size={20} />
                <span className="font-bold text-sm">Cámara en Vivo - Tomar Foto</span>
              </div>
              <button
                type="button"
                onClick={stopCameraStream}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/20 m-6 rounded-2xl flex items-center justify-center">
                <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Alinea el producto aquí</span>
              </div>
            </div>

            <div className="p-5 flex items-center justify-between bg-zinc-950">
              <button
                type="button"
                onClick={() => mobileCameraInputRef.current?.click()}
                className="text-xs text-zinc-400 hover:text-zinc-200 font-semibold"
              >
                Usar cámara del sistema
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={stopCameraStream}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="px-5 py-2 text-xs font-bold text-zinc-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-lg shadow-emerald-400/20 flex items-center gap-2"
                >
                  <Camera size={16} /> Capturar Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
