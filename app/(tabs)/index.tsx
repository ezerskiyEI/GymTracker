import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image
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
import { MotivationService } from '@/services/motivationService';

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { workouts, schedules } = useWorkout();
  const { profile } = useUser();
  const [dailyQuote, setDailyQuote] = useState(MotivationService.getDailyQuote());
  const [weekProgress, setWeekProgress] = useState({ completed: 0, total: 0, percentage: 0 });

  useEffect(() => {
    calculateWeekProgress();
  }, [workouts]);

  const calculateWeekProgress = () => {
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
    const total = Math.max(weekWorkouts.length, schedules.filter(s => s.enabled).length, 3);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    setWeekProgress({ completed, total, percentage });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро!';
    if (hour < 18) return 'Добрый день!';
    return 'Добрый вечер!';
  };

  const getProgressColor = () => {
    if (weekProgress.percentage >= 80) return theme.colors.success;
    if (weekProgress.percentage >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  const getProgressMessage = () => {
    const { completed, total, percentage } = weekProgress;
    if (percentage >= 100) return '🎉 Отличная неделя! Все тренировки выполнены!';
    if (percentage >= 80) return '💪 Почти у цели! Продолжайте в том же духе!';
    if (percentage >= 50) return '⚡ Хороший темп! Не останавливайтесь!';
    if (completed > 0) return '🔥 Начало положено! Продолжайте двигаться!';
    return '🎯 Время начинать! Первая тренировка ждёт вас!';
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={theme.colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>
                {getGreeting()}{profile ? `, ${profile.name}` : ''}
              </Text>
              <Text style={styles.motivation}>Время для тренировки!</Text>
            </View>
            
            {profile && (
              <View style={styles.avatarContainer}>
                {profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('file')) ? (
                  <Image source={{ uri: profile.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarEmoji}>
                    <Text style={styles.avatarText}>{profile.avatar || '💪'}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.weekProgress}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Прогресс недели: {weekProgress.completed} из {weekProgress.total}
            </Text>
            <View style={[styles.progressBadge, { backgroundColor: getProgressColor() }]}>
              <Text style={styles.progressPercentage}>{weekProgress.percentage}%</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${weekProgress.percentage}%`,
                  backgroundColor: getProgressColor()
                }
              ]} 
            />
          </View>
          <Text style={styles.progressMessage}>{getProgressMessage()}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Card style={styles.quoteCard}>
          <View style={styles.quoteHeader}>
            <MaterialIcons name="format-quote" size={32} color={theme.colors.primary} />
            <Text style={styles.quoteTitle}>Цитата дня</Text>
          </View>
          <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
          <TouchableOpacity 
            style={styles.newQuoteButton}
            onPress={() => setDailyQuote(MotivationService.getRandomQuote())}
          >
            <MaterialIcons name="refresh" size={16} color={theme.colors.primary} />
            <Text style={styles.newQuoteText}>Новая цитата</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.nextWorkoutCard}>
          <View style={styles.nextWorkoutHeader}>
            <MaterialIcons name="fitness-center" size={24} color={theme.colors.primary} />
            <Text style={styles.nextWorkoutTitle}>Ближайшая тренировка</Text>
          </View>
          <Text style={styles.nextWorkoutTime}>Сегодня в 18:00</Text>
          <GradientButton
            title="Начать тренировку"
            onPress={() => router.push('/add')}
            size="large"
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Быстрые действия</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/add')}
          >
            <MaterialIcons name="add-circle" size={24} color={theme.colors.primary} />
            <Text style={styles.actionText}>Добавить тренировку вручную</Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/programs')}
          >
            <MaterialIcons name="library-books" size={24} color={theme.colors.secondary} />
            <Text style={styles.actionText}>Выбрать программу</Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/stats')}
          >
            <MaterialIcons name="show-chart" size={24} color={theme.colors.success} />
            <Text style={styles.actionText}>Посмотреть прогресс</Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/week-summary')}
          >
            <MaterialIcons name="emoji-events" size={24} color={theme.colors.warning} />
            <Text style={styles.actionText}>Итоги недели</Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
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
  header: {
    padding: theme.spacing.lg,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
  },
  headerContent: {
    marginBottom: theme.spacing.lg,
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: theme.spacing.xs,
  },
  motivation: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarEmoji: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  weekProgress: {
    marginTop: theme.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  progressBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  progressPercentage: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMessage: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    padding: theme.spacing.md,
  },
  quoteCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}05`,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  quoteText: {
    fontSize: 16,
    color: theme.colors.text,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: theme.spacing.sm,
  },
  quoteAuthor: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginBottom: theme.spacing.md,
  },
  newQuoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  newQuoteText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  nextWorkoutCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: `${theme.colors.success}05`,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  nextWorkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  nextWorkoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  nextWorkoutTime: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  actionText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
});