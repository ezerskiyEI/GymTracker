import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWorkout } from '@/hooks/useWorkout';
import { useUser } from '@/hooks/useUser';
import Card from '@/components/ui/Card';
import GradientButton from '@/components/ui/GradientButton';
import { theme } from '@/constants/theme';
import { Workout, Exercise } from '@/types/workout';
import { ProgramService } from '@/services/programService';
import { WorkoutAnalysisService } from '@/services/workoutAnalysisService';

const weekDays = [
  { key: 0, short: 'Вс', full: 'Воскресенье' },
  { key: 1, short: 'Пн', full: 'Понедельник' },
  { key: 2, short: 'Вт', full: 'Вторник' },
  { key: 3, short: 'Ср', full: 'Среда' },
  { key: 4, short: 'Чт', full: 'Четверг' },
  { key: 5, short: 'Пт', full: 'Пятница' },
  { key: 6, short: 'Сб', full: 'Суббота' }
];

interface ExerciseData {
  id: string;
  name: string;
  weight?: number;
  reps?: number;
  sets?: number;
  duration?: number;
  notes?: string;
}

export default function WorkoutByDaysPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addWorkout, workouts } = useWorkout();
  const { profile } = useUser();
  
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [exercisesData, setExercisesData] = useState<Map<string, ExerciseData>>(new Map());
  const [feeling, setFeeling] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Exercise editor modal
  const [showExerciseEditor, setShowExerciseEditor] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<{
    id: string;
    name: string;
    defaultSets?: number;
    defaultReps?: number;
    defaultDuration?: number;
  } | null>(null);
  
  const [editWeight, setEditWeight] = useState('');
  const [editReps, setEditReps] = useState('');
  const [editSets, setEditSets] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Web alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons?: Array<{text: string, onPress?: () => void, style?: 'default' | 'cancel' | 'destructive'}>;
  }>({ visible: false, title: '', message: '' });

  const showWebAlert = (
    title: string, 
    message: string, 
    buttons?: Array<{text: string, onPress?: () => void, style?: 'default' | 'cancel' | 'destructive'}>
  ) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, buttons });
    } else {
      if (buttons) {
        Alert.alert(title, message, buttons.map(b => ({ text: b.text, onPress: b.onPress, style: b.style })));
      } else {
        Alert.alert(title, message);
      }
    }
  };

  const getCurrentProgram = () => {
    if (!profile?.currentProgram) return null;
    return ProgramService.getProgramById(profile.currentProgram);
  };

  const getWorkoutForDay = (dayNumber: number) => {
    const program = getCurrentProgram();
    if (!program) return null;
    return program.days.find(d => d.dayNumber === dayNumber);
  };

  const openExerciseEditor = (exerciseId: string, name: string, defaultSets?: number, defaultReps?: number, defaultDuration?: number) => {
    const existingData = exercisesData.get(exerciseId);
    
    setCurrentExercise({ id: exerciseId, name, defaultSets, defaultReps, defaultDuration });
    
    if (existingData) {
      setEditWeight(existingData.weight?.toString() || '');
      setEditReps(existingData.reps?.toString() || defaultReps?.toString() || '');
      setEditSets(existingData.sets?.toString() || defaultSets?.toString() || '');
      setEditDuration(existingData.duration?.toString() || defaultDuration?.toString() || '');
      setEditNotes(existingData.notes || '');
    } else {
      // Получить рекомендации на основе прошлых тренировок
      const recommendation = WorkoutAnalysisService.getRecommendedWeight(
        workouts,
        exerciseId,
        profile?.level || 'beginner'
      );
      
      setEditWeight(recommendation.recommended.toString());
      setEditReps(defaultReps?.toString() || '10');
      setEditSets(defaultSets?.toString() || '3');
      setEditDuration(defaultDuration?.toString() || '');
      setEditNotes('');
    }
    
    setValidationErrors([]);
    setShowExerciseEditor(true);
  };

  const validateAndSaveExercise = () => {
    const weight = editWeight ? parseFloat(editWeight) : undefined;
    const reps = editReps ? parseInt(editReps) : undefined;
    const sets = editSets ? parseInt(editSets) : undefined;
    const duration = editDuration ? parseInt(editDuration) : undefined;

    // Валидация
    const validation = WorkoutAnalysisService.validateExerciseInput(weight, reps, sets);
    
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      
      // Показать рекомендации по весу
      const recommendations = [
        '📊 Рекомендуемые веса:',
        '• Лёгкий: 2–10 кг',
        '• Средний: 12–20 кг',
        '• Тяжёлый: 22–35 кг',
        '• Максимальный: 36+ кг',
        '',
        '⚠️ Ошибки:',
        ...validation.errors
      ].join('\n');
      
      showWebAlert(
        'Ошибка валидации',
        recommendations,
        [{ text: 'Исправить', style: 'default' }]
      );
      return;
    }

    if (!currentExercise) return;

    // Сохранить данные упражнения
    const newData: ExerciseData = {
      id: currentExercise.id,
      name: currentExercise.name,
      weight,
      reps,
      sets,
      duration,
      notes: editNotes.trim()
    };

    setExercisesData(prev => {
      const newMap = new Map(prev);
      newMap.set(currentExercise.id, newData);
      return newMap;
    });

    setShowExerciseEditor(false);
    showWebAlert('Успех', 'Упражнение успешно добавлено');
  };

  const getRecommendationForExercise = () => {
    if (!currentExercise) return null;
    
    return WorkoutAnalysisService.getRecommendedWeight(
      workouts,
      currentExercise.id,
      profile?.level || 'beginner'
    );
  };

  const startWorkout = async (dayNumber: number) => {
    try {
      setIsLoading(true);
      
      const program = getCurrentProgram();
      if (!program) {
        showWebAlert('Ошибка', 'Программа не найдена');
        return;
      }

      const dayWorkout = getWorkoutForDay(dayNumber);
      if (!dayWorkout) {
        showWebAlert('Информация', 'На этот день тренировка не запланирована (день отдыха)');
        return;
      }

      if (!dayWorkout.exercises || dayWorkout.exercises.length === 0) {
        showWebAlert('Ошибка', 'В этом дне нет упражнений');
        return;
      }

      setSelectedDay(dayNumber);
      setExercisesData(new Map());
      setFeeling(3);
      setNotes('');
    } catch (error) {
      console.error('Error starting workout:', error);
      showWebAlert('Ошибка', 'Не удалось загрузить тренировку');
    } finally {
      setIsLoading(false);
    }
  };

  const saveWorkout = async () => {
    if (!selectedDay) return;
    
    try {
      const dayWorkout = getWorkoutForDay(selectedDay);
      if (!dayWorkout) {
        showWebAlert('Ошибка', 'Тренировка не найдена');
        return;
      }

      if (exercisesData.size === 0) {
        showWebAlert('Ошибка', 'Добавьте хотя бы одно упражнение');
        return;
      }

      // Проверка пропущенных упражнений
      const totalExercises = dayWorkout.exercises.length;
      const completedCount = exercisesData.size;
      
      if (completedCount < totalExercises) {
        const skipped = dayWorkout.exercises.filter(ex => !exercisesData.has(ex.exerciseId));
        const skippedNames = skipped.map(ex => `- ${ex.name}`).join('\n');
        
        showWebAlert(
          'Пропущены упражнения',
          `Вы пропустили ${totalExercises - completedCount} упражнений:\n${skippedNames}\n\nСохранить тренировку?`,
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Сохранить', onPress: () => performSaveWorkout() }
          ]
        );
        return;
      }

      await performSaveWorkout();
    } catch (error) {
      console.error('Error saving workout:', error);
      showWebAlert('Ошибка', 'Не удалось сохранить тренировку');
    }
  };

  const performSaveWorkout = async () => {
    try {
      const dayWorkout = getWorkoutForDay(selectedDay!);
      if (!dayWorkout) return;

      const exercises: Exercise[] = Array.from(exercisesData.values()).map(data => ({
        id: data.id,
        name: data.name,
        sets: data.sets || 0,
        reps: data.reps,
        weight: data.weight,
        duration: data.duration,
        notes: data.notes
      }));

      const newWorkout: Workout = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: 'Силовая',
        exercises,
        feeling,
        notes: notes.trim(),
        duration: 60,
        completed: true,
        programId: profile?.currentProgram,
        dayNumber: selectedDay
      };

      await addWorkout(newWorkout);
      showWebAlert('Успех', 'Тренировка сохранена!', [
        { 
          text: 'OK', 
          onPress: () => {
            setSelectedDay(null);
            setShowSaveModal(false);
          }
        }
      ]);
    } catch (error) {
      console.error('Error in performSaveWorkout:', error);
      throw error;
    }
  };

  const feelingEmojis = ['😫', '😕', '😐', '😊', '💪'];
  const feelingLabels = ['Очень плохо', 'Плохо', 'Нормально', 'Хорошо', 'Отлично'];

  const renderExerciseEditor = () => {
    if (!currentExercise) return null;
    
    const recommendation = getRecommendationForExercise();
    const weightCategory = editWeight ? 
      WorkoutAnalysisService.getWeightCategory(parseFloat(editWeight)) : null;

    return (
      <Modal
        visible={showExerciseEditor}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExerciseEditor(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{currentExercise.name}</Text>
              <TouchableOpacity onPress={() => setShowExerciseEditor(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Рекомендации на основе прошлых тренировок */}
              {recommendation && (
                <Card style={styles.recommendationCard}>
                  <View style={styles.recommendationHeader}>
                    <MaterialIcons name="lightbulb" size={20} color={theme.colors.warning} />
                    <Text style={styles.recommendationTitle}>Рекомендация</Text>
                  </View>
                  <Text style={styles.recommendationText}>{recommendation.reason}</Text>
                  <View style={styles.recommendationValues}>
                    <Text style={styles.recommendationValue}>
                      Рекомендуемый вес: <Text style={styles.highlightText}>{recommendation.recommended} кг</Text>
                    </Text>
                    <Text style={styles.recommendationRange}>
                      Диапазон: {recommendation.range.min}–{recommendation.range.max} кг
                    </Text>
                  </View>
                </Card>
              )}

              {/* Вес */}
              <Text style={styles.fieldLabel}>Вес (кг) *</Text>
              <TextInput
                style={styles.input}
                value={editWeight}
                onChangeText={setEditWeight}
                keyboardType="decimal-pad"
                placeholder="Введите вес (1-200 кг)"
                placeholderTextColor={theme.colors.textSecondary}
              />
              {weightCategory && (
                <Text style={styles.categoryLabel}>
                  Категория: {weightCategory.label} ({weightCategory.range})
                </Text>
              )}

              {/* Повторения */}
              <Text style={styles.fieldLabel}>Повторения *</Text>
              <TextInput
                style={styles.input}
                value={editReps}
                onChangeText={setEditReps}
                keyboardType="number-pad"
                placeholder="Введите повторения (1-50)"
                placeholderTextColor={theme.colors.textSecondary}
              />

              {/* Сеты */}
              <Text style={styles.fieldLabel}>Сеты *</Text>
              <TextInput
                style={styles.input}
                value={editSets}
                onChangeText={setEditSets}
                keyboardType="number-pad"
                placeholder="Введите сеты (1-10)"
                placeholderTextColor={theme.colors.textSecondary}
              />

              {/* Длительность (если нужно) */}
              {currentExercise.defaultDuration && (
                <>
                  <Text style={styles.fieldLabel}>Длительность (мин)</Text>
                  <TextInput
                    style={styles.input}
                    value={editDuration}
                    onChangeText={setEditDuration}
                    keyboardType="number-pad"
                    placeholder="Введите длительность"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </>
              )}

              {/* Заметки */}
              <Text style={styles.fieldLabel}>Заметки (необязательно)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Как выполнили упражнение..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={theme.colors.textSecondary}
              />

              {/* Ошибки валидации */}
              {validationErrors.length > 0 && (
                <View style={styles.errorContainer}>
                  {validationErrors.map((error, index) => (
                    <Text key={index} style={styles.errorText}>⚠️ {error}</Text>
                  ))}
                </View>
              )}

              {/* Справка по рекомендуемым весам */}
              <Card style={styles.helpCard}>
                <Text style={styles.helpTitle}>📊 Рекомендуемые веса:</Text>
                <Text style={styles.helpItem}>• Лёгкий: 2–10 кг</Text>
                <Text style={styles.helpItem}>• Средний: 12–20 кг</Text>
                <Text style={styles.helpItem}>• Тяжёлый: 22–35 кг</Text>
                <Text style={styles.helpItem}>• Максимальный: 36+ кг</Text>
              </Card>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowExerciseEditor(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <GradientButton
                title="Сохранить"
                onPress={validateAndSaveExercise}
                size="medium"
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (selectedDay === null) {
    const program = getCurrentProgram();
    
    if (!profile) {
      return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (!program) {
      return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <ScrollView style={styles.content}>
            <Card>
              <MaterialIcons name="fitness-center" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>Программа не выбрана</Text>
              <Text style={styles.emptySubtext}>
                Перейдите в раздел "Программы" и выберите программу тренировок
              </Text>
              <GradientButton
                title="Выбрать программу"
                onPress={() => router.push('/programs')}
                size="large"
              />
            </Card>
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView style={styles.content}>
          <Card>
            <Text style={styles.programTitle}>{program.name}</Text>
            <Text style={styles.programDescription}>{program.description}</Text>
          </Card>

          <Text style={styles.sectionTitle}>Выберите день недели</Text>
          
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
          
          <View style={styles.daysGrid}>
            {weekDays.map((day) => {
              const dayWorkout = getWorkoutForDay(day.key);
              const isRestDay = !dayWorkout;
              
              return (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayCard,
                    isRestDay && styles.restDayCard
                  ]}
                  onPress={() => !isRestDay && !isLoading && startWorkout(day.key)}
                  disabled={isRestDay || isLoading}
                >
                  <Text style={[
                    styles.dayShort,
                    isRestDay && styles.restDayText
                  ]}>
                    {day.short}
                  </Text>
                  <Text style={[
                    styles.dayFull,
                    isRestDay && styles.restDayText
                  ]}>
                    {day.full}
                  </Text>
                  {dayWorkout && (
                    <>
                      <View style={styles.muscleGroupBadge}>
                        <Text style={styles.muscleGroupText}>
                          {dayWorkout.name}
                        </Text>
                      </View>
                      <Text style={styles.exerciseCount}>
                        {dayWorkout.exercises.length} упражнений
                      </Text>
                    </>
                  )}
                  {isRestDay && (
                    <Text style={styles.restText}>Отдых</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  const dayWorkout = getWorkoutForDay(selectedDay);
  if (!dayWorkout) return null;

  const selectedDayInfo = weekDays.find(d => d.key === selectedDay);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setSelectedDay(null)}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerDay}>{selectedDayInfo?.full}</Text>
          <Text style={styles.headerMuscles}>{dayWorkout.name}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Card>
          <Text style={styles.exerciseListTitle}>
            Упражнения ({exercisesData.size} из {dayWorkout.exercises.length})
          </Text>
          
          {dayWorkout.exercises.map((exercise) => {
            const isCompleted = exercisesData.has(exercise.exerciseId);
            const data = exercisesData.get(exercise.exerciseId);
            
            return (
              <TouchableOpacity
                key={exercise.exerciseId}
                style={[
                  styles.exerciseItem,
                  isCompleted && styles.completedExercise
                ]}
                onPress={() => openExerciseEditor(
                  exercise.exerciseId, 
                  exercise.name,
                  exercise.sets,
                  exercise.reps,
                  exercise.duration
                )}
              >
                <View style={styles.exerciseCheckbox}>
                  {isCompleted && (
                    <MaterialIcons name="check" size={20} color={theme.colors.success} />
                  )}
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={[
                    styles.exerciseName,
                    isCompleted && styles.completedExerciseName
                  ]}>
                    {exercise.name}
                  </Text>
                  {isCompleted && data ? (
                    <Text style={styles.exerciseDetails}>
                      {data.weight && `${data.weight} кг`}
                      {data.sets && data.reps && ` × ${data.sets} подходов × ${data.reps} раз`}
                      {data.duration && ` | ${data.duration} мин`}
                    </Text>
                  ) : (
                    <Text style={styles.exerciseDetails}>
                      Нажмите для ввода данных
                    </Text>
                  )}
                  {data?.notes && (
                    <Text style={styles.exerciseNotes}>{data.notes}</Text>
                  )}
                </View>
                <MaterialIcons 
                  name={isCompleted ? "edit" : "add-circle"} 
                  size={24} 
                  color={isCompleted ? theme.colors.primary : theme.colors.textSecondary} 
                />
              </TouchableOpacity>
            );
          })}
        </Card>

        {exercisesData.size > 0 && (
          <GradientButton
            title="Завершить тренировку"
            onPress={() => setShowSaveModal(true)}
            size="large"
          />
        )}
      </ScrollView>

      {/* Exercise Editor Modal */}
      {renderExerciseEditor()}

      {/* Save Workout Modal */}
      <Modal
        visible={showSaveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Сохранить тренировку</Text>
              <TouchableOpacity onPress={() => setShowSaveModal(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.fieldLabel}>Как себя чувствуете?</Text>
              <View style={styles.feelingContainer}>
                {feelingEmojis.map((emoji, index) => {
                  const value = (index + 1) as 1 | 2 | 3 | 4 | 5;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.feelingButton,
                        feeling === value && styles.selectedFeeling
                      ]}
                      onPress={() => setFeeling(value)}
                    >
                      <Text style={styles.feelingEmoji}>{emoji}</Text>
                      <Text style={styles.feelingLabel}>{feelingLabels[index]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Заметки (необязательно)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Как прошла тренировка..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowSaveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <GradientButton
                title="Сохранить"
                onPress={saveWorkout}
                size="medium"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Web Alert Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, minWidth: 280, maxWidth: 400 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{alertConfig.title}</Text>
              <Text style={{ fontSize: 16, marginBottom: 20, lineHeight: 22 }}>{alertConfig.message}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                {alertConfig.buttons?.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      padding: 10,
                      borderRadius: 4,
                      minWidth: 80,
                      alignItems: 'center',
                      backgroundColor: button.style === 'destructive' ? '#FF3B30' : 
                                     button.style === 'cancel' ? '#F2F2F7' : '#007AFF'
                    }}
                    onPress={() => {
                      button.onPress?.();
                      setAlertConfig(prev => ({ ...prev, visible: false }));
                    }}
                  >
                    <Text style={{
                      color: button.style === 'cancel' ? '#000' : 'white',
                      fontWeight: 'bold'
                    }}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  programTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  programDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginVertical: theme.spacing.md,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  dayCard: {
    width: '47%',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  restDayCard: {
    opacity: 0.5,
    borderColor: theme.colors.border,
  },
  dayShort: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  dayFull: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  restDayText: {
    color: theme.colors.textSecondary,
  },
  muscleGroupBadge: {
    backgroundColor: `${theme.colors.primary}20`,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
  },
  muscleGroupText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  exerciseCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  restText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerMuscles: {
    fontSize: 14,
    color: theme.colors.primary,
    marginTop: 2,
  },
  exerciseListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  completedExercise: {
    backgroundColor: `${theme.colors.success}10`,
  },
  exerciseCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  completedExerciseName: {
    color: theme.colors.success,
  },
  exerciseDetails: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  exerciseNotes: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalForm: {
    padding: theme.spacing.lg,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryLabel: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  recommendationCard: {
    backgroundColor: `${theme.colors.warning}10`,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
    marginBottom: theme.spacing.md,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  recommendationText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  recommendationValues: {
    marginTop: theme.spacing.sm,
  },
  recommendationValue: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  highlightText: {
    color: theme.colors.warning,
    fontWeight: 'bold',
  },
  recommendationRange: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: `${theme.colors.error}10`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    marginTop: theme.spacing.md,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  helpCard: {
    backgroundColor: `${theme.colors.primary}05`,
    marginTop: theme.spacing.md,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  helpItem: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  feelingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feelingButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    minWidth: 60,
  },
  selectedFeeling: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  feelingEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  feelingLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
