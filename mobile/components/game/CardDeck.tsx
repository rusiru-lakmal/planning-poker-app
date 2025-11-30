import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { AnimatedCard } from './AnimatedCard';

interface CardDeckProps {
  deckType: string;
  selectedValue?: string | null;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const FIBONACCI = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?'];
const T_SHIRT = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?'];

export function CardDeck({ deckType, selectedValue, onSelect, disabled }: CardDeckProps) {
  const cards = deckType === 't-shirt' ? T_SHIRT : FIBONACCI;

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cards.map((value) => (
          <AnimatedCard 
            key={value} 
            value={value} 
            selected={selectedValue === value} 
            onPress={() => !disabled && onSelect(value)}
            disabled={disabled}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 140,
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 16,
  },
});
