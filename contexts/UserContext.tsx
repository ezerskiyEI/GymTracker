import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { UserProfile, WeightEntry, Achievement, UserLevel } from '@/types/user';
import { StorageService } from '@/services/storageService';
import { GoalService } from '@/services/goalService';

interface UserContextType {
  // Profile
  profile: UserProfile | null;
  updateProfile: (profile: UserProfile) => Promise<void>;
  completeOnboarding: (profile: Omit<UserProfile, 'id' | 'createdAt' | 'isOnboardingCompleted'>) => Promise<void>;
  
  // Weight tracking
  weightEntries: WeightEntry[];
  addWeightEntry: (entry: Omit<WeightEntry, 'id'>) => Promise<void>;
  
  // Achievements
  achievements: Achievement[];
  refreshAchievements: (workouts: any[]) => Promise<void>;
  
  // Recovery tips
  getRecoveryTips: () => string[];
  
  // User management
  logout: () => Promise<void>;
  switchUser: (profileId?: string) => Promise<void>;
  getBackupProfiles: () => Promise<Array<{id: string, name: string, backupDate: string}>>;
  

  
  // Loading
  loading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [profileData, weightData, achievementData] = await Promise.all([
        StorageService.getUserProfile(),
        StorageService.getWeightEntries(),
        StorageService.getAchievements(),
      ]);
      
      setProfile(profileData);
      setWeightEntries(weightData);
      setAchievements(achievementData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedProfile: UserProfile) => {
    try {
      await StorageService.saveUserProfile(updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const completeOnboarding = async (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'isOnboardingCompleted'>) => {
    try {
      const newProfile: UserProfile = {
        ...profileData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isOnboardingCompleted: true,
      };
      
      await StorageService.saveUserProfile(newProfile);
      setProfile(newProfile);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const addWeightEntry = async (entryData: Omit<WeightEntry, 'id'>) => {
    try {
      const newEntry: WeightEntry = {
        ...entryData,
        id: Date.now().toString(),
      };
      
      await StorageService.saveWeightEntry(newEntry);
      setWeightEntries(prev => [...prev, newEntry]);
      
      // Обновление профиля с последней датой измерения веса
      if (profile) {
        const updatedProfile = {
          ...profile,
          lastWeightUpdate: newEntry.date,
        };
        await updateProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error adding weight entry:', error);
    }
  };

  const refreshAchievements = async (workouts: any[]) => {
    try {
      if (!profile) return;
      
      const newAchievements = GoalService.calculateAchievements(workouts, profile, weightEntries);
      await StorageService.saveAchievements(newAchievements);
      setAchievements(newAchievements);
    } catch (error) {
      console.error('Error refreshing achievements:', error);
    }
  };

  const getRecoveryTips = (): string[] => {
    if (!profile) return [];
    return GoalService.getRecoveryTips(profile.goals.primaryGoal);
  };

  const logout = async () => {
    try {
      await StorageService.clearCurrentUserData();
      setProfile(null);
      setWeightEntries([]);
      setAchievements([]);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const switchUser = async (profileId?: string) => {
    try {
      setLoading(true);
      
      if (profileId) {
        // Switch to existing user
        const switchProfile = await StorageService.loadUserProfile(profileId);
        if (switchProfile) {
          await StorageService.saveUserProfile(switchProfile);
          setProfile(switchProfile);
          
          // Load user-specific data (if stored separately in future)
          const [weightData, achievementData] = await Promise.all([
            StorageService.getWeightEntries(),
            StorageService.getAchievements(),
          ]);
          
          setWeightEntries(weightData);
          setAchievements(achievementData);
        }
      } else {
        // Create new user - clear current data first
        await logout();
      }
    } catch (error) {
      console.error('Error switching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBackupProfiles = async () => {
    return await StorageService.getBackupProfiles();
  };



  const value: UserContextType = {
    profile,
    updateProfile,
    completeOnboarding,
    weightEntries,
    addWeightEntry,
    achievements,
    refreshAchievements,
    getRecoveryTips,
    logout,
    switchUser,
    getBackupProfiles,
    loading,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}