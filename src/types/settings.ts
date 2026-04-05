export interface AppSettings {
  autoStart: boolean;
  mousePenetration: boolean;
  opacity: number;
  alwaysOnTop: boolean;
  showInDock: boolean;
}

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

export const defaultSettings: AppSettings = {
  autoStart: false,
  mousePenetration: false,
  opacity: 0.9,
  alwaysOnTop: false,
  showInDock: true,
};

export const defaultWindowState: WindowState = {
  x: 0,
  y: 0,
  width: 320,
  height: 290,
  isMaximized: false,
};