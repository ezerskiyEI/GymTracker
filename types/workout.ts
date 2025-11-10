export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio' | 'stretching';
export type WorkoutType = 'Силовая' | 'Кардио' | 'Функциональная' | 'Растяжка';

export interface Exercise {
  id: string;
  name: string;
  sets?: number;        // для силовых (подходы)
  reps?: number;        // для силовых (количество)
  weight?: number;      // для силовых (кг)
  duration?: number;    // для кардио и растяжки (минуты)
  notes?: string;
}

export interface Workout {
  id: string;
  date: string;
  type: WorkoutType;
  exercises: Exercise[];  // Тренировка = набор упражнений
  duration: number;       // общая длительность (минуты)
  feeling: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  completed: boolean;
  programId?: string;     // связь с программой (если есть)
  dayNumber?: number;     // день программы (если есть)
}

export interface WorkoutSchedule {
  id: string;
  dayOfWeek: number;
  time: string;
  programId?: string;
  enabled: boolean;
}

export interface WeeklyStats {
  weekStart: string;
  totalWorkouts: number;
  completedWorkouts: number;
  averageFeeling: number;
  totalDuration: number;
  improvementPercentage: number;
}