import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Farm } from './farmTypes';

const LS_FARMS_KEY = 'salinoCrop_farms_v1';
const LS_ONBOARD_KEY = 'salinoCrop_onboarded_v1';

interface FarmsContextType {
  farms: Farm[];
  addFarm: (farm: Farm) => void;
  updateFarm: (id: string, updates: Partial<Farm>) => void;
  deleteFarm: (id: string) => void;
  getFarm: (id: string) => Farm | undefined;
  onboardingDone: boolean;
  dismissOnboarding: () => void;
}

const FarmsContext = createContext<FarmsContextType>({
  farms: [],
  addFarm: () => {},
  updateFarm: () => {},
  deleteFarm: () => {},
  getFarm: () => undefined,
  onboardingDone: false,
  dismissOnboarding: () => {},
});

export function FarmsProvider({ children }: { children: ReactNode }) {
  const [farms, setFarms] = useState<Farm[]>(() => {
    try {
      const raw = localStorage.getItem(LS_FARMS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const [onboardingDone, setOnboardingDone] = useState<boolean>(() => {
    return localStorage.getItem(LS_ONBOARD_KEY) === 'true';
  });

  // Sync farms to localStorage whenever they change
  useEffect(() => {
    try { localStorage.setItem(LS_FARMS_KEY, JSON.stringify(farms)); }
    catch { /* storage full */ }
  }, [farms]);

  const addFarm = useCallback((farm: Farm) => {
    setFarms(prev => {
      // Avoid duplicates
      if (prev.find(f => f.id === farm.id)) return prev;
      return [...prev, farm];
    });
    // Once a farm is saved, mark onboarding as done
    setOnboardingDone(true);
    localStorage.setItem(LS_ONBOARD_KEY, 'true');
  }, []);

  const updateFarm = useCallback((id: string, updates: Partial<Farm>) => {
    setFarms(prev => prev.map(f =>
      f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
    ));
  }, []);

  const deleteFarm = useCallback((id: string) => {
    setFarms(prev => prev.filter(f => f.id !== id));
  }, []);

  const getFarm = useCallback((id: string) => {
    return farms.find(f => f.id === id);
  }, [farms]);

  const dismissOnboarding = useCallback(() => {
    setOnboardingDone(true);
    localStorage.setItem(LS_ONBOARD_KEY, 'true');
  }, []);

  return (
    <FarmsContext.Provider value={{ farms, addFarm, updateFarm, deleteFarm, getFarm, onboardingDone, dismissOnboarding }}>
      {children}
    </FarmsContext.Provider>
  );
}

export const useFarms = () => useContext(FarmsContext);
