import React from 'react';
import { Mountain, CloudRain, Navigation, ShieldAlert, Box, Sparkles } from 'lucide-react';
import { AuthLanguage } from './LanguageSelector';

interface FeatureItem {
  id: string;
  number: string;
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
}

const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: 'f1',
    number: '01',
    titleKey: 'MONITOR',
    descKey: 'Landslide & Flood Risk',
    icon: Mountain
  },
  {
    id: 'f2',
    number: '02',
    titleKey: 'ANALYZE',
    descKey: 'Weather, Terrain & Soil',
    icon: CloudRain
  },
  {
    id: 'f3',
    number: '03',
    titleKey: 'PLAN',
    descKey: 'Evacuation & Safe Routes',
    icon: Navigation
  },
  {
    id: 'f4',
    number: '04',
    titleKey: 'RESPOND',
    descKey: 'Emergency & Alerts',
    icon: ShieldAlert
  },
  {
    id: 'f5',
    number: '05',
    titleKey: 'SIMULATE',
    descKey: '3D Disaster Scenarios',
    icon: Box
  }
];

const TRANSLATIONS: Record<AuthLanguage, Record<string, { title: string; desc: string }>> = {
  en: {
    MONITOR: { title: 'Monitor', desc: 'Landslide & Flood Risk' },
    ANALYZE: { title: 'Analyze', desc: 'Weather, Terrain & Soil' },
    PLAN: { title: 'Plan', desc: 'Evacuation & Safe Routes' },
    RESPOND: { title: 'Respond', desc: 'Emergency & Alerts' },
    SIMULATE: { title: 'Simulate', desc: '3D Disaster Scenarios' }
  },
  te: {
    MONITOR: { title: 'Monitor', desc: 'కొండచరియలు & వరద ప్రమాదం' },
    ANALYZE: { title: 'Analyze', desc: 'వాతావరణం, భూమి & మట్టి' },
    PLAN: { title: 'Plan', desc: 'సురక్షిత తరలింపు మార్గాలు' },
    RESPOND: { title: 'Respond', desc: 'అత్యవసర హెచ్చరికలు' },
    SIMULATE: { title: 'Simulate', desc: '3D విపత్తు నమూనాలు' }
  },
  hi: {
    MONITOR: { title: 'Monitor', desc: 'भूस्खलन और बाढ़ जोखिम' },
    ANALYZE: { title: 'Analyze', desc: 'मौसम, भूभाग और मिट्टी' },
    PLAN: { title: 'Plan', desc: 'निकासी और सुरक्षित मार्ग' },
    RESPOND: { title: 'Respond', desc: 'आपातकालीन अलर्ट' },
    SIMULATE: { title: 'Simulate', desc: '3D आपदा परिदृश्य' }
  },
  as: {
    MONITOR: { title: 'Monitor', desc: 'ভূমিস্খলন আৰু বানপানীৰ আশংকা' },
    ANALYZE: { title: 'Analyze', desc: 'বতৰ, ভূখণ্ড আৰু মাটি' },
    PLAN: { title: 'Plan', desc: 'নিৰাপদ স্থানান্তৰ পথ' },
    RESPOND: { title: 'Respond', desc: 'জৰুৰী সতৰ্কবাণী' },
    SIMULATE: { title: 'Simulate', desc: '৩D দুৰ্যোগ পৰিবেশ' }
  }
};

interface FeatureListProps {
  language?: AuthLanguage;
  className?: string;
}

export const FeatureList: React.FC<FeatureListProps> = ({
  language = 'en',
  className = ''
}) => {
  const currentDict = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <div className={`flex flex-col space-y-4 select-none ${className}`}>
      {FEATURE_ITEMS.map((item) => {
        const IconComponent = item.icon;
        const text = currentDict[item.titleKey] || { title: item.titleKey, desc: item.descKey };

        return (
          <div
            key={item.id}
            className="group flex items-center gap-3.5 py-0.5 transition-transform duration-200 hover:translate-x-1.5 cursor-default"
          >
            {/* Glowing Cyan Circular Icon Container */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#04192f]/90 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-md shadow-cyan-950 group-hover:border-cyan-300 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] group-hover:text-cyan-200 transition-all">
                <IconComponent className="w-5 h-5 stroke-[2]" />
              </div>
            </div>

            {/* Text Title & Subtitle */}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-tight text-white group-hover:text-cyan-200 transition-colors font-sans">
                {text.title}
              </span>
              <span className="text-xs font-medium text-cyan-200/80 group-hover:text-cyan-100 transition-colors truncate">
                {text.desc}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
