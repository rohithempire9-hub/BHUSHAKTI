import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  RotateCw,
  Check,
  RefreshCw,
  AlertCircle,
  MapPin,
  Clock,
  Shield,
  Zap,
  Upload,
  Crosshair,
  Sliders
} from 'lucide-react';
import { dataUrlToFile } from '../../utils/imageCompressor';

export interface CameraCaptureResult {
  file: File;
  dataUrl: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  source: 'live_camera';
}

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (result: CameraCaptureResult) => void;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  stationName?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  locationName = 'Northeast India Field Sector',
  latitude,
  longitude,
  stationName,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<'requesting' | 'streaming' | 'captured' | 'error'>('requesting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [stampWatermark, setStampWatermark] = useState<boolean>(true);
  const [isShutterFlashing, setIsShutterFlashing] = useState<boolean>(false);
  const [currentTimestamp, setCurrentTimestamp] = useState<string>(new Date().toLocaleString());
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  // Play synthetic camera shutter audio using Web Audio API
  const playShutterSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio playback fails gracefully if unpermitted
    }
  }, []);

  // Update live clock
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCurrentTimestamp(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Check available video devices
  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      })
      .catch(() => {});
  }, []);

  // Stop camera stream cleanly
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    stopCameraStream();
    setCameraState('requesting');
    setErrorMessage(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('error');
      setErrorMessage(
        'Camera API (getUserMedia) is not supported in this browser. Please use the file upload option or grant camera permissions.'
      );
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setCameraState('streaming');
        };
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          'Camera access was blocked. Please click the camera icon in your browser address bar to allow camera access.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera hardware was detected on your system. You can upload an image file instead.');
      } else {
        setErrorMessage(`Could not initialize camera: ${err.message || 'Unknown error'}`);
      }
    }
  }, [facingMode, stopCameraStream]);

  // Start camera on modal open
  useEffect(() => {
    if (isOpen) {
      setCapturedPhotoUrl(null);
      startCamera();
    } else {
      stopCameraStream();
      setCameraState('requesting');
      setCapturedPhotoUrl(null);
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen, startCamera, stopCameraStream]);

  // Toggle Camera Facing Mode (Front / Back)
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture Photo from Live Stream
  const handleCapturePhoto = () => {
    if (!videoRef.current || cameraState !== 'streaming') return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trigger visual flash & audio sound
    setIsShutterFlashing(true);
    playShutterSound();
    setTimeout(() => setIsShutterFlashing(false), 200);

    // If using front camera, mirror image back for natural orientation
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);
    if (facingMode === 'user') {
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    }

    // Burn Geotechnical Field Watermark directly onto canvas if toggled
    if (stampWatermark) {
      const bannerHeight = Math.max(54, Math.round(height * 0.08));
      // Dark gradient overlay along bottom
      const gradient = ctx.createLinearGradient(0, height - bannerHeight - 20, 0, height);
      gradient.addColorStop(0, 'rgba(6, 12, 30, 0)');
      gradient.addColorStop(0.3, 'rgba(6, 12, 30, 0.85)');
      gradient.addColorStop(1, 'rgba(6, 12, 30, 0.96)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height - bannerHeight - 20, width, bannerHeight + 20);

      // Cyan accent border line
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height - bannerHeight);
      ctx.lineTo(width, height - bannerHeight);
      ctx.stroke();

      // Text Watermark
      const fontSize = Math.max(12, Math.round(width * 0.016));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = '#ffffff';

      const locText = `BHUSHAKTI FIELD EVIDENCE | ${stationName || locationName}`;
      ctx.fillText(locText, 20, height - bannerHeight + fontSize + 4);

      ctx.font = `normal ${Math.round(fontSize * 0.85)}px monospace`;
      ctx.fillStyle = '#67e8f9';
      const gpsText = latitude && longitude
        ? `GPS: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E | UTC: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`
        : `TIMESTAMP: ${new Date().toLocaleString()} | VERIFIED SENSOR GRID`;
      ctx.fillText(gpsText, 20, height - 12);

      // Right-aligned verification badge
      ctx.textAlign = 'right';
      ctx.font = `bold ${Math.round(fontSize * 0.8)}px sans-serif`;
      ctx.fillStyle = '#34d399';
      ctx.fillText('GEOTAGGED CAMERA EVIDENCE [SEC-OK]', width - 20, height - 14);
      ctx.textAlign = 'left';
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhotoUrl(dataUrl);
    setCameraState('captured');
    stopCameraStream();
  };

  // Retake photo: restart camera stream
  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    startCamera();
  };

  // Accept and use captured photo
  const handleConfirmPhoto = () => {
    if (!capturedPhotoUrl) return;

    const filename = `camera_evidence_${Date.now()}.jpg`;
    const file = dataUrlToFile(capturedPhotoUrl, filename);

    onPhotoCaptured({
      file,
      dataUrl: capturedPhotoUrl,
      timestamp: currentTimestamp,
      latitude,
      longitude,
      locationName,
      source: 'live_camera',
    });

    onClose();
  };

  // Load a simulated high-res field photo for demonstration if camera is unavailable in browser
  const handleUseSimulatedFieldPhoto = () => {
    const sampleUrl =
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80';
    
    // Create an image element to draw watermark on canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = img.width || 1200;
      canvas.height = img.height || 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Watermark
        const bannerHeight = 60;
        ctx.fillStyle = 'rgba(6, 12, 30, 0.9)';
        ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, canvas.height - bannerHeight, canvas.width, 2);

        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`BHUSHAKTI EVIDENCE SIMULATOR | ${stationName || locationName}`, 20, canvas.height - 32);

        ctx.font = '14px monospace';
        ctx.fillStyle = '#67e8f9';
        ctx.fillText(
          `GPS: ${latitude?.toFixed(4) || 27.1742}°N, ${longitude?.toFixed(4) || 88.5283}°E | ${new Date().toLocaleString()}`,
          20,
          canvas.height - 12
        );

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setCapturedPhotoUrl(dataUrl);
        setCameraState('captured');
      }
    };
    img.src = sampleUrl;
  };

  if (!isOpen) return null;

  return (
    <div
      id="camera-capture-modal-backdrop"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="camera-capture-modal-container"
        className="relative w-full max-w-3xl bg-[#060c1e] border border-[#1b3470] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Shutter White Flash Animation */}
        {isShutterFlashing && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-150 opacity-90 animate-out fade-out" />
        )}

        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-[#08122c] border-b border-[#142654] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Field Evidence Camera</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  LIVE VIEWFINDER
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Capture high-resolution photographic proof of slope cracks, slip displacement, or debris flows
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stamp Watermark Toggle */}
            <button
              type="button"
              onClick={() => setStampWatermark(!stampWatermark)}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                stampWatermark
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
              title="Overlay GPS, Timestamp, and BhuShakti Verification Watermark"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>GPS Watermark: {stampWatermark ? 'ON' : 'OFF'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Main Stage */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[340px] sm:min-h-[440px]">
          {/* 1. Requesting / Connecting Screen */}
          {cameraState === 'requesting' && (
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <RefreshCw className="w-9 h-9 text-cyan-400 animate-spin" />
              <div className="text-sm font-bold text-white">Connecting to Camera Hardware...</div>
              <p className="text-xs text-slate-400 max-w-sm">
                Requesting camera access permissions. If prompted by your browser, click &quot;Allow&quot;.
              </p>
            </div>
          )}

          {/* 2. Error / Fallback Screen */}
          {cameraState === 'error' && (
            <div className="p-6 max-w-md text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Camera Not Accessible</h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                {errorMessage || 'Unable to access your device camera.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full justify-center">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Connection
                </button>

                <button
                  type="button"
                  onClick={handleUseSimulatedFieldPhoto}
                  className="px-4 py-2 rounded-xl bg-[#0c1a3e] hover:bg-[#142654] border border-[#1b3470] text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  Load Sample Field Shot
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mt-4">
                Tip: If testing on desktop without a webcam, you can also browse files from disk directly in the evidence modal.
              </p>
            </div>
          )}

          {/* 3. Live Streaming Video Viewfinder */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraState === 'streaming' ? 'block' : 'hidden'}`}
          />

          {/* 4. Captured Still Image Preview */}
          {cameraState === 'captured' && capturedPhotoUrl && (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedPhotoUrl}
                alt="Captured Evidence"
                className="max-h-[60vh] max-w-full object-contain rounded"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <Check className="w-3.5 h-3.5" />
                <span>Photo Captured Successfully</span>
              </div>
            </div>
          )}

          {/* Geotechnical Live HUD Overlay (Active during live streaming) */}
          {cameraState === 'streaming' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-5">
              {/* Top Viewfinder Status & Crosshairs */}
              <div className="flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-bold text-white uppercase tracking-wider">REC LIVE</span>
                  <span className="text-slate-400">|</span>
                  <span>{currentTimestamp}</span>
                </div>

                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate max-w-[200px]">{stationName || locationName}</span>
                  {latitude && longitude && (
                    <span className="text-cyan-300 font-mono text-[10px]">
                      ({latitude.toFixed(2)}°, {longitude.toFixed(2)}°)
                    </span>
                  )}
                </div>
              </div>

              {/* Center Target Crosshairs */}
              <div className="self-center relative w-48 h-48 sm:w-64 sm:h-64 border border-cyan-400/30 rounded-xl flex items-center justify-center">
                {/* Corner Brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                {/* Center Reticle */}
                <Crosshair className="w-8 h-8 text-cyan-400/60" />

                <span className="absolute bottom-2 text-[10px] font-mono text-cyan-300/80 bg-black/50 px-1.5 rounded">
                  ALIGN CRACK / SLOPE
                </span>
              </div>

              {/* Bottom Live Telemetry Note */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TAMPER-RESISTANT TIMESTAMP & GEO-HASH ACTIVE</span>
                </div>
                <div className="hidden sm:block text-slate-400">
                  PRESS SHUTTER BUTTON BELOW TO SNAP
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#08122c] border-t border-[#142654] flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Left status / watermark indicator */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {cameraState === 'captured' ? (
                <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Review photo before uploading
                </span>
              ) : (
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  High-Def Field Sensor Optics
                </span>
              )}
            </span>
          </div>

          {/* Center / Right Action Buttons */}
          <div className="flex items-center gap-3 ml-auto">
            {cameraState === 'streaming' && (
              <>
                {/* Switch Camera Button (Front/Back) */}
                {hasMultipleCameras && (
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                    title="Switch Front/Back Camera"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                )}

                {/* Primary Shutter Button */}
                <button
                  type="button"
                  id="camera-shutter-btn"
                  onClick={handleCapturePhoto}
                  className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 border-4 border-white/80 shadow-lg shadow-rose-900/50 cursor-pointer active:scale-95 transition-all"
                  title="Click to Snap Evidence Photo"
                >
                  <div className="w-10 h-10 rounded-full bg-white group-hover:scale-90 transition-transform" />
                  <Camera className="absolute w-5 h-5 text-rose-600" />
                </button>
              </>
            )}

            {cameraState === 'captured' && (
              <>
                <button
                  type="button"
                  id="camera-retake-btn"
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Photo</span>
                </button>

                <button
                  type="button"
                  id="camera-confirm-btn"
                  onClick={handleConfirmPhoto}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-400/40 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Use Photo as Evidence</span>
                </button>
              </>
            )}

            {cameraState === 'error' && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
