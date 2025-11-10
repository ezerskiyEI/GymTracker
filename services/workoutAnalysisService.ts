import { Workout } from '@/types/workout';

interface ExerciseStats {
  exerciseId: string;
  name: string;
  averageWeight: number;
  maxWeight: number;
  lastWeight: number;
  averageReps: number;
  averageSets: number;
  totalSessions: number;
}

export class WorkoutAnalysisService {
  static getExerciseStats(workouts: Workout[], exerciseId: string): ExerciseStats | null {
    const relevantWorkouts = workouts.filter(workout => 
      workout.completed && workout.exercises.some(ex => ex.id === exerciseId)
    );

    if (relevantWorkouts.length === 0) return null;

    let totalWeight = 0;
    let totalReps = 0;
    let totalSets = 0;
    let maxWeight = 0;
    let lastWeight = 0;
    let count = 0;
    let exerciseName = '';

    relevantWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.id === exerciseId && exercise.weight) {
          exerciseName = exercise.name;
          totalWeight += exercise.weight;
          totalReps += exercise.reps || 0;
          totalSets += exercise.sets || 0;
          maxWeight = Math.max(maxWeight, exercise.weight);
          count++;
        }
      });
    });

    // Получаем вес из последней тренировки
    const sortedWorkouts = relevantWorkouts.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (const workout of sortedWorkouts) {
      const exercise = workout.exercises.find(ex => ex.id === exerciseId && ex.weight);
      if (exercise && exercise.weight) {
        lastWeight = exercise.weight;
        break;
      }
    }

    return {
      exerciseId,
      name: exerciseName,
      averageWeight: count > 0 ? Math.round(totalWeight / count) : 0,
      maxWeight,
      lastWeight,
      averageReps: count > 0 ? Math.round(totalReps / count) : 0,
      averageSets: count > 0 ? Math.round(totalSets / count) : 0,
      totalSessions: relevantWorkouts.length
    };
  }

  static getRecommendedWeight(
    workouts: Workout[], 
    exerciseId: string, 
    userLevel: 'beginner' | 'intermediate' | 'advanced'
  ): {
    recommended: number;
    range: { min: number; max: number };
    reason: string;
  } {
    const stats = this.getExerciseStats(workouts, exerciseId);

    // Если есть история тренировок - прогрессия
    if (stats && stats.lastWeight > 0) {
      const progressionFactor = userLevel === 'beginner' ? 1.05 : 
                               userLevel === 'intermediate' ? 1.08 : 1.10;
      
      const recommended = Math.round(stats.lastWeight * progressionFactor);
      const range = {
        min: Math.max(1, Math.round(stats.lastWeight * 0.9)),
        max: Math.round(stats.lastWeight * 1.15)
      };

      return {
        recommended,
        range,
        reason: `На основе прошлого результата (${stats.lastWeight} кг) рекомендуем прогрессию +${Math.round((progressionFactor - 1) * 100)}%`
      };
    }

    // Если нет истории - базовые рекомендации по уровню
    const baseWeights = {
      beginner: { recommended: 10, range: { min: 5, max: 15 } },
      intermediate: { recommended: 20, range: { min: 15, max: 30 } },
      advanced: { recommended: 30, range: { min: 25, max: 50 } }
    };

    return {
      ...baseWeights[userLevel],
      reason: 'Рекомендуемый вес для вашего уровня (начните с малого и увеличивайте постепенно)'
    };
  }

  static validateExerciseInput(
    weight?: number,
    reps?: number,
    sets?: number
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Валидация веса
    if (weight !== undefined) {
      if (weight < 1 || weight > 200) {
        errors.push('Вес должен быть от 1 до 200 кг');
      }
    }

    // Валидация повторений
    if (reps !== undefined) {
      if (!Number.isInteger(reps) || reps < 1 || reps > 50) {
        errors.push('Повторения должны быть от 1 до 50');
      }
    }

    // Валидация сетов
    if (sets !== undefined) {
      if (!Number.isInteger(sets) || sets < 1 || sets > 10) {
        errors.push('Сеты должны быть от 1 до 10');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static getWeightCategory(weight: number): {
    category: 'light' | 'moderate' | 'heavy' | 'maximum';
    label: string;
    range: string;
  } {
    if (weight <= 10) {
      return { category: 'light', label: 'Лёгкий', range: '2–10 кг' };
    } else if (weight <= 20) {
      return { category: 'moderate', label: 'Средний', range: '12–20 кг' };
    } else if (weight <= 35) {
      return { category: 'heavy', label: 'Тяжёлый', range: '22–35 кг' };
    } else {
      return { category: 'maximum', label: 'Максимальный', range: '36+ кг' };
    }
  }
}
