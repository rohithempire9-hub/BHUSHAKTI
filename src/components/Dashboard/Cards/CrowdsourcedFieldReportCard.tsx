import React, { useState, useRef } from 'react';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  MapPin,
  Sparkles,
  FileImage
} from 'lucide-react';
import { CitizenCrowdsourceReport } from '../../../types/bhuShakti';

interface CrowdsourcedFieldReportCardProps {
  reports: CitizenCrowdsourceReport[];
  onSubmitReport: (report: Omit<CitizenCrowdsourceReport, 'id' | 'timestamp'>) => void;
}

export const CrowdsourcedFieldReportCard: React.FC<CrowdsourcedFieldReportCardProps> = ({
  reports,
  onSubmitReport,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [locationName, setLocationName] = useState('NH-10 Rangpo Sinking Slump');
  const [observations, setObservations] = useState(
    'Fresh transverse cracks appearing along road embankment; brown silt seepage.'
  );
  const [autoExtractExif, setAutoExtractExif] = useState(true);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>(
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'
  );
  const [photoFileName, setPhotoFileName] = useState('field_crack_evidence.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onSubmitReport({
        locationName,
        state: 'Sikkim',
        latitude: 27.1742,
        longitude: 88.5283,
        elevationM: 1450,
        reporterName: 'Field Observer (Geotech Unit)',
        reporterRole: 'Observer',
        contactNumber: '+91 94350 78210',
        observations,
        photoUrl: photoPreviewUrl,
        photoFileName,
        exifExtracted: autoExtractExif,
        disasterType: 'Slope Displacement & Embankment Fissure',
        severity: 'warning',
        aiConfidencePct: 95.4,
        recommendedAction: 'Place geotechnical tell-tales and dispatch inspection team.',
        status: 'Pending Review',
      });

      setIsSubmitting(false);
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
            Field Report & Evidence Intake
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Geotagged citizen crack submission with EXIF metadata parsing
          </p>
        </div>

        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          EXIF + Vision AI
        </span>
      </div>

      {/* Two section split inside card: Quick Form & Scrolling Alerts List */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-0 overflow-hidden">
        {/* Left: Minimalist Data Entry Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-between bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 space-y-2 overflow-y-auto text-xs"
        >
          {/* Dropzone Slot to upload field photos/videos */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Field Evidence Dropzone (Crack / Slip)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative rounded-lg border-2 border-dashed border-slate-700 hover:border-cyan-400/80 p-2 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/60 overflow-hidden group h-20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {photoPreviewUrl ? (
                <div className="relative w-full h-full rounded overflow-hidden">
                  <img
                    src={photoPreviewUrl}
                    alt="Crack Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-[10px] text-white font-mono bg-black/60 px-1.5 py-0.5 rounded">
                      Change Photo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-5 h-5 text-cyan-400 mx-auto mb-0.5" />
                  <span className="text-[11px] text-slate-300 font-semibold">
                    Upload Photo/Video
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Checkbox: Extract EXIF GPS Metadata */}
          <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-2">
            <input
              id="exif-extract-checkbox"
              type="checkbox"
              checked={autoExtractExif}
              onChange={(e) => setAutoExtractExif(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-cyan-500 bg-slate-950 border-slate-700 cursor-pointer"
            />
            <label
              htmlFor="exif-extract-checkbox"
              className="text-[10px] text-slate-300 font-medium cursor-pointer"
            >
              Extract EXIF GPS Metadata (Geotag coordinates)
            </label>
          </div>

          {/* Location / Observation Input */}
          <div className="space-y-1.5">
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Location (e.g. NH-10 Rangpo Slump)"
              className="w-full px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
              placeholder="Observation notes..."
              className="w-full px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            {successMessage ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Submitted & Dispatched!</span>
              </>
            ) : (
              <>
                <Send className="w-3 h-3 text-cyan-200" />
                <span>Submit Field Report</span>
              </>
            )}
          </button>
        </form>

        {/* Right: Scrolling list of recently processed village alerts */}
        <div className="flex flex-col bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 min-h-0">
          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Recent Village Alerts</span>
            <span className="font-mono text-cyan-400">{reports.length} Total</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 text-xs">
            {reports.map((rpt) => {
              const isVerified = rpt.status === 'Verified Disaster';
              const isDispatched = rpt.status === 'Dispatched to NDRF';

              const statusColor = isVerified
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : isDispatched
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';

              return (
                <div
                  key={rpt.id}
                  id={`village-alert-${rpt.id}`}
                  className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-200 text-[11px] truncate">
                      {rpt.locationName}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold font-mono tracking-wider border shrink-0 ${statusColor}`}
                    >
                      {rpt.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 line-clamp-2 mb-1">
                    {rpt.observations}
                  </p>

                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                    <span>{rpt.state} • Elev {rpt.elevationM}m</span>
                    <span className="text-cyan-400">
                      {rpt.exifExtracted ? 'EXIF Tagged' : 'Manual GPS'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
