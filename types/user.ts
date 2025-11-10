export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'maintenance';
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'arms' | 'shoulders' | 'abs';

export interface UserGoals {
  primaryGoal: FitnessGoal;
  targetDescription: string;
  currentWeight?: number;
  targetWeight?: number;
  preferredDays: number[];
  preferredTime: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string; // URL изображения или emoji
  level: UserLevel;
  goals: UserGoals;
  currentProgram?: string;
  isOnboardingCompleted: boolean;
  createdAt: string;
  lastWeightUpdate?: string;
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
}

export type AchievementType = 
  | 'consistency_3_weeks'
  | 'consistency_month'
  | 'total_workouts_10'
  | 'total_workouts_50'
  | 'weight_goal_achieved'
  | 'strength_improvement'
  | 'perfect_week';