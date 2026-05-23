import { create } from 'zustand';
import { GameSettings, BattleMode, defaultGameSettings } from './Types';

export interface GameStore {
  isRunning: boolean;
  isPaused: boolean;
  isLoading: boolean;
  loadProgress: number;
  currentScene: string;
  error: string | null;
  settings: GameSettings;

  setRunning: (running: boolean) => void;
  setPaused: (paused: boolean) => void;
  setLoading: (loading: boolean) => void;
  setLoadProgress: (progress: number) => void;
  setCurrentScene: (scene: string) => void;
  setError: (error: string | null) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  setSettings: (settings: GameSettings) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  isRunning: false,
  isPaused: false,
  isLoading: true,
  loadProgress: 0,
  currentScene: 'loading',
  error: null,
  settings: defaultGameSettings(),

  setRunning: (running) => set({ isRunning: running }),
  setPaused: (paused) => set({ isPaused: paused }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLoadProgress: (progress) => set({ loadProgress: progress }),
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setError: (error) => set({ error }),
  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),
  setSettings: (settings) => set({ settings }),
}));