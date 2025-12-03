import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useRoom } from '@/contexts/RoomContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface RoomSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  initialSettings: {
    autoReveal: boolean;
    allowSpectators: boolean;
    timerDuration: number;
  };
  roomId: string;
}

export const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
  visible,
  onClose,
  onSave,
  initialSettings,
  roomId,
}) => {
  const { currentTheme } = useTheme();
  const { currentRoom } = useRoom();
  const [settings, setSettings] = useState(initialSettings);

  React.useEffect(() => {
    console.log("[RoomSettingsModal] useEffect triggered - visible:", visible);
    if (visible) {
      setSettings(initialSettings);
      
      // Use currentRoom from context if available and matches roomId
      if (currentRoom && currentRoom.id === roomId && currentRoom.settings) {
        console.log("[RoomSettingsModal] Using settings from currentRoom context:", currentRoom.settings);
        setSettings(currentRoom.settings);
      }
    }
  }, [visible, roomId, currentRoom]);

  const handleSave = () => {
    console.log("[RoomSettingsModal] handleSave called with settings:", settings);
    onSave(settings);
    onClose();
  };

  if (!visible) return null;

  const SettingRow = ({ icon, label, description, children }: any) => (
    <Animated.View entering={FadeInDown} style={styles.settingRow}>
      <LinearGradient
        colors={currentTheme.colors.cardBg as any}
        style={styles.settingGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.settingIcon}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <View>{children}</View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView
          intensity={20}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      </Pressable>

      <View style={styles.modalContainer} pointerEvents="box-none">
        <Pressable style={{flex: 1}} onPress={onClose}  />
        <Animated.View entering={FadeIn.delay(100)} style={styles.content}>
          <ScrollView 
            style={styles.mainScrollView}
            contentContainerStyle={styles.mainScrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <LinearGradient
              colors={currentTheme.colors.cardBg as any}
              style={styles.contentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerIcon}>⚙️</Text>
                <Text style={styles.title}>Room Settings</Text>
                <Text style={styles.subtitle}>Configure your room preferences</Text>
              </View>

              {/* Settings */}
              <View style={styles.settings}>
                <SettingRow
                  icon="🔄"
                  label="Auto Reveal Votes"
                  description="Reveal cards when everyone votes"
                >
                  <Switch
                    value={settings.autoReveal || false}
                    onValueChange={(val) => {
                      const newSettings = { ...settings, autoReveal: val };
                      if (!val) {
                        newSettings.timerDuration = 0;
                      }
                      setSettings(newSettings);
                    }}
                    trackColor={{ false: '#767577', true: currentTheme.colors.accent }}
                    thumbColor={settings.autoReveal ? currentTheme.colors.button[0] : '#f4f3f4'}
                  />
                </SettingRow>

                <SettingRow
                  icon="👥"
                  label="Allow Spectators"
                  description="Let users join without voting"
                >
                  <Switch
                    value={settings.allowSpectators !== false}
                    onValueChange={(val) => setSettings({ ...settings, allowSpectators: val })}
                    trackColor={{ false: '#767577', true: currentTheme.colors.accent }}
                    thumbColor={settings.allowSpectators !== false ? currentTheme.colors.button[0] : '#f4f3f4'}
                  />
                </SettingRow>

                <SettingRow
                  icon="⏱️"
                  label="Timer Duration"
                  description="Set to 0 to disable timer"
                >
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: currentTheme.colors.accent,
                        backgroundColor: `${currentTheme.colors.button[0]}1A`,
                      }
                    ]}
                    keyboardType="numeric"
                    value={(settings.timerDuration || 0).toString()}
                    onChangeText={(text) => setSettings({ ...settings, timerDuration: parseInt(text) || 0 })}
                    placeholderTextColor="#9CA3AF"
                  />
                </SettingRow>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Button 
                  title="Cancel" 
                  onPress={onClose} 
                  variant="outline" 
                  style={styles.button} 
                />
                <Button 
                  title="Save Changes" 
                  onPress={handleSave} 
                  style={styles.button} 
                />
              </View>
            </LinearGradient>
          </ScrollView>
        </Animated.View>
        <Pressable style={{flex: 1}} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: '80%',
    width: '100%',
  },
  mainScrollView: {
    flexGrow: 0,
  },
  mainScrollContent: {
    flexGrow: 1,
  },
  contentGradient: {
    padding: 28,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 24,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
    textAlign: 'center',
  },
  settings: {
    gap: 16,
  },
  settingRow: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    width: 80,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
});
