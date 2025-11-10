import { MuscleGroup } from './workout';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';
export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'maintenance';

export interface ProgramExercise {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps?: number;
  duration?: number;
  weight?: 'bodyweight' | 'light' | 'moderate' | 'heavy';
  rest?: number;
  notes?: string;
}

export interface ProgramDay {
  dayNumber: number;
  name: string;
  muscleGroups: MuscleGroup[];
  exercises: ProgramExercise[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  goal: FitnessGoal;
  duration: number;
  level: UserLevel;
  workoutsPerWeek: number;
  days: ProgramDay[];
  benefits: string[];
  tips: string[];
}

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'functional' | 'flexibility';
  muscleGroups: MuscleGroup[];
  description: string;
  instructions: string[];
  tips: string[];
  equipment?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface MotivationalQuote {
  id: string;
  text: string;
  author: string;
  category: 'strength' | 'motivation' | 'discipline' | 'success';
}