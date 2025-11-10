import { WorkoutProgram, UserLevel, FitnessGoal, ProgramExercise } from '@/types/program';
import { ExerciseService } from './exerciseService';

// Helper function to create exercise with name from ExerciseService
const createExercise = (
  exerciseId: string,
  sets: number,
  options: {
    reps?: number;
    duration?: number;
    weight?: 'bodyweight' | 'light' | 'moderate' | 'heavy';
    rest?: number;
    notes?: string;
  } = {}
): ProgramExercise => {
  const exercise = ExerciseService.getExerciseById(exerciseId);
  const name = exercise?.name || exerciseId;
  
  return {
    exerciseId,
    name,
    muscleGroup: exercise?.muscleGroups[0] || 'chest',
    sets,
    ...options
  };
};

export class ProgramService {
  private static programs: WorkoutProgram[] = [
    // BEGINNER PROGRAMS
    {
      id: 'fullbody_beginner',
      name: 'Фулбоди 3×неделя',
      description: 'Тренировка всего тела для новичков. Изучение базовых движений с собственным весом и лёгкими отягощениями.',
      goal: 'maintenance',
      duration: 8,
      level: 'beginner',
      workoutsPerWeek: 3,
      days: [
        {
          dayNumber: 1,
          name: 'Полное тело А',
          muscleGroups: ['chest', 'legs', 'abs'],
          exercises: [
            createExercise('pushups', 3, { reps: 8, rest: 90 }),
            createExercise('squat', 3, { reps: 12, weight: 'bodyweight', rest: 90 }),
            createExercise('plank', 3, { duration: 30, rest: 60 }),
            createExercise('lunges', 2, { reps: 10, rest: 60 })
          ]
        },
        {
          dayNumber: 3,
          name: 'Полное тело Б',
          muscleGroups: ['back', 'legs', 'shoulders', 'abs'],
          exercises: [
            createExercise('pullups', 3, { reps: 5, rest: 120, notes: 'Используйте резинку если нужно' }),
            createExercise('leg_press', 3, { reps: 15, weight: 'light', rest: 90 }),
            createExercise('shoulder_press', 3, { reps: 10, weight: 'light', rest: 90 }),
            createExercise('crunches', 3, { reps: 15, rest: 45 })
          ]
        },
        {
          dayNumber: 5,
          name: 'Полное тело В',
          muscleGroups: ['chest', 'back', 'shoulders', 'abs'],
          exercises: [
            createExercise('dumbbell_press', 3, { reps: 10, weight: 'light', rest: 90 }),
            createExercise('deadlift', 3, { reps: 8, weight: 'light', rest: 120 }),
            createExercise('lateral_raises', 3, { reps: 12, weight: 'light', rest: 60 }),
            createExercise('mountain_climbers', 3, { duration: 20, rest: 60 })
          ]
        }
      ],
      benefits: [
        'Изучение правильной техники выполнения базовых упражнений',
        'Развитие базовой силы и выносливости',
        'Подготовка тела к более сложным программам',
        'Тренировка всех основных мышечных групп'
      ],
      tips: [
        'Сосредоточьтесь на правильной технике, а не на весе',
        'Отдыхайте между тренировками минимум день',
        'Обязательно делайте разминку 5-10 минут',
        'Завершайте тренировку растяжкой основных мышц'
      ]
    },

    {
      id: 'fitness_starter',
      name: 'Начальный фитнес-план',
      description: 'Мягкое введение в мир фитнеса с акцентом на кардио и функциональные движения.',
      goal: 'weight_loss',
      duration: 6,
      level: 'beginner',
      workoutsPerWeek: 3,
      days: [
        {
          dayNumber: 1,
          name: 'Кардио + базовые силовые',
          muscleGroups: ['legs', 'chest', 'abs'],
          exercises: [
            createExercise('jumping_jacks', 3, { duration: 30, rest: 30 }),
            createExercise('pushups', 2, { reps: 8, rest: 60 }),
            createExercise('lunges', 2, { reps: 10, rest: 60 }),
            createExercise('plank', 2, { duration: 20, rest: 45 })
          ]
        },
        {
          dayNumber: 3,
          name: 'Функциональная тренировка',
          muscleGroups: ['legs', 'abs', 'chest'],
          exercises: [
            createExercise('burpees', 3, { reps: 5, rest: 90 }),
            createExercise('mountain_climbers', 3, { duration: 20, rest: 60 }),
            createExercise('crunches', 3, { reps: 12, rest: 45 }),
            createExercise('step_ups', 2, { reps: 10, rest: 60 })
          ]
        },
        {
          dayNumber: 5,
          name: 'Кардио + растяжка',
          muscleGroups: ['legs', 'back'],
          exercises: [
            createExercise('running', 1, { duration: 15, rest: 0 }),
            createExercise('squat', 2, { reps: 15, weight: 'bodyweight', rest: 60 }),
            createExercise('back_stretch', 3, { duration: 30, rest: 30 }),
            createExercise('leg_stretch', 3, { duration: 30, rest: 30 })
          ]
        }
      ],
      benefits: [
        'Улучшение общей физической формы',
        'Развитие сердечно-сосудистой выносливости',
        'Изучение базовых функциональных движений',
        'Подготовка к более интенсивным тренировкам'
      ],
      tips: [
        'Слушайте своё тело и не перегружайтесь',
        'Не пропускайте разминку перед тренировкой',
        'Пейте достаточно воды во время тренировки',
        'Обязательно отдыхайте день между тренировками'
      ]
    },

    // INTERMEDIATE PROGRAMS
    {
      id: 'push_pull_legs',
      name: 'Push/Pull/Legs',
      description: 'Разделение тренировок по типу движений: толкающие, тянущие движения и ноги.',
      goal: 'muscle_gain',
      duration: 12,
      level: 'intermediate',
      workoutsPerWeek: 6,
      days: [
        {
          dayNumber: 1,
          name: 'Push (Толкающие)',
          muscleGroups: ['chest', 'shoulders', 'arms'],
          exercises: [
            createExercise('bench_press', 4, { reps: 8, weight: 'moderate', rest: 120 }),
            createExercise('shoulder_press', 4, { reps: 10, weight: 'moderate', rest: 90 }),
            createExercise('tricep_dips', 3, { reps: 12, rest: 90 }),
            createExercise('lateral_raises', 3, { reps: 15, weight: 'light', rest: 60 })
          ]
        },
        {
          dayNumber: 2,
          name: 'Pull (Тянущие)',
          muscleGroups: ['back', 'arms'],
          exercises: [
            createExercise('deadlift', 4, { reps: 6, weight: 'moderate', rest: 180 }),
            createExercise('pullups', 4, { reps: 8, rest: 120 }),
            createExercise('barbell_rows', 4, { reps: 10, weight: 'moderate', rest: 90 }),
            createExercise('bicep_curls', 3, { reps: 12, weight: 'moderate', rest: 60 })
          ]
        },
        {
          dayNumber: 3,
          name: 'Legs (Ноги)',
          muscleGroups: ['legs', 'abs'],
          exercises: [
            createExercise('squat', 4, { reps: 8, weight: 'moderate', rest: 120 }),
            createExercise('leg_press', 4, { reps: 12, weight: 'moderate', rest: 90 }),
            createExercise('lunges', 3, { reps: 12, rest: 90 }),
            createExercise('crunches', 3, { reps: 20, rest: 45 })
          ]
        }
      ],
      benefits: [
        'Отличное разделение нагрузки между мышечными группами',
        'Достаточное время на восстановление каждой группы мышц',
        'Подходит для набора мышечной массы',
        'Можно тренироваться 6 раз в неделю'
      ],
      tips: [
        'Можете повторять цикл 2 раза в неделю (6 тренировок)',
        'Отдыхайте день после полного цикла',
        'Фокусируйтесь на качестве выполнения упражнений',
        'Прогрессируйте в весах постепенно каждую неделю'
      ]
    },

    {
      id: 'upper_lower_split',
      name: 'Upper/Lower Split',
      description: 'Разделение на верх и низ тела. Идеальная программа для среднего уровня.',
      goal: 'muscle_gain',
      duration: 12,
      level: 'intermediate',
      workoutsPerWeek: 4,
      days: [
        {
          dayNumber: 1,
          name: 'Верх тела А',
          muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
          exercises: [
            createExercise('bench_press', 4, { reps: 8, weight: 'moderate', rest: 120 }),
            createExercise('barbell_rows', 4, { reps: 8, weight: 'moderate', rest: 120 }),
            createExercise('shoulder_press', 3, { reps: 10, weight: 'moderate', rest: 90 }),
            createExercise('pullups', 3, { reps: 8, rest: 90 }),
            createExercise('tricep_dips', 3, { reps: 12, rest: 60 }),
            createExercise('bicep_curls', 3, { reps: 12, weight: 'moderate', rest: 60 })
          ]
        },
        {
          dayNumber: 2,
          name: 'Низ тела А',
          muscleGroups: ['legs', 'abs'],
          exercises: [
            createExercise('squat', 4, { reps: 8, weight: 'moderate', rest: 150 }),
            createExercise('deadlift', 3, { reps: 6, weight: 'moderate', rest: 180 }),
            createExercise('leg_press', 3, { reps: 12, weight: 'moderate', rest: 90 }),
            createExercise('lunges', 3, { reps: 12, rest: 60 }),
            createExercise('plank', 3, { duration: 45, rest: 60 })
          ]
        },
        {
          dayNumber: 4,
          name: 'Верх тела Б',
          muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
          exercises: [
            createExercise('dumbbell_press', 4, { reps: 10, weight: 'moderate', rest: 90 }),
            createExercise('pullups', 4, { reps: 10, rest: 90 }),
            createExercise('lateral_raises', 4, { reps: 15, weight: 'light', rest: 60 }),
            createExercise('barbell_rows', 3, { reps: 10, weight: 'moderate', rest: 90 }),
            createExercise('tricep_dips', 3, { reps: 15, rest: 60 }),
            createExercise('bicep_curls', 3, { reps: 15, weight: 'light', rest: 60 })
          ]
        },
        {
          dayNumber: 5,
          name: 'Низ тела Б',
          muscleGroups: ['legs', 'abs'],
          exercises: [
            createExercise('leg_press', 4, { reps: 12, weight: 'moderate', rest: 120 }),
            createExercise('lunges', 4, { reps: 15, rest: 60 }),
            createExercise('squat', 3, { reps: 12, weight: 'light', rest: 90 }),
            createExercise('crunches', 4, { reps: 20, rest: 45 }),
            createExercise('mountain_climbers', 3, { duration: 30, rest: 60 })
          ]
        }
      ],
      benefits: [
        'Высокий объём тренировок для каждой группы мышц',
        'Отличное время на восстановление',
        'Подходит для набора мышечной массы и силы',
        'Разнообразие упражнений предотвращает скуку'
      ],
      tips: [
        'Обязательно отдыхайте день между тренировками',
        'Используйте принципы периодизации в весах',
        'Следите за техникой при работе с тяжёлыми весами',
        'Питание и сон критически важны для восстановления'
      ]
    },

    // ADVANCED PROGRAMS  
    {
      id: 'stronglifts_5x5',
      name: '5×5 StrongLifts',
      description: 'Классическая программа для развития максимальной силы. Основана на базовых упражнениях с линейной прогрессией.',
      goal: 'strength',
      duration: 16,
      level: 'advanced',
      workoutsPerWeek: 3,
      days: [
        {
          dayNumber: 1,
          name: 'Тренировка А',
          muscleGroups: ['legs', 'chest', 'back'],
          exercises: [
            createExercise('squat', 5, { reps: 5, weight: 'heavy', rest: 180 }),
            createExercise('bench_press', 5, { reps: 5, weight: 'heavy', rest: 180 }),
            createExercise('barbell_rows', 5, { reps: 5, weight: 'heavy', rest: 180 })
          ]
        },
        {
          dayNumber: 3,
          name: 'Тренировка Б',
          muscleGroups: ['legs', 'shoulders', 'back'],
          exercises: [
            createExercise('squat', 5, { reps: 5, weight: 'heavy', rest: 180 }),
            createExercise('shoulder_press', 5, { reps: 5, weight: 'heavy', rest: 180 }),
            createExercise('deadlift', 1, { reps: 5, weight: 'heavy', rest: 300 })
          ]
        },
        {
          dayNumber: 5,
          name: 'Тренировка А',
          muscleGroups: ['legs', 'chest', 'back'],
          exercises: [
            createExercise('squat', 5, { reps: 5, weight: 'heavy', rest: 180 }),
            createExercise('bench_press', 5, { reps: 5, weight: 'heavy', rest: 180 }),
            createExercise('barbell_rows', 5, { reps: 5, weight: 'heavy', rest: 180 })
          ]
        }
      ],
      benefits: [
        'Максимальный рост силовых показателей',
        'Простота и понятность программы',
        'Фокус на самых эффективных базовых упражнениях',
        'Проверенная десятилетиями эффективность'
      ],
      tips: [
        'Увеличивайте вес каждую тренировку на 2.5 кг для верха, 5 кг для низа',
        'Соблюдайте идеальную технику выполнения',
        'Отдыхайте между подходами 3-5 минут',
        'Если не можете выполнить 5х5, снизьте вес на 10% и начните снова'
      ]
    },

    // WEIGHT LOSS PROGRAMS
    {
      id: 'cardio_weight_loss',
      name: 'Кардио-план для похудения',
      description: 'Интенсивная кардио программа для максимального жиросжигания.',
      goal: 'weight_loss',
      duration: 8,
      level: 'intermediate',
      workoutsPerWeek: 5,
      days: [
        {
          dayNumber: 1,
          name: 'Интервальное кардио',
          muscleGroups: ['legs', 'chest'],
          exercises: [
            createExercise('running', 1, { duration: 30, rest: 0, notes: 'Чередуйте 2 мин бег, 1 мин ходьба' }),
            createExercise('jumping_jacks', 4, { duration: 30, rest: 30 }),
            createExercise('burpees', 3, { reps: 8, rest: 60 })
          ]
        },
        {
          dayNumber: 2,
          name: 'Силовые + кардио',
          muscleGroups: ['legs', 'chest', 'abs'],
          exercises: [
            createExercise('squat', 3, { reps: 15, weight: 'light', rest: 45 }),
            createExercise('pushups', 3, { reps: 12, rest: 45 }),
            createExercise('mountain_climbers', 3, { duration: 30, rest: 45 }),
            createExercise('plank', 3, { duration: 45, rest: 60 })
          ]
        },
        {
          dayNumber: 3,
          name: 'Длительное кардио',
          muscleGroups: ['legs', 'abs'],
          exercises: [
            createExercise('cycling', 1, { duration: 40, rest: 0 }),
            createExercise('crunches', 3, { reps: 20, rest: 30 }),
            createExercise('leg_stretch', 3, { duration: 30, rest: 30 })
          ]
        },
        {
          dayNumber: 5,
          name: 'HIIT тренировка',
          muscleGroups: ['legs', 'chest', 'abs'],
          exercises: [
            createExercise('burpees', 5, { reps: 6, rest: 30 }),
            createExercise('jumping_jacks', 5, { duration: 20, rest: 40 }),
            createExercise('mountain_climbers', 5, { duration: 20, rest: 40 }),
            createExercise('squat', 4, { reps: 20, weight: 'bodyweight', rest: 30 })
          ]
        },
        {
          dayNumber: 6,
          name: 'Активное восстановление',
          muscleGroups: ['legs', 'back'],
          exercises: [
            createExercise('elliptical', 1, { duration: 25, rest: 0 }),
            createExercise('back_stretch', 3, { duration: 30, rest: 30 }),
            createExercise('leg_stretch', 3, { duration: 30, rest: 30 })
          ]
        }
      ],
      benefits: [
        'Максимальное жиросжигание',
        'Улучшение сердечно-сосудистой системы',
        'Разнообразие кардио упражнений',
        'Сохранение мышечной массы'
      ],
      tips: [
        'Следите за питанием - это 70% успеха в похудении',
        'Контролируйте пульс во время кардио',
        'Пейте достаточно воды',
        'Не пропускайте дни отдыха'
      ]
    },

    {
      id: 'hiit_strength_combo',
      name: 'HIIT + силовые',
      description: 'Комбинация высокоинтенсивных интервалов с силовыми упражнениями.',
      goal: 'weight_loss',
      duration: 10,
      level: 'intermediate',
      workoutsPerWeek: 4,
      days: [
        {
          dayNumber: 1,
          name: 'HIIT + верх тела',
          muscleGroups: ['chest', 'back', 'abs'],
          exercises: [
            createExercise('burpees', 4, { reps: 8, rest: 45 }),
            createExercise('bench_press', 3, { reps: 12, weight: 'moderate', rest: 60 }),
            createExercise('mountain_climbers', 4, { duration: 30, rest: 30 }),
            createExercise('barbell_rows', 3, { reps: 12, weight: 'moderate', rest: 60 })
          ]
        },
        {
          dayNumber: 2,
          name: 'HIIT + низ тела',
          muscleGroups: ['legs'],
          exercises: [
            createExercise('jumping_jacks', 5, { duration: 30, rest: 30 }),
            createExercise('squat', 4, { reps: 15, weight: 'moderate', rest: 60 }),
            createExercise('burpees', 3, { reps: 6, rest: 60 }),
            createExercise('lunges', 3, { reps: 12, rest: 60 })
          ]
        },
        {
          dayNumber: 4,
          name: 'Силовая круговая',
          muscleGroups: ['chest', 'back', 'legs', 'abs'],
          exercises: [
            createExercise('pushups', 4, { reps: 12, rest: 30 }),
            createExercise('squat', 4, { reps: 15, weight: 'bodyweight', rest: 30 }),
            createExercise('pullups', 4, { reps: 6, rest: 30 }),
            createExercise('plank', 4, { duration: 30, rest: 30 })
          ]
        },
        {
          dayNumber: 6,
          name: 'Метаболическая',
          muscleGroups: ['legs', 'back', 'abs'],
          exercises: [
            createExercise('kettlebell_swings', 5, { reps: 15, rest: 45 }),
            createExercise('mountain_climbers', 4, { duration: 30, rest: 30 }),
            createExercise('burpees', 4, { reps: 8, rest: 60 }),
            createExercise('jumping_jacks', 4, { duration: 45, rest: 15 })
          ]
        }
      ],
      benefits: [
        'Эффективное жиросжигание',
        'Сохранение и рост мышечной массы',
        'Улучшение метаболизма на 24 часа после тренировки',
        'Экономия времени'
      ],
      tips: [
        'Поддерживайте высокую интенсивность в HIIT блоках',
        'Следите за техникой даже при усталости',
        'Достаточно отдыхайте между тренировками',
        'Пейте много воды'
      ]
    },

    // ENDURANCE PROGRAMS
    {
      id: 'crossfit_basic',
      name: 'Кроссфит-базовый',
      description: 'Введение в кроссфит с акцентом на функциональные движения и общую физическую подготовку.',
      goal: 'endurance',
      duration: 12,
      level: 'intermediate',
      workoutsPerWeek: 4,
      days: [
        {
          dayNumber: 1,
          name: 'Силовая выносливость',
          muscleGroups: ['legs', 'chest', 'back'],
          exercises: [
            createExercise('squat', 5, { reps: 20, weight: 'bodyweight', rest: 60 }),
            createExercise('pushups', 5, { reps: 15, rest: 60 }),
            createExercise('pullups', 5, { reps: 8, rest: 90 }),
            createExercise('burpees', 3, { reps: 10, rest: 120 })
          ]
        },
        {
          dayNumber: 2,
          name: 'Метаболическая',
          muscleGroups: ['legs', 'back', 'abs'],
          exercises: [
            createExercise('kettlebell_swings', 4, { reps: 20, rest: 45 }),
            createExercise('mountain_climbers', 4, { duration: 30, rest: 30 }),
            createExercise('jumping_jacks', 4, { duration: 45, rest: 15 }),
            createExercise('rowing', 4, { duration: 60, rest: 60 })
          ]
        },
        {
          dayNumber: 4,
          name: 'Функциональная',
          muscleGroups: ['legs', 'back', 'shoulders', 'abs'],
          exercises: [
            createExercise('deadlift', 4, { reps: 12, weight: 'moderate', rest: 90 }),
            createExercise('step_ups', 4, { reps: 16, rest: 60 }),
            createExercise('shoulder_press', 4, { reps: 10, weight: 'moderate', rest: 90 }),
            createExercise('plank', 3, { duration: 60, rest: 60 })
          ]
        },
        {
          dayNumber: 6,
          name: 'Смешанная',
          muscleGroups: ['legs', 'chest', 'abs'],
          exercises: [
            createExercise('burpees', 3, { reps: 12, rest: 60 }),
            createExercise('squat', 3, { reps: 25, weight: 'bodyweight', rest: 45 }),
            createExercise('pushups', 3, { reps: 20, rest: 45 }),
            createExercise('running', 1, { duration: 10, rest: 0 })
          ]
        }
      ],
      benefits: [
        'Развитие общей физической подготовки',
        'Функциональная сила для повседневной жизни',
        'Разнообразие движений и упражнений',
        'Высокая интенсивность тренировок'
      ],
      tips: [
        'Масштабируйте упражнения под свой уровень',
        'Техника важнее скорости выполнения',
        'Отдыхайте достаточно между тренировками',
        'Следите за восстановлением и питанием'
      ]
    }
  ];

  static getAllPrograms(): WorkoutProgram[] {
    return this.programs;
  }

  static getProgramsByGoal(goal: FitnessGoal): WorkoutProgram[] {
    return this.programs.filter(program => program.goal === goal);
  }

  static getProgramsByLevel(level: UserLevel): WorkoutProgram[] {
    return this.programs.filter(program => program.level === level);
  }

  static getRecommendedPrograms(goal: FitnessGoal, level: UserLevel): WorkoutProgram[] {
    return this.programs.filter(program => 
      program.goal === goal && program.level === level
    );
  }

  static getProgramById(id: string): WorkoutProgram | undefined {
    return this.programs.find(program => program.id === id);
  }

  static getProgramsByCategory(): Record<FitnessGoal, WorkoutProgram[]> {
    const categories: Record<FitnessGoal, WorkoutProgram[]> = {
      strength: [],
      muscle_gain: [],
      weight_loss: [],
      endurance: [],
      maintenance: []
    };

    this.programs.forEach(program => {
      if (categories[program.goal]) {
        categories[program.goal].push(program);
      }
    });

    return categories;
  }
}
