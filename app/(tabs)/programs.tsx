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
  FlatList
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@/hooks/useUser';
import Card from '@/components/ui/Card';
import GradientButton from '@/components/ui/GradientButton';
import { theme } from '@/constants/theme';
import { ProgramService } from '@/services/programService';
import { ExerciseService } from '@/services/exerciseService';
import { WorkoutProgram, FitnessGoal } from '@/types/program';

export default function ProgramsPage() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useUser();
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const [showProgramDetail, setShowProgramDetail] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FitnessGoal | 'all'>('all');

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

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  const allPrograms = ProgramService.getAllPrograms();
  const recommendedPrograms = ProgramService.getRecommendedPrograms(
    profile.goals.primaryGoal, 
    profile.level
  );

  const categories = [
    { key: 'all', title: 'Все программы', icon: 'apps', count: allPrograms.length },
    { key: 'strength', title: 'Сила', icon: 'fitness-center', count: ProgramService.getProgramsByGoal('strength').length },
    { key: 'muscle_gain', title: 'Масса', icon: 'trending-up', count: ProgramService.getProgramsByGoal('muscle_gain').length },
    { key: 'weight_loss', title: 'Похудение', icon: 'trending-down', count: ProgramService.getProgramsByGoal('weight_loss').length },
    { key: 'endurance', title: 'Выносливость', icon: 'directions-run', count: ProgramService.getProgramsByGoal('endurance').length },
    { key: 'maintenance', title: 'Поддержание', icon: 'balance', count: ProgramService.getProgramsByGoal('maintenance').length }
  ];

  const getFilteredPrograms = () => {
    if (selectedCategory === 'all') {
      return allPrograms;
    }
    return ProgramService.getProgramsByGoal(selectedCategory as FitnessGoal);
  };

  const goalTitles = {
    strength: 'Сила',
    muscle_gain: 'Масса',
    weight_loss: 'Похудение',
    endurance: 'Выносливость',
    maintenance: 'Поддержание формы'
  };

  const levelTitles = {
    beginner: 'Новичок',
    intermediate: 'Средний',
    advanced: 'Продвинутый'
  };

  const selectProgram = async (program: WorkoutProgram) => {
    try {
      const updatedProfile = {
        ...profile,
        currentProgram: program.id
      };
      
      await updateProfile(updatedProfile);
      
      showWebAlert('Программа выбрана!', `Вы выбрали программу "${program.name}". Теперь она будет использоваться для ваших тренировок.`);
    } catch (error) {
      showWebAlert('Ошибка', 'Не удалось выбрать программу');
    }
  };

  const showProgramDetails = (program: WorkoutProgram) => {
    setSelectedProgram(program);
    setShowProgramDetail(true);
  };

  const renderProgramCard = (program: WorkoutProgram) => {
    const isRecommended = recommendedPrograms.some(p => p.id === program.id);
    const isActive = profile.currentProgram === program.id;

    return (
      <Card key={program.id} style={[
        styles.programCard, 
        isRecommended && styles.recommendedCard,
        isActive && styles.activeCard
      ]}>
        <View style={styles.programHeader}>
          <View style={styles.programTitleContainer}>
            <Text style={styles.programName}>{program.name}</Text>
            <View style={styles.badgeContainer}>
              {isRecommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Рекомендуется</Text>
                </View>
              )}
              {isActive && (
                <View style={styles.activeBadge}>
                  <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.activeText}>Активна</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        <Text style={styles.programDescription}>{program.description}</Text>
        
        <View style={styles.programInfo}>
          <View style={styles.infoItem}>
            <MaterialIcons name="schedule" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{program.duration} недель</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="fitness-center" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{program.workoutsPerWeek}x в неделю</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="trending-up" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{levelTitles[program.level]}</Text>
          </View>
        </View>

        <View style={styles.programActions}>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => showProgramDetails(program)}
          >
            <Text style={styles.detailsButtonText}>Подробнее</Text>
            <MaterialIcons name="arrow-forward-ios" size={12} color={theme.colors.primary} />
          </TouchableOpacity>
          
          {!isActive && (
            <GradientButton
              title="Выбрать"
              onPress={() => selectProgram(program)}
              size="medium"
            />
          )}
        </View>
      </Card>
    );
  };

  const renderProgramDetail = () => (
    <Modal
      visible={showProgramDetail}
      transparent
      animationType="slide"
      onRequestClose={() => setShowProgramDetail(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedProgram?.name}</Text>
            <TouchableOpacity onPress={() => setShowProgramDetail(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.programDescription}>{selectedProgram?.description}</Text>
            
            <View style={styles.programStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{selectedProgram?.duration}</Text>
                <Text style={styles.statLabel}>недель</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{selectedProgram?.workoutsPerWeek}</Text>
                <Text style={styles.statLabel}>тренировок/неделю</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{selectedProgram?.days.length}</Text>
                <Text style={styles.statLabel}>типов тренировок</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Структура программы:</Text>
            {selectedProgram?.days.map((day, index) => (
              <View key={index} style={styles.dayItem}>
                <Text style={styles.dayName}>День {day.dayNumber}: {day.name}</Text>
                {day.exercises.map((progExercise, exerciseIndex) => {
                  const exercise = ExerciseService.getExerciseById(progExercise.exerciseId);
                  if (!exercise) return null;
                  
                  return (
                    <View key={exerciseIndex} style={styles.exerciseItem}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseParams}>
                        {progExercise.sets} подходов
                        {progExercise.reps && ` × ${progExercise.reps} повторений`}
                        {progExercise.duration && ` × ${progExercise.duration} минут`}
                        {progExercise.rest && ` (отдых ${progExercise.rest}с)`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}

            <Text style={styles.sectionTitle}>Преимущества программы:</Text>
            {selectedProgram?.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <MaterialIcons name="check" size={16} color={theme.colors.success} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Советы по выполнению:</Text>
            {selectedProgram?.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <MaterialIcons name="lightbulb" size={16} color={theme.colors.warning} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalActions}>
            {profile?.currentProgram === selectedProgram?.id ? (
              <View style={styles.activeProgram}>
                <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
                <Text style={styles.activeProgramText}>Программа активна</Text>
              </View>
            ) : (
              <GradientButton
                title="Выбрать эту программу"
                onPress={() => {
                  if (selectedProgram) {
                    selectProgram(selectedProgram);
                    setShowProgramDetail(false);
                  }
                }}
                size="large"
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCategoryFilter = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.key && styles.activeCategoryButton
      ]}
      onPress={() => setSelectedCategory(item.key)}
    >
      <MaterialIcons 
        name={item.icon as any} 
        size={20} 
        color={selectedCategory === item.key ? '#FFFFFF' : theme.colors.textSecondary} 
      />
      <Text style={[
        styles.categoryText,
        selectedCategory === item.key && styles.activeCategoryText
      ]}>
        {item.title}
      </Text>
      <View style={[
        styles.categoryBadge,
        selectedCategory === item.key && styles.activeCategoryBadge
      ]}>
        <Text style={[
          styles.categoryCount,
          selectedCategory === item.key && styles.activeCategoryCount
        ]}>
          {item.count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const filteredPrograms = getFilteredPrograms();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Category Filters */}
      <View style={styles.filtersSection}>
        <FlatList
          data={categories}
          renderItem={renderCategoryFilter}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Level Info */}
        <Card>
          <View style={styles.levelInfo}>
            <MaterialIcons name="person" size={32} color={theme.colors.primary} />
            <View style={styles.levelDetails}>
              <Text style={styles.levelTitle}>Ваш уровень: {levelTitles[profile.level]}</Text>
              <Text style={styles.levelDescription}>
                Цель: {goalTitles[profile.goals.primaryGoal]}
                {profile.goals.laggingMuscleGroups && profile.goals.laggingMuscleGroups.length > 0 && (
                  <Text> • Акцент на: {profile.goals.laggingMuscleGroups.join(', ')}</Text>
                )}
              </Text>
            </View>
          </View>
        </Card>

        {/* Programs List */}
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'all' ? '📋 Все программы' : `🎯 ${categories.find(c => c.key === selectedCategory)?.title}`}
          <Text style={styles.sectionSubtitle}> ({filteredPrograms.length})</Text>
        </Text>

        {filteredPrograms.length > 0 ? (
          filteredPrograms
            .sort((a, b) => {
              // Recommended programs first
              const aRecommended = recommendedPrograms.some(p => p.id === a.id);
              const bRecommended = recommendedPrograms.some(p => p.id === b.id);
              if (aRecommended && !bRecommended) return -1;
              if (!aRecommended && bRecommended) return 1;
              
              // Active program first among recommended
              if (profile.currentProgram === a.id) return -1;
              if (profile.currentProgram === b.id) return 1;
              
              // Then by level match
              if (a.level === profile.level && b.level !== profile.level) return -1;
              if (a.level !== profile.level && b.level === profile.level) return 1;
              
              return a.name.localeCompare(b.name);
            })
            .map(renderProgramCard)
        ) : (
          <Card style={styles.emptyContainer}>
            <MaterialIcons name="fitness-center" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>Программы не найдены</Text>
            <Text style={styles.emptySubtitle}>Попробуйте выбрать другую категорию</Text>
          </Card>
        )}

        {/* Instructions for beginners */}
        {profile.level === 'beginner' && (
          <Card>
            <Text style={styles.cardTitle}>💡 Советы для начинающих</Text>
            <View style={styles.tips}>
              <Text style={styles.tipText}>• Начните с программы "Фулбоди 3 раза в неделю"</Text>
              <Text style={styles.tipText}>• Изучите правильную технику выполнения упражнений</Text>
              <Text style={styles.tipText}>• Увеличивайте нагрузку постепенно</Text>
              <Text style={styles.tipText}>• Отдыхайте между тренировками минимум день</Text>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Program Detail Modal */}
      {renderProgramDetail()}

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
  filtersSection: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeCategoryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },
  activeCategoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  activeCategoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  categoryCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  activeCategoryCount: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginVertical: theme.spacing.md,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'normal',
    color: theme.colors.textSecondary,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelDetails: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  levelDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  programCard: {
    marginBottom: theme.spacing.md,
  },
  recommendedCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  activeCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
    backgroundColor: `${theme.colors.success}05`,
  },
  programHeader: {
    marginBottom: theme.spacing.sm,
  },
  programTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  programName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  recommendedBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  activeBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  programDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  programInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  programActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  detailsButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: theme.spacing.xs,
  },
  activeProgram: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeProgramText: {
    color: theme.colors.success,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  tips: {
    gap: theme.spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    flex: 1,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  programStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  dayItem: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  exerciseItem: {
    paddingLeft: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  exerciseParams: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  benefitText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  modalActions: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});