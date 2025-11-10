import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWorkout } from '@/hooks/useWorkout';
import { useUser } from '@/hooks/useUser';
import Card from '@/components/ui/Card';
import GradientButton from '@/components/ui/GradientButton';
import { theme } from '@/constants/theme';

const { width: screenWidth } = Dimensions.get('window');

export default function WeekSummaryPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { workouts } = useWorkout();
  const { profile } = useUser();
  
  const [weekStats, setWeekStats] = useState({
    completed: 0,
    total: 0,
    totalWeight: 0,
    averageFeeling: 0,
    allCompleted: false
  });

  useEffect(() => {
    calculateWeekStats();
  }, [workouts]);

  const calculateWeekStats = () => {
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

    const completed = weekWorkouts.filter(w => w.completed).length;
    
    const totalWeight = weekWorkouts.reduce((sum, workout) => {
      const workoutWeight = workout.exercises.reduce((exSum, exercise) => {
        const weight = exercise.weight || 0;
        const reps = exercise.reps || 0;
        const sets = exercise.sets || 1;
        return exSum + (weight * reps * sets);
      }, 0);
      return sum + workoutWeight;
    }, 0);

    const totalFeeling = weekWorkouts.reduce((sum, w) => sum + w.feeling, 0);
    const averageFeeling = weekWorkouts.length > 0 ? totalFeeling / weekWorkouts.length : 0;

    const plannedWorkouts = profile?.goals.preferredDays.length || 3;
    const allCompleted = completed >= plannedWorkouts;

    setWeekStats({
      completed,
      total: plannedWorkouts,
      totalWeight: Math.round(totalWeight),
      averageFeeling,
      allCompleted
    });
  };

  const getMessage = () => {
    if (weekStats.allCompleted) {
      return '🎉 Вы успешно завершили все тренировки недели! Отличная работа!';
    } else if (weekStats.completed >= weekStats.total * 0.7) {
      return '💪 Хороший результат! Продолжайте в том же духе!';
    } else {
      return '⚡ На этой неделе можно больше! Не останавливайтесь!';
    }
  };

  const getMotivation = () => {
    if (weekStats.allCompleted) {
      return [
        'Вы показали отличную дисциплину',
        'Ваша сила воли впечатляет',
        'Продолжайте в том же духе',
        'Следующая неделя будет ещё лучше'
      ];
    } else {
      return [
        'Каждая тренировка приближает к цели',
        'Не сдавайтесь, результат придёт',
        'Регулярность - ключ к успеху',
        'Начните новую неделю с энтузиазмом'
      ];
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <LinearGradient
          colors={weekStats.allCompleted ? ['#4CAF50', '#45a049'] : theme.colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <MaterialIcons 
              name={weekStats.allCompleted ? "emoji-events" : "fitness-center"} 
              size={64} 
              color="#FFFFFF" 
            />
            <Text style={styles.headerTitle}>
              {weekStats.allCompleted ? 'Неделя завершена!' : 'Итоги недели'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {getMessage()}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <MaterialIcons name="check-circle" size={32} color={theme.colors.success} />
            <Text style={styles.statValue}>{weekStats.completed}</Text>
            <Text style={styles.statLabel}>Выполнено тренировок</Text>
          </Card>

          <Card style={styles.statCard}>
            <MaterialIcons name="fitness-center" size={32} color={theme.colors.primary} />
            <Text style={styles.statValue}>{weekStats.totalWeight}</Text>
            <Text style={styles.statLabel}>Общий вес (кг)</Text>
          </Card>

          <Card style={styles.statCard}>
            <MaterialIcons name="mood" size={32} color={theme.colors.warning} />
            <Text style={styles.statValue}>{weekStats.averageFeeling.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Самочувствие</Text>
          </Card>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Прогресс недели</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${weekStats.total > 0 ? (weekStats.completed / weekStats.total) * 100 : 0}%`,
                    backgroundColor: weekStats.allCompleted ? theme.colors.success : theme.colors.primary
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {weekStats.completed} из {weekStats.total} тренировок выполнено
            </Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>
            {weekStats.allCompleted ? '✨ Вы молодец!' : '💪 Мотивация'}
          </Text>
          {getMotivation().map((text, index) => (
            <View key={index} style={styles.motivationItem}>
              <MaterialIcons 
                name={weekStats.allCompleted ? "star" : "check"} 
                size={20} 
                color={weekStats.allCompleted ? theme.colors.warning : theme.colors.primary} 
              />
              <Text style={styles.motivationText}>{text}</Text>
            </View>
          ))}
        </Card>

        <View style={styles.buttonContainer}>
          <GradientButton
            title="Начать новую неделю"
            onPress={() => router.push('/(tabs)')}
            size="large"
          />
        </View>
      </ScrollView>
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
  },
  header: {
    padding: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  progressContainer: {
    marginTop: theme.spacing.md,
  },
  progressBar: {
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  motivationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  motivationText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  buttonContainer: {
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
});