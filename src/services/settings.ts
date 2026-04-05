import { invoke } from "@tauri-apps/api/core";
import type { AppSettings, WindowState } from "../types";

export async function getSettings(): Promise<AppSettings> {
  return invoke<AppSettings>("get_settings");
}

export async function updateSettings(settings: AppSettings): Promise<void> {
  return invoke("update_settings", { settings });
}

export async function getWindowState(): Promise<WindowState> {
  return invoke<WindowState>("get_window_state");
}

export async function saveWindowState(state: WindowState): Promise<void> {
  return invoke("save_window_state", { state });
}