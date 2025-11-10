import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Card from './ui/Card';
import { Workout } from '@/types/workout';
import { theme, workoutTypeColors } from '@/constants/theme';

interface WorkoutCardProps {
  workout: Workout;
  onPress?: () => void;
  showDate?: boolean;
}

export default function WorkoutCard({ workout, onPress, showDate = true }: WorkoutCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const renderFeeling = (feeling: number) => {
    const icons = ['😫', '😕', '😐', '😊', '💪'];
    return icons[feeling - 1] || '😐';
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.container, !workout.completed && styles.incompleteCard]}>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <View 
              style={[
                styles.typeIndicator, 
                { backgroundColor: workoutTypeColors[workout.type as keyof typeof workoutTypeColors] }
              ]} 
            />
            <Text style={styles.type}>{workout.type}</Text>
          </View>
          {showDate && (
            <Text style={styles.date}>{formatDate(workout.date)}</Text>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseCount}>
              {workout.exercises.length} упражнений
            </Text>
            <Text style={styles.duration}>
              {workout.duration} мин
            </Text>
          </View>

          <View style={styles.statusContainer}>
            {workout.completed ? (
              <View style={styles.completedStatus}>
                <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
                <Text style={styles.feeling}>{renderFeeling(workout.feeling)}</Text>
              </View>
            ) : (
              <View style={styles.pendingStatus}>
                <MaterialIcons name="schedule" size={20} color={theme.colors.warning} />
                <Text style={styles.pendingText}>В ожидании</Text>
              </View>
            )}
          </View>
        </View>

        {workout.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {workout.notes}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  incompleteCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  date: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  duration: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  completedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeling: {
    fontSize: 18,
    marginLeft: theme.spacing.sm,
  },
  pendingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 12,
    color: theme.colors.warning,
    marginLeft: theme.spacing.xs,
  },
  notes: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
});