import { create } from "zustand";
import type { AppSettings, WindowState } from "../types";
import { defaultSettings, defaultWindowState } from "../types";
import { setIgnoreMouseEvents } from "../services/window";

interface SettingsState extends AppSettings {
  windowState: WindowState;
  isLoading: boolean;
  showSettings: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => void;
  saveWindowState: (state: WindowState) => void;
  toggleMousePenetration: () => void;
  toggleAutoStart: () => void;
  setOpacity: (opacity: number) => void;
  toggleSettingsPanel: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,
  windowState: defaultWindowState,
  isLoading: false,
  showSettings: false,

  loadSettings: async () => {
    set({ isLoading: true });
    set({ ...defaultSettings, isLoading: false });
  },

  updateSettings: (newSettings) => {
    set(newSettings);
  },

  saveWindowState: (state) => {
    set({ windowState: state });
  },

  toggleMousePenetration: () => {
    const current = get().mousePenetration;
    set({ mousePenetration: !current });
    // Apply to window
    setIgnoreMouseEvents(!current);
  },

  toggleAutoStart: () => {
    const current = get().autoStart;
    set({ autoStart: !current });
  },

  setOpacity: (opacity: number) => {
    set({ opacity });
  },

  toggleSettingsPanel: () => {
    const current = get().showSettings;
    const newState = !current;
    set({ showSettings: newState });

    // Disable mouse penetration when settings is open
    if (newState) {
      setIgnoreMouseEvents(false);
    } else {
      // Restore mouse penetration when closing
      const { mousePenetration } = get();
      setIgnoreMouseEvents(mousePenetration);
    }
  },
}));