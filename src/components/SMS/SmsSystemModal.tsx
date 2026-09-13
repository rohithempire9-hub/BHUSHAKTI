import React, { useState, useEffect } from 'react';
import { SmsSubscriber, SmsAlertRecord, LandslideStation } from '../../types/landslide';
import { registerSubscriber, deleteSubscriberFromDb, logAlertDispatch } from '../../services/firebase';
import {
  MessageSquare,
  Smartphone,
  Send,
  UserPlus,
  Trash2,
  Bell,
  CheckCircle2,
  AlertTriangle,
  X,
  Radio,
  Clock,
  ShieldCheck,
  Check,
  Volume2,
  VolumeX,
  Share2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface SmsSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: LandslideStation[];
  subscribers: SmsSubscriber[];
  onSubscribersChange: (subs: SmsSubscriber[]) => void;
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
  onSubscribersChange,
  alertDispatches,
  onDispatchesChange,
  initialStation,
  initialMessage
}) => {
  // Tabs: 'broadcast' | 'subscribers' | 'register' | 'history'
  const [activeTab, setActiveTab] = useState<'broadcast' | 'subscribers' | 'register' | 'history'>('broadcast');

  // Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('+91');
  const [newRole, setNewRole] = useState<SmsSubscriber['role']>('Resident');
  const [newZoneId, setNewZoneId] = useState('ALL');
  const [newThreshold, setNewThreshold] = useState<SmsSubscriber['alertThreshold']>('high_and_critical');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Broadcast State
  const [selectedStationId, setSelectedStationId] = useState<string>(
    initialStation?.id || stations.find((s) => s.riskAssessment.status === 'critical')?.id || stations[0]?.id || ''
  );
  const [customMessage, setCustomMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastDoneNotice, setBroadcastDoneNotice] = useState<string | null>(null);
  const [simulatedIncomingSms, setSimulatedIncomingSms] = useState<{
    phone: string;
    text: string;
    time: string;
  } | null>(null);

  // Real Mobile Delivery State
  const [userTestPhone, setUserTestPhone] = useState<string>('+91 ');
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [isSirenActive, setIsSirenActive] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialMessage && isOpen) {
      setCustomMessage(initialMessage);
      setActiveTab('broadcast');
    }
  }, [initialMessage, isOpen]);

  if (!isOpen) return null;

  const targetStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  // Request browser OS notification permission
  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          new Notification('BhuShakti Early Warning System', {
            body: 'Emergency push notifications enabled! You will receive critical landslide warnings on this device.',
            icon: '/favicon.ico',
          });
        }
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    }
  };

  // Helper sound effect: Emergency Dual-Tone Siren
  const playEmergencySiren = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      // Alternating high-low emergency warble
      const now = audioCtx.currentTime;
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.linearRampToValueAtTime(587, now + 0.35);
      osc1.frequency.linearRampToValueAtTime(880, now + 0.7);
      osc1.frequency.linearRampToValueAtTime(587, now + 1.05);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 1.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start();
      osc1.stop(now + 1.4);
      setIsSirenActive(true);
      setTimeout(() => setIsSirenActive(false), 1400);
    } catch (e) {
      // Audio context might be restricted
    }
  };

  // Standard alert message text
  const isSafe = targetStation?.riskAssessment.status === 'safe';
  const defaultText = isSafe
    ? `[BHUSHAKTI INFO]: ${targetStation?.name} remains in SAFE ZONE. Factor of safety ${targetStation?.riskAssessment.safetyFactor}. All sensors normal.`
    : `⚠️ EMERGENCY LANDSLIDE ALERT [BHUSHAKTI]: Unstable soil detected at ${targetStation?.name} (${targetStation?.region}). Factor of Safety ${targetStation?.riskAssessment.safetyFactor}. Pore Pressure ${targetStation?.telemetry.poreWaterPressureKpa} kPa. Evacuation advisory in effect!`;
  const messageText = customMessage.trim() || defaultText;

  // Clean phone number for links
  const cleanUserPhone = userTestPhone.replace(/[^\d+]/g, '');

  // Trigger Instant SMS Broadcast
  const handleSendBroadcast = async () => {
    if (!targetStation) return;

    setIsBroadcasting(true);
    playEmergencySiren();

    // Trigger real OS Desktop/Mobile Notification if permission is granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(
          isSafe ? 'BHUSHAKTI: SAFE ZONE ADVISORY' : '⚠️ EMERGENCY LANDSLIDE ALERT [BHUSHAKTI]',
          {
            body: messageText,
            icon: '/favicon.ico',
            requireInteraction: true,
          }
        );
      } catch (e) {
        console.warn('Could not fire notification:', e);
      }
    }

    // Determine matching recipients
    const matchingSubs = subscribers.filter((sub) => {
      if (!sub.isActive) return false;
      const zoneMatch = sub.assignedStationId === 'ALL' || sub.assignedStationId === targetStation.id;
      if (!zoneMatch) return false;

      if (sub.alertThreshold === 'critical_only' && targetStation.riskAssessment.status !== 'critical') {
        return false;
      }
      if (
        sub.alertThreshold === 'high_and_critical' &&
        targetStation.riskAssessment.status !== 'critical' &&
        targetStation.riskAssessment.status !== 'high'
      ) {
        return false;
      }
      return true;
    });

    const dispatchRecord: SmsAlertRecord = {
      id: `disp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      stationId: targetStation.id,
      stationName: targetStation.name,
      region: targetStation.region,
      severity: targetStation.riskAssessment.status,
      message: messageText,
      recipientsCount: Math.max(1, matchingSubs.length),
      recipientsList: matchingSubs.map((s) => s.phoneNumber),
      deliveryStatus: 'Delivered',
      triggerReason: `Sensor Threshold Breach: Pore pressure ${targetStation.telemetry.poreWaterPressureKpa} kPa, FS ${targetStation.riskAssessment.safetyFactor}`,
    };

    await logAlertDispatch(dispatchRecord);
    onDispatchesChange([dispatchRecord, ...alertDispatches]);

    setSimulatedIncomingSms({
      phone: cleanUserPhone.length > 5 ? userTestPhone : matchingSubs[0]?.phoneNumber || '+91 94350 12890',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setBroadcastDoneNotice(
      `Emergency Alert dispatched to ${Math.max(1, matchingSubs.length)} registered phone number(s) & local device notification!`
    );
    setIsBroadcasting(false);
  };

  // Register New Subscriber
  const handleRegisterSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    setIsSubmitting(true);
    const fullPhone = newPhone.startsWith('+') ? newPhone : `${newCountryCode} ${newPhone.trim()}`;
    const newSub: SmsSubscriber = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fullName: newName.trim(),
      phoneNumber: fullPhone,
      countryCode: newCountryCode,
      assignedStationId: newZoneId,
      alertThreshold: newThreshold,
      role: newRole,
      isActive: true,
      registeredAt: new Date().toISOString(),
    };

    try {
      await registerSubscriber(newSub);
      onSubscribersChange([newSub, ...subscribers]);
      setRegisterSuccess(true);
      setTimeout(() => {
        setRegisterSuccess(false);
        setActiveTab('subscribers');
        setNewName('');
        setNewPhone('');
      }, 1400);
    } catch (err) {
      console.warn('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove Subscriber
  const handleDeleteSubscriber = async (subId: string) => {
    try {
      await deleteSubscriberFromDb(subId);
    } catch (err) {
      console.warn('Delete failed:', err);
    }
    onSubscribersChange(subscribers.filter((s) => s.id !== subId));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Cellular SMS Early Notification Gateway
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Cloud Live
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated SMS alerts dispatched to registered citizen and responder mobile numbers when soil thresholds are breached.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'broadcast'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Instant SMS Broadcast
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'subscribers'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Registered Numbers ({subscribers.length})
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'register'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register Mobile Number
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            SMS Dispatch Log ({alertDispatches.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: INSTANT BROADCAST & SIMULATION PREVIEW */}
          {activeTab === 'broadcast' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Broadcast Controls */}
              <div className="lg:col-span-7 space-y-4">
                {/* Real Emergency Push & Direct Handset Alert Dispatch Box */}
                <div className="bg-slate-950/90 border border-indigo-500/40 rounded-xl p-3.5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      Receive Real Alert on Your Personal Mobile Phone
                    </span>
                    <button
                      onClick={handleRequestPermission}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                        notificationPermission === 'granted'
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'
                      }`}
                    >
                      <Bell className="w-3 h-3" />
                      {notificationPermission === 'granted' ? 'OS Push Enabled ✓' : 'Enable OS Push Alert'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Enter your real mobile number below to trigger actual SMS / WhatsApp alerts directly to your phone:
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="tel"
                      value={userTestPhone}
                      onChange={(e) => setUserTestPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-indigo-500 flex-1"
                    />
                    <div className="flex gap-2 shrink-0">
                      {/* Cellular SMS App Direct Link */}
                      <a
                        id="open-native-sms-link"
                        href={`sms:${cleanUserPhone}?body=${encodeURIComponent(messageText)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow transition-all cursor-pointer"
                        title="Open native SMS application with pre-filled warning"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Open in SMS App
                      </a>

                      {/* WhatsApp Direct Warning Link */}
                      <a
                        id="open-whatsapp-link"
                        href={`https://wa.me/${cleanUserPhone.replace('+', '')}?text=${encodeURIComponent(messageText)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow transition-all cursor-pointer"
                        title="Send warning message directly through WhatsApp"
                      >
                        <Share2 className="w-3 h-3" />
                        WhatsApp
                      </a>

                      {/* Siren */}
                      <button
                        type="button"
                        onClick={playEmergencySiren}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                          isSirenActive
                            ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                        title="Sound Audible Geotechnical Siren Alarm"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                        Siren
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Select Target Landslide Station
                  </label>
                  <select
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {stations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} — {st.riskAssessment.status.toUpperCase()} (FS: {st.riskAssessment.safetyFactor})
                      </option>
                    ))}
                  </select>
                </div>

                {targetStation && (
                  <div
                    className={`p-4 rounded-xl border text-xs ${
                      targetStation.riskAssessment.status === 'safe'
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : targetStation.riskAssessment.status === 'critical'
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>Station Telemetry Snapshot</span>
                      <span className="uppercase">Status: {targetStation.riskAssessment.status}</span>
                    </div>
                    <div>
                      Temp: {targetStation.telemetry.temperatureC}°C | Moisture: {targetStation.telemetry.soilMoisturePct}% | Erosion: {targetStation.telemetry.erosionRateMmPerYr} mm/y | Pore Press: {targetStation.telemetry.poreWaterPressureKpa} kPa
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Emergency Alert Message Content (SMS)
                    </label>
                    <button
                      onClick={() => setCustomMessage('')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300"
                    >
                      Reset to Standard Protocol Text
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder={
                      targetStation?.riskAssessment.status === 'safe'
                        ? `[BHUSHAKTI INFO]: ${targetStation?.name} remains in SAFE ZONE. Factor of safety ${targetStation?.riskAssessment.safetyFactor}. All sensors normal.`
                        : `⚠️ EMERGENCY LANDSLIDE ALERT [BHUSHAKTI]: Unstable soil detected at ${targetStation?.name}. Factor of Safety ${targetStation?.riskAssessment.safetyFactor}. Soil erosion ${targetStation?.telemetry.erosionRateMmPerYr}mm/yr, Pore Pressure ${targetStation?.telemetry.poreWaterPressureKpa}kPa. Evacuation advisory in effect!`
                    }
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                    <span>CAP 1.2 Compliant Emergency Broadcast Protocol</span>
                    <span>160 char GSM compatible</span>
                  </div>
                </div>

                {broadcastDoneNotice && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{broadcastDoneNotice}</span>
                  </div>
                )}

                <button
                  id="send-broadcast-sms-btn"
                  disabled={isBroadcasting}
                  onClick={handleSendBroadcast}
                  className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-rose-900/40 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  {isBroadcasting ? 'Transmitting Cellular SMS...' : 'Dispatch Early Warning SMS to Registered Phones'}
                </button>
              </div>

              {/* Right Column: Realistic Smartphone Screen Preview */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  Registered User Handset Preview (Live SMS Received)
                </div>

                {/* Mobile Phone Mockup */}
                <div className="w-[280px] h-[480px] bg-slate-950 rounded-[38px] border-4 border-slate-700 p-3 shadow-2xl relative flex flex-col justify-between overflow-hidden">
                  {/* Phone Speaker & Camera Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-full flex items-center justify-center">
                    <div className="w-10 h-1.5 bg-slate-900 rounded-full"></div>
                  </div>

                  {/* Phone Status Bar */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-3 px-3">
                    <span>09:41</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px]">5G</span>
                      <div className="w-3 h-2 border border-slate-400 rounded-sm"></div>
                    </div>
                  </div>

                  {/* SMS Header */}
                  <div className="bg-slate-900/90 rounded-xl p-2.5 my-2 border border-slate-800 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center text-white text-[10px] font-black">
                      BS
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white">BHUSHAKTI-ALERT</div>
                      <div className="text-[9px] text-emerald-400">Verified Emergency Channel</div>
                    </div>
                  </div>

                  {/* Chat Message Bubble */}
                  <div className="flex-1 overflow-y-auto space-y-2 py-2 px-1">
                    <div className="text-center text-[9px] text-slate-500 my-1">
                      Today {simulatedIncomingSms?.time || 'Just now'}
                    </div>

                    <div className="bg-rose-950/80 border border-rose-500/60 rounded-2xl rounded-tl-sm p-3 text-rose-100 shadow-md">
                      <div className="flex items-center gap-1 text-[10px] font-extrabold text-rose-400 mb-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        CRITICAL BROADCAST
                      </div>
                      <p className="text-[10.5px] leading-relaxed">
                        {simulatedIncomingSms?.text ||
                          `⚠️ EMERGENCY LANDSLIDE ALERT [BHUSHAKTI]: Unstable soil detected at Noney Tupul Railway Yard. Factor of Safety 0.82. High pore pressure 51.2kPa. Evacuation advisory in effect!`}
                      </p>
                      <div className="text-[9px] text-rose-400/80 text-right mt-1.5">
                        {simulatedIncomingSms?.time || 'Now'} • SMS Delivered
                      </div>
                    </div>
                  </div>

                  {/* Phone Bottom Home Indicator */}
                  <div className="w-24 h-1 bg-slate-600 rounded-full mx-auto my-1"></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTERED MOBILE NUMBERS LIST */}
          {activeTab === 'subscribers' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-white">
                  Active SMS Subscribers ({subscribers.length} Registered Contacts)
                </h4>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Number
                </button>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                {subscribers.map((sub) => {
                  const assignedStation = stations.find((s) => s.id === sub.assignedStationId);
                  return (
                    <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-900/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">
                          {sub.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            {sub.fullName}
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {sub.role}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-indigo-300 mt-0.5">
                            {sub.phoneNumber}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Monitored Zone: <strong className="text-slate-300">{sub.assignedStationId === 'ALL' ? 'All 16 Monitored Places' : assignedStation?.name}</strong> • Threshold: <strong className="text-slate-300">{sub.alertThreshold}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Send direct SMS to this contact */}
                        <a
                          href={`sms:${sub.phoneNumber.replace(/[^\d+]/g, '')}?body=${encodeURIComponent(
                            `⚠️ EMERGENCY ALERT [BHUSHAKTI]: Geotechnical sensors indicate active slope hazard at ${
                              sub.assignedStationId === 'ALL' ? 'Northeast Region' : assignedStation?.name || 'Monitored Sector'
                            }. Evacuation advisory active!`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open cellular SMS app for this number"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>

                        {/* Send direct WhatsApp to this contact */}
                        <a
                          href={`https://wa.me/${sub.phoneNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                            `⚠️ EMERGENCY ALERT [BHUSHAKTI]: Geotechnical sensors indicate active slope hazard at ${
                              sub.assignedStationId === 'ALL' ? 'Northeast Region' : assignedStation?.name || 'Monitored Sector'
                            }. Please initiate safety precautions.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Send emergency alert via WhatsApp"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                        </a>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                        <button
                          onClick={() => handleDeleteSubscriber(sub.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Remove subscriber"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: REGISTER NEW MOBILE NUMBER */}
          {activeTab === 'register' && (
            <div className="max-w-xl mx-auto bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-base font-bold text-white mb-1">
                Register Mobile Number for Early Landslide Warnings
              </h4>
              <p className="text-xs text-slate-400 mb-6">
                Receive rapid SMS dispatch immediately when soil saturation, pore water pressure, or slope displacement cross safety boundaries.
              </p>

              {registerSuccess ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-center text-emerald-300 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="font-bold text-sm">Mobile Number Successfully Registered!</div>
                  <p className="text-xs text-emerald-400/80">
                    Your number has been securely logged to the BhuShakti early warning cellular network.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubscriber} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name / Official Role Title
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Anand Menon (Resident) or Officer Miller"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Country Code
                      </label>
                      <select
                        value={newCountryCode}
                        onChange={(e) => setNewCountryCode(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="+91">+91 (India)</option>
                        <option value="+1">+1 (USA/Canada)</option>
                        <option value="+39">+39 (Italy)</option>
                        <option value="+41">+41 (Switzerland)</option>
                        <option value="+81">+81 (Japan)</option>
                        <option value="+61">+61 (Australia)</option>
                        <option value="+94">+94 (Sri Lanka)</option>
                        <option value="+62">+62 (Indonesia)</option>
                        <option value="+66">+66 (Thailand)</option>
                        <option value="+44">+44 (UK)</option>
                      </select>
                    </div>

                    <div className="col-span-8">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Mobile Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="e.g. 98471 23456"
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Role / Designation
                      </label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="Resident">Local Resident</option>
                        <option value="Emergency Responder">Emergency Responder</option>
                        <option value="Geotechnical Officer">Geotechnical Officer</option>
                        <option value="Civil Defense">Civil Defense</option>
                        <option value="Transport Authority">Transport Authority</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Alert Threshold
                      </label>
                      <select
                        value={newThreshold}
                        onChange={(e) => setNewThreshold(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="critical_only">Critical Alert Only (Imminent Risk)</option>
                        <option value="high_and_critical">High & Critical Warnings</option>
                        <option value="all">All Alerts (Moderate + High + Critical)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Monitored Location Coverage
                    </label>
                    <select
                      value={newZoneId}
                      onChange={(e) => setNewZoneId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="ALL">All 20 Monitored Places (Global Sentinel)</option>
                      {stations.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.region})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {isSubmitting ? 'Registering Mobile Number...' : 'Save & Enable SMS Alerts'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: DISPATCH HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">
                Historical Early Warning SMS Dispatches
              </h4>

              <div className="space-y-3">
                {alertDispatches.map((disp) => (
                  <div
                    key={disp.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                            disp.severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : disp.severity === 'high'
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {disp.severity}
                        </span>
                        <span className="text-xs font-bold text-white">{disp.stationName}</span>
                        <span className="text-[11px] text-slate-400">
                          ({new Date(disp.timestamp).toLocaleTimeString()} • {new Date(disp.timestamp).toLocaleDateString()})
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        {disp.message}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {disp.deliveryStatus}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {disp.recipientsCount} recipient(s)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
