import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HostCountryCode, CountryConfig, getCountryConfig } from '../constants/countries';

// Lazy-import authService to avoid crashing at module load time
let _getUserProfile: ((uid: string) => Promise<any>) | null = null;
let _updateUserProfile: ((uid: string, data: any) => Promise<void>) | null = null;

async function loadAuthService() {
  if (!_getUserProfile) {
    try {
      const mod = await import('../services/authService');
      _getUserProfile = mod.getUserProfile;
      _updateUserProfile = mod.updateUserProfile;
    } catch (e) {
      console.error('CountryContext: Failed to load authService:', e);
    }
  }
}

const STORAGE_KEY = '@host_country';

interface CountryContextValue {
  hostCountry: HostCountryCode;
  countryConfig: CountryConfig;
  setHostCountry: (code: HostCountryCode) => Promise<void>;
}

const CountryContext = createContext<CountryContextValue>({
  hostCountry: 'US',
  countryConfig: getCountryConfig('US'),
  setHostCountry: async () => {},
});

interface CountryProviderProps {
  children: React.ReactNode;
  user?: { uid: string } | null;
}

export function CountryProvider({ children, user = null }: CountryProviderProps) {
  const [hostCountry, setHostCountryState] = useState<HostCountryCode>('US');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setHostCountryState(stored as HostCountryCode);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    loadAuthService().then(() => {
      if (_getUserProfile) {
        _getUserProfile(user.uid).then((profile: any) => {
          if (profile?.hostCountry) {
            setHostCountryState(profile.hostCountry);
            AsyncStorage.setItem(STORAGE_KEY, profile.hostCountry);
          }
        }).catch((e: any) => console.error('CountryContext: getUserProfile error:', e));
      }
    }).catch((e: any) => console.error('CountryContext: loadAuthService error:', e));
  }, [user]);

  const setHostCountry = useCallback(async (code: HostCountryCode) => {
    setHostCountryState(code);
    await AsyncStorage.setItem(STORAGE_KEY, code);
    if (user) {
      await loadAuthService();
      if (_updateUserProfile) {
        await _updateUserProfile(user.uid, { hostCountry: code });
      }
    }
  }, [user]);

  return (
    <CountryContext.Provider
      value={{
        hostCountry,
        countryConfig: getCountryConfig(hostCountry),
        setHostCountry,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  return useContext(CountryContext);
}
