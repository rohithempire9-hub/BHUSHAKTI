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
  const [activeSubView, setActiveSubView] = useState<'polygon' | 'devices'>('devices');
  const [selectedDevice, setSelectedDevice] = useState<RegisteredDeviceProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const filteredDevices = registeredDevices.filter((dev) =>
    dev.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dev.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dev.nodeAssociation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="sms-early-warning-hub-panel" className="flex flex-col h-full space-y-4 text-slate-900">
      {/* Sub-view switcher tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubView('polygon')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubView === 'polygon'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Hazard Polygon Drawing &amp; Real SMS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView('devices')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubView === 'devices'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Cell Relays &amp; Device Registry</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-1 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <Radio className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                  Registered Device Registry
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Cell Broadcast Ch. 4370
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Offline GSM / LoRaWAN multi-operator cellular gateway for Northeast India
              </p>
            </div>

            {/* Prominent Manual Override Button */}
            <button
              id="simulate-mass-sos-btn"
              onClick={onSimulateMassSos}
              className="relative group flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
              <span className="tracking-wide uppercase font-sans">
                Simulate Mass SOS Alert
              </span>
            </button>
          </div>

          {/* Network Tower & Subscriber Telemetry Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
              <span className="text-[11px] text-slate-500">Registered Devices</span>
              <span className="font-mono font-bold text-slate-900">{registeredDevices.length} Priority Units</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
              <span className="text-[11px] text-slate-500">Cell Relay Towers</span>
              <span className="font-mono font-bold text-emerald-700">18 BSNL / Airtel Towers</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
              <span className="text-[11px] text-slate-500">Network Latency</span>
              <span className="font-mono font-bold text-blue-700">&lt; 1.4s Satellite Sync</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
              <span className="text-[11px] text-slate-500">Gateway Encryption</span>
              <span className="font-mono font-bold text-slate-800">AES-256 CAP v1.2</span>
            </div>
          </div>

          {/* Contact Database Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Device / Authority Name</th>
                  <th className="py-2.5 px-3">Mobile Number</th>
                  <th className="py-2.5 px-3">Region &amp; Jurisdiction</th>
                  <th className="py-2.5 px-3">Node Association</th>
                  <th className="py-2.5 px-3">Alert Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredDevices.map((dev) => {
                  const isDispatched = dev.alertStatus === 'DISPATCHED';
                  const isArmed = dev.alertStatus === 'ARMED / ACTIVE';

                  const statusBadge = isDispatched
                    ? 'bg-red-50 text-red-800 border-red-200 animate-pulse'
                    : isArmed
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-300';

                  return (
                    <tr
                      key={dev.id}
                      id={`device-row-${dev.id}`}
                      className="hover:bg-slate-50 transition-colors text-slate-800"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{dev.deviceName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{dev.role}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{dev.mobileNumber}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{dev.region}</td>
                      <td className="py-2.5 px-3 font-mono text-blue-700 text-[11px] font-bold">
                        {dev.nodeAssociation}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDispatched ? 'bg-red-500' : isArmed ? 'bg-emerald-500' : 'bg-slate-400'
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
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer border border-slate-300 shadow-2xs"
                        >
                          <Send className="w-3 h-3 text-blue-600" />
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
