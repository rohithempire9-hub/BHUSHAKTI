import { BhuLanguage } from '../types/bhuShakti';
import { TranslationSchema, LanguageOption } from './types';

import { en } from './en';
import { te } from './te';
import { hi } from './hi';
import { as } from './as';
import { bn } from './bn';
import { ne } from './ne';
import { mni } from './mni';
import { kha } from './kha';
import { lus } from './lus';
import { brx } from './brx';

export * from './types';

export const translations: Record<BhuLanguage, TranslationSchema> = {
  en,
  te,
  hi,
  as,
  bn,
  ne,
  mni,
  kha,
  lus,
  brx,
};

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'ne', label: 'Nepali', native: 'नेपाली' },
  { code: 'mni', label: 'Meitei', native: 'মণিপুরী' },
  { code: 'kha', label: 'Khasi', native: 'खासी' },
  { code: 'lus', label: 'Mizo', native: 'मिज़ो' },
  { code: 'brx', label: 'Bodo', native: 'बोडो' },
];

/**
 * Robust fallback helper:
 * 1. Try selected language
 * 2. If missing -> English
 * 3. Never return undefined or broken string
 */
export function getTranslation(lang: BhuLanguage, key: keyof TranslationSchema): string {
  const currentDict = translations[lang];
  if (currentDict && currentDict[key]) {
    return currentDict[key] as string;
  }
  const fallbackDict = translations.en;
  if (fallbackDict && fallbackDict[key]) {
    return fallbackDict[key] as string;
  }
  return String(key);
}
