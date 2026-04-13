import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Tauri APIs for testing
vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({
    setIgnoreCursorEvents: vi.fn(),
    setAlwaysOnTop: vi.fn(),
    outerPosition: vi.fn().mockResolvedValue({ x: 100, y: 100 }),
    outerSize: vi.fn().mockResolvedValue({ width: 320, height: 290 }),
    hide: vi.fn(),
    show: vi.fn(),
    setFocus: vi.fn(),
    close: vi.fn(),
  }),
}));

vi.mock('@tauri-apps/plugin-autostart', () => ({
  enable: vi.fn(),
  disable: vi.fn(),
  isEnabled: vi.fn().mockResolvedValue(false),
}));

vi.mock('../services/database', () => ({
  getTodos: vi.fn().mockResolvedValue([]),
  createTodo: vi.fn().mockResolvedValue(undefined),
  updateTodo: vi.fn().mockResolvedValue(undefined),
  deleteTodo: vi.fn().mockResolvedValue(undefined),
  reorderTodos: vi.fn().mockResolvedValue(undefined),
  moveTodo: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../services/settings', () => ({
  getSettings: vi.fn().mockResolvedValue({
    autoStart: false,
    mousePenetration: false,
    alwaysOnTop: false,
    opacity: 0.95,
  }),
  saveSettings: vi.fn().mockResolvedValue(undefined),
  getWindowState: vi.fn().mockResolvedValue({ x: 100, y: 100, width: 320, height: 290 }),
  saveWindowState: vi.fn().mockResolvedValue(undefined),
}));