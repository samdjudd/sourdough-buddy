import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { InputField } from '../../src/components/InputField';
import { calculateRecipe, formatWeight } from '../../src/utils/recipe';

export default function CalculatorScreen() {
  const [totalWeight, setTotalWeight] = useState('900');
  const [hydration, setHydration] = useState('75');
  const [saltPercent, setSaltPercent] = useState('2');
  const [starterPercent, setStarterPercent] = useState('20');

  const recipe = useMemo(() => {
    const weight = parseInt(totalWeight) || 0;
    const hydro = parseInt(hydration) || 0;
    const salt = parseFloat(saltPercent) || 0;
    const starter = parseInt(starterPercent) || 0;
    if (weight === 0) return null;
    return calculateRecipe(weight, hydro, salt, starter);
  }, [totalWeight, hydration, saltPercent, starterPercent]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Calculator</Text>
          <Text style={styles.subtitle}>
            Enter your target dough weight and ratios
          </Text>
        </View>

        <Card style={styles.inputCard}>
          <InputField
            label="Total Dough Weight"
            suffix="g"
            value={totalWeight}
            onChangeText={setTotalWeight}
            keyboardType="numeric"
            placeholder="900"
          />
          <InputField
            label="Hydration"
            suffix="%"
            value={hydration}
            onChangeText={setHydration}
            keyboardType="numeric"
            placeholder="75"
          />
          <InputField
            label="Salt"
            suffix="%"
            value={saltPercent}
            onChangeText={setSaltPercent}
            keyboardType="numeric"
            placeholder="2"
          />
          <InputField
            label="Starter (Levain)"
            suffix="%"
            value={starterPercent}
            onChangeText={setStarterPercent}
            keyboardType="numeric"
            placeholder="20"
          />
        </Card>

        {recipe && (
          <>
            <Text style={styles.sectionTitle}>Your Recipe</Text>
            <Card style={styles.resultCard}>
              <IngredientRow
                icon="leaf-outline"
                label="Bread Flour"
                amount={formatWeight(recipe.flour)}
                color={Colors.amber}
              />
              <IngredientRow
                icon="water-outline"
                label="Water"
                amount={formatWeight(recipe.water)}
                color={Colors.info}
              />
              <IngredientRow
                icon="flask-outline"
                label="Starter"
                amount={formatWeight(recipe.starter)}
                color={Colors.success}
              />
              <IngredientRow
                icon="cube-outline"
                label="Salt"
                amount={formatWeight(recipe.salt)}
                color={Colors.darkGray}
                isLast
              />
            </Card>

            <Card style={styles.totalCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Dough</Text>
                <Text style={styles.totalAmount}>
                  {formatWeight(
                    recipe.flour + recipe.water + recipe.starter + recipe.salt
                  )}
                </Text>
              </View>
            </Card>

            <Card style={styles.tipsCard}>
              <View style={styles.tipHeader}>
                <Ionicons name="bulb-outline" size={20} color={Colors.golden} />
                <Text style={styles.tipTitle}>Baker's Tips</Text>
              </View>
              <Text style={styles.tipText}>
                {parseInt(hydration) >= 80
                  ? 'High hydration dough — expect a wet, extensible dough. Use wet hands and a bench scraper for shaping.'
                  : parseInt(hydration) >= 70
                    ? 'Medium-high hydration — a good balance of open crumb and workability. Great for beginners.'
                    : parseInt(hydration) >= 65
                      ? 'Medium hydration — a firmer dough, easier to shape. Good for sandwich loaves.'
                      : 'Lower hydration — a stiff dough. Consider longer bulk fermentation for better flavor development.'}
              </Text>
            </Card>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function IngredientRow({
  icon,
  label,
  amount,
  color,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  amount: string;
  color: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.ingredientRow, !isLast && styles.ingredientBorder]}>
      <View style={styles.ingredientLeft}>
        <View style={[styles.ingredientIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.ingredientLabel}>{label}</Text>
      </View>
      <Text style={styles.ingredientAmount}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.largeTitle,
  },
  subtitle: {
    ...Typography.callout,
    marginTop: Spacing.xs,
  },
  inputCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.title3,
    marginBottom: Spacing.md,
  },
  resultCard: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  ingredientBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  ingredientIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientLabel: {
    ...Typography.body,
  },
  ingredientAmount: {
    ...Typography.title3,
    color: Colors.amber,
  },
  totalCard: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.amber,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...Typography.headline,
    color: Colors.white,
  },
  totalAmount: {
    ...Typography.title2,
    color: Colors.white,
  },
  tipsCard: {
    marginBottom: Spacing.md,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tipTitle: {
    ...Typography.headline,
    color: Colors.golden,
  },
  tipText: {
    ...Typography.body,
    lineHeight: 24,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
