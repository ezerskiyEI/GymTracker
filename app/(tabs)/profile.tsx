import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  Switch,
  TextInput,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@/hooks/useUser';
import { useLanguage } from '@/hooks/useLanguage';
import Card from '@/components/ui/Card';
import GradientButton from '@/components/ui/GradientButton';
import { theme } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';

const defaultAvatars = [
  '💪', '🏋️‍♂️', '🏋️‍♀️', '🤸‍♂️', '🤸‍♀️', '🏃‍♂️', '🏃‍♀️', '🚴‍♂️', '🚴‍♀️',
  '🧘‍♂️', '🧘‍♀️', '⭐', '🔥', '💯', '🎯', '🏆', '👑', '💎'
];

export default function SettingsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, updateProfile, logout, switchUser, getBackupProfiles } = useUser();
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [backupProfiles, setBackupProfiles] = useState<Array<{id: string, name: string, backupDate: string}>>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Edit profile form
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editGoal, setEditGoal] = useState('');
  const [editLevel, setEditLevel] = useState('');

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
      Alert.alert(title, message, buttons?.map(b => ({ text: b.text, onPress: b.onPress, style: b.style })));
    }
  };

  useEffect(() => {
    if (profile) {
      setEditName(profile.name);
      setEditAvatar(profile.avatar || '💪');
      setEditGoal(profile.goals.primaryGoal);
      setEditLevel(profile.level);
    }
  }, [profile]);

  useEffect(() => {
    loadBackupProfiles();
  }, []);

  const loadBackupProfiles = async () => {
    const profiles = await getBackupProfiles();
    setBackupProfiles(profiles);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    if (!editName.trim()) {
      showWebAlert('Ошибка', 'Введите имя пользователя');
      return;
    }

    try {
      setIsSavingProfile(true);
      const updatedProfile = {
        ...profile,
        name: editName.trim(),
        avatar: editAvatar,
        goals: {
          ...profile.goals,
          primaryGoal: editGoal as any
        },
        level: editLevel as any
      };

      await updateProfile(updatedProfile);
      setShowEditProfile(false);
      showWebAlert('Успех', 'Профиль обновлен!');
    } catch (error) {
      showWebAlert('Ошибка', 'Не удалось обновить профиль');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePickImageFromGallery = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showWebAlert('Ошибка', 'Необходимо разрешение для доступа к галерее');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setEditAvatar(result.assets[0].uri);
        setShowAvatarPicker(false);
      }
    } catch (error) {
      showWebAlert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showWebAlert('Ошибка', 'Необходимо разрешение для доступа к камере');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setEditAvatar(result.assets[0].uri);
        setShowAvatarPicker(false);
      }
    } catch (error) {
      showWebAlert('Ошибка', 'Не удалось сделать фото');
    }
  };

  const handleResetData = () => {
    showWebAlert(
      'Сброс данных',
      'Все данные будут удалены безвозвратно. Приложение вернется к первому запуску. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Сбросить', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/onboarding');
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    showWebAlert(
      t('logout'),
      'Ваши данные будут сохранены, и вы сможете вернуться к ним позже. Продолжить?',
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('logout'), 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/onboarding');
          }
        }
      ]
    );
  };

  const handleSwitchUser = async (profileId?: string) => {
    await switchUser(profileId);
    setShowUserSwitcher(false);
    if (profileId) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    await setLanguage(newLanguage as any);
    setShowLanguageSelector(false);
  };

  const formatBackupDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const goalTitles = {
    weight_loss: 'Похудение',
    muscle_gain: 'Набор массы',
    maintenance: 'Поддержание формы',
    endurance: 'Выносливость',
    strength: 'Сила'
  };

  const levelTitles = {
    beginner: 'Новичок',
    intermediate: 'Средний',
    advanced: 'Продвинутый'
  };

  const renderProfileEditor = () => (
    <Modal
      visible={showEditProfile}
      transparent
      animationType="slide"
      onRequestClose={() => setShowEditProfile(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Редактировать профиль</Text>
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            {/* Avatar Section */}
            <Text style={styles.fieldLabel}>Аватар</Text>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => setShowAvatarPicker(true)}
            >
              {editAvatar.startsWith('http') || editAvatar.startsWith('file') ? (
                <Image source={{ uri: editAvatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarEmoji}>{editAvatar}</Text>
              )}
              <View style={styles.cameraIcon}>
                <MaterialIcons name="camera-alt" size={20} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>

            {/* Name */}
            <Text style={styles.fieldLabel}>Имя *</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Ваше имя"
              placeholderTextColor={theme.colors.textSecondary}
            />

            {/* Goal */}
            <Text style={styles.fieldLabel}>Цель</Text>
            <View style={styles.selectContainer}>
              {Object.entries(goalTitles).map(([key, title]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.selectOption,
                    editGoal === key && styles.selectedOption
                  ]}
                  onPress={() => setEditGoal(key)}
                >
                  <Text style={[
                    styles.selectText,
                    editGoal === key && styles.selectedText
                  ]}>
                    {title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Level */}
            <Text style={styles.fieldLabel}>Уровень</Text>
            <View style={styles.selectContainer}>
              {Object.entries(levelTitles).map(([key, title]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.selectOption,
                    editLevel === key && styles.selectedOption
                  ]}
                  onPress={() => setEditLevel(key)}
                >
                  <Text style={[
                    styles.selectText,
                    editLevel === key && styles.selectedText
                  ]}>
                    {title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowEditProfile(false)}
              disabled={isSavingProfile}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <GradientButton
              title={isSavingProfile ? 'Сохранение...' : 'Сохранить'}
              onPress={handleSaveProfile}
              size="medium"
              disabled={isSavingProfile}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAvatarPicker = () => (
    <Modal
      visible={showAvatarPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAvatarPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Выбор аватара</Text>
            <TouchableOpacity onPress={() => setShowAvatarPicker(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.avatarGrid}>
            {/* Photo Options */}
            <View style={styles.photoOptionsContainer}>
              <TouchableOpacity
                style={styles.photoOption}
                onPress={handlePickImageFromGallery}
              >
                <MaterialIcons name="photo-library" size={32} color={theme.colors.primary} />
                <Text style={styles.photoOptionText}>Из галереи</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoOption}
                onPress={handleTakePhoto}
              >
                <MaterialIcons name="photo-camera" size={32} color={theme.colors.secondary} />
                <Text style={styles.photoOptionText}>Сделать фото</Text>
              </TouchableOpacity>
            </View>

            {/* Emoji Avatars */}
            <View style={styles.emojiSection}>
              <Text style={styles.sectionTitle}>Стандартные аватары</Text>
              <View style={styles.emojiGrid}>
                {defaultAvatars.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.avatarOption,
                      editAvatar === emoji && styles.selectedAvatar
                    ]}
                    onPress={() => {
                      setEditAvatar(emoji);
                      setShowAvatarPicker(false);
                    }}
                  >
                    <Text style={styles.avatarOptionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderLanguageSelector = () => (
    <Modal
      visible={showLanguageSelector}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLanguageSelector(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('changeLanguage')}</Text>
            <TouchableOpacity onPress={() => setShowLanguageSelector(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.languageList}>
            {availableLanguages.map((lang) => (
              <TouchableOpacity
                key={lang.key}
                style={[
                  styles.languageItem,
                  language === lang.key && styles.currentLanguage
                ]}
                onPress={() => handleLanguageChange(lang.key)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <View style={styles.languageInfo}>
                  <Text style={[
                    styles.languageName,
                    language === lang.key && styles.currentLanguageText
                  ]}>
                    {lang.name}
                  </Text>
                </View>
                {language === lang.key && (
                  <MaterialIcons name="check-circle" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderUserSwitcher = () => (
    <Modal
      visible={showUserSwitcher}
      transparent
      animationType="slide"
      onRequestClose={() => setShowUserSwitcher(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('changeUser')}</Text>
            <TouchableOpacity onPress={() => setShowUserSwitcher(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.userList}>
            {/* Create new user option */}
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => handleSwitchUser()}
            >
              <MaterialIcons name="person-add" size={32} color={theme.colors.primary} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>Создать нового пользователя</Text>
                <Text style={styles.userDate}>Начать с чистого листа</Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {/* Existing users */}
            {backupProfiles.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userItem,
                  profile?.id === user.id && styles.currentUser
                ]}
                onPress={() => handleSwitchUser(user.id)}
              >
                <MaterialIcons 
                  name="person" 
                  size={32} 
                  color={profile?.id === user.id ? theme.colors.primary : theme.colors.textSecondary} 
                />
                <View style={styles.userInfo}>
                  <Text style={[
                    styles.userName,
                    profile?.id === user.id && styles.currentUserText
                  ]}>
                    {user.name}
                  </Text>
                  <Text style={styles.userDate}>
                    Последнее использование: {formatBackupDate(user.backupDate)}
                  </Text>
                </View>
                {profile?.id === user.id && (
                  <MaterialIcons name="check-circle" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Current User Profile */}
        <Card style={styles.profileCard}>
          <View style={styles.userProfile}>
            <View style={styles.avatarSection}>
              {profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('file')) ? (
                <Image source={{ uri: profile.avatar }} style={styles.profileAvatar} />
              ) : (
                <View style={styles.profileAvatarContainer}>
                  <Text style={styles.profileAvatarEmoji}>{profile.avatar || '💪'}</Text>
                </View>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.currentUserName}>{profile.name}</Text>
                            
              <Text style={styles.memberSince}>
                Пользователь с {new Date(profile.createdAt).toLocaleDateString('ru-RU')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowEditProfile(true)}
            >
              <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Account Settings */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>👤 Аккаунт</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowEditProfile(true)}
          >
            <MaterialIcons name="person" size={24} color={theme.colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Редактировать профиль</Text>
              <Text style={styles.settingDescription}>
                Изменить имя, аватар, цель и уровень
              </Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              loadBackupProfiles();
              setShowUserSwitcher(true);
            }}
          >
            <MaterialIcons name="swap-horiz" size={24} color={theme.colors.secondary} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>{t('changeUser')}</Text>
              <Text style={styles.settingDescription}>
                Переключиться между профилями или создать новый
              </Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* App Settings */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⚙️ Настройки приложения</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowLanguageSelector(true)}
          >
            <MaterialIcons name="language" size={24} color={theme.colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>{t('changeLanguage')}</Text>
              <Text style={styles.settingDescription}>
                Текущий: {availableLanguages.find(l => l.key === language)?.name}
              </Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

<View style={styles.settingItem}>
            <MaterialIcons name="notifications" size={24} color={theme.colors.success} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>{t('notifications')}</Text>
              <Text style={styles.settingDescription}>
                Уведомления о тренировках
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🚀 Быстрые действия</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/onboarding')}
          >
            <MaterialIcons name="refresh" size={24} color={theme.colors.secondary} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Изменить цели</Text>
              <Text style={styles.settingDescription}>
                Обновить цели и получить новые рекомендации
              </Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleResetData}
          >
            <MaterialIcons name="restore" size={24} color={theme.colors.warning} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Сброс данных</Text>
              <Text style={styles.settingDescription}>
                Удалить все данные и вернуться к первому запуску
              </Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* App Info */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>ℹ️ О приложении</Text>
          
          <View style={styles.settingItem}>
            <MaterialIcons name="info" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>GymTracker Ultimate</Text>
              <Text style={styles.settingDescription}>Версия 2.1.0</Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <MaterialIcons name="storage" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Локальное хранение</Text>
              <Text style={styles.settingDescription}>
                Все данные хранятся на вашем устройстве
              </Text>
            </View>
          </View>
        </Card>

        {/* Logout */}
        <Card style={styles.logoutCard}>
          <Text style={[styles.sectionTitle, styles.logoutTitle]}>🚪 Выход</Text>
          <Text style={styles.logoutDescription}>
            Ваши данные будут сохранены и доступны при следующем входе
          </Text>
          
          <GradientButton
            title={t('logout')}
            onPress={handleLogout}
            size="large"
          />
        </Card>
      </ScrollView>

      {/* Modals */}
      {renderProfileEditor()}
      {renderAvatarPicker()}
      {renderLanguageSelector()}
      {renderUserSwitcher()}

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
  profileCard: {
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSection: {
    marginRight: theme.spacing.md,
  },
  profileAvatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileAvatarEmoji: {
    fontSize: 32,
  },
  userDetails: {
    flex: 1,
  },
  currentUserName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  userGoal: {
    fontSize: 16,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  logoutCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    marginBottom: theme.spacing.xl,
  },
  logoutTitle: {
    color: theme.colors.error,
  },
  logoutDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
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
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  selectContainer: {
    gap: theme.spacing.sm,
  },
  selectOption: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  selectedOption: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  selectText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  selectedText: {
    color: theme.colors.primary,
    fontWeight: '600',
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
  avatarGrid: {
    padding: theme.spacing.lg,
  },
  photoOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.xl,
  },
  photoOption: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}10`,
    minWidth: 120,
  },
  photoOptionText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
    fontWeight: '500',
  },
  emojiSection: {
    marginTop: theme.spacing.lg,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'center',
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatar: {
    borderColor: theme.colors.primary,
  },
  avatarOptionEmoji: {
    fontSize: 24,
  },
  languageList: {
    padding: theme.spacing.lg,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  currentLanguage: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  currentLanguageText: {
    color: theme.colors.primary,
  },
  userList: {
    maxHeight: 400,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  currentUser: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  userInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  currentUserText: {
    color: theme.colors.primary,
  },
  userDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});