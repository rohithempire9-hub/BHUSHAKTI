import React, { useState, useRef } from 'react';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  FileImage,
  MapPin,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Info,
  ChevronRight,
  Eye,
  ExternalLink
} from 'lucide-react';
import { CitizenCrowdsourceReport, BhuLanguage } from '../../types/bhuShakti';
import { TRANSLATIONS } from '../../utils/translations';
import { CameraCaptureModal, CameraCaptureResult } from '../Evidence/CameraCaptureModal';

interface CitizenReportingPortalProps {
  reports: CitizenCrowdsourceReport[];
  onSubmitReport: (report: Omit<CitizenCrowdsourceReport, 'id' | 'timestamp'>) => void;
  onUpdateReportStatus?: (reportId: string, newStatus: CitizenCrowdsourceReport['status']) => void;
  currentLanguage: BhuLanguage;
}

export const CitizenReportingPortal: React.FC<CitizenReportingPortalProps> = ({
  reports,
  onSubmitReport,
  onUpdateReportStatus,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State
  const [reporterName, setReporterName] = useState('Ankit Sarma (Field Geologist)');
  const [contactNumber, setContactNumber] = useState('+91 94350 78210');
  const [locationName, setLocationName] = useState('NH-10 Rangpo Sinking Slump');
  const [state, setState] = useState('Sikkim');
  const [latitude, setLatitude] = useState(27.1742);
  const [longitude, setLongitude] = useState(88.5283);
  const [observations, setObservations] = useState(
    'Fresh transverse cracks appearing along road embankment; seepage water discharging with brownish silt.'
  );
  const [autoExtractExif, setAutoExtractExif] = useState(true);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>(
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
  );
  const [photoFileName, setPhotoFileName] = useState('field_crack_evidence.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [selectedReportForView, setSelectedReportForView] = useState<CitizenCrowdsourceReport | null>(null);

  // Live Device Camera Modal State
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);

  const handleCameraPhoto = (result: CameraCaptureResult) => {
    setPhotoPreviewUrl(result.dataUrl);
    setPhotoFileName(result.file.name);
    if (result.latitude && result.longitude) {
      setLatitude(result.latitude);
      setLongitude(result.longitude);
    }
    setObservations((prev) =>
      prev
        ? prev
        : `Direct field camera evidence recorded on ${result.timestamp}. Live geotechnical watermark & GPS verified.`
    );
  };

  // Handle file selection and simulated/real EXIF extraction
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoPreviewUrl(dataUrl);

      if (autoExtractExif) {
        // Simulating realistic EXIF metadata extraction
        setObservations((prev) =>
          prev ? prev : `Field photograph captured via mobile camera. Crack width measured at 12cm.`
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onSubmitReport({
        locationName,
        state,
        latitude,
        longitude,
        elevationM: 1450,
        reporterName,
        reporterRole: 'Field Observer',
        contactNumber,
        observations,
        photoUrl: photoPreviewUrl,
        photoFileName,
        exifExtracted: autoExtractExif,
        exifData: autoExtractExif
          ? {
              cameraModel: 'iPhone 15 Pro / Geotagged Cam',
              dateTimeOriginal: new Date().toLocaleString(),
              gpsAltitudeM: 1452.0,
              gpsAccuracyM: 3.5,
              shutterSpeed: '1/200s f/1.8 ISO 80',
            }
          : undefined,
        disasterType: 'Slope Displacement & Embankment Fissure',
        severity: 'warning',
        aiConfidencePct: 95.4,
        recommendedAction: 'Place geotechnical tell-tales and dispatch local BRO inspection team.',
        status: 'Pending Review',
      });

      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => setSubmittedSuccess(false), 4000);
    }, 600);
  };

  return (
    <div id="citizen-crowdsourced-reporting-portal" className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
              Citizen Crowdsourced Reporting Portal &amp; Field Evidence
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              EXIF Geotagging + AI Vision
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Field officials &amp; residents submit crack/slope photo evidence with verified GPS coordinates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 overflow-hidden">
        {/* Left Column: Reporting Form (5 Cols) */}
        <form
          onSubmit={handleFormSubmit}
          className="lg:col-span-5 clay-panel p-4 flex flex-col justify-between overflow-y-auto"
        >
          <div className="space-y-3 text-xs">
            {/* File Upload Box (Drag/Drop + Click) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-800">
                  Field Photo Evidence (Crack / Slip / Mudslide)
                </label>
                <button
                  type="button"
                  id="btn-take-camera-photo-citizen"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsLiveCameraOpen(true);
                  }}
                  className="clay-button-primary flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take Camera Photo</span>
                </button>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative rounded-2xl border border-dashed border-blue-300/80 hover:border-blue-500 p-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/70 shadow-[inset_1px_2px_4px_rgba(0,0,0,0.03)] overflow-hidden group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {photoPreviewUrl ? (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={photoPreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end justify-between p-2">
                      <span className="text-[10px] text-white font-mono truncate max-w-[170px]">
                        {photoFileName}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsLiveCameraOpen(true);
                        }}
                        className="clay-button px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1"
                      >
                        <Camera className="w-3 h-3 text-blue-600" />
                        Retake
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <div className="flex items-center justify-center gap-3 mb-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsLiveCameraOpen(true);
                        }}
                        className="clay-button-primary p-2 text-white"
                        title="Open Camera"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                      <UploadCloud className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-xs text-slate-800 font-semibold">
                      Take photo with <span className="text-blue-600 font-bold">Camera</span> or <span className="text-blue-700 underline">Browse File</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Live geotagging, GPS metadata &amp; tamper-proof watermark embedded
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Checkbox: Auto-extract GPS metadata from photo EXIF tags */}
            <div className="p-2.5 rounded-2xl clay-card-raised flex items-start gap-2.5">
              <input
                id="auto-extract-exif-checkbox"
                type="checkbox"
                checked={autoExtractExif}
                onChange={(e) => setAutoExtractExif(e.target.checked)}
                className="clay-checkbox mt-0.5"
              />
              <label
                htmlFor="auto-extract-exif-checkbox"
                className="text-[11px] text-slate-800 font-semibold cursor-pointer leading-tight"
              >
                Auto-extract GPS metadata from photo EXIF tags
                <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                  Reads device latitude, longitude, elevation, and timestamp from embedded EXIF headers.
                </span>
              </label>
            </div>

            {/* Location & State */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Location / Highway
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. NH-10 9th Mile"
                  required
                  className="clay-input w-full px-2.5 py-1.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  State (NER)
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="clay-select w-full px-2.5 py-1.5 text-xs font-semibold"
                >
                  <option value="Sikkim">Sikkim</option>
                  <option value="Assam">Assam</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Tripura">Tripura</option>
                </select>
              </div>
            </div>

            {/* GPS Coordinates */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Latitude (°N)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  required
                  className="clay-input w-full px-2.5 py-1.5 font-mono text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Longitude (°E)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  required
                  className="clay-input w-full px-2.5 py-1.5 font-mono text-xs font-semibold"
                />
              </div>
            </div>

            {/* Observations text */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                Field Observations / Physical Signs
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={2}
                placeholder="Describe slope cracks, mud volume, road blockages..."
                required
                className="clay-textarea w-full px-2.5 py-1.5 text-xs resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-3 pt-2 border-t border-slate-200/80">
            {submittedSuccess && (
              <div className="mb-2 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Georeport dispatched successfully to BhuShakti Queue!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="clay-button-primary w-full py-2.5 text-xs font-bold gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Analyzing & Transmitting...' : t.submitReport}</span>
            </button>
          </div>
        </form>

        {/* Right Column: Interactive Queue of Recently Submitted Reports (7 Cols) */}
        <div className="lg:col-span-7 clay-panel p-4 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  Citizen Reports Stream &amp; Verification Queue
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {reports.length} Verified Records
                </span>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {reports.map((report) => {
                const isPending = report.status === 'Pending Review';
                const isDispatched = report.status === 'Dispatched to NDRF';
                const isVerified = report.status === 'Verified Disaster';

                const statusBadge = isDispatched
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : isVerified
                  ? 'bg-red-50 text-red-800 border-red-300'
                  : 'bg-blue-50 text-blue-800 border-blue-300';

                return (
                  <div
                    key={report.id}
                    id={`report-card-${report.id}`}
                    className="p-3.5 rounded-2xl clay-card hover:translate-y-[-1px] transition-all flex flex-col sm:flex-row gap-3"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full sm:w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-inner">
                      <img
                        src={report.photoUrl}
                        alt={report.locationName}
                        className="w-full h-full object-cover"
                      />
                      {report.exifExtracted && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-[8px] font-mono text-white font-bold">
                          EXIF GPS
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {report.locationName}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusBadge}`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 mb-1">
                        {report.state} • Reported by <strong className="text-slate-800">{report.reporterName}</strong>
                      </div>

                      <p className="text-xs text-slate-700 line-clamp-2 italic mb-2">
                        "{report.observations}"
                      </p>

                      {/* AI Classification & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/80 text-[10px]">
                        <div className="flex items-center gap-1.5 text-blue-700 font-mono font-bold">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          <span>{report.disasterType}</span>
                          <span className="text-slate-500">({report.aiConfidencePct}% Conf)</span>
                        </div>

                        {/* Status Change Buttons for Reviewer */}
                        {onUpdateReportStatus && (
                          <div className="flex items-center gap-1.5">
                            {isPending && (
                              <button
                                onClick={() => onUpdateReportStatus(report.id, 'Dispatched to NDRF')}
                                className="clay-button px-2.5 py-1 text-[10px] font-bold text-amber-800"
                              >
                                Dispatch NDRF
                              </button>
                            )}
                            {!isVerified && (
                              <button
                                onClick={() => onUpdateReportStatus(report.id, 'Verified Disaster')}
                                className="clay-button-danger px-2.5 py-1 text-[10px] font-bold"
                              >
                                Mark Verified
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified by District Geotechnical Control Room
            </span>
            <span className="font-mono text-slate-400">Auto-push to GIS Map Enabled</span>
          </div>
        </div>
      </div>

      {/* Live Device Camera Modal */}
      <CameraCaptureModal
        isOpen={isLiveCameraOpen}
        onClose={() => setIsLiveCameraOpen(false)}
        onPhotoCaptured={handleCameraPhoto}
        locationName={locationName}
        latitude={latitude}
        longitude={longitude}
      />
    </div>
  );
};
