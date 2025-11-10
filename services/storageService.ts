import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout, WorkoutSchedule, WeeklyStats } from '@/types/workout';
import { UserProfile, WeightEntry, Achievement } from '@/types/user';
import { Language } from '@/constants/languages';

const STORAGE_KEYS = {
  WORKOUTS: 'workouts',
  SCHEDULES: 'schedules',
  WEEKLY_STATS: 'weekly_stats',
  USER_PROFILE: 'user_profile',
  WEIGHT_ENTRIES: 'weight_entries',
  ACHIEVEMENTS: 'achievements',
  BACKUP_PROFILES: 'backup_profiles',
  CURRENT_USER_ID: 'current_user_id',
  LANGUAGE: 'language',
  THEME: 'theme',
};

export class StorageService {
  // Language Management
  static async getLanguage(): Promise<Language> {
    try {
      const language = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return (language as Language) || 'ru';
    } catch (error) {
      console.error('Error getting language:', error);
      return 'ru';
    }
  }

  static async saveLanguage(language: Language): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }

  // Theme Management
  static async getTheme(): Promise<'light' | 'dark'> {
    try {
      const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      return (theme as 'light' | 'dark') || 'dark';
    } catch (error) {
      console.error('Error getting theme:', error);
      return 'dark';
    }
  }

  static async saveTheme(theme: 'light' | 'dark'): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  // User Management
  static async getCurrentUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  }

  static async setCurrentUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } catch (error) {
      console.error('Error setting current user ID:', error);
    }
  }

  static async getBackupProfiles(): Promise<Array<{id: string, name: string, backupDate: string}>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BACKUP_PROFILES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading backup profiles:', error);
      return [];
    }
  }

  static async saveProfileBackup(profile: UserProfile): Promise<void> {
    try {
      const backups = await this.getBackupProfiles();
      const existingIndex = backups.findIndex(b => b.id === profile.id);
      
      const backupEntry = {
        id: profile.id,
        name: profile.name,
        backupDate: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        backups[existingIndex] = backupEntry;
      } else {
        backups.push(backupEntry);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.BACKUP_PROFILES, JSON.stringify(backups));
      
      // Save full profile data with user ID prefix
      await AsyncStorage.setItem(`${STORAGE_KEYS.USER_PROFILE}_${profile.id}`, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile backup:', error);
    }
  }

  static async loadUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.USER_PROFILE}_${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  static async clearCurrentUserData(): Promise<void> {
    try {
      const currentUserId = await this.getCurrentUserId();
      if (currentUserId) {
        // Backup current profile before clearing
        const profile = await this.getUserProfile();
        if (profile) {
          await this.saveProfileBackup(profile);
        }
      }

      // Clear current session data
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      await AsyncStorage.removeItem(STORAGE_KEYS.WORKOUTS);
      await AsyncStorage.removeItem(STORAGE_KEYS.WEIGHT_ENTRIES);
      await AsyncStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
      await AsyncStorage.removeItem(STORAGE_KEYS.SCHEDULES);
      await AsyncStorage.removeItem(STORAGE_KEYS.WEEKLY_STATS);
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  // Работа с тренировками
  static async getWorkouts(): Promise<Workout[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading workouts:', error);
      return [];
    }
  }

  static async saveWorkout(workout: Workout): Promise<void> {
    try {
      const workouts = await this.getWorkouts();
      const existingIndex = workouts.findIndex(w => w.id === workout.id);
      
      if (existingIndex >= 0) {
        workouts[existingIndex] = workout;
      } else {
        workouts.push(workout);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  }

  static async deleteWorkout(workoutId: string): Promise<void> {
    try {
      const workouts = await this.getWorkouts();
      const filtered = workouts.filter(w => w.id !== workoutId);
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  }

  // Работа с расписанием
  static async getSchedules(): Promise<WorkoutSchedule[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading schedules:', error);
      return [];
    }
  }

  static async saveSchedule(schedule: WorkoutSchedule): Promise<void> {
    try {
      const schedules = await this.getSchedules();
      const existingIndex = schedules.findIndex(s => s.id === schedule.id);
      
      if (existingIndex >= 0) {
        schedules[existingIndex] = schedule;
      } else {
        schedules.push(schedule);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  }

  // Статистика
  static async getWeeklyStats(): Promise<WeeklyStats[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_STATS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading weekly stats:', error);
      return [];
    }
  }

  static async saveWeeklyStats(stats: WeeklyStats): Promise<void> {
    try {
      const allStats = await this.getWeeklyStats();
      const existingIndex = allStats.findIndex(s => s.weekStart === stats.weekStart);
      
      if (existingIndex >= 0) {
        allStats[existingIndex] = stats;
      } else {
        allStats.push(stats);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_STATS, JSON.stringify(allStats));
    } catch (error) {
      console.error('Error saving weekly stats:', error);
    }
  }

  // Пользовательский профиль
  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  static async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      await this.setCurrentUserId(profile.id);
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  // Записи веса
  static async getWeightEntries(): Promise<WeightEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading weight entries:', error);
      return [];
    }
  }

  static async saveWeightEntry(entry: WeightEntry): Promise<void> {
    try {
      const entries = await this.getWeightEntries();
      entries.push(entry);
      await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving weight entry:', error);
    }
  }

  // Достижения
  static async getAchievements(): Promise<Achievement[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading achievements:', error);
      return [];
    }
  }

  static async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }
}