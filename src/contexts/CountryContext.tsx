import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HostCountryCode, CountryConfig, getCountryConfig } from '../constants/countries';
import { useAuth } from './AuthContext';
import { getUserProfile, updateUserProfile } from '../services/authService';

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

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [hostCountry, setHostCountryState] = useState<HostCountryCode>('US');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setHostCountryState(stored as HostCountryCode);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((profile) => {
      if (profile?.hostCountry) {
        setHostCountryState(profile.hostCountry);
        AsyncStorage.setItem(STORAGE_KEY, profile.hostCountry);
      }
    });
  }, [user]);

  const setHostCountry = useCallback(async (code: HostCountryCode) => {
    setHostCountryState(code);
    await AsyncStorage.setItem(STORAGE_KEY, code);
    if (user) {
      await updateUserProfile(user.uid, { hostCountry: code });
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
