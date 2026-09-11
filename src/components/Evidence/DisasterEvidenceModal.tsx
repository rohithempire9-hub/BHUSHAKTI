import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Shield,
  MapPin,
  Clock,
  User,
  Phone,
  Sparkles,
  X,
  Eye,
  Trash2,
  Filter,
  Search,
  Maximize2,
  Radio,
  FileCheck,
  RefreshCw,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  DisasterEvidenceReport,
  DisasterClassification,
  DisasterSeverity,
  LandslideStation,
} from '../../types/landslide';
import {
  submitDisasterEvidence,
  updateEvidenceVerificationStatus,
  deleteDisasterEvidence,
} from '../../services/firebase';
import { processUserEvidencePhoto, ProcessedImageResult } from '../../utils/imageCompressor';
import {
  identifyDisasterFromEvidence,
  DisasterIdentificationResult,
} from '../../services/aiDisasterIdentifier';

interface DisasterEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: LandslideStation[];
  selectedStation: LandslideStation | null;
  evidenceList: DisasterEvidenceReport[];
  onSelectStation?: (station: LandslideStation) => void;
  onOpenSmsModalWithAlert?: (prefilledText: string, stationId?: string) => void;
}

export const DisasterEvidenceModal: React.FC<DisasterEvidenceModalProps> = ({
  isOpen,
  onClose,
  stations,
  selectedStation,
  evidenceList,
  onSelectStation,
  onOpenSmsModalWithAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Upload Form State
  const [dragActive, setDragActive] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [processedImage, setProcessedImage] = useState<ProcessedImageResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<DisasterIdentificationResult | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  const [formStationId, setFormStationId] = useState<string>(selectedStation?.id || stations[0]?.id || '');
  const [formLocationName, setFormLocationName] = useState<string>(selectedStation?.name || '');
  const [formRegion, setFormRegion] = useState<string>(selectedStation?.region || 'Northeast India');
  const [formLat, setFormLat] = useState<number>(selectedStation?.latitude || 25.5);
  const [formLng, setFormLng] = useState<number>(selectedStation?.longitude || 93.5);
  const [formReporterName, setFormReporterName] = useState<string>('Rohit Citizen Responder');
  const [formReporterRole, setFormReporterRole] = useState<DisasterEvidenceReport['reporterRole']>('Citizen Observer');
  const [formReporterContact, setFormReporterContact] = useState<string>('+91 90324-79657');
  const [formObservations, setFormObservations] = useState<string>('');
  const [formDisasterType, setFormDisasterType] = useState<DisasterClassification>('Rotational Landslide');
  const [formSeverity, setFormSeverity] = useState<DisasterSeverity>('high');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  // Lightbox Modal state
  const [lightboxReport, setLightboxReport] = useState<DisasterEvidenceReport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync selected station to form defaults
  useEffect(() => {
    if (selectedStation) {
      setFormStationId(selectedStation.id);
      setFormLocationName(selectedStation.name);
      setFormRegion(selectedStation.region + ', ' + selectedStation.country);
      setFormLat(selectedStation.latitude);
      setFormLng(selectedStation.longitude);
    }
  }, [selectedStation]);

  if (!isOpen) return null;

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    try {
      setIsProcessingImage(true);
      setSubmitErrorMessage(null);
      const processed = await processUserEvidencePhoto(file, 960, 0.8);
      setProcessedImage(processed);

      // Auto-trigger AI disaster identification based on image characteristics and user context
      runDisasterIdentification(processed, formObservations);
    } catch (err: any) {
      setSubmitErrorMessage(err.message || 'Failed to process uploaded photo.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const runDisasterIdentification = (
    image: ProcessedImageResult | null,
    observationsText: string
  ) => {
    setIsAnalyzingAi(true);
    setTimeout(() => {
      const matchStation = stations.find((s) => s.id === formStationId) || selectedStation;
      const result = identifyDisasterFromEvidence({
        imageWidth: image?.width,
        imageHeight: image?.height,
        userObservations: observationsText,
        nearbyStation: matchStation,
      });

      setAiAnalysis(result);
      setFormDisasterType(result.disasterType);
      setFormSeverity(result.severityLevel);
      setIsAnalyzingAi(false);
    }, 450);
  };

  // Station dropdown change
  const handleStationChange = (stId: string) => {
    setFormStationId(stId);
    const target = stations.find((s) => s.id === stId);
    if (target) {
      setFormLocationName(target.name);
      setFormRegion(target.region + ', ' + target.country);
      setFormLat(target.latitude);
      setFormLng(target.longitude);
      if (processedImage) {
        runDisasterIdentification(processedImage, formObservations);
      }
    }
  };

  // Current GPS Detection
  const handleUseCurrentGps = () => {
    if (!navigator.geolocation) {
      setSubmitErrorMessage('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormLat(Number(pos.coords.latitude.toFixed(5)));
        setFormLng(Number(pos.coords.longitude.toFixed(5)));
        setFormLocationName(`Field GPS Point (${pos.coords.latitude.toFixed(3)}°N, ${pos.coords.longitude.toFixed(3)}°E)`);
        setSubmitSuccessMessage('Captured current device GPS coordinates.');
        setTimeout(() => setSubmitSuccessMessage(null), 3000);
      },
      (err) => {
        setSubmitErrorMessage(`GPS capture error: ${err.message}`);
      }
    );
  };

  // Submit Evidence Report
  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processedImage) {
      setSubmitErrorMessage('Please upload a photo of the disaster evidence first.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitErrorMessage(null);

      const features = aiAnalysis?.detectedFeatures && aiAnalysis.detectedFeatures.length > 0
        ? aiAnalysis.detectedFeatures
        : ['Visual ground fracture', 'Displaced regolith and topsoil'];

      const recAction = aiAnalysis?.recommendedAction ||
        'Cordon off area. Alert downstream community authorities and maintain observation.';

      await submitDisasterEvidence({
        stationId: formStationId || 'unassigned',
        locationName: formLocationName || 'Northeast Landslide Zone',
        region: formRegion || 'Northeast India',
        latitude: formLat,
        longitude: formLng,
        reporterName: formReporterName || 'Field Reporter',
        reporterRole: formReporterRole,
        reporterContact: formReporterContact,
        userObservations: formObservations || 'Observed active slope deformation and displacement in the field.',
        photoUrl: processedImage.dataUrl,
        photoThumbnailUrl: processedImage.thumbnailUrl,
        imageDimensions: { width: processedImage.width, height: processedImage.height },
        imageFileName: processedImage.fileName,
        imageSizeBytes: processedImage.compressedSizeBytes,
        disasterType: formDisasterType,
        severityLevel: formSeverity,
        identificationConfidencePct: aiAnalysis?.confidencePct || 92,
        detectedFeatures: features,
        recommendedImmediateAction: recAction,
        verificationStatus: formReporterRole === 'Field Geologist' ? 'Verified Disaster' : 'Pending Geologist Review',
      });

      setSubmitSuccessMessage('Disaster photo evidence submitted and synced to Cloud Firestore!');
      setProcessedImage(null);
      setAiAnalysis(null);
      setFormObservations('');

      setTimeout(() => {
        setSubmitSuccessMessage(null);
        setActiveTab('gallery');
      }, 1400);
    } catch (err: any) {
      setSubmitErrorMessage(err.message || 'Failed to submit evidence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Evidence list
  const filteredEvidence = evidenceList.filter((ev) => {
    const matchesSearch =
      ev.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.disasterType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || ev.disasterType === filterType;
    const matchesSev = filterSeverity === 'all' || ev.severityLevel === filterSeverity;

    return matchesSearch && matchesType && matchesSev;
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* MODAL HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-950/40">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  Disaster Photo Evidence & Identification
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  Cloud Firestore Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Crowdsourced field evidence, photogrammetric forensics, and automated geotechnical disaster classifier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Tabs */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('gallery')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'gallery'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Evidence Gallery ({evidenceList.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'upload'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload & Identify Photo</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: UPLOAD & AUTO-IDENTIFY */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {submitSuccessMessage && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{submitSuccessMessage}</span>
                </div>
              )}

              {submitErrorMessage && (
                <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 text-sm flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{submitErrorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitEvidence} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* LEFT COLUMN: PHOTO UPLOADER (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-indigo-400" />
                        Disaster Photo / Field Evidence
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Supports drag-and-drop, camera & file picker
                      </span>
                    </div>

                    {/* Drag-and-drop & Click Zone */}
                    {!processedImage ? (
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[260px] ${
                          dragActive
                            ? 'border-indigo-400 bg-indigo-950/30'
                            : 'border-slate-700 hover:border-indigo-500/60 bg-slate-950/40 hover:bg-slate-950/70'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileChange}
                          className="hidden"
                        />

                        {isProcessingImage ? (
                          <div className="flex flex-col items-center gap-3">
                            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                            <p className="text-sm font-semibold text-slate-200">
                              Optimizing & compressing image for Firestore...
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
                              <Upload className="w-8 h-8" />
                            </div>
                            <p className="text-sm font-bold text-white mb-1">
                              Drag & drop disaster photo here, or <span className="text-indigo-400 underline">browse</span>
                            </p>
                            <p className="text-xs text-slate-400 max-w-sm mb-4">
                              Upload photographs of slope failures, cracks, fallen rocks, mudflows, or flooded cut-sections. Automatically compressed to high-speed WebP/JPEG (&lt;100KB).
                            </p>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fileInputRef.current?.click();
                                }}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                Choose File
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cameraInputRef.current?.click();
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                              >
                                <Camera className="w-3.5 h-3.5 text-rose-400" />
                                Camera Snap
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      /* Image Preview Box */
                      <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
                        <img
                          src={processedImage.dataUrl}
                          alt="Uploaded Disaster Evidence"
                          className="w-full max-h-[300px] object-cover object-center"
                        />
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setProcessedImage(null);
                              setAiAnalysis(null);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-slate-700 flex items-center gap-1 backdrop-blur-md shadow-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Change Photo
                          </button>
                        </div>

                        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                              {processedImage.fileName}
                            </span>
                            <span>•</span>
                            <span>{processedImage.width} × {processedImage.height}px</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-mono font-bold">
                              {(processedImage.compressedSizeBytes / 1024).toFixed(1)} KB
                            </span>
                            <span className="text-[10px] text-slate-400">
                              (Firestore Safe)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Automated Disaster Identification Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                            Automated AI Disaster Identification
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => runDisasterIdentification(processedImage, formObservations)}
                          className="text-[11px] text-indigo-300 hover:text-white underline cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${isAnalyzingAi ? 'animate-spin' : ''}`} />
                          Re-Analyze
                        </button>
                      </div>

                      {isAnalyzingAi ? (
                        <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                          Classifying slope deformation & failure dynamics...
                        </div>
                      ) : aiAnalysis ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                                Identified Disaster
                              </div>
                              <div className="text-sm font-black text-white flex items-center gap-2">
                                <span>{aiAnalysis.disasterType}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-extrabold ${
                                  aiAnalysis.severityLevel === 'critical'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}>
                                  {aiAnalysis.severityLevel}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                                AI Confidence
                              </div>
                              <div className="text-sm font-black text-emerald-400 font-mono">
                                {aiAnalysis.confidencePct}% Certainty
                              </div>
                            </div>
                          </div>

                          {/* Visual Geological Indicators Detected */}
                          <div>
                            <div className="text-[11px] font-semibold text-slate-300 mb-1.5">
                              Detected Visual Indicators:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {aiAnalysis.detectedFeatures.map((feat, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200 text-[11px] border border-slate-700 flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  {feat}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Recommended Action */}
                          <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200">
                            <strong className="text-rose-300">Action Protocol: </strong>
                            {aiAnalysis.recommendedAction}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Upload a photo and enter observations to trigger automated computer-vision and geotechnical disaster identification.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: LOCATION & METADATA FORM (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Associated Monitoring Station */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Associated Monitoring Station / Zone
                      </label>
                      <select
                        value={formStationId}
                        onChange={(e) => handleStationChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        {stations.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} ({st.region})
                          </option>
                        ))}
                        <option value="unassigned">Other Northeast Field Location</option>
                      </select>
                    </div>

                    {/* Location Name & GPS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Location Specifics
                        </label>
                        <input
                          type="text"
                          value={formLocationName}
                          onChange={(e) => setFormLocationName(e.target.value)}
                          placeholder="e.g. NH-27 Mile 14"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          State / Region
                        </label>
                        <input
                          type="text"
                          value={formRegion}
                          onChange={(e) => setFormRegion(e.target.value)}
                          placeholder="e.g. Assam"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Coordinates & GPS capture */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          Coordinates (Lat / Lng)
                        </span>
                        <button
                          type="button"
                          onClick={handleUseCurrentGps}
                          className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <NavigationIcon className="w-3 h-3" />
                          Use My GPS
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <input
                          type="number"
                          step="0.0001"
                          value={formLat}
                          onChange={(e) => setFormLat(parseFloat(e.target.value))}
                          placeholder="Latitude"
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                        />
                        <input
                          type="number"
                          step="0.0001"
                          value={formLng}
                          onChange={(e) => setFormLng(parseFloat(e.target.value))}
                          placeholder="Longitude"
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Reporter Credentials */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Reporter Name
                        </label>
                        <input
                          type="text"
                          value={formReporterName}
                          onChange={(e) => setFormReporterName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Reporter Role
                        </label>
                        <select
                          value={formReporterRole}
                          onChange={(e) => setFormReporterRole(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Citizen Observer">Citizen Observer</option>
                          <option value="Field Geologist">Field Geologist</option>
                          <option value="Emergency Responder">Emergency Responder</option>
                          <option value="Village Head">Village Head</option>
                          <option value="Road Transport Inspector">Road Transport Inspector</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Contact / Phone (Optional)
                      </label>
                      <input
                        type="text"
                        value={formReporterContact}
                        onChange={(e) => setFormReporterContact(e.target.value)}
                        placeholder="+91 98765-43210"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    {/* Field Observations */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Field Observations & Visual Description
                      </label>
                      <textarea
                        rows={3}
                        value={formObservations}
                        onChange={(e) => {
                          setFormObservations(e.target.value);
                          if (processedImage) {
                            runDisasterIdentification(processedImage, e.target.value);
                          }
                        }}
                        placeholder="Describe what you see: crack width, falling boulders, mud slurry, blocked roads, tilted trees, or sounds heard..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>

                    {/* Disaster Classification & Severity Overrides */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Classification Type
                        </label>
                        <select
                          value={formDisasterType}
                          onChange={(e) => setFormDisasterType(e.target.value as DisasterClassification)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Rotational Landslide">Rotational Landslide</option>
                          <option value="Rockfall / Topple">Rockfall / Topple</option>
                          <option value="Debris Flow / Mudslide">Debris Flow / Mudslide</option>
                          <option value="Slope Tension Cracks & Subsidence">Slope Tension Cracks</option>
                          <option value="Toe Cut Slump">Toe Cut Slump</option>
                          <option value="Flash Flood Debris Surge">Flash Flood Debris Surge</option>
                          <option value="GLOF Moraine Breach">GLOF Moraine Breach</option>
                          <option value="Riverbank Soil Erosion">Riverbank Soil Erosion</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Severity Assessment
                        </label>
                        <select
                          value={formSeverity}
                          onChange={(e) => setFormSeverity(e.target.value as DisasterSeverity)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="critical">Critical (Imminent Danger)</option>
                          <option value="high">High (Active Movement)</option>
                          <option value="moderate">Moderate (Incipient / Watching)</option>
                          <option value="low">Low (Minor Surface Spall)</option>
                        </select>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !processedImage}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-rose-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all border border-rose-400/30"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Saving Evidence to Cloud Firestore...</span>
                        </>
                      ) : (
                        <>
                          <FileCheck className="w-4 h-4" />
                          <span>Submit Photo Evidence & Save to Cloud</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: EVIDENCE GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {/* FILTERS & CONTROLS */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by location, reporter, or type..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Type filter */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="all">All Disaster Types</option>
                    <option value="Rotational Landslide">Rotational Landslide</option>
                    <option value="Debris Flow / Mudslide">Debris Flow / Mudslide</option>
                    <option value="Rockfall / Topple">Rockfall / Topple</option>
                    <option value="Slope Tension Cracks & Subsidence">Tension Cracks</option>
                    <option value="Toe Cut Slump">Toe Cut Slump</option>
                  </select>

                  {/* Severity filter */}
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="moderate">Moderate</option>
                  </select>

                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Add New Photo</span>
                  </button>
                </div>
              </div>

              {/* CARD GRID */}
              {filteredEvidence.length === 0 ? (
                <div className="text-center py-16 bg-slate-950/40 border border-slate-800 rounded-2xl p-6">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-300">No Disaster Evidence Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    No field reports match your search criteria. Be the first to upload photo evidence from the field.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    Upload Photo Evidence
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredEvidence.map((report) => {
                    const isCritical = report.severityLevel === 'critical';
                    const isHigh = report.severityLevel === 'high';

                    return (
                      <div
                        key={report.id}
                        className="rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col overflow-hidden shadow-lg group"
                      >
                        {/* PHOTO THUMBNAIL WITH BADGES */}
                        <div
                          onClick={() => setLightboxReport(report)}
                          className="relative h-48 w-full bg-slate-900 cursor-pointer overflow-hidden"
                        >
                          <img
                            src={report.photoUrl}
                            alt={report.locationName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                          {/* Hover Zoom Prompt */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-[2px]">
                            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700">
                              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                              Inspect Photo & Diagnostics
                            </div>
                          </div>

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold tracking-tight flex items-center gap-1.5 shadow-md ${
                                isCritical
                                  ? 'bg-rose-600 text-white'
                                  : isHigh
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {report.disasterType}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                                report.verificationStatus === 'Verified Disaster'
                                  ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300'
                                  : 'bg-slate-900/90 border border-slate-700 text-slate-300'
                              }`}
                            >
                              {report.verificationStatus}
                            </span>
                          </div>

                          {/* Bottom info banner on photo */}
                          <div className="absolute bottom-2 left-3 right-3">
                            <h3 className="text-sm font-bold text-white truncate drop-shadow">
                              {report.locationName}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] text-slate-300">
                              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                              <span className="truncate">{report.region}</span>
                            </div>
                          </div>
                        </div>

                        {/* CARD BODY */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          {/* AI Detection Pill & Confidence */}
                          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
                            <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>AI Confidence: {report.identificationConfidencePct}%</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* User Observations */}
                          <p className="text-xs text-slate-300 line-clamp-2 italic">
                            "{report.userObservations}"
                          </p>

                          {/* Detected Features Chips */}
                          <div className="flex flex-wrap gap-1">
                            {report.detectedFeatures.slice(0, 3).map((feat, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] border border-slate-800 truncate max-w-[200px]"
                              >
                                {feat}
                              </span>
                            ))}
                            {report.detectedFeatures.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                                +{report.detectedFeatures.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Reporter Info & Action Buttons */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                              <span className="font-semibold text-slate-300">{report.reporterName}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                {report.reporterRole}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* SMS Dispatch Trigger */}
                              {onOpenSmsModalWithAlert && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onOpenSmsModalWithAlert(
                                      `CRITICAL DISASTER ALERT: Verified ${report.disasterType} at ${report.locationName} (${report.region}). Evidence photo confirmed. Immediate action: ${report.recommendedImmediateAction}`,
                                      report.stationId
                                    )
                                  }
                                  className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors"
                                  title="Broadcast SMS Warning for this disaster photo"
                                >
                                  <Radio className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* View / Inspect */}
                              <button
                                type="button"
                                onClick={() => setLightboxReport(report)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 font-semibold text-xs flex items-center gap-1 transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* LIGHTBOX PHOTO & GEOTECHNICAL FORENSICS MODAL */}
        {lightboxReport && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center gap-2.5">
                  <Camera className="w-5 h-5 text-rose-400" />
                  <div>
                    <h3 className="text-base font-bold text-white truncate">
                      {lightboxReport.locationName} — Field Photo Evidence
                    </h3>
                    <p className="text-xs text-slate-400">
                      {lightboxReport.region} • Reported by {lightboxReport.reporterName} ({lightboxReport.reporterRole})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLightboxReport(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Full Image view */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center bg-black/40 rounded-xl overflow-hidden border border-slate-800">
                  <img
                    src={lightboxReport.photoUrl}
                    alt={lightboxReport.locationName}
                    className="w-full max-h-[420px] object-contain"
                  />
                  {lightboxReport.imageFileName && (
                    <div className="w-full p-2 bg-slate-950/90 text-center text-[11px] text-slate-400 border-t border-slate-800">
                      Captured File: {lightboxReport.imageFileName} ({lightboxReport.imageDimensions?.width}x{lightboxReport.imageDimensions?.height}px)
                    </div>
                  )}
                </div>

                {/* Diagnostics Panel */}
                <div className="lg:col-span-5 space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Disaster Classification</div>
                    <div className="text-base font-black text-white flex items-center justify-between">
                      <span>{lightboxReport.disasterType}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-600 text-white">
                        {lightboxReport.severityLevel}
                      </span>
                    </div>
                    <div className="text-emerald-400 font-mono font-bold">
                      {lightboxReport.identificationConfidencePct}% AI Confidence Score
                    </div>
                  </div>

                  {/* Coordinates & Timestamp */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">GPS Coordinates:</span>
                      <span className="font-mono text-white">
                        {lightboxReport.latitude.toFixed(4)}°N, {lightboxReport.longitude.toFixed(4)}°E
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Reported At:</span>
                      <span className="text-slate-200">
                        {new Date(lightboxReport.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-emerald-400 font-semibold">
                        {lightboxReport.verificationStatus}
                      </span>
                    </div>
                  </div>

                  {/* Visual Indicators */}
                  <div>
                    <h5 className="font-bold text-slate-300 mb-1.5">Identified Geological Indicators:</h5>
                    <ul className="space-y-1">
                      {lightboxReport.detectedFeatures.map((feat, i) => (
                        <li key={i} className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Immediate Action */}
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200">
                    <strong className="block text-rose-300 font-bold mb-1">Recommended Response:</strong>
                    {lightboxReport.recommendedImmediateAction}
                  </div>

                  {/* Geologist Verification Button */}
                  {lightboxReport.verificationStatus !== 'Verified Disaster' && (
                    <button
                      onClick={async () => {
                        await updateEvidenceVerificationStatus(
                          lightboxReport.id,
                          'Verified Disaster',
                          'State Disaster Management Authority'
                        );
                        setLightboxReport({
                          ...lightboxReport,
                          verificationStatus: 'Verified Disaster',
                        });
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Verify as Official Geotechnical Disaster
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function NavigationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}
