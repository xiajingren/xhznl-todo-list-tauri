import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";

export async function setAutoStart(enabled: boolean): Promise<void> {
  if (enabled) {
    await enable();
  } else {
    await disable();
  }
}

export async function getAutoStartStatus(): Promise<boolean> {
  return await isEnabled();
}