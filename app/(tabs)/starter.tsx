import React, { useCallback, useState } from 'react';
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
import { InputField } from '../../src/components/InputField';
import { EmptyState } from '../../src/components/EmptyState';
import { Starter, StarterFeeding } from '../../src/types';
import { getStarters, saveStarter, deleteStarter } from '../../src/storage/store';
import { generateId } from '../../src/utils/id';
import { formatTimeAgo, formatDate } from '../../src/utils/time';

export default function StarterScreen() {
  const [starters, setStarters] = useState<Starter[]>([]);
  const [showNewStarter, setShowNewStarter] = useState(false);
  const [showFeeding, setShowFeeding] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newFlour, setNewFlour] = useState('');
  const [feedFlourType, setFeedFlourType] = useState('');
  const [feedFlourGrams, setFeedFlourGrams] = useState('');
  const [feedWaterGrams, setFeedWaterGrams] = useState('');
  const [feedStarterGrams, setFeedStarterGrams] = useState('');
  const [feedNotes, setFeedNotes] = useState('');

  const loadStarters = useCallback(async () => {
    const data = await getStarters();
    setStarters(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStarters();
    }, [loadStarters])
  );

  const handleCreateStarter = async () => {
    if (!newName.trim()) return;
    const starter: Starter = {
      id: generateId(),
      name: newName.trim(),
      createdAt: Date.now(),
      flourType: newFlour.trim() || 'All-purpose',
      feedings: [],
    };
    await saveStarter(starter);
    setNewName('');
    setNewFlour('');
    setShowNewStarter(false);
    loadStarters();
  };

  const handleLogFeeding = async () => {
    if (!showFeeding) return;
    const starter = starters.find((s) => s.id === showFeeding);
    if (!starter) return;

    const feeding: StarterFeeding = {
      id: generateId(),
      timestamp: Date.now(),
      flourType: feedFlourType.trim() || starter.flourType,
      flourGrams: parseInt(feedFlourGrams) || 50,
      waterGrams: parseInt(feedWaterGrams) || 50,
      starterGrams: parseInt(feedStarterGrams) || 50,
      notes: feedNotes.trim() || undefined,
    };

    starter.feedings.unshift(feeding);
    await saveStarter(starter);
    setShowFeeding(null);
    setFeedFlourType('');
    setFeedFlourGrams('');
    setFeedWaterGrams('');
    setFeedStarterGrams('');
    setFeedNotes('');
    loadStarters();
  };

  const handleDeleteStarter = (id: string, name: string) => {
    Alert.alert('Delete Starter', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteStarter(id);
          loadStarters();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Starter</Text>
          <Button
            title="+ New Starter"
            variant="primary"
            size="sm"
            onPress={() => setShowNewStarter(true)}
          />
        </View>

        {starters.length === 0 ? (
          <EmptyState
            icon="flask-outline"
            title="No Starters Yet"
            message="Add your sourdough starter to track feedings and monitor its health over time."
          />
        ) : (
          starters.map((starter) => {
            const lastFed = starter.feedings[0];
            return (
              <Card key={starter.id} style={styles.starterCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.starterName}>{starter.name}</Text>
                    <Text style={styles.starterMeta}>
                      {starter.flourType} &middot; Created{' '}
                      {formatDate(starter.createdAt)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      handleDeleteStarter(starter.id, starter.name)
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={Colors.gray}
                    />
                  </TouchableOpacity>
                </View>

                {lastFed && (
                  <View style={styles.lastFeeding}>
                    <Text style={styles.lastFeedLabel}>Last feeding</Text>
                    <Text style={styles.lastFeedTime}>
                      {formatTimeAgo(lastFed.timestamp)}
                    </Text>
                    <Text style={styles.lastFeedDetail}>
                      {lastFed.starterGrams}g starter + {lastFed.flourGrams}g{' '}
                      {lastFed.flourType} + {lastFed.waterGrams}g water
                    </Text>
                  </View>
                )}

                <View style={styles.feedingHistory}>
                  <Text style={styles.historyLabel}>
                    {starter.feedings.length} feeding
                    {starter.feedings.length !== 1 ? 's' : ''} logged
                  </Text>
                </View>

                <Button
                  title="Log Feeding"
                  variant="secondary"
                  size="md"
                  onPress={() => {
                    setShowFeeding(starter.id);
                    setFeedFlourType(starter.flourType);
                  }}
                  style={styles.feedButton}
                />
              </Card>
            );
          })
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* New Starter Modal */}
      <Modal visible={showNewStarter} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewStarter(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Starter</Text>
            <TouchableOpacity onPress={handleCreateStarter}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <InputField
              label="Starter Name"
              placeholder="e.g., Old Reliable"
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <InputField
              label="Primary Flour"
              placeholder="e.g., Whole wheat"
              value={newFlour}
              onChangeText={setNewFlour}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Log Feeding Modal */}
      <Modal
        visible={showFeeding !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFeeding(null)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Log Feeding</Text>
            <TouchableOpacity onPress={handleLogFeeding}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <InputField
              label="Flour Type"
              placeholder="All-purpose"
              value={feedFlourType}
              onChangeText={setFeedFlourType}
            />
            <InputField
              label="Starter Amount"
              suffix="g"
              placeholder="50"
              value={feedStarterGrams}
              onChangeText={setFeedStarterGrams}
              keyboardType="numeric"
            />
            <InputField
              label="Flour Amount"
              suffix="g"
              placeholder="50"
              value={feedFlourGrams}
              onChangeText={setFeedFlourGrams}
              keyboardType="numeric"
            />
            <InputField
              label="Water Amount"
              suffix="g"
              placeholder="50"
              value={feedWaterGrams}
              onChangeText={setFeedWaterGrams}
              keyboardType="numeric"
            />
            <InputField
              label="Notes"
              placeholder="How does it look? Any observations..."
              value={feedNotes}
              onChangeText={setFeedNotes}
              multiline
              numberOfLines={3}
            />
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
  starterCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  starterName: {
    ...Typography.title2,
  },
  starterMeta: {
    ...Typography.subhead,
    marginTop: 2,
  },
  lastFeeding: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  lastFeedLabel: {
    ...Typography.footnote,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lastFeedTime: {
    ...Typography.headline,
    marginTop: 2,
  },
  lastFeedDetail: {
    ...Typography.subhead,
    marginTop: 2,
  },
  feedingHistory: {
    marginTop: Spacing.md,
  },
  historyLabel: {
    ...Typography.footnote,
  },
  feedButton: {
    marginTop: Spacing.md,
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
  modalSave: {
    ...Typography.body,
    color: Colors.amber,
    fontWeight: '600',
  },
  modalContent: {
    padding: Spacing.lg,
  },
});
