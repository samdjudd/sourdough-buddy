import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/EmptyState';
import { ActiveBake, BakeStep } from '../../src/types';
import {
  getActiveBakes,
  saveActiveBake,
  deleteActiveBake,
} from '../../src/storage/store';
import { generateId } from '../../src/utils/id';
import { formatDuration } from '../../src/utils/time';

const PRESET_RECIPES = [
  {
    name: 'Basic Country Loaf',
    steps: [
      { name: 'Autolyse', description: 'Mix flour and water, let rest', durationMinutes: 60, type: 'bulk' as const },
      { name: 'Add starter & salt', description: 'Mix in levain and salt, pinch and fold until combined', durationMinutes: 10, type: 'fold' as const },
      { name: 'Stretch & Fold 1', description: 'Stretch and fold from all 4 sides', durationMinutes: 30, type: 'fold' as const },
      { name: 'Stretch & Fold 2', description: 'Stretch and fold from all 4 sides', durationMinutes: 30, type: 'fold' as const },
      { name: 'Stretch & Fold 3', description: 'Stretch and fold from all 4 sides', durationMinutes: 30, type: 'fold' as const },
      { name: 'Stretch & Fold 4', description: 'Stretch and fold from all 4 sides', durationMinutes: 30, type: 'fold' as const },
      { name: 'Bulk Ferment', description: 'Let dough rise until 50-75% increase in volume', durationMinutes: 120, type: 'bulk' as const },
      { name: 'Pre-shape', description: 'Gently shape into a round, rest on bench', durationMinutes: 20, type: 'shape' as const },
      { name: 'Final Shape', description: 'Shape into batard or boule, place in banneton', durationMinutes: 10, type: 'shape' as const },
      { name: 'Cold Proof', description: 'Refrigerate overnight (8-14 hours)', durationMinutes: 720, type: 'proof' as const },
      { name: 'Preheat Oven', description: 'Preheat Dutch oven to 500°F / 260°C', durationMinutes: 60, type: 'bake' as const },
      { name: 'Bake (covered)', description: 'Score and bake in covered Dutch oven', durationMinutes: 20, type: 'bake' as const },
      { name: 'Bake (uncovered)', description: 'Remove lid, bake until deep golden brown', durationMinutes: 25, type: 'bake' as const },
      { name: 'Cool', description: 'Cool on wire rack — resist cutting!', durationMinutes: 60, type: 'cool' as const },
    ],
  },
  {
    name: 'Same-Day Loaf',
    steps: [
      { name: 'Mix dough', description: 'Combine all ingredients', durationMinutes: 15, type: 'bulk' as const },
      { name: 'Stretch & Fold 1', description: 'Stretch and fold from all 4 sides', durationMinutes: 30, type: 'fold' as const },
      { name: 'Stretch & Fold 2', description: 'Stretch and fold from all 4 sides', durationMinutes: 30, type: 'fold' as const },
      { name: 'Stretch & Fold 3', description: 'Stretch and fold from all 4 sides', durationMinutes: 30, type: 'fold' as const },
      { name: 'Bulk Ferment', description: 'Wait for 75% rise at warm temp', durationMinutes: 180, type: 'bulk' as const },
      { name: 'Shape', description: 'Pre-shape, rest 15 min, then final shape', durationMinutes: 30, type: 'shape' as const },
      { name: 'Proof', description: 'Room temperature proof until puffy', durationMinutes: 90, type: 'proof' as const },
      { name: 'Preheat & Bake', description: 'Preheat Dutch oven, score, bake covered 20 min then uncovered 25 min', durationMinutes: 105, type: 'bake' as const },
      { name: 'Cool', description: 'Cool on wire rack at least 1 hour', durationMinutes: 60, type: 'cool' as const },
    ],
  },
];

export default function TimerScreen() {
  const [activeBakes, setActiveBakes] = useState<ActiveBake[]>([]);
  const [showPresets, setShowPresets] = useState(false);
  const [elapsed, setElapsed] = useState<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const loadBakes = useCallback(async () => {
    const bakes = await getActiveBakes();
    setActiveBakes(bakes.filter((b) => !b.isComplete));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBakes();
    }, [loadBakes])
  );

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const newElapsed: Record<string, number> = {};
      activeBakes.forEach((bake) => {
        if (!bake.isPaused && bake.stepStartedAt) {
          newElapsed[bake.id] = Math.floor((now - bake.stepStartedAt) / 60000);
        }
      });
      setElapsed(newElapsed);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [activeBakes]);

  const startBake = async (presetIndex: number) => {
    const preset = PRESET_RECIPES[presetIndex];
    const bake: ActiveBake = {
      id: generateId(),
      recipeName: preset.name,
      startedAt: Date.now(),
      currentStepIndex: 0,
      steps: preset.steps.map((s) => ({ ...s, id: generateId() })),
      stepStartedAt: Date.now(),
      isPaused: false,
      isComplete: false,
    };
    await saveActiveBake(bake);
    setShowPresets(false);
    loadBakes();
  };

  const advanceStep = async (bake: ActiveBake) => {
    if (bake.currentStepIndex >= bake.steps.length - 1) {
      bake.isComplete = true;
      await saveActiveBake(bake);
    } else {
      bake.currentStepIndex += 1;
      bake.stepStartedAt = Date.now();
      await saveActiveBake(bake);
    }
    loadBakes();
  };

  const togglePause = async (bake: ActiveBake) => {
    bake.isPaused = !bake.isPaused;
    if (!bake.isPaused) {
      bake.stepStartedAt = Date.now();
    }
    await saveActiveBake(bake);
    loadBakes();
  };

  const cancelBake = (bake: ActiveBake) => {
    Alert.alert('Cancel Bake', 'Are you sure you want to cancel this bake?', [
      { text: 'Keep Going', style: 'cancel' },
      {
        text: 'Cancel Bake',
        style: 'destructive',
        onPress: async () => {
          await deleteActiveBake(bake.id);
          loadBakes();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Timer</Text>
          <Button
            title="+ New Bake"
            variant="primary"
            size="sm"
            onPress={() => setShowPresets(true)}
          />
        </View>

        {activeBakes.length === 0 ? (
          <EmptyState
            icon="timer-outline"
            title="No Active Bakes"
            message="Start a guided bake with step-by-step timers. Choose from preset recipes or create your own schedule."
          />
        ) : (
          activeBakes.map((bake) => {
            const currentStep = bake.steps[bake.currentStepIndex];
            const elapsedMins = elapsed[bake.id] || 0;
            const remaining = Math.max(0, currentStep.durationMinutes - elapsedMins);
            const progress = Math.min(
              1,
              elapsedMins / currentStep.durationMinutes
            );

            return (
              <Card key={bake.id} style={styles.bakeCard}>
                <View style={styles.bakeHeader}>
                  <Text style={styles.bakeName}>{bake.recipeName}</Text>
                  <TouchableOpacity onPress={() => cancelBake(bake)}>
                    <Ionicons name="close-circle-outline" size={24} color={Colors.gray} />
                  </TouchableOpacity>
                </View>

                <View style={styles.stepInfo}>
                  <Text style={styles.stepCount}>
                    Step {bake.currentStepIndex + 1} of {bake.steps.length}
                  </Text>
                  <Text style={styles.stepName}>{currentStep.name}</Text>
                  <Text style={styles.stepDesc}>{currentStep.description}</Text>
                </View>

                <View style={styles.timerContainer}>
                  <Text
                    style={[
                      styles.timerText,
                      remaining === 0 && styles.timerDone,
                    ]}
                  >
                    {remaining === 0
                      ? 'Done!'
                      : formatDuration(remaining) + ' left'}
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progress * 100}%`,
                          backgroundColor:
                            remaining === 0 ? Colors.success : Colors.amber,
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.bakeActions}>
                  <Button
                    title={bake.isPaused ? 'Resume' : 'Pause'}
                    variant="secondary"
                    size="sm"
                    onPress={() => togglePause(bake)}
                    style={styles.actionButton}
                  />
                  <Button
                    title={
                      bake.currentStepIndex >= bake.steps.length - 1
                        ? 'Finish'
                        : 'Next Step'
                    }
                    variant="primary"
                    size="sm"
                    onPress={() => advanceStep(bake)}
                    style={styles.actionButton}
                  />
                </View>

                {/* Step overview */}
                <View style={styles.stepsOverview}>
                  {bake.steps.map((step, i) => (
                    <View
                      key={step.id}
                      style={[
                        styles.stepDot,
                        i < bake.currentStepIndex && styles.stepDotDone,
                        i === bake.currentStepIndex && styles.stepDotActive,
                      ]}
                    />
                  ))}
                </View>
              </Card>
            );
          })
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Preset Selection Modal */}
      <Modal
        visible={showPresets}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPresets(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Choose Recipe</Text>
            <View style={{ width: 50 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {PRESET_RECIPES.map((recipe, index) => {
              const totalTime = recipe.steps.reduce(
                (sum, s) => sum + s.durationMinutes,
                0
              );
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => startBake(index)}
                  activeOpacity={0.7}
                >
                  <Card style={styles.presetCard}>
                    <Text style={styles.presetName}>{recipe.name}</Text>
                    <Text style={styles.presetMeta}>
                      {recipe.steps.length} steps &middot;{' '}
                      {formatDuration(totalTime)} total
                    </Text>
                    <View style={styles.presetSteps}>
                      {recipe.steps.map((step, i) => (
                        <View key={i} style={styles.presetStep}>
                          <View
                            style={[
                              styles.presetStepDot,
                              {
                                backgroundColor:
                                  step.type === 'bake'
                                    ? Colors.error
                                    : step.type === 'fold'
                                      ? Colors.info
                                      : step.type === 'proof'
                                        ? Colors.success
                                        : Colors.amber,
                              },
                            ]}
                          />
                          <Text style={styles.presetStepText}>
                            {step.name} ({formatDuration(step.durationMinutes)})
                          </Text>
                        </View>
                      ))}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.largeTitle,
  },
  bakeCard: {
    marginBottom: Spacing.lg,
  },
  bakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bakeName: {
    ...Typography.title2,
  },
  stepInfo: {
    marginTop: Spacing.md,
  },
  stepCount: {
    ...Typography.footnote,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepName: {
    ...Typography.title3,
    marginTop: 4,
  },
  stepDesc: {
    ...Typography.callout,
    marginTop: 4,
    lineHeight: 22,
  },
  timerContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.amber,
    marginBottom: Spacing.md,
  },
  timerDone: {
    color: Colors.success,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  bakeActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  stepsOverview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
  },
  stepDotDone: {
    backgroundColor: Colors.success,
  },
  stepDotActive: {
    backgroundColor: Colors.amber,
    width: 20,
    borderRadius: 4,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalTitle: {
    ...Typography.headline,
  },
  modalCancel: {
    ...Typography.body,
    color: Colors.darkGray,
  },
  modalContent: {
    padding: Spacing.lg,
  },
  presetCard: {
    marginBottom: Spacing.md,
  },
  presetName: {
    ...Typography.title3,
  },
  presetMeta: {
    ...Typography.subhead,
    marginTop: 4,
  },
  presetSteps: {
    marginTop: Spacing.md,
    gap: 6,
  },
  presetStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  presetStepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  presetStepText: {
    ...Typography.footnote,
    color: Colors.darkGray,
  },
});
