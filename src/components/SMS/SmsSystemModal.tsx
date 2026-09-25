import React, { useState, useEffect } from 'react';
import { SmsSubscriber, SmsAlertRecord, LandslideStation } from '../../types/landslide';
import {
  Radio,
  Send,
  X,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Waves,
  CloudRain,
  Phone,
  CheckCircle2,
  Info,
  Smartphone,
  ChevronDown
} from 'lucide-react';

export type AlertType =
  | 'Landslide Warning'
  | 'Flood Warning'
  | 'Heavy Rainfall'
  | 'Road Blockage'
  | 'Emergency Alert';

export type AlertPriority = 'Normal' | 'High' | 'Critical';

interface SmsSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: LandslideStation[];
  subscribers: SmsSubscriber[];
  onSubscribersChange?: (subs: SmsSubscriber[]) => void;
  alertDispatches: SmsAlertRecord[];
  onDispatchesChange: (dispatches: SmsAlertRecord[]) => void;
  initialStation?: LandslideStation | null;
  initialMessage?: string | null;
}

export const SmsSystemModal: React.FC<SmsSystemModalProps> = ({
  isOpen,
  onClose,
  stations,
  subscribers,
  alertDispatches,
  onDispatchesChange,
  initialStation,
  initialMessage
}) => {
  // Service connection status (Real SMS external API is not connected)
  const isSmsServiceConnected = false;

  // Form states
  const [recipientPhone, setRecipientPhone] = useState('+91 94350 12890');
  const [alertType, setAlertType] = useState<AlertType>('Landslide Warning');
  const [priority, setPriority] = useState<AlertPriority>('Critical');
  const [message, setMessage] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Station selection
  const defaultStation = initialStation || stations[0] || null;
  const [selectedStationId, setSelectedStationId] = useState<string>(defaultStation?.id || '');

  const activeStation = stations.find((s) => s.id === selectedStationId) || defaultStation;

  // Generate template message based on alert type & priority
  const getTemplateMessage = (type: AlertType, prio: AlertPriority, stName: string) => {
    switch (type) {
      case 'Landslide Warning':
        return `[BHUSHAKTI AI - ${prio.toUpperCase()} PRIORITY] Urgent Landslide Warning for ${stName}. Soil displacement & pore pressure thresholds breached. Evacuate downstream valley settlements immediately to designated high-ridge shelters.`;
      case 'Flood Warning':
        return `[BHUSHAKTI AI - ${prio.toUpperCase()} PRIORITY] Flash Flood & River Overflow Warning for ${stName} basin. Water levels rising rapidly. Relocate livestock and families to elevated safe havens.`;
      case 'Heavy Rainfall':
        return `[BHUSHAKTI AI - ${prio.toUpperCase()} PRIORITY] Intense Monsoon Precipitation Alert for ${stName}. Rainfall > 100mm expected. Avoid non-essential road travel along mountainous corridors.`;
      case 'Road Blockage':
        return `[BHUSHAKTI AI - ${prio.toUpperCase()} PRIORITY] Road Sector Blockage & Debris Inundation along ${stName} highway axis. Barricades active. Emergency transit diverted to alternate evacuation routes.`;
      case 'Emergency Alert':
      default:
        return `[BHUSHAKTI AI - ${prio.toUpperCase()} PRIORITY] Multi-Hazard Emergency Alert for ${stName}. Civil Defense and Disaster Response Forces activated. Tune to emergency broadcast channels.`;
    }
  };

  // Sync initial message or template
  useEffect(() => {
    if (initialMessage && initialMessage.trim().length > 0) {
      setMessage(initialMessage);
    } else if (activeStation) {
      setMessage(getTemplateMessage(alertType, priority, activeStation.name));
    }
  }, [initialMessage, activeStation?.id, alertType, priority]);

  // Handle body scroll lock & Escape key
  useEffect(() => {
    if (!isOpen) return;

    // Prevent background scrolling
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAlertTypeChange = (newType: AlertType) => {
    setAlertType(newType);
    if (activeStation) {
      setMessage(getTemplateMessage(newType, priority, activeStation.name));
    }
  };

  const handlePriorityChange = (newPrio: AlertPriority) => {
    setPriority(newPrio);
    if (activeStation) {
      setMessage(getTemplateMessage(alertType, newPrio, activeStation.name));
    }
  };

  const handleStationChange = (stId: string) => {
    setSelectedStationId(stId);
    const target = stations.find((s) => s.id === stId);
    if (target) {
      setMessage(getTemplateMessage(alertType, priority, target.name));
    }
  };

  const handleSimulateLog = () => {
    if (!recipientPhone.trim()) {
      setStatusNotice('Please enter a recipient phone number.');
      return;
    }

    const newDispatch: SmsAlertRecord = {
      id: `disp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      stationId: activeStation?.id || 'manual-station',
      stationName: activeStation?.name || 'Manual Notification',
      region: activeStation?.region || 'Northeast India',
      severity: priority === 'Critical' ? 'critical' : priority === 'High' ? 'high' : 'moderate',
      message: message,
      recipientsCount: 1,
      recipientsList: [recipientPhone],
      deliveryStatus: 'Broadcasting',
      triggerReason: `Operator Broadcast: ${alertType}`,
    };

    onDispatchesChange([newDispatch, ...alertDispatches]);
    setStatusNotice('Alert logged to Recent Dispatches in offline simulation mode.');
    setTimeout(() => setStatusNotice(null), 4000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sms-modal-title"
      className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 sm:px-6 py-4 bg-slate-950/80 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 id="sms-modal-title" className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                SMS Alert Center
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                  SIH Gateway
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Emergency communication and notification management
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close SMS Alert Center"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* CARD 1: SERVICE STATUS CARD */}
          <div className="rounded-xl p-3.5 bg-slate-800/70 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full shrink-0 ${
                  isSmsServiceConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                }`}
              />
              <div>
                <span className="text-slate-400 font-medium">Service Status: </span>
                <span
                  className={`font-bold ${
                    isSmsServiceConnected ? 'text-emerald-400' : 'text-amber-300 font-mono'
                  }`}
                >
                  {isSmsServiceConnected ? 'Connected (Live Cellular Gateway)' : 'SMS service not connected'}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
              Offline Simulation &amp; Dispatch Logging Mode
            </div>
          </div>

          {/* Location Focus Selector */}
          <div className="rounded-xl p-3 bg-slate-800/70 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span>Target Hazard Station:</span>
            </div>
            <select
              value={selectedStationId}
              onChange={(e) => handleStationChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-cyan-400 text-xs cursor-pointer max-w-full sm:max-w-xs"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                  {st.name} ({st.region})
                </option>
              ))}
            </select>
          </div>

          {/* CARD 2: RECIPIENT CARD */}
          <div className="rounded-xl p-3.5 bg-slate-800/70 border border-slate-700/60 space-y-2">
            <label htmlFor="sms-recipient-input" className="block text-slate-300 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                Recipient Phone Number
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Registered contacts: {subscribers.length}
              </span>
            </label>
            <div className="flex gap-2">
              <input
                id="sms-recipient-input"
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"
              />
              {subscribers.length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) setRecipientPhone(e.target.value);
                  }}
                  className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-2 py-1 text-xs cursor-pointer focus:outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>Quick Pick Contact</option>
                  {subscribers.slice(0, 8).map((sub) => (
                    <option key={sub.id} value={sub.phoneNumber} className="bg-slate-900 text-white">
                      {sub.fullName} ({sub.role})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* CARD 3: ALERT TYPE SELECTOR */}
          <div className="rounded-xl p-3.5 bg-slate-800/70 border border-slate-700/60 space-y-2">
            <span className="block text-slate-300 font-bold">Alert Type</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  'Landslide Warning',
                  'Flood Warning',
                  'Heavy Rainfall',
                  'Road Blockage',
                  'Emergency Alert'
                ] as AlertType[]
              ).map((type) => {
                const isSelected = alertType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleAlertTypeChange(type)}
                    className={`px-2.5 py-2 rounded-xl text-center font-bold text-xs transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-950/40'
                        : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARD 4: PRIORITY SELECTOR */}
          <div className="rounded-xl p-3.5 bg-slate-800/70 border border-slate-700/60 space-y-2">
            <span className="block text-slate-300 font-bold">Priority Level</span>
            <div className="grid grid-cols-3 gap-2">
              {(['Normal', 'High', 'Critical'] as AlertPriority[]).map((prio) => {
                const isSelected = priority === prio;
                const activeClasses =
                  prio === 'Critical'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400 shadow-rose-950/40'
                    : prio === 'High'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-amber-950/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-emerald-950/40';

                return (
                  <button
                    key={prio}
                    type="button"
                    onClick={() => handlePriorityChange(prio)}
                    className={`py-2 px-3 rounded-xl font-black text-center text-xs transition-all border cursor-pointer ${
                      isSelected
                        ? activeClasses
                        : 'bg-slate-900/80 text-slate-400 border-slate-700/60 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {prio}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARD 5: EDITABLE MESSAGE TEXTAREA */}
          <div className="rounded-xl p-3.5 bg-slate-800/70 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>Alert Message</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {message.length} characters • 1 SMS segment
              </span>
            </div>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-white text-xs leading-relaxed placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 font-mono"
            />
          </div>

          {statusNotice && (
            <div className="rounded-xl p-2.5 bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{statusNotice}</span>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-amber-300/90 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>SMS service not connected — Live telecom transmission disabled.</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>

              {/* Disabled / clearly marked Send Button */}
              <button
                type="button"
                disabled={!isSmsServiceConnected}
                title="SMS service not connected"
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 text-xs font-bold cursor-not-allowed flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Alert (Service Not Connected)</span>
              </button>

              {/* Offline Dispatch Simulation for Demonstration */}
              <button
                type="button"
                onClick={handleSimulateLog}
                className="px-3.5 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/50 text-xs font-bold transition-all cursor-pointer"
                title="Log this alert record for SIH evaluation demonstration"
              >
                Log Simulation
              </button>
            </div>
          </div>

          {/* RECENT ALERTS SECTION */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Recent Alerts
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {alertDispatches.length} recorded
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/70">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Alert Type</th>
                      <th className="py-2 px-3">Recipient</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {alertDispatches.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-500 italic">
                          No alerts dispatched yet
                        </td>
                      </tr>
                    ) : (
                      alertDispatches.slice(0, 6).map((dispatch) => {
                        const timeStr = new Date(dispatch.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        const recipient = dispatch.recipientsList?.[0] || '+91 94350 12890';
                        return (
                          <tr key={dispatch.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-2 px-3 font-mono text-slate-400">{timeStr}</td>
                            <td className="py-2 px-3 font-medium text-white truncate max-w-[150px]">
                              {dispatch.triggerReason || 'Emergency Alert'}
                            </td>
                            <td className="py-2 px-3 font-mono text-cyan-300">{recipient}</td>
                            <td className="py-2 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Logged / Simulated
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
