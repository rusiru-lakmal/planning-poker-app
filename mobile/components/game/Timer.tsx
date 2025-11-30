import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TimerProps {
  startTime?: string | Date;
  duration: number;
  status: 'running' | 'paused' | 'stopped';
  onTimerExpire?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ startTime, duration, status, onTimerExpire }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (status === 'stopped') {
      setTimeLeft(duration);
      return;
    }

    if (status === 'paused') {
      // In a real app, we'd need the pausedAt time to calculate correctly
      return;
    }

    if (!startTime) return;

    const start = typeof startTime === 'string' ? new Date(startTime).getTime() : startTime.getTime();
    const end = start + duration * 1000;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const remaining = Math.ceil((end - now) / 1000);

      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        if (onTimerExpire) {
          onTimerExpire();
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration, status, onTimerExpire]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'stopped' && duration === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[
        styles.timerText,
        timeLeft <= 10 && status === 'running' && styles.urgent
      ]}>
        {formatTime(timeLeft)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: '#000000',
  },
  urgent: {
    color: '#FF3B30',
  },
});
