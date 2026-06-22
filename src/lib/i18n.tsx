'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Locale = 'zh-TW' | 'en' | 'ja';
type TranslationValue = string | { [key: string]: any };

interface TranslationDict {
  [key: string]: TranslationValue | TranslationDict;
}

const LOCALE_MAP: Record<string, Locale> = {
  'zh': 'zh-TW',
  'zh-TW': 'zh-TW',
  'zh-HK': 'zh-TW',
  'zh-CN': 'zh-TW',
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'ja': 'ja',
  'ja-JP': 'ja',
};

function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'zh-TW';
  const langs = navigator.languages || [navigator.language || 'zh-TW'];
  for (const lang of langs) {
    const mapped = LOCALE_MAP[lang];
    if (mapped) return mapped;
  }
  // Fallback: check the first two chars
  const primary = langs[0]?.slice(0, 2);
  if (primary === 'en') return 'en';
  if (primary === 'ja') return 'ja';
  return 'zh-TW';
}

function deepGet(obj: any, path: string): string {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return path;
    current = current[key];
  }
  return typeof current === 'string' ? current : path;
}

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (path: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'zh-TW',
  setLocale: () => {},
  t: (p: string) => p,
});

const cache: Record<string, any> = {};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh-TW');
  const [dict, setDict] = useState<any>(null);
  const [ready, setReady] = useState(false);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem('stock-power-locale', l);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('stock-power-locale') as Locale | null;
    const detected = saved || detectLocale();
    setLocaleState(detected);
  }, []);

  useEffect(() => {
    const load = async () => {
      const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/stock-power')
        ? '/stock-power' : '';
      try {
        const res = await fetch(`${basePath}/locales/${locale}.json`);
        const data = await res.json();
        setDict(data);
      } catch {
        // Fallback
        const res = await fetch(`${basePath}/locales/zh-TW.json`);
        const data = await res.json();
        setDict(data);
      }
      setReady(true);
    };
    load();
  }, [locale]);

  const t = useCallback((path: string): string => {
    if (!dict) return path;
    return deepGet(dict, path);
  }, [dict]);

  if (!ready) {
    return <div style={{ display: 'none' }} />;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
