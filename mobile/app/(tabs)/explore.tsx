import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';

export default function ExploreScreen() {
  const { currentTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: '1', name: 'Sprint Planning', icon: '🏃‍♂️', count: 12 },
    { id: '2', name: 'Backlog Refinement', icon: '📋', count: 8 },
    { id: '3', name: 'Feature Estimation', icon: '⭐', count: 15 },
    { id: '4', name: 'Bug Triage', icon: '🐛', count: 6 },
  ];

  const CategoryCard = ({ category }: any) => (
    <Pressable style={styles.categoryCard}>
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
        style={styles.categoryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryCount}>{category.count} rooms</Text>
      </LinearGradient>
    </Pressable>
  );

  return (
    <LinearGradient
      colors={currentTheme.colors.background as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Text style={styles.title}>🔍 Explore</Text>
          <Text style={styles.subtitle}>Discover planning poker rooms</Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.searchContainer}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
            style={styles.searchGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.searchIcon}>🔎</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search rooms..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </LinearGradient>
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>📁 Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <Animated.View
                key={category.id}
                entering={FadeInDown.delay(400 + index * 50)}
                style={{ flex: 1 }}
              >
                <CategoryCard category={category} />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Coming Soon */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
          <EmptyState
            emoji="🚧"
            title="Public Rooms Coming Soon"
            subtitle="Discover and join public planning poker rooms from the community"
          />
        </Animated.View>
      </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  categoryGradient: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
