import { Workout } from '@/types/workout';
import { WeightEntry } from '@/types/user';

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export class ChartService {
  static prepareWeightChart(weights: WeightEntry[]): ChartDataPoint[] {
    return weights
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(entry => ({
        date: entry.date,
        value: entry.weight,
        label: `${entry.weight} кг`
      }));
  }

  static prepareFeelingChart(workouts: Workout[], days: number = 30): ChartDataPoint[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const completedWorkouts = workouts
      .filter(w => w.completed && new Date(w.date) >= startDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Группировка по дням и усреднение самочувствия
    const dailyFeelings = new Map<string, number[]>();

    completedWorkouts.forEach(workout => {
      const dateKey = new Date(workout.date).toISOString().split('T')[0];
      if (!dailyFeelings.has(dateKey)) {
        dailyFeelings.set(dateKey, []);
      }
      dailyFeelings.get(dateKey)!.push(workout.feeling);
    });

    return Array.from(dailyFeelings.entries()).map(([date, feelings]) => {
      const avgFeeling = feelings.reduce((sum, f) => sum + f, 0) / feelings.length;
      return {
        date,
        value: avgFeeling,
        label: avgFeeling.toFixed(1)
      };
    });
  }

  static prepareVolumeChart(workouts: Workout[], days: number = 30): ChartDataPoint[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const completedWorkouts = workouts
      .filter(w => w.completed && new Date(w.date) >= startDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Группировка по неделям
    const weeklyVolume = new Map<string, number>();

    completedWorkouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      const weekStart = new Date(workoutDate);
      weekStart.setDate(workoutDate.getDate() - workoutDate.getDay() + 1);
      const weekKey = weekStart.toISOString().split('T')[0];

      // Расчет объема тренировки (вес * повторения * подходы)
      const workoutVolume = workout.exercises.reduce((total, exercise) => {
        const weight = exercise.weight || 0;
        const reps = exercise.reps || 0;
        const sets = exercise.sets || 1;
        return total + (weight * reps * sets);
      }, 0);

      weeklyVolume.set(weekKey, (weeklyVolume.get(weekKey) || 0) + workoutVolume);
    });

    return Array.from(weeklyVolume.entries()).map(([date, volume]) => ({
      date,
      value: Math.round(volume),
      label: `${Math.round(volume / 1000)}k кг`
    }));
  }

  static prepareWorkoutFrequency(workouts: Workout[], days: number = 30): ChartDataPoint[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Создание карты всех дней
    const dailyWorkouts = new Map<string, number>();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      dailyWorkouts.set(dateKey, 0);
    }

    // Подсчет тренировок по дням
    workouts
      .filter(w => w.completed && new Date(w.date) >= startDate && new Date(w.date) <= endDate)
      .forEach(workout => {
        const dateKey = new Date(workout.date).toISOString().split('T')[0];
        dailyWorkouts.set(dateKey, (dailyWorkouts.get(dateKey) || 0) + 1);
      });

    return Array.from(dailyWorkouts.entries()).map(([date, count]) => ({
      date,
      value: count,
      label: count > 0 ? `${count}` : '0'
    }));
  }

  static prepareStrengthProgress(workouts: Workout[], exerciseName: string): ChartDataPoint[] {
    return workouts
      .filter(w => w.completed && w.type === 'Силовая')
      .map(workout => {
        const exercise = workout.exercises.find(e => 
          e.name.toLowerCase().includes(exerciseName.toLowerCase())
        );
        
        if (!exercise) return null;
        
        return {
          date: workout.date,
          value: exercise.weight || 0,
          label: `${exercise.weight || 0} кг`
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime()) as ChartDataPoint[];
  }
}