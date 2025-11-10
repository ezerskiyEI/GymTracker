import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@/hooks/useUser';
import { useLanguage } from '@/hooks/useLanguage';
import Card from '@/components/ui/Card';
import GradientButton from '@/components/ui/GradientButton';
import { theme } from '@/constants/theme';
import { FitnessGoal, UserGoals, UserLevel, MuscleGroup } from '@/types/user';
import { GoalService } from '@/services/goalService';

export default function OnboardingPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useUser();
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    level: 'beginner' as UserLevel,
    goal: 'maintenance' as FitnessGoal,
    targetDescription: '',
    currentWeight: '',
    targetWeight: '',
    preferredDays: [] as number[],
    preferredTime: '18:00',
  });

  // Web alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const levels: Array<{ key: UserLevel; title: string; description: string; icon: string }> = [
    {
      key: 'beginner',
      title: t('beginner'),
      description: 'Только начинаю заниматься или возвращаюсь после долгого перерыва',
      icon: 'emoji-people'
    },
    {
      key: 'intermediate',
      title: t('intermediate'),
      description: 'Занимаюсь регулярно несколько месяцев, знаю основные упражнения',
      icon: 'fitness-center'
    },
    {
      key: 'advanced',
      title: t('advanced'),
      description: 'Опытный атлет с хорошими знаниями техники и программ',
      icon: 'military-tech'
    }
  ];

  const goals: Array<{ key: FitnessGoal; title: string; description: string; icon: string }> = [
    {
      key: 'weight_loss',
      title: t('weightLoss'),
      description: 'Сбросить лишний вес и улучшить рельеф',
      icon: 'trending-down'
    },
    {
      key: 'muscle_gain',
      title: t('muscleGain'),
      description: 'Увеличить мышечную массу и силу',
      icon: 'trending-up'
    },
    {
      key: 'strength',
      title: t('strength'),
      description: 'Развить максимальную силу в базовых упражнениях',
      icon: 'fitness-center'
    },
    {
      key: 'endurance',
      title: t('endurance'),
      description: 'Развить кардио и общую выносливость',
      icon: 'directions-run'
    },
    {
      key: 'maintenance',
      title: t('maintenance'),
      description: 'Сохранить текущее физическое состояние',
      icon: 'balance'
    }
  ];



  const weekdays = [
    { key: 1, label: 'Пн' },
    { key: 2, label: 'Вт' },
    { key: 3, label: 'Ср' },
    { key: 4, label: 'Чт' },
    { key: 5, label: 'Пт' },
    { key: 6, label: 'Сб' },
    { key: 0, label: 'Вс' }
  ];

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter(d => d !== day)
        : [...prev.preferredDays, day]
    }));
  };



  const nextStep = () => {
    // Validation
    if (currentStep === 1 && !formData.name.trim()) {
      showWebAlert('Ошибка', 'Введите ваше имя');
      return;
    }
    
    if (currentStep === 4 && !formData.targetDescription.trim()) {
      showWebAlert('Ошибка', 'Опишите вашу цель');
      return;
    }
    
    if (currentStep === 5 && !formData.currentWeight) {
      showWebAlert('Ошибка', 'Укажите ваш текущий вес');
      return;
    }
    
    if (currentStep === 6 && formData.preferredDays.length === 0) {
      showWebAlert('Ошибка', 'Выберите хотя бы один день для тренировок');
      return;
    }

    const maxSteps = getStepCount();
    if (currentStep < maxSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeSetup();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeSetup = async () => {
    try {
      const goals: UserGoals = {
        primaryGoal: formData.goal,
        targetDescription: formData.targetDescription,
        currentWeight: parseFloat(formData.currentWeight),
        targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : undefined,
        preferredDays: formData.preferredDays,
        preferredTime: formData.preferredTime,
      };

      await completeOnboarding({
        name: formData.name,
        level: formData.level,
        goals,
      });

      showWebAlert(t('welcome'), 'Настройка завершена. Начните свой путь к цели!', () => {
        router.replace('/(tabs)');
      });
    } catch (error) {
      showWebAlert('Ошибка', 'Не удалось завершить настройку');
    }
  };

  const getStepCount = () => {
    return 8; // Фиксированное количество шагов для всех уровней
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <Text style={styles.stepTitle}>{t('chooseLanguage')}</Text>
            <Text style={styles.stepDescription}>Выберите язык интерфейса</Text>
            <View style={styles.languageGrid}>
              {availableLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang.key}
                  style={[
                    styles.languageCard,
                    language === lang.key && styles.selectedLanguage
                  ]}
                  onPress={() => setLanguage(lang.key)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={[
                    styles.languageText,
                    language === lang.key && styles.selectedLanguageText
                  ]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        );

      case 1:
        return (
          <Card>
            <Text style={styles.stepTitle}>Как вас зовут?</Text>
            <Text style={styles.stepDescription}>Мы будем обращаться к вам по имени</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Введите ваше имя"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </Card>
        );

      case 2:
        return (
          <Card>
            <Text style={styles.stepTitle}>Ваш уровень подготовки?</Text>
            <Text style={styles.stepDescription}>Это определит программы и советы для вас</Text>
            <View style={styles.goalGrid}>
              {levels.map((level) => (
                <TouchableOpacity
                  key={level.key}
                  style={[
                    styles.goalCard,
                    formData.level === level.key && styles.selectedGoal
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, level: level.key }))}
                >
                  <MaterialIcons 
                    name={level.icon as any} 
                    size={32} 
                    color={formData.level === level.key ? theme.colors.primary : theme.colors.textSecondary} 
                  />
                  <Text style={[
                    styles.goalTitle,
                    formData.level === level.key && styles.selectedGoalText
                  ]}>
                    {level.title}
                  </Text>
                  <Text style={styles.goalDescription}>{level.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        );

      case 3:
        return (
          <Card>
            <Text style={styles.stepTitle}>{t('chooseGoal')}</Text>
            <Text style={styles.stepDescription}>Это поможет подобрать оптимальную программу</Text>
            <View style={styles.goalGrid}>
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal.key}
                  style={[
                    styles.goalCard,
                    formData.goal === goal.key && styles.selectedGoal
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, goal: goal.key }))}
                >
                  <MaterialIcons 
                    name={goal.icon as any} 
                    size={32} 
                    color={formData.goal === goal.key ? theme.colors.primary : theme.colors.textSecondary} 
                  />
                  <Text style={[
                    styles.goalTitle,
                    formData.goal === goal.key && styles.selectedGoalText
                  ]}>
                    {goal.title}
                  </Text>
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        );

            case 4:
        return renderDescriptionStep();

      case 5:
        return renderWeightStep();

      case 6:
        return renderScheduleStep();

      case 7:
        return renderSummaryStep();

      default:
        return renderSummaryStep();
    }
  };

  const renderDescriptionStep = () => (
    <Card>
      <Text style={styles.stepTitle}>Опишите вашу цель</Text>
      <Text style={styles.stepDescription}>
        Например: "сбросить 5 кг за 3 месяца" или "жать 100 кг"
      </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.targetDescription}
        onChangeText={(text) => setFormData(prev => ({ ...prev, targetDescription: text }))}
        placeholder="Чего хотите достичь?"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        placeholderTextColor={theme.colors.textSecondary}
      />
      
      {/* Показать рекомендации для выбранной цели */}
      <View style={styles.recommendationBox}>
        <Text style={styles.recommendationTitle}>💡 Рекомендации для вашей цели:</Text>
        <Text style={styles.recommendationText}>
          {GoalService.getWorkoutRecommendations(formData.goal).description}
        </Text>
      </View>
    </Card>
  );

  const renderWeightStep = () => (
    <Card>
      <Text style={styles.stepTitle}>Ваш текущий вес</Text>
      <Text style={styles.stepDescription}>Это поможет отслеживать прогресс</Text>
      
      <View style={styles.weightInputs}>
        <View style={styles.weightInput}>
          <Text style={styles.inputLabel}>Текущий вес (кг)</Text>
          <TextInput
            style={styles.input}
            value={formData.currentWeight}
            onChangeText={(text) => setFormData(prev => ({ ...prev, currentWeight: text }))}
            placeholder="70"
            keyboardType="numeric"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
        
        {(formData.goal === 'weight_loss' || formData.goal === 'muscle_gain') && (
          <View style={styles.weightInput}>
            <Text style={styles.inputLabel}>
              Целевой вес (кг) - необязательно
            </Text>
            <TextInput
              style={styles.input}
              value={formData.targetWeight}
              onChangeText={(text) => setFormData(prev => ({ ...prev, targetWeight: text }))}
              placeholder="65"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        )}
      </View>
    </Card>
  );

  const renderScheduleStep = () => (
    <Card>
      <Text style={styles.stepTitle}>Когда удобно тренироваться?</Text>
      <Text style={styles.stepDescription}>Выберите дни недели</Text>
      
      <View style={styles.daysContainer}>
        {weekdays.map((day) => (
          <TouchableOpacity
            key={day.key}
            style={[
              styles.dayButton,
              formData.preferredDays.includes(day.key) && styles.selectedDay
            ]}
            onPress={() => toggleDay(day.key)}
          >
            <Text style={[
              styles.dayText,
              formData.preferredDays.includes(day.key) && styles.selectedDayText
            ]}>
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.inputLabel}>Предпочтительное время</Text>
      <TextInput
        style={styles.input}
        value={formData.preferredTime}
        onChangeText={(text) => setFormData(prev => ({ ...prev, preferredTime: text }))}
        placeholder="18:00"
        placeholderTextColor={theme.colors.textSecondary}
      />
    </Card>
  );

  const renderSummaryStep = () => (
    <Card>
      <Text style={styles.stepTitle}>Все готово! 🎉</Text>
      <Text style={styles.stepDescription}>
        Давайте проверим ваши настройки
      </Text>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Имя:</Text>
          <Text style={styles.summaryValue}>{formData.name}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Уровень:</Text>
          <Text style={styles.summaryValue}>
            {levels.find(l => l.key === formData.level)?.title}
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Цель:</Text>
          <Text style={styles.summaryValue}>
            {goals.find(g => g.key === formData.goal)?.title}
          </Text>
        </View>
        

        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Дни тренировок:</Text>
          <Text style={styles.summaryValue}>
            {formData.preferredDays.map(d => 
              weekdays.find(w => w.key === d)?.label
            ).join(', ')} в {formData.preferredTime}
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Рекомендуемая частота:</Text>
          <Text style={styles.summaryValue}>
            {GoalService.getWorkoutRecommendations(formData.goal).frequency} раз в неделю
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Прогресс-бар */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / getStepCount()) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} из {getStepCount()}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.backButtonText}>{t('back')}</Text>
          </TouchableOpacity>
        )}
        
        <GradientButton
          title={currentStep === getStepCount() - 1 ? t('start') : t('next')}
          onPress={nextStep}
          size="large"
        />
      </View>

      {/* Web Alert Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, minWidth: 280 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{alertConfig.title}</Text>
              <Text style={{ fontSize: 16, marginBottom: 20 }}>{alertConfig.message}</Text>
              <TouchableOpacity 
                style={{ backgroundColor: '#007AFF', padding: 10, borderRadius: 4, alignItems: 'center' }}
                onPress={() => {
                  alertConfig.onOk?.();
                  setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>OK</Text>
              </TouchableOpacity>
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
  progressContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
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
  languageGrid: {
    gap: theme.spacing.md,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  selectedLanguage: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  languageText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  selectedLanguageText: {
    color: theme.colors.primary,
  },
  goalGrid: {
    gap: theme.spacing.md,
  },
  goalCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  selectedGoal: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  selectedGoalText: {
    color: theme.colors.primary,
  },
  goalDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },

  recommendationBox: {
    backgroundColor: `${theme.colors.primary}10`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  recommendationText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  weightInputs: {
    gap: theme.spacing.md,
  },
  weightInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  dayButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  selectedDay: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  summaryContainer: {
    gap: theme.spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 2,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  backButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginLeft: theme.spacing.sm,
  },
});