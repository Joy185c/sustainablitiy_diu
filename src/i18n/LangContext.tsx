import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { en, bn } from './translations';

type Lang = 'en' | 'bn';
type Translations = typeof en;

interface LangContextType {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  t: en,
  toggleLang: () => {},
});

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>('en');

  const toggleLang = () => setLang(prev => (prev === 'en' ? 'bn' : 'en'));

  const t = lang === 'en' ? en : bn;

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      <div className={lang === 'bn' ? 'lang-bn' : ''} style={{ fontFamily: lang === 'bn' ? "'Hind Siliguri', sans-serif" : "'Inter', sans-serif" }}>
        {children}
      </div>
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
