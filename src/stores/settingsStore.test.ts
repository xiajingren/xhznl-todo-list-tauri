import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSettingsStore } from '../stores/settingsStore';

// Mock window service
vi.mock('../services/window', () => ({
  setIgnoreMouseEvents: vi.fn(),
  setAlwaysOnTop: vi.fn(),
}));

import { setIgnoreMouseEvents } from '../services/window';

describe('settingsStore', () => {
  beforeEach(() => {
    // Reset store to default state
    useSettingsStore.setState({
      autoStart: false,
      mousePenetration: false,
      opacity: 0.9,
      alwaysOnTop: false,
      showInDock: true,
      windowState: {
        x: 0,
        y: 0,
        width: 320,
        height: 290,
        isMaximized: false,
      },
      isLoading: false,
      showSettings: false,
    });
    vi.clearAllMocks();
  });

  describe('toggleMousePenetration', () => {
    it('should toggle mousePenetration from false to true', () => {
      const store = useSettingsStore.getState();
      store.toggleMousePenetration();

      const state = useSettingsStore.getState();
      expect(state.mousePenetration).toBe(true);
      expect(setIgnoreMouseEvents).toHaveBeenCalledWith(true);
    });

    it('should toggle mousePenetration from true to false', () => {
      useSettingsStore.setState({ mousePenetration: true });

      const store = useSettingsStore.getState();
      store.toggleMousePenetration();

      const state = useSettingsStore.getState();
      expect(state.mousePenetration).toBe(false);
      expect(setIgnoreMouseEvents).toHaveBeenCalledWith(false);
    });
  });

  describe('toggleAutoStart', () => {
    it('should toggle autoStart from false to true', () => {
      const store = useSettingsStore.getState();
      store.toggleAutoStart();

      expect(useSettingsStore.getState().autoStart).toBe(true);
    });

    it('should toggle autoStart from true to false', () => {
      useSettingsStore.setState({ autoStart: true });

      const store = useSettingsStore.getState();
      store.toggleAutoStart();

      expect(useSettingsStore.getState().autoStart).toBe(false);
    });
  });

  describe('setOpacity', () => {
    it('should update opacity value', () => {
      const store = useSettingsStore.getState();
      store.setOpacity(0.7);

      expect(useSettingsStore.getState().opacity).toBe(0.7);
    });

    it('should clamp opacity to valid range', () => {
      const store = useSettingsStore.getState();
      store.setOpacity(0.5);

      expect(useSettingsStore.getState().opacity).toBe(0.5);
    });
  });

  describe('updateSettings', () => {
    it('should update multiple settings at once', () => {
      const store = useSettingsStore.getState();
      store.updateSettings({
        autoStart: true,
        opacity: 0.8,
      });

      const state = useSettingsStore.getState();
      expect(state.autoStart).toBe(true);
      expect(state.opacity).toBe(0.8);
    });
  });

  describe('toggleSettingsPanel', () => {
    it('should open settings panel', () => {
      useSettingsStore.setState({ mousePenetration: true });

      const store = useSettingsStore.getState();
      store.toggleSettingsPanel();

      const state = useSettingsStore.getState();
      expect(state.showSettings).toBe(true);
      // Should disable mouse penetration when settings is open
      expect(setIgnoreMouseEvents).toHaveBeenCalledWith(false);
    });

    it('should close settings panel and restore mouse penetration', () => {
      useSettingsStore.setState({ showSettings: true, mousePenetration: true });

      const store = useSettingsStore.getState();
      store.toggleSettingsPanel();

      const state = useSettingsStore.getState();
      expect(state.showSettings).toBe(false);
      // Should restore mouse penetration when closing
      expect(setIgnoreMouseEvents).toHaveBeenCalledWith(true);
    });

    it('should not enable mouse penetration on close if it was disabled', () => {
      useSettingsStore.setState({ showSettings: true, mousePenetration: false });

      const store = useSettingsStore.getState();
      store.toggleSettingsPanel();

      const state = useSettingsStore.getState();
      expect(state.showSettings).toBe(false);
      expect(setIgnoreMouseEvents).toHaveBeenCalledWith(false);
    });
  });

  describe('saveWindowState', () => {
    it('should save window state', () => {
      const store = useSettingsStore.getState();
      store.saveWindowState({
        x: 100,
        y: 200,
        width: 400,
        height: 500,
        isMaximized: false,
      });

      const state = useSettingsStore.getState();
      expect(state.windowState.x).toBe(100);
      expect(state.windowState.y).toBe(200);
      expect(state.windowState.width).toBe(400);
      expect(state.windowState.height).toBe(500);
    });
  });
});