import { useState, useEffect, useCallback } from 'react';
import { loadUserData, saveUserData, defaultUserData } from '@/lib/userData';
import { UserData } from '@/types/userData';

export function useUserProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = loadUserData();
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserData(data);
    }
     
    setIsLoading(false);
  }, []);

  const updateProfile = useCallback((profileUpdates: Partial<UserData['profile']>) => {
    setUserData(prev => {
      const newData = prev ? { ...prev } : { ...defaultUserData };
      newData.profile = { ...newData.profile, ...profileUpdates };
      saveUserData(newData);
      return newData;
    });
  }, []);

  const updateData = useCallback((updater: (data: UserData) => UserData) => {
    setUserData(prev => {
      const current = prev || { ...defaultUserData };
      const newData = updater(current);
      saveUserData(newData);
      return newData;
    });
  }, []);

  const createProfile = useCallback((name: string, avatar: string, age: UserData['profile']['ageRange']) => {
    const newProfile = { ...defaultUserData };
    newProfile.profile.displayName = name;
    newProfile.profile.avatar = avatar;
    newProfile.profile.ageRange = age;
    saveUserData(newProfile);
    setUserData(newProfile);
  }, []);

  return {
    userData,
    isLoading,
    updateProfile,
    updateData,
    createProfile,
    hasProfile: !!userData && !!userData.profile.displayName
  };
}
