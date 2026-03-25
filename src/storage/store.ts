import AsyncStorage from '@react-native-async-storage/async-storage';
import { Starter, ActiveBake, BakeLogEntry } from '../types';

const KEYS = {
  STARTERS: 'sourdough_starters',
  ACTIVE_BAKES: 'sourdough_active_bakes',
  BAKE_LOG: 'sourdough_bake_log',
};

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// Starters
export async function getStarters(): Promise<Starter[]> {
  return getJSON(KEYS.STARTERS, []);
}

export async function saveStarter(starter: Starter): Promise<void> {
  const starters = await getStarters();
  const index = starters.findIndex((s) => s.id === starter.id);
  if (index >= 0) {
    starters[index] = starter;
  } else {
    starters.push(starter);
  }
  await setJSON(KEYS.STARTERS, starters);
}

export async function deleteStarter(id: string): Promise<void> {
  const starters = await getStarters();
  await setJSON(
    KEYS.STARTERS,
    starters.filter((s) => s.id !== id)
  );
}

// Active Bakes
export async function getActiveBakes(): Promise<ActiveBake[]> {
  return getJSON(KEYS.ACTIVE_BAKES, []);
}

export async function saveActiveBake(bake: ActiveBake): Promise<void> {
  const bakes = await getActiveBakes();
  const index = bakes.findIndex((b) => b.id === bake.id);
  if (index >= 0) {
    bakes[index] = bake;
  } else {
    bakes.push(bake);
  }
  await setJSON(KEYS.ACTIVE_BAKES, bakes);
}

export async function deleteActiveBake(id: string): Promise<void> {
  const bakes = await getActiveBakes();
  await setJSON(
    KEYS.ACTIVE_BAKES,
    bakes.filter((b) => b.id !== id)
  );
}

// Bake Log
export async function getBakeLog(): Promise<BakeLogEntry[]> {
  return getJSON(KEYS.BAKE_LOG, []);
}

export async function saveBakeLogEntry(entry: BakeLogEntry): Promise<void> {
  const log = await getBakeLog();
  const index = log.findIndex((e) => e.id === entry.id);
  if (index >= 0) {
    log[index] = entry;
  } else {
    log.unshift(entry);
  }
  await setJSON(KEYS.BAKE_LOG, log);
}

export async function deleteBakeLogEntry(id: string): Promise<void> {
  const log = await getBakeLog();
  await setJSON(
    KEYS.BAKE_LOG,
    log.filter((e) => e.id !== id)
  );
}
