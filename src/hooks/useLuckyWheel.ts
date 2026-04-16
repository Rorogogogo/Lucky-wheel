import { useState, useEffect, useCallback } from 'react';

export type WheelItem = {
  id: string;
  label: string;
  color: string;
};

export type Preset = {
  id: string;
  name: string;
  items: WheelItem[];
};

export type LuckyWheelData = {
  activePresetId: string;
  presets: Preset[];
};

const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'preset-1',
    name: 'Food Choice',
    items: [
      { id: '1-1', label: 'Pizza', color: '#ef4444' },
      { id: '1-2', label: 'Sushi', color: '#f97316' },
      { id: '1-3', label: 'Burgers', color: '#eab308' },
      { id: '1-4', label: 'Salad', color: '#22c55e' },
      { id: '1-5', label: 'Tacos', color: '#3b82f6' },
      { id: '1-6', label: 'Pasta', color: '#a855f7' },
    ],
  },
  {
    id: 'preset-2',
    name: 'Who Pays?',
    items: [
      { id: '2-1', label: 'Alice', color: '#ec4899' },
      { id: '2-2', label: 'Bob', color: '#14b8a6' },
      { id: '2-3', label: 'Charlie', color: '#8b5cf6' },
      { id: '2-4', label: 'Dave', color: '#f43f5e' },
      { id: '2-5', label: 'Split Even', color: '#64748b' },
    ],
  },
  {
    id: 'preset-3',
    name: 'Weekend Activity',
    items: [
      { id: '3-1', label: 'Movie Night', color: '#0ea5e9' },
      { id: '3-2', label: 'Hiking', color: '#84cc16' },
      { id: '3-3', label: 'Board Games', color: '#d946ef' },
      { id: '3-4', label: 'Read a Book', color: '#fcd34d' },
    ],
  },
];

// Main wheel data key (presets, active preset)
const DATA_KEY = 'luckyWheelData';

// Separate, simple key for rigging — set manually via DevTools:
//   localStorage.setItem('luckyWheel.riggedResult', 'Pizza')
// The label must match an item in the current preset (case-sensitive).
// After the next spin, this key is automatically deleted.
const RIG_KEY = 'luckyWheel.riggedResult';

export function useLuckyWheel() {
  const [data, setData] = useState<LuckyWheelData>(() => {
    try {
      const stored = localStorage.getItem(DATA_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.presets && parsed.presets.length > 0) {
          return parsed as LuckyWheelData;
        }
      }
    } catch (e) {
      console.warn('Failed to parse luckyWheelData from localStorage', e);
    }
    return {
      activePresetId: DEFAULT_PRESETS[0].id,
      presets: DEFAULT_PRESETS,
    };
  });

  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data]);

  const activePreset = data.presets.find((p) => p.id === data.activePresetId) || data.presets[0];

  const setActivePresetId = (id: string) => {
    setData((prev) => ({ ...prev, activePresetId: id }));
  };

  // Reads and immediately deletes the rig key (one-time use).
  // Returns the matching WheelItem ID if the ID matches, otherwise null.
  const consumeRiggedResult = useCallback((): string | null => {
    const riggedId = localStorage.getItem(RIG_KEY);
    if (!riggedId) return null;

    // Always clear the rig key after reading — it's a one-shot directive
    localStorage.removeItem(RIG_KEY);

    // Look up by ID in the currently active preset
    const match = activePreset.items.find((item) => item.id === riggedId);

    if (!match) {
      // ID not found — rig is silently ignored, spin is random
      console.warn(`[luckyWheel] Rigged ID "${riggedId}" not found in current preset. Spinning randomly.`);
      return null;
    }

    return match.id;
  }, [activePreset.items]);

  const updatePresetItems = (presetId: string, items: WheelItem[]) => {
    setData((prev) => ({
      ...prev,
      presets: prev.presets.map((p) => (p.id === presetId ? { ...p, items } : p)),
    }));
  };

  const updatePresetName = (presetId: string, name: string) => {
    setData((prev) => ({
      ...prev,
      presets: prev.presets.map((p) => (p.id === presetId ? { ...p, name } : p)),
    }));
  };

  const resetToDefaults = () => {
    localStorage.removeItem(RIG_KEY);
    setData({
      activePresetId: DEFAULT_PRESETS[0].id,
      presets: DEFAULT_PRESETS,
    });
  };

  return {
    data,
    activePreset,
    setActivePresetId,
    consumeRiggedResult,
    updatePresetItems,
    updatePresetName,
    resetToDefaults,
  };
}
