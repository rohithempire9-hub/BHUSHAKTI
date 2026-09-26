import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  Compass,
  Layers,
  ArrowRight
} from 'lucide-react';

export const PostDisasterForensicView: React.FC = () => {
  const [selectedIncidentId, setSelectedIncidentId] = useState('TAW-042-2026-001');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-12 text-slate-900">
      {/* 1. HEADER */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
              AUDITABLE AI DISASTER MEMORY
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              POST-DISASTER FORENSIC INTELLIGENCE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Post-Disaster Forensic Audit Reports &amp; Self-Learning
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Retrospective incident investigations linking pre-event AI warnings, observed geotechnical failure kinematics, rescue response dispatch times, and institutional lessons learned.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export Forensic PDF</span>
          </button>
        </div>
      </div>

      {/* 2. REPORT CONTAINER */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-slate-800">
        {/* DOCUMENT HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-700 font-bold block">
              NATIONAL DISASTER MANAGEMENT PLATFORM • FORMAL INCIDENT REPORT
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Geotechnical Failure Incident Dossier: TAW-042-2026-001
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Event Classification: Deep-Seated Colluvial Slope Failure &amp; Highway Severance
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-right font-mono">
            <span className="text-[10px] text-slate-500 block uppercase">Audit Status</span>
            <span className="text-xs font-bold text-emerald-700 flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED CLOSED
            </span>
          </div>
        </div>

        {/* 4-COLUMN SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[9px] text-slate-500 uppercase block">Event Timestamp</span>
            <span className="font-bold text-slate-900 text-sm">13-SEP-2026 04:15 IST</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[9px] text-slate-500 uppercase block">Pre-Event AI Risk</span>
            <span className="font-bold text-red-600 text-sm">78/100 (FS 1.04)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[9px] text-slate-500 uppercase block">Early Warning Lead</span>
            <span className="font-bold text-blue-700 text-sm">14 Hours Advance</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[9px] text-slate-500 uppercase block">Casualties Prevented</span>
            <span className="font-bold text-emerald-700 text-sm">340 Students Evac</span>
          </div>
        </div>

        {/* INCIDENT TIMELINE TABLE */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
            Chronological Sequence &amp; Warning Log
          </h3>
          <div className="space-y-2 text-xs">
            {[
              { time: 'T - 18h (Yesterday 10:00)', event: 'Precipitation exceeded 120mm; BhuShakti escalated Risk Level to 3 (Field Inspection).' },
              { time: 'T - 14h (Yesterday 14:15)', event: 'Subsurface pore-pressure passed 71 kPa; automated cell-broadcast and SMS issued to Jang valley.' },
              { time: 'T - 08h (Yesterday 20:30)', event: 'BRO Project Vartak erected physical barricade on NH-13 Km 42; civilian traffic diverted to Dirang bypass.' },
              { time: 'T - 02h (Today 02:15)', event: 'Inclinometer recorded 7.2mm/h displacement surge; Jang Higher Secondary School safely vacated.' },
              { time: 'T - 00h (Today 04:15)', event: '18,000 m³ colluvial slide detached; deposited across 380m of NH-13. Zero casualties due to advance barricade.' },
            ].map((t, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-mono text-blue-700 font-bold shrink-0">{t.time}</span>
                <span className="text-slate-700">{t.event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ROOT CAUSE & CONTRIBUTING FACTORS */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 font-mono">
            Root Geotechnical Cause &amp; Contributing Mechanics
          </h3>
          <p className="leading-relaxed text-slate-700">
            1. <strong>Hydrostatic Uplift</strong>: Continuous infiltration of 155mm rain over 24 hours saturated the high-porosity colluvium down to the impermeable fractured biotite gneiss bedrock.
          </p>
          <p className="leading-relaxed text-slate-700">
            2. <strong>Anthropogenic Toe Excavation</strong>: Highway 4-laning widening had debuttressed the natural 48° toe support, reducing the passive resisting force by 35%.
          </p>
          <p className="leading-relaxed text-slate-700">
            3. <strong>Historical Failure Recurrence</strong>: The rupture geometry matched 91% with the 2021 Sela Pass failure, proving that unremediated historical scars act as preferential failure paths.
          </p>
        </div>

        {/* INSTITUTIONAL LESSONS LEARNED */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 font-mono">
            Institutional Takeaways for Post-Disaster Learning
          </h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>Permanent tieback soil nails and geotextile drainage blankets must be installed at Km 42-45 prior to next monsoon.</li>
            <li>Zero-internet LoRa SMS gateways ensured 100% alert delivery to 2,180 remote residents despite fiber severance.</li>
            <li>This incident memory is permanently logged in the BhuShakti Slope Registry under Slope ID TAW-042 for all future pattern matching.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
