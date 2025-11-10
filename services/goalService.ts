import { FitnessGoal, UserGoals, Achievement, AchievementType } from '@/types/user';
import { Workout, WorkoutType } from '@/types/workout';

export class GoalService {
  static getWorkoutRecommendations(goal: FitnessGoal): {
    types: WorkoutType[];
    frequency: number;
    description: string;
  } {
    switch (goal) {
      case 'weight_loss':
        return {
          types: ['Кардио', 'Функциональная', 'Силовая'],
          frequency: 4,
          description: 'Кардио тренировки для сжигания калорий, функциональные упражнения для тонуса мышц'
        };
      
      case 'muscle_gain':
        return {
          types: ['Силовая', 'Функциональная'],
          frequency: 5,
          description: 'Силовые тренировки для набора мышечной массы с прогрессивной нагрузкой'
        };
      
      case 'endurance':
        return {
          types: ['Кардио', 'Функциональная'],
          frequency: 4,
          description: 'Кардио тренировки и функциональные упражнения для развития выносливости'
        };
      
      case 'maintenance':
      default:
        return {
          types: ['Силовая', 'Кардио', 'Растяжка'],
          frequency: 3,
          description: 'Сбалансированные тренировки для поддержания текущей формы'
        };
    }
  }

  static getRecoveryTips(goal: FitnessGoal): string[] {
    const baseTips = [
      'Спите 7-9 часов для восстановления мышц',
      'Пейте достаточно воды в течение дня',
      'Не забывайте про разминку и заминку'
    ];

    const specificTips: Record<FitnessGoal, string[]> = {
      weight_loss: [
        'Контролируйте калории, но не голодайте',
        'Ешьте белок после тренировки',
        'Избегайте поздних приемов пищи'
      ],
      muscle_gain: [
        'Увеличьте потребление белка до 2г на кг веса',
        'Ешьте через каждые 3-4 часа',
        'Отдыхайтесь между силовыми тренировками 48 часов'
      ],
      endurance: [
        'Восстанавливайтесь углеводами после кардио',
        'Постепенно увеличивайте интенсивность',
        'Делайте легкие тренировки между интенсивными'
      ],
      maintenance: [
        'Поддерживайте регулярность тренировок',
        'Слушайте свое тело и корректируйте нагрузку'
      ]
    };

    return [...baseTips, ...specificTips[goal]];
  }

  static calculateAchievements(
    workouts: Workout[], 
    profile: any,
    weightEntries: any[]
  ): Achievement[] {
    const achievements: Achievement[] = [];
    
    // Константы достижений
    const achievementTemplates: Record<AchievementType, Omit<Achievement, 'id' | 'progress' | 'unlockedAt'>> = {
      consistency_3_weeks: {
        title: 'Железная дисциплина',
        description: '3 недели подряд без пропусков',
        icon: 'local-fire-department',
        target: 21
      },
      consistency_month: {
        title: 'Месяц силы воли',
        description: 'Месяц регулярных тренировок',
        icon: 'emoji-events',
        target: 30
      },
      total_workouts_10: {
        title: 'Первые 10',
        description: '10 завершенных тренировок',
        icon: 'fitness-center',
        target: 10
      },
      total_workouts_50: {
        title: 'Полтинник',
        description: '50 завершенных тренировок',
        icon: 'military-tech',
        target: 50
      },
      weight_goal_achieved: {
        title: 'Цель достигнута!',
        description: 'Достигли желаемого веса',
        icon: 'flag',
        target: 1
      },
      strength_improvement: {
        title: 'Становлюсь сильнее',
        description: 'Увеличили рабочий вес на 25%',
        icon: 'trending-up',
        target: 25
      },
      perfect_week: {
        title: 'Идеальная неделя',
        description: 'Выполнили все запланированные тренировки',
        icon: 'star',
        target: 1
      }
    };

    const completedWorkouts = workouts.filter(w => w.completed);
    
    // Общее количество тренировок
    const totalWorkouts = completedWorkouts.length;
    
    // Серия дней
    const streakDays = this.calculateStreakDays(completedWorkouts);
    
    // Прогресс по весу
    const weightProgress = this.calculateWeightProgress(weightEntries, profile.goals);
    
    // Силовой прогресс
    const strengthProgress = this.calculateStrengthProgress(completedWorkouts);

    // Создание достижений
    Object.entries(achievementTemplates).forEach(([key, template]) => {
      const achievementType = key as AchievementType;
      let progress = 0;
      let isUnlocked = false;

      switch (achievementType) {
        case 'total_workouts_10':
        case 'total_workouts_50':
          progress = Math.min((totalWorkouts / template.target) * 100, 100);
          isUnlocked = totalWorkouts >= template.target;
          break;
          
        case 'consistency_3_weeks':
          progress = Math.min((streakDays / template.target) * 100, 100);
          isUnlocked = streakDays >= template.target;
          break;
          
        case 'consistency_month':
          progress = Math.min((streakDays / template.target) * 100, 100);
          isUnlocked = streakDays >= template.target;
          break;
          
        case 'weight_goal_achieved':
          progress = weightProgress;
          isUnlocked = weightProgress >= 100;
          break;
          
        case 'strength_improvement':
          progress = Math.min(strengthProgress, 100);
          isUnlocked = strengthProgress >= template.target;
          break;
          
        case 'perfect_week':
          progress = this.checkPerfectWeek(completedWorkouts) ? 100 : 0;
          isUnlocked = progress === 100;
          break;
      }

      achievements.push({
        id: achievementType,
        ...template,
        progress,
        unlockedAt: isUnlocked ? new Date().toISOString() : undefined
      });
    });

    return achievements.sort((a, b) => (b.progress - a.progress));
  }

  private static calculateStreakDays(workouts: Workout[]): number {
    if (workouts.length === 0) return 0;

    const sortedWorkouts = workouts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak || (diffDays === streak + 1)) {
        streak++;
        currentDate = new Date(workoutDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private static calculateWeightProgress(weightEntries: any[], goals: UserGoals): number {
    if (!goals.targetWeight || weightEntries.length === 0) return 0;
    
    const latestWeight = weightEntries[weightEntries.length - 1]?.weight || goals.currentWeight;
    const startWeight = goals.currentWeight;
    const targetWeight = goals.targetWeight;

    if (goals.primaryGoal === 'weight_loss') {
      const totalLoss = startWeight - targetWeight;
      const currentLoss = startWeight - latestWeight;
      return Math.min((currentLoss / totalLoss) * 100, 100);
    } else if (goals.primaryGoal === 'muscle_gain') {
      const totalGain = targetWeight - startWeight;
      const currentGain = latestWeight - startWeight;
      return Math.min((currentGain / totalGain) * 100, 100);
    }
    
    return 0;
  }

  private static calculateStrengthProgress(workouts: Workout[]): number {
    // Упрощенный расчет - можно усложнить
    const strengthWorkouts = workouts.filter(w => w.type === 'Силовая');
    if (strengthWorkouts.length < 2) return 0;

    const firstWorkout = strengthWorkouts[0];
    const lastWorkout = strengthWorkouts[strengthWorkouts.length - 1];

    const firstMaxWeight = Math.max(...firstWorkout.exercises.map(e => e.weight || 0));
    const lastMaxWeight = Math.max(...lastWorkout.exercises.map(e => e.weight || 0));

    if (firstMaxWeight === 0) return 0;
    
    return ((lastMaxWeight - firstMaxWeight) / firstMaxWeight) * 100;
  }

  private static checkPerfectWeek(workouts: Workout[]): boolean {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weekWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
    });

    // Простая проверка - выполнили ли хотя бы 3 тренировки на неделе
    return weekWorkouts.length >= 3;
  }
}