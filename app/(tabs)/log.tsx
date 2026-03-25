import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { InputField } from '../../src/components/InputField';
import { RatingStars } from '../../src/components/RatingStars';
import { EmptyState } from '../../src/components/EmptyState';
import { BakeLogEntry } from '../../src/types';
import { getBakeLog, saveBakeLogEntry, deleteBakeLogEntry } from '../../src/storage/store';
import { generateId } from '../../src/utils/id';
import { formatDate } from '../../src/utils/time';

export default function LogScreen() {
  const [entries, setEntries] = useState<BakeLogEntry[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [hydration, setHydration] = useState('75');
  const [flourTypes, setFlourTypes] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [crumbRating, setCrumbRating] = useState(0);
  const [tasteRating, setTasteRating] = useState(0);
  const [riseRating, setRiseRating] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [wouldChange, setWouldChange] = useState('');

  const loadEntries = useCallback(async () => {
    const data = await getBakeLog();
    setEntries(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const resetForm = () => {
    setRecipeName('');
    setHydration('75');
    setFlourTypes('');
    setTotalWeight('');
    setCrumbRating(0);
    setTasteRating(0);
    setRiseRating(0);
    setPhotos([]);
    setNotes('');
    setWouldChange('');
  };

  const handleSave = async () => {
    if (!recipeName.trim()) return;
    const entry: BakeLogEntry = {
      id: generateId(),
      date: Date.now(),
      recipeName: recipeName.trim(),
      hydration: parseInt(hydration) || 75,
      flourTypes: flourTypes.trim() || 'Bread flour',
      totalWeight: parseInt(totalWeight) || 0,
      crumbRating,
      tasteRating,
      riseRating,
      photos,
      notes: notes.trim(),
      wouldChange: wouldChange.trim(),
    };
    await saveBakeLogEntry(entry);
    resetForm();
    setShowNew(false);
    loadEntries();
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Remove this bake from your log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteBakeLogEntry(id);
          loadEntries();
        },
      },
    ]);
  };

  const avgRating = (entry: BakeLogEntry) => {
    const ratings = [entry.crumbRating, entry.tasteRating, entry.riseRating].filter(
      (r) => r > 0
    );
    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Bake Log</Text>
          <Button
            title="+ Log Bake"
            variant="primary"
            size="sm"
            onPress={() => setShowNew(true)}
          />
        </View>

        {entries.length === 0 ? (
          <EmptyState
            icon="book-outline"
            title="No Bakes Logged"
            message="Keep a journal of every bake. Track what worked, what didn't, and watch yourself improve over time."
          />
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName}>{entry.recipeName}</Text>
                  <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(entry.id)}>
                  <Ionicons name="trash-outline" size={18} color={Colors.gray} />
                </TouchableOpacity>
              </View>

              <View style={styles.entryMeta}>
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>{entry.hydration}%</Text>
                </View>
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>{entry.flourTypes}</Text>
                </View>
                {entry.totalWeight > 0 && (
                  <View style={styles.metaChip}>
                    <Text style={styles.metaText}>{entry.totalWeight}g</Text>
                  </View>
                )}
              </View>

              {avgRating(entry) > 0 && (
                <View style={styles.ratingsRow}>
                  <RatingStars rating={Math.round(avgRating(entry))} size={16} />
                </View>
              )}

              {entry.photos.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.photoScroll}
                >
                  {entry.photos.map((uri, i) => (
                    <Image key={i} source={{ uri }} style={styles.photo} />
                  ))}
                </ScrollView>
              )}

              {entry.notes ? (
                <Text style={styles.entryNotes}>{entry.notes}</Text>
              ) : null}
              {entry.wouldChange ? (
                <View style={styles.changeBox}>
                  <Text style={styles.changeLabel}>Next time:</Text>
                  <Text style={styles.changeText}>{entry.wouldChange}</Text>
                </View>
              ) : null}
            </Card>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* New Entry Modal */}
      <Modal visible={showNew} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setShowNew(false);
              }}
            >
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Log a Bake</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <InputField
              label="Recipe Name"
              placeholder="e.g., Country Sourdough"
              value={recipeName}
              onChangeText={setRecipeName}
              autoFocus
            />
            <InputField
              label="Flour Types"
              placeholder="e.g., Bread flour, whole wheat"
              value={flourTypes}
              onChangeText={setFlourTypes}
            />
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <InputField
                  label="Hydration"
                  suffix="%"
                  value={hydration}
                  onChangeText={setHydration}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <InputField
                  label="Total Weight"
                  suffix="g"
                  value={totalWeight}
                  onChangeText={setTotalWeight}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.ratingLabel}>Crumb</Text>
            <RatingStars rating={crumbRating} onRate={setCrumbRating} />

            <Text style={styles.ratingLabel}>Taste</Text>
            <RatingStars rating={tasteRating} onRate={setTasteRating} />

            <Text style={styles.ratingLabel}>Rise / Oven Spring</Text>
            <RatingStars rating={riseRating} onRate={setRiseRating} />

            <View style={styles.photoSection}>
              <Button
                title="Add Photos"
                variant="secondary"
                size="md"
                onPress={handlePickImage}
              />
              {photos.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.photoPreview}
                >
                  {photos.map((uri, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() =>
                        setPhotos((prev) => prev.filter((_, idx) => idx !== i))
                      }
                    >
                      <Image source={{ uri }} style={styles.previewPhoto} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            <InputField
              label="Notes"
              placeholder="How did it go? Any observations..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
            <InputField
              label="What would you change?"
              placeholder="Next time I would..."
              value={wouldChange}
              onChangeText={setWouldChange}
              multiline
              numberOfLines={2}
            />
            <View style={styles.bottomSpacer} />
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
  entryCard: {
    marginBottom: Spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    ...Typography.title3,
  },
  entryDate: {
    ...Typography.footnote,
    marginTop: 2,
  },
  entryMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  metaChip: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.darkGray,
    fontWeight: '500',
  },
  ratingsRow: {
    marginTop: Spacing.md,
  },
  photoScroll: {
    marginTop: Spacing.md,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
  },
  entryNotes: {
    ...Typography.body,
    marginTop: Spacing.md,
    lineHeight: 24,
  },
  changeBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.golden,
  },
  changeLabel: {
    ...Typography.footnote,
    fontWeight: '600',
    color: Colors.golden,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  changeText: {
    ...Typography.body,
    marginTop: 4,
  },
  bottomSpacer: {
    height: Spacing.xxl,
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
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  ratingLabel: {
    ...Typography.subhead,
    fontWeight: '500',
    color: Colors.darkGray,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  photoSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  photoPreview: {
    marginTop: Spacing.md,
  },
  previewPhoto: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
});
