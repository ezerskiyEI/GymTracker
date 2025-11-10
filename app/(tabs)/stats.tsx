import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkout } from '@/hooks/useWorkout';
import Card from '@/components/ui/Card';
import { theme } from '@/constants/theme';
import { AnalyticsService } from '@/services/analyticsService';
import { WeeklyStats } from '@/types/workout';

const { width: screenWidth } = Dimensions.get('window');

export default function StatsPage() {
  const insets = useSafeAreaInsets();
  const { workouts, weeklyStats, refreshStats } = useWorkout();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [currentStats, setCurrentStats] = useState<WeeklyStats | null>(null);

  useEffect(() => {
    refreshStats();
    calculateCurrentStats();
  }, [workouts]);

  const calculateCurrentStats = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const stats = AnalyticsService.calculateWeeklyStats(workouts, startOfWeek);
    setCurrentStats(stats);
  };

  const getOverallStats = () => {
    const completed = workouts.filter(w => w.completed);
    const totalWorkouts = completed.length;
    const totalDuration = completed.reduce((sum, w) => sum + w.duration, 0);
    const averageFeeling = completed.length > 0 
      ? completed.reduce((sum, w) => sum + w.feeling, 0) / completed.length 
      : 0;

    // Подсчет по типам тренировок
    const typeStats = completed.reduce((acc, workout) => {
      acc[workout.type] = (acc[workout.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalWorkouts,
      totalDuration,
      averageFeeling,
      typeStats,
    };
  };

  const getStreakDays = () => {
    const sortedWorkouts = workouts
      .filter(w => w.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedWorkouts.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays === streak + 1) {
        // Пропуск одного дня допустим
        streak++;
        currentDate = new Date(workoutDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const renderStatCard = (title: string, value: string | number, subtitle?: string, icon?: string) => (
    <Card style={styles.statCard}>
      <View style={styles.statContent}>
        {icon && (
          <MaterialIcons 
            name={icon as any} 
            size={32} 
            color={theme.colors.primary} 
            style={styles.statIcon}
          />
        )}
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </Card>
  );

  const renderProgressBar = (label: string, value: number, maxValue: number, color: string) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    
    return (
      <View style={styles.progressItem}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressValue}>{value}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
      </View>
    );
  };

  const overallStats = getOverallStats();
  const streak = getStreakDays();

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Основные показатели */}
        <Text style={styles.sectionTitle}>Общая статистика</Text>
        
        <View style={styles.statsGrid}>
          {renderStatCard(
            'Всего тренировок',
            overallStats.totalWorkouts,
            undefined,
            'fitness-center'
          )}
          {renderStatCard(
            'Общее время',
            `${Math.round(overallStats.totalDuration / 60)} ч`,
            `${overallStats.totalDuration} мин`,
            'schedule'
          )}
          {renderStatCard(
            'Серия дней',
            streak,
            streak > 0 ? 'Продолжай!' : 'Начни сегодня',
            'local-fire-department'
          )}
          {renderStatCard(
            'Среднее настроение',
            overallStats.averageFeeling.toFixed(1),
            'Из 5.0',
            'mood'
          )}
        </View>

        {/* Статистика текущей недели */}
        {currentStats && (
          <Card style={styles.weeklyCard}>
            <Text style={styles.cardTitle}>Эта неделя</Text>
            <View style={styles.weeklyStats}>
              <View style={styles.weeklyItem}>
                <Text style={styles.weeklyValue}>{currentStats.completedWorkouts}</Text>
                <Text style={styles.weeklyLabel}>Выполнено</Text>
              </View>
              <View style={styles.weeklyDivider} />
              <View style={styles.weeklyItem}>
                <Text style={styles.weeklyValue}>{currentStats.totalWorkouts}</Text>
                <Text style={styles.weeklyLabel}>Запланировано</Text>
              </View>
              <View style={styles.weeklyDivider} />
              <View style={styles.weeklyItem}>
                <Text style={[
                  styles.weeklyValue,
                  { color: currentStats.improvementPercentage >= 0 ? theme.colors.success : theme.colors.error }
                ]}>
                  {currentStats.improvementPercentage >= 0 ? '+' : ''}{currentStats.improvementPercentage.toFixed(0)}%
                </Text>
                <Text style={styles.weeklyLabel}>К прошлой неделе</Text>
              </View>
            </View>
            
            {/* Прогресс-бар недели */}
            <View style={styles.weekProgress}>
              <Text style={styles.progressTitle}>Прогресс недели</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBarFill,
                    { 
                      width: `${currentStats.totalWorkouts > 0 ? (currentStats.completedWorkouts / currentStats.totalWorkouts) * 100 : 0}%`,
                      backgroundColor: theme.colors.primary 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {currentStats.completedWorkouts} из {currentStats.totalWorkouts} тренировок
              </Text>
            </View>{/* This was the missing closing tag */}
          </Card>
        )}

        {/* Статистика по типам тренировок */}
        <Card>
          <Text style={styles.cardTitle}>Типы тренировок</Text>
          <View style={styles.typeStats}>
            {Object.entries(overallStats.typeStats).map(([type, count]) => 
              renderProgressBar(
                type, 
                count, 
                Math.max(...Object.values(overallStats.typeStats)), 
                theme.colors.primary
              )
            )}
            {Object.keys(overallStats.typeStats).length === 0 && (
              <View style={styles.emptyState}>
                <MaterialIcons name="bar-chart" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>Пока нет данных</Text>
                <Text style={styles.emptySubtext}>Добавьте тренировки для просмотра статистики</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Достижения */}
        <Card>
          <Text style={styles.cardTitle}>Достижения</Text>
          <View style={styles.achievements}>
            {overallStats.totalWorkouts >= 1 && (
              <View style={styles.achievement}>
                <MaterialIcons name="fitness-center" size={24} color={theme.colors.primary} />
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementText}>Первая тренировка</Text>
                  <Text style={styles.achievementProgress}>Начало положено!</Text>
                </View>
              </View>
            )}
            {overallStats.totalWorkouts >= 5 && (
              <View style={styles.achievement}>
                <MaterialIcons name="trending-up" size={24} color={theme.colors.success} />
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementText}>5+ тренировок</Text>
                  <Text style={styles.achievementProgress}>Регулярность - ключ к успеху</Text>
                </View>
              </View>
            )}
            {overallStats.totalWorkouts >= 10 && (
              <View style={styles.achievement}>
                <MaterialIcons name="emoji-events" size={24} color={theme.colors.warning} />
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementText}>10+ тренировок</Text>
                  <Text style={styles.achievementProgress}>Первая крупная цель достигнута!</Text>
                </View>
              </View>
            )}
            {overallStats.totalWorkouts >= 30 && (
              <View style={styles.achievement}>
                <MaterialIcons name="stars" size={24} color={theme.colors.warning} />
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementText}>Месяц тренировок</Text>
                  <Text style={styles.achievementProgress}>30+ тренировок - впечатляющий результат</Text>
                </View>
              </View>
            )}
            {streak >= 3 && (
              <View style={styles.achievement}>
                <MaterialIcons name="local-fire-department" size={24} color={theme.colors.error} />
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementText}>Серия {streak} дней</Text>
                  <Text style={styles.achievementProgress}>Не останавливайся!</Text>
                </View>
              </View>
            )}
            {streak >= 7 && (
              <View style={styles.achievement}>
                <MaterialIcons name="whatshot" size={24} color={theme.colors.error} />
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementText}>Неделя без пропусков</Text>
                  <Text style={styles.achievementProgress}>7 дней подряд - невероятно!</Text>
                </View>
              </View>
            )}
            {overallStats.averageFeeling >= 4 && (
              <View style={styles.achievement}>
                <MaterialIcons name="mood" size={24} color={theme.colors.success} />
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementText}>Отличное настроение</Text>
                  <Text style={styles.achievementProgress}>Средняя оценка 4+</Text>
                </View>
              </View>
            )}
            {overallStats.totalDuration >= 600 && (
              <View style={styles.achievement}>
                <MaterialIcons name="schedule" size={24} color={theme.colors.secondary} />
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementText}>10+ часов тренировок</Text>
                  <Text style={styles.achievementProgress}>Импрессивный объём работы</Text>
                </View>
              </View>
            )}
            {overallStats.totalDuration >= 1800 && (
              <View style={styles.achievement}>
                <MaterialIcons name="timer" size={24} color={theme.colors.secondary} />
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementText}>30+ часов тренировок</Text>
                  <Text style={styles.achievementProgress}>Вы - истинный атлет!</Text>
                </View>
              </View>
            )}
            
            {/* Заглушка если нет достижений */}
            {overallStats.totalWorkouts === 0 && (
              <View style={styles.emptyState}>
                <MaterialIcons name="emoji-events" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>Достижений пока нет</Text>
                <Text style={styles.emptySubtext}>Сделайте первую тренировку и начните путь к успеху!</Text>
              </View>
            )}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    width: (screenWidth - theme.spacing.md * 3) / 2,
    padding: theme.spacing.md,
  },
  statContent: {
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: theme.spacing.sm,
  },
  statInfo: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  weeklyCard: {
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  weeklyItem: {
    alignItems: 'center',
    flex: 1,
  },
  weeklyValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  weeklyLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  weeklyDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  weekProgress: {
    marginTop: theme.spacing.md,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  typeStats: {
    gap: theme.spacing.md,
  },
  progressItem: {
    marginBottom: theme.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  achievements: {
    gap: theme.spacing.md,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.md,
  },
  achievementText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  achievementInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  achievementProgress: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});