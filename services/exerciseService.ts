import { Exercise, MuscleGroup, UserLevel } from '@/types/program';

export class ExerciseService {
  private static exercises: Exercise[] = [
    // STRENGTH - CHEST
    {
      id: 'bench_press',
      name: 'Жим штанги лёжа',
      category: 'strength',
      muscleGroups: ['chest', 'shoulders', 'arms'],
      description: 'Базовое упражнение для развития мышц груди, плеч и трицепсов. Король упражнений для верха тела.',
      instructions: [
        'Лягте на скамью, штанга над грудью',
        'Сведите лопатки, ноги плотно на полу',
        'Опустите штангу до касания груди',
        'Выжмите штангу вверх до полного выпрямления рук'
      ],
      tips: [
        'Держите лопатки сведёнными на протяжении всего движения',
        'Не отрывайте поясницу от скамьи',
        'Контролируйте движение вниз (2-3 секунды)',
        'Дышите на усилии (выдох при подъёме)'
      ],
      equipment: ['Штанга', 'Скамья'],
      difficulty: 'intermediate'
    },
    {
      id: 'pushups',
      name: 'Отжимания',
      category: 'strength',
      muscleGroups: ['chest', 'arms', 'shoulders'],
      description: 'Классическое упражнение с собственным весом для груди и трицепсов. Доступно везде.',
      instructions: [
        'Примите упор лёжа, руки на ширине плеч',
        'Тело должно быть прямой линией от головы до пят',
        'Опустите тело до касания грудью пола',
        'Поднимитесь в исходное положение'
      ],
      tips: [
        'Напрягайте пресс и ягодицы',
        'Не прогибайте поясницу',
        'Контролируйте движение',
        'Начинайте с колен, если тяжело'
      ],
      equipment: [],
      difficulty: 'beginner'
    },
    {
      id: 'dumbbell_press',
      name: 'Жим гантелей лёжа',
      category: 'strength',
      muscleGroups: ['chest', 'shoulders', 'arms'],
      description: 'Жим гантелей для лучшей проработки груди с большей амплитудой движения',
      instructions: [
        'Лягте на скамью с гантелями в руках',
        'Гантели над грудью на вытянутых руках',
        'Опустите гантели к груди, разводя локти',
        'Выжмите обратно вверх'
      ],
      tips: [
        'Больший диапазон движения чем со штангой',
        'Сводите гантели в верхней точке',
        'Контролируйте вес на опускании'
      ],
      equipment: ['Гантели', 'Скамья'],
      difficulty: 'intermediate'
    },

    // STRENGTH - BACK
    {
      id: 'deadlift',
      name: 'Становая тяга',
      category: 'strength',
      muscleGroups: ['back', 'legs'],
      description: 'Король всех упражнений. Развивает всё тело, особенно спину и ноги.',
      instructions: [
        'Встаньте к штанге, ноги на ширине плеч',
        'Наклонитесь, возьмите штангу хватом сверху',
        'Поднимите штангу, выпрямляя спину и ноги одновременно',
        'В верхней точке полностью выпрямитесь'
      ],
      tips: [
        'Держите штангу близко к телу',
        'Спина всегда прямая!',
        'Начинайте движение с ног',
        'Не округляйте спину ни в коем случае'
      ],
      equipment: ['Штанга'],
      difficulty: 'advanced'
    },
    {
      id: 'pullups',
      name: 'Подтягивания',
      category: 'strength',
      muscleGroups: ['back', 'arms'],
      description: 'Лучшее упражнение для спины с собственным весом',
      instructions: [
        'Повисните на турнике широким хватом',
        'Подтянитесь до касания перекладины грудью',
        'Медленно опуститесь в исходное положение'
      ],
      tips: [
        'Не раскачивайтесь',
        'Полностью выпрямляйте руки внизу',
        'Используйте резинку для помощи если нужно'
      ],
      equipment: ['Турник'],
      difficulty: 'intermediate'
    },
    {
      id: 'barbell_rows',
      name: 'Тяга штанги в наклоне',
      category: 'strength',
      muscleGroups: ['back', 'arms'],
      description: 'Тяга штанги для развития широчайших и ромбовидных мышц',
      instructions: [
        'Наклонитесь вперёд под углом 45°, штанга в руках',
        'Тяните штангу к нижней части груди',
        'Сводите лопатки в верхней точке'
      ],
      tips: [
        'Держите спину прямой',
        'Тяните локтями, не руками',
        'Контролируйте негативную фазу'
      ],
      equipment: ['Штанга'],
      difficulty: 'intermediate'
    },

    // STRENGTH - LEGS
    {
      id: 'squat',
      name: 'Приседания со штангой',
      category: 'strength',
      muscleGroups: ['legs'],
      description: 'Король упражнений для развития ног и ягодиц. Основа силовых тренировок.',
      instructions: [
        'Поставьте штангу на плечи (трапеции)',
        'Ноги на ширине плеч, носки слегка развёрнуты',
        'Приседайте до параллели бёдер с полом',
        'Встаньте, отталкиваясь пятками'
      ],
      tips: [
        'Держите спину прямой',
        'Колени не должны заходить за носки',
        'Смотрите прямо перед собой',
        'Опускайтесь медленно, поднимайтесь быстро'
      ],
      equipment: ['Штанга', 'Стойка'],
      difficulty: 'intermediate'
    },
    {
      id: 'lunges',
      name: 'Выпады',
      category: 'strength',
      muscleGroups: ['legs'],
      description: 'Выпады для проработки ног и ягодиц, улучшения баланса',
      instructions: [
        'Шагните вперёд одной ногой',
        'Опуститесь до угла 90 градусов в обеих ногах',
        'Вернитесь в исходное положение',
        'Повторите другой ногой'
      ],
      tips: [
        'Держите корпус прямо',
        'Не касайтесь коленом пола',
        'Вес на передней ноге'
      ],
      equipment: [],
      difficulty: 'beginner'
    },
    {
      id: 'leg_press',
      name: 'Жим ногами',
      category: 'strength',
      muscleGroups: ['legs'],
      description: 'Жим ногами в тренажёре для безопасной проработки квадрицепсов',
      instructions: [
        'Лягте в тренажёр для жима ногами',
        'Поставьте ноги на платформу на ширине плеч',
        'Опустите платформу до угла 90 градусов в коленях',
        'Выжмите платформу вверх'
      ],
      tips: [
        'Не блокируйте колени полностью в верхней точке',
        'Контролируйте движение',
        'Дышите правильно'
      ],
      equipment: ['Тренажёр жим ногами'],
      difficulty: 'beginner'
    },

    // STRENGTH - ARMS
    {
      id: 'bicep_curls',
      name: 'Подъёмы на бицепс',
      category: 'strength',
      muscleGroups: ['arms'],
      description: 'Изолированное упражнение для развития бицепсов',
      instructions: [
        'Встаньте прямо с гантелями в руках',
        'Согните руки в локтях, поднимая гантели к плечам',
        'Медленно опустите в исходное положение'
      ],
      tips: [
        'Не раскачивайтесь корпусом',
        'Контролируйте негативную фазу',
        'Не используйте слишком большой вес'
      ],
      equipment: ['Гантели'],
      difficulty: 'beginner'
    },
    {
      id: 'tricep_dips',
      name: 'Отжимания на брусьях',
      category: 'strength',
      muscleGroups: ['arms', 'chest'],
      description: 'Отжимания на брусьях для развития трицепсов и груди',
      instructions: [
        'Возьмитесь за брусья и поднимитесь на прямых руках',
        'Медленно опуститесь до угла 90 градусов в локтях',
        'Поднимитесь в исходное положение'
      ],
      tips: [
        'Не опускайтесь слишком низко',
        'Держите корпус слегка наклонённым вперёд',
        'Используйте помощь ног если нужно'
      ],
      equipment: ['Брусья'],
      difficulty: 'intermediate'
    },

    // STRENGTH - SHOULDERS
    {
      id: 'shoulder_press',
      name: 'Армейский жим',
      category: 'strength',
      muscleGroups: ['shoulders', 'arms'],
      description: 'Жим штанги или гантелей над головой для развития плеч',
      instructions: [
        'Встаньте прямо со штангой на груди',
        'Выжмите штангу строго вверх над головой',
        'Медленно опустите в исходное положение'
      ],
      tips: [
        'Держите корпус напряжённым',
        'Не прогибайтесь в пояснице',
        'Гриф должен проходить над головой'
      ],
      equipment: ['Штанга'],
      difficulty: 'intermediate'
    },
    {
      id: 'lateral_raises',
      name: 'Подъёмы в стороны',
      category: 'strength',
      muscleGroups: ['shoulders'],
      description: 'Изолированное упражнение для средних дельтовидных мышц',
      instructions: [
        'Встаньте с гантелями в руках по бокам',
        'Поднимите руки в стороны до уровня плеч',
        'Медленно опустите'
      ],
      tips: [
        'Не поднимайте выше плеч',
        'Контролируйте негативную фазу',
        'Используйте умеренный вес'
      ],
      equipment: ['Гантели'],
      difficulty: 'beginner'
    },

    // STRENGTH - ABS
    {
      id: 'plank',
      name: 'Планка',
      category: 'strength',
      muscleGroups: ['abs'],
      description: 'Статическое упражнение для укрепления всех мышц кора',
      instructions: [
        'Примите упор лёжа на предплечьях',
        'Держите тело прямой линией от головы до пят',
        'Удерживайте позицию заданное время'
      ],
      tips: [
        'Не прогибайте поясницу',
        'Напрягайте пресс и ягодицы',
        'Дышите равномерно',
        'Начинайте с 30 секунд'
      ],
      equipment: [],
      difficulty: 'beginner'
    },
    {
      id: 'crunches',
      name: 'Скручивания',
      category: 'strength',
      muscleGroups: ['abs'],
      description: 'Классическое упражнение для прямой мышцы живота',
      instructions: [
        'Лягте на спину, колени согнуты под 90°',
        'Руки за головой или скрещены на груди',
        'Поднимите плечи от пола, скручивая корпус',
        'Медленно вернитесь в исходное положение'
      ],
      tips: [
        'Не тяните себя за шею руками',
        'Поднимайте только плечи, не всю спину',
        'Напрягайте пресс на подъёме'
      ],
      equipment: [],
      difficulty: 'beginner'
    },
    {
      id: 'hyperextensions',
      name: 'Гиперэкстензии',
      category: 'strength',
      muscleGroups: ['back'],
      description: 'Укрепление мышц поясницы и задней поверхности бедра',
      instructions: [
        'Лягте на тренажёр для гиперэкстензий',
        'Скрестите руки на груди',
        'Медленно опуститесь вниз',
        'Поднимитесь до прямой линии тела'
      ],
      tips: [
        'Не поднимайтесь слишком высоко',
        'Контролируйте движение',
        'Напрягайте ягодицы в верхней точке'
      ],
      equipment: ['Тренажёр для гиперэкстензий'],
      difficulty: 'beginner'
    },

    // CARDIO
    {
      id: 'running',
      name: 'Бег',
      category: 'cardio',
      muscleGroups: ['legs'],
      description: 'Классическое кардио для развития выносливости и жиросжигания',
      instructions: [
        'Начните с лёгкой разминки ходьбой 5 минут',
        'Постепенно увеличивайте темп до комфортного бега',
        'Поддерживайте ровное дыхание',
        'Завершите заминкой и растяжкой'
      ],
      tips: [
        'Начинайте постепенно, увеличивая время каждую неделю',
        'Следите за пульсом (60-70% от максимального)',
        'Пейте воду по потребности',
        'Выберите качественную беговую обувь'
      ],
      equipment: ['Беговая дорожка'],
      difficulty: 'beginner'
    },
    {
      id: 'cycling',
      name: 'Велотренажёр',
      category: 'cardio',
      muscleGroups: ['legs'],
      description: 'Низкоударное кардио, щадящее для суставов',
      instructions: [
        'Настройте высоту сиденья по своему росту',
        'Начните с лёгкого сопротивления',
        'Поддерживайте ровный темп педалирования',
        'Контролируйте дыхание'
      ],
      tips: [
        'Не перенапрягайтесь в первые тренировки',
        'Меняйте интенсивность каждые 5-10 минут',
        'Следите за осанкой'
      ],
      equipment: ['Велотренажёр'],
      difficulty: 'beginner'
    },
    {
      id: 'elliptical',
      name: 'Эллипс',
      category: 'cardio',
      muscleGroups: ['legs', 'arms'],
      description: 'Кардио тренажёр, задействующий всё тело',
      instructions: [
        'Встаньте на педали, возьмитесь за ручки',
        'Начните движение в естественном ритме',
        'Используйте руки для дополнительной нагрузки',
        'Поддерживайте равномерный темп'
      ],
      tips: [
        'Держите спину прямо',
        'Не наклоняйтесь на ручки',
        'Варьируйте интенсивность'
      ],
      equipment: ['Эллиптический тренажёр'],
      difficulty: 'beginner'
    },
    {
      id: 'rowing',
      name: 'Гребля',
      category: 'cardio',
      muscleGroups: ['back', 'legs', 'arms'],
      description: 'Кардио с акцентом на спину и руки',
      instructions: [
        'Сядьте на тренажёр, возьмитесь за рукоятку',
        'Начните с ног, затем спина, затем руки',
        'В обратном порядке: руки, спина, ноги',
        'Поддерживайте ритм'
      ],
      tips: [
        'Большая часть силы должна идти от ног',
        'Держите спину прямо',
        'Контролируйте фазу возврата'
      ],
      equipment: ['Гребной тренажёр'],
      difficulty: 'intermediate'
    },
    {
      id: 'jumping_jacks',
      name: 'Прыжки "Звёздочка"',
      category: 'cardio',
      muscleGroups: ['legs'],
      description: 'Динамичное кардио упражнение без оборудования',
      instructions: [
        'Встаньте прямо, руки по бокам',
        'Прыгните, разводя ноги и поднимая руки над головой',
        'Прыгните обратно в исходное положение',
        'Повторяйте в быстром темпе'
      ],
      tips: [
        'Приземляйтесь мягко на носки',
        'Держите постоянный ритм',
        'Дышите активно'
      ],
      equipment: [],
      difficulty: 'beginner'
    },

    // FUNCTIONAL
    {
      id: 'burpees',
      name: 'Бёрпи',
      category: 'functional',
      muscleGroups: ['legs', 'arms', 'abs'],
      description: 'Комплексное функциональное упражнение для всего тела',
      instructions: [
        'Присядьте, поставьте руки на пол',
        'Прыжком отведите ноги назад в планку',
        'Сделайте отжимание (опционально)',
        'Прыжком подтяните ноги к груди',
        'Выпрыгните вверх с руками над головой'
      ],
      tips: [
        'Начинайте медленно, отрабатывая технику',
        'Следите за дыханием',
        'Можно исключить отжимание или прыжок'
      ],
      equipment: [],
      difficulty: 'intermediate'
    },
    {
      id: 'mountain_climbers',
      name: 'Альпинист',
      category: 'functional',
      muscleGroups: ['abs', 'legs', 'arms'],
      description: 'Динамичное упражнение для кора и кардио',
      instructions: [
        'Примите позицию планки на прямых руках',
        'Поочерёдно подтягивайте колени к груди',
        'Держите быстрый темп',
        'Имитируйте бег в планке'
      ],
      tips: [
        'Держите планку на протяжении всего упражнения',
        'Не поднимайте таз вверх',
        'Дышите активно'
      ],
      equipment: [],
      difficulty: 'intermediate'
    },
    {
      id: 'kettlebell_swings',
      name: 'Махи гирей',
      category: 'functional',
      muscleGroups: ['legs', 'back', 'shoulders'],
      description: 'Взрывное движение для развития силы и выносливости',
      instructions: [
        'Встаньте с гирей в руках между ног',
        'Согните бёдра, отведите гирю назад',
        'Взрывным движением вытолкните бёдра вперёд',
        'Гиря поднимается до уровня плеч'
      ],
      tips: [
        'Движение идёт от бёдер, не от рук',
        'Держите спину прямой',
        'Напрягайте ягодицы в верхней точке'
      ],
      equipment: ['Гиря'],
      difficulty: 'intermediate'
    },
    {
      id: 'step_ups',
      name: 'Степ-апы',
      category: 'functional',
      muscleGroups: ['legs'],
      description: 'Функциональное упражнение для ног с использованием возвышения',
      instructions: [
        'Встаньте перед скамьей или степ-платформой',
        'Поставьте одну ногу на возвышение',
        'Оттолкнитесь и поднимитесь вверх',
        'Медленно опуститесь обратно'
      ],
      tips: [
        'Не помогайте себе задней ногой',
        'Контролируйте спуск',
        'Меняйте ведущую ногу'
      ],
      equipment: ['Скамья или степ-платформа'],
      difficulty: 'beginner'
    },

    // FLEXIBILITY
    {
      id: 'back_stretch',
      name: 'Растяжка спины',
      category: 'flexibility',
      muscleGroups: ['back'],
      description: 'Комплекс упражнений для растяжки мышц спины',
      instructions: [
        'Встаньте на четвереньки',
        'Выгните спину дугой вверх (поза кошки)',
        'Прогните спину вниз (поза коровы)',
        'Повторяйте плавно'
      ],
      tips: [
        'Двигайтесь медленно и плавно',
        'Дышите глубоко',
        'Не делайте резких движений'
      ],
      equipment: ['Коврик'],
      difficulty: 'beginner'
    },
    {
      id: 'leg_stretch',
      name: 'Растяжка ног',
      category: 'flexibility',
      muscleGroups: ['legs'],
      description: 'Комплексная растяжка мышц ног',
      instructions: [
        'Сядьте на пол, ноги прямые',
        'Потянитесь руками к носкам',
        'Держите растяжку 30 секунд',
        'Дышите ровно'
      ],
      tips: [
        'Не делайте рывков',
        'Растягивайтесь до лёгкого дискомфорта',
        'Расслабьте мышцы'
      ],
      equipment: ['Коврик'],
      difficulty: 'beginner'
    }
  ];

  static getAllExercises(): Exercise[] {
    return this.exercises;
  }

  static getExercisesByMuscleGroup(muscleGroup: MuscleGroup): Exercise[] {
    return this.exercises.filter(ex => ex.muscleGroups.includes(muscleGroup));
  }

  static getExercisesByCategory(category: Exercise['category']): Exercise[] {
    return this.exercises.filter(ex => ex.category === category);
  }

  static getExercisesByLevel(level: Exercise['difficulty']): Exercise[] {
    return this.exercises.filter(ex => ex.difficulty === level);
  }

  static getExerciseById(id: string): Exercise | undefined {
    return this.exercises.find(ex => ex.id === id);
  }

  static getRecommendedExercises(
    userLevel: UserLevel,
    category?: Exercise['category'],
    muscleGroup?: MuscleGroup
  ): Exercise[] {
    let filtered = this.exercises;

    // Filter by user level
    if (userLevel === 'beginner') {
      filtered = filtered.filter(ex => ex.difficulty === 'beginner');
    } else if (userLevel === 'intermediate') {
      filtered = filtered.filter(ex => ['beginner', 'intermediate'].includes(ex.difficulty));
    }
    // Advanced users see all exercises

    // Filter by category if specified
    if (category) {
      filtered = filtered.filter(ex => ex.category === category);
    }

    // Filter by muscle group if specified
    if (muscleGroup) {
      filtered = filtered.filter(ex => ex.muscleGroups.includes(muscleGroup));
    }

    return filtered;
  }

  static searchExercises(query: string): Exercise[] {
    const lowQuery = query.toLowerCase();
    return this.exercises.filter(ex =>
      ex.name.toLowerCase().includes(lowQuery) ||
      ex.description.toLowerCase().includes(lowQuery)
    );
  }

  static getMuscleGroupExercises(): Record<MuscleGroup, Exercise[]> {
    const groups: Record<MuscleGroup, Exercise[]> = {
      chest: [],
      back: [],
      legs: [],
      arms: [],
      shoulders: [],
      abs: []
    };

    this.exercises.forEach(exercise => {
      exercise.muscleGroups.forEach(group => {
        if (groups[group]) {
          groups[group].push(exercise);
        }
      });
    });

    return groups;
  }

  // Method to add custom exercise (for future use)
  static addCustomExercise(exercise: Omit<Exercise, 'id'>): Exercise {
    const newExercise: Exercise = {
      ...exercise,
      id: `custom_${Date.now()}`
    };
    this.exercises.push(newExercise);
    return newExercise;
  }
}