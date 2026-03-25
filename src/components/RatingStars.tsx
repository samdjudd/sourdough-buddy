import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';

interface RatingStarsProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: number;
  color?: string;
}

export function RatingStars({
  rating,
  onRate,
  size = 24,
  color = Colors.golden,
}: RatingStarsProps) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => {
        const icon =
          star <= rating
            ? 'star'
            : star - 0.5 <= rating
              ? 'star-half'
              : 'star-outline';
        return (
          <TouchableOpacity
            key={star}
            onPress={() => onRate?.(star)}
            disabled={!onRate}
            activeOpacity={onRate ? 0.7 : 1}
          >
            <Ionicons
              name={icon}
              size={size}
              color={color}
              style={styles.star}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});
