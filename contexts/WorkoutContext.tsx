import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { Workout, WorkoutSchedule, WeeklyStats } from '@/types/workout';
import { StorageService } from '@/services/storageService';
import { AnalyticsService } from '@/services/analyticsService';

interface WorkoutContextType {
  // Тренировки
  workouts: Workout[];
  addWorkout: (workout: Workout) => Promise<void>;
  updateWorkout: (workout: Workout) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  
  // Расписание
  schedules: WorkoutSchedule[];
  addSchedule: (schedule: WorkoutSchedule) => Promise<void>;
  updateSchedule: (schedule: WorkoutSchedule) => Promise<void>;
  
  // Статистика
  weeklyStats: WeeklyStats[];
  refreshStats: () => Promise<void>;
  
  // Состояние загрузки
  loading: boolean;
}

export const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [workoutsData, schedulesData, statsData] = await Promise.all([
        StorageService.getWorkouts(),
        StorageService.getSchedules(),
        StorageService.getWeeklyStats(),
      ]);
      
      setWorkouts(workoutsData);
      setSchedules(schedulesData);
      setWeeklyStats(statsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWorkout = async (workout: Workout) => {
    try {
      await StorageService.saveWorkout(workout);
      setWorkouts(prev => [...prev, workout]);
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  const updateWorkout = async (workout: Workout) => {
    try {
      await StorageService.saveWorkout(workout);
      setWorkouts(prev => prev.map(w => w.id === workout.id ? workout : w));
    } catch (error) {
      console.error('Error updating workout:', error);
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    try {
      await StorageService.deleteWorkout(workoutId);
      setWorkouts(prev => prev.filter(w => w.id !== workoutId));
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const addSchedule = async (schedule: WorkoutSchedule) => {
    try {
      await StorageService.saveSchedule(schedule);
      setSchedules(prev => [...prev, schedule]);
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  const updateSchedule = async (schedule: WorkoutSchedule) => {
    try {
      await StorageService.saveSchedule(schedule);
      setSchedules(prev => prev.map(s => s.id === schedule.id ? schedule : s));
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const refreshStats = async () => {
    try {
      // Расчет статистики за последние недели
      const now = new Date();
      const weeksToCalculate = 8; // Последние 8 недель
      
      for (let i = 0; i < weeksToCalculate; i++) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (now.getDay() + 7 * i)); // Понедельник недели
        weekStart.setHours(0, 0, 0, 0);
        
        const stats = AnalyticsService.calculateWeeklyStats(workouts, weekStart);
        await StorageService.saveWeeklyStats(stats);
      }
      
      const updatedStats = await StorageService.getWeeklyStats();
      setWeeklyStats(updatedStats);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  const value: WorkoutContextType = {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    schedules,
    addSchedule,
    updateSchedule,
    weeklyStats,
    refreshStats,
    loading,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}