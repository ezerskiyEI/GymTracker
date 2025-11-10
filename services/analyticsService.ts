import { Workout, WeeklyStats } from '@/types/workout';

export class AnalyticsService {
  static calculateWeeklyStats(workouts: Workout[], weekStart: Date): WeeklyStats {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= weekStart && workoutDate <= weekEnd;
    });

    const completedWorkouts = weekWorkouts.filter(w => w.completed);
    const totalFeeling = completedWorkouts.reduce((sum, w) => sum + w.feeling, 0);
    const totalDuration = completedWorkouts.reduce((sum, w) => sum + w.duration, 0);

    // Предыдущая неделя для сравнения
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(prevWeekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() + 6);
    
    const prevWeekWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= prevWeekStart && workoutDate <= prevWeekEnd && workout.completed;
    });

    const improvementPercentage = prevWeekWorkouts.length > 0 
      ? ((completedWorkouts.length - prevWeekWorkouts.length) / prevWeekWorkouts.length) * 100
      : 0;

    return {
      weekStart: weekStart.toISOString(),
      totalWorkouts: weekWorkouts.length,
      completedWorkouts: completedWorkouts.length,
      averageFeeling: completedWorkouts.length > 0 ? totalFeeling / completedWorkouts.length : 0,
      totalDuration,
      improvementPercentage,
    };
  }

  static getProgressData(workouts: Workout[], exerciseName: string): Array<{date: string, value: number}> {
    return workouts
      .filter(workout => workout.completed)
      .map(workout => ({
        workout,
        exercise: workout.exercises.find(ex => ex.name === exerciseName)
      }))
      .filter(item => item.exercise)
      .map(item => ({
        date: item.workout.date,
        value: item.exercise?.weight || item.exercise?.reps || 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  static getWorkoutFrequency(workouts: Workout[], days: number = 30): Array<{date: string, count: number}> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const dayMap = new Map<string, number>();
    
    // Инициализация всех дней нулями
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dayMap.set(dateStr, 0);
    }

    // Подсчет тренировок по дням
    workouts
      .filter(workout => workout.completed)
      .forEach(workout => {
        const dateStr = new Date(workout.date).toISOString().split('T')[0];
        if (dayMap.has(dateStr)) {
          dayMap.set(dateStr, dayMap.get(dateStr)! + 1);
        }
      });

    return Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));
  }
}