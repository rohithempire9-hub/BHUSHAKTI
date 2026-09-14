import React, { useState } from 'react';
import {
  Radio,
  ShieldAlert,
  Send,
  Users,
  CheckCircle2,
  Clock,
  Phone,
  TowerControl,
  Sparkles,
  AlertTriangle,
  FileText,
  Activity,
  ChevronRight,
  MapPin,
  Layers
} from 'lucide-react';
import { RegisteredDeviceProfile, BhuLanguage } from '../../types/bhuShakti';
import { LandslideStation, SmsSubscriber } from '../../types/landslide';
import { TRANSLATIONS } from '../../utils/translations';
import { RealSmsHazardZoneDispatcher } from './RealSmsHazardZoneDispatcher';
import { INITIAL_STATIONS, INITIAL_SUBSCRIBERS } from '../../data/initialStations';

interface SmsEarlyWarningHubProps {
  registeredDevices: RegisteredDeviceProfile[];
  currentLanguage: BhuLanguage;
  onSimulateMassSos: () => void;
  onDispatchIndividualAlert?: (device: RegisteredDeviceProfile) => void;
  stations?: LandslideStation[];
  subscribers?: SmsSubscriber[];
  initialStation?: LandslideStation | null;
}

export const SmsEarlyWarningHub: React.FC<SmsEarlyWarningHubProps> = ({
  registeredDevices,
  currentLanguage,
  onSimulateMassSos,
  onDispatchIndividualAlert,
  stations = INITIAL_STATIONS,
  subscribers = INITIAL_SUBSCRIBERS,
  initialStation,
}) => {
  const [activeSubView, setActiveSubView] = useState<'polygon' | 'devices'>('polygon');
  const [selectedDevice, setSelectedDevice] = useState<RegisteredDeviceProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const filteredDevices = registeredDevices.filter((dev) =>
    dev.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dev.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dev.nodeAssociation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="sms-early-warning-hub-panel" className="flex flex-col h-full space-y-4">
      {/* Sub-view switcher tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubView('polygon')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubView === 'polygon'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-300" />
            <span>Hazard Polygon Drawing &amp; Real SMS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView('devices')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubView === 'devices'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-300" />
            <span>Cell Relays &amp; Device Registry</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            BSNL Ch. 4370 Live Gateway
          </span>
        </div>
      </div>

      {activeSubView === 'polygon' ? (
        <RealSmsHazardZoneDispatcher
          stations={stations}
          subscribers={subscribers}
          initialStation={initialStation}
        />
      ) : (
        <div className="space-y-3">
          {/* Top Header & Prominent Manual Override Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-100 font-sans tracking-tight">
                  Registered Device Registry
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Cell Broadcast Ch. 4370
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Offline GSM / LoRaWAN multi-operator cellular gateway for Northeast India
              </p>
            </div>

            {/* Prominent Manual Override Button */}
            <button
              id="simulate-mass-sos-btn"
              onClick={onSimulateMassSos}
              className="relative group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-xl shadow-rose-950/70 border-2 border-rose-400/60 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-amber-200 animate-bounce" />
              <span className="tracking-wide uppercase font-sans">
                Simulate Mass SOS Alert
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
            </button>
          </div>

          {/* Network Tower & Subscriber Telemetry Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Registered Devices</span>
              <span className="font-mono font-bold text-slate-100">{registeredDevices.length} Priority Units</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Cell Relay Towers</span>
              <span className="font-mono font-bold text-emerald-400">18 BSNL / Airtel Towers</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Network Latency</span>
              <span className="font-mono font-bold text-cyan-400">&lt; 1.4s Satellite Sync</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Gateway Encryption</span>
              <span className="font-mono font-bold text-slate-300">AES-256 CAP v1.2</span>
            </div>
          </div>

          {/* Contact Database Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left text-xs border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Device / Authority Name</th>
                  <th className="py-2.5 px-3">Mobile Number</th>
                  <th className="py-2.5 px-3">Region &amp; Jurisdiction</th>
                  <th className="py-2.5 px-3">Node Association</th>
                  <th className="py-2.5 px-3">Alert Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {filteredDevices.map((dev) => {
                  const isDispatched = dev.alertStatus === 'DISPATCHED';
                  const isArmed = dev.alertStatus === 'ARMED / ACTIVE';

                  const statusBadge = isDispatched
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse'
                    : isArmed
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700';

                  return (
                    <tr
                      key={dev.id}
                      id={`device-row-${dev.id}`}
                      className="hover:bg-slate-900/60 transition-colors text-slate-200"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-100">{dev.deviceName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{dev.role}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{dev.mobileNumber}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{dev.region}</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300 text-[11px]">
                        {dev.nodeAssociation}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusBadge}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDispatched ? 'bg-rose-400' : isArmed ? 'bg-emerald-400' : 'bg-slate-400'
                            }`}
                          />
                          {dev.alertStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            if (onDispatchIndividualAlert) {
                              onDispatchIndividualAlert(dev);
                            } else {
                              onSimulateMassSos();
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer border border-slate-700"
                        >
                          <Send className="w-3 h-3 text-cyan-400" />
                          <span>Dispatch</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

