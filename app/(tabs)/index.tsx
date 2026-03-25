import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Starter, ActiveBake, BakeLogEntry } from '../../src/types';
import { getStarters, getActiveBakes, getBakeLog } from '../../src/storage/store';
import { formatTimeAgo } from '../../src/utils/time';

export default function HomeScreen() {
  const [starters, setStarters] = useState<Starter[]>([]);
  const [activeBakes, setActiveBakes] = useState<ActiveBake[]>([]);
  const [recentLogs, setRecentLogs] = useState<BakeLogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [s, b, l] = await Promise.all([
      getStarters(),
      getActiveBakes(),
      getBakeLog(),
    ]);
    setStarters(s);
    setActiveBakes(b.filter((bake) => !bake.isComplete));
    setRecentLogs(l.slice(0, 3));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStarterHealth = (starter: Starter) => {
    if (starter.feedings.length === 0) return { label: 'New', color: Colors.info };
    const lastFeeding = starter.feedings[0];
    const hoursSince = (Date.now() - lastFeeding.timestamp) / 3600000;
    if (hoursSince < 24) return { label: 'Active', color: Colors.success };
    if (hoursSince < 48) return { label: 'Hungry', color: Colors.warning };
    return { label: 'Neglected', color: Colors.error };
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Sourdough Buddy</Text>
          <Text style={styles.subtitle}>Your baking companion</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickAction
            icon="flask-outline"
            label="Feed Starter"
            onPress={() => router.push('/(tabs)/starter')}
          />
          <QuickAction
            icon="calculator-outline"
            label="Calculate"
            onPress={() => router.push('/(tabs)/calculator')}
          />
          <QuickAction
            icon="timer-outline"
            label="Start Bake"
            onPress={() => router.push('/(tabs)/timer')}
          />
          <QuickAction
            icon="book-outline"
            label="Log Bake"
            onPress={() => router.push('/(tabs)/log')}
          />
        </View>

        {/* Starter Status */}
        <Text style={styles.sectionTitle}>Starter Status</Text>
        {starters.length === 0 ? (
          <Card>
            <View style={styles.emptyCard}>
              <Ionicons name="flask-outline" size={32} color={Colors.wheat} />
              <Text style={styles.emptyText}>No starters yet</Text>
              <Button
                title="Add Your Starter"
                variant="secondary"
                size="sm"
                onPress={() => router.push('/(tabs)/starter')}
              />
            </View>
          </Card>
        ) : (
          starters.map((starter) => {
            const health = getStarterHealth(starter);
            const lastFed = starter.feedings[0];
            return (
              <Card key={starter.id} style={styles.starterCard}>
                <View style={styles.starterRow}>
                  <View style={styles.starterInfo}>
                    <Text style={styles.starterName}>{starter.name}</Text>
                    <Text style={styles.starterDetail}>
                      {starter.flourType} &middot;{' '}
                      {lastFed
                        ? `Fed ${formatTimeAgo(lastFed.timestamp)}`
                        : 'No feedings yet'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.healthBadge,
                      { backgroundColor: health.color + '20' },
                    ]}
                  >
                    <View
                      style={[styles.healthDot, { backgroundColor: health.color }]}
                    />
                    <Text style={[styles.healthLabel, { color: health.color }]}>
                      {health.label}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}

        {/* Active Bakes */}
        {activeBakes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Active Bakes</Text>
            {activeBakes.map((bake) => (
              <Card key={bake.id} style={styles.bakeCard}>
                <View style={styles.bakeRow}>
                  <View>
                    <Text style={styles.bakeName}>{bake.recipeName}</Text>
                    <Text style={styles.bakeStep}>
                      Step {bake.currentStepIndex + 1} of {bake.steps.length}:{' '}
                      {bake.steps[bake.currentStepIndex]?.name}
                    </Text>
                  </View>
                  <Button
                    title="View"
                    variant="ghost"
                    size="sm"
                    onPress={() => router.push('/(tabs)/timer')}
                  />
                </View>
              </Card>
            ))}
          </>
        )}

        {/* Recent Bakes */}
        {recentLogs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Bakes</Text>
            {recentLogs.map((entry) => (
              <Card key={entry.id} style={styles.logCard}>
                <Text style={styles.logName}>{entry.recipeName}</Text>
                <Text style={styles.logDetail}>
                  {entry.hydration}% hydration &middot;{' '}
                  {new Date(entry.date).toLocaleDateString()}
                </Text>
              </Card>
            ))}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.quickAction}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={24} color={Colors.amber} onPress={onPress} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
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
  greeting: {
    ...Typography.largeTitle,
  },
  subtitle: {
    ...Typography.callout,
    marginTop: Spacing.xs,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.espresso,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionLabel: {
    ...Typography.caption,
    marginTop: Spacing.xs,
    color: Colors.darkGray,
  },
  sectionTitle: {
    ...Typography.title3,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    ...Typography.callout,
  },
  starterCard: {
    marginBottom: Spacing.md,
  },
  starterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starterInfo: {
    flex: 1,
  },
  starterName: {
    ...Typography.headline,
  },
  starterDetail: {
    ...Typography.subhead,
    marginTop: 2,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  bakeCard: {
    marginBottom: Spacing.md,
  },
  bakeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bakeName: {
    ...Typography.headline,
  },
  bakeStep: {
    ...Typography.subhead,
    marginTop: 2,
  },
  logCard: {
    marginBottom: Spacing.md,
  },
  logName: {
    ...Typography.headline,
  },
  logDetail: {
    ...Typography.subhead,
    marginTop: 2,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
