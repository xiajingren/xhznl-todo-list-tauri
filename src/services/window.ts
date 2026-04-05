import { getCurrentWindow } from "@tauri-apps/api/window";

export async function setIgnoreMouseEvents(ignore: boolean): Promise<void> {
  await getCurrentWindow().setIgnoreCursorEvents(ignore);
}

export async function setAlwaysOnTop(onTop: boolean): Promise<void> {
  await getCurrentWindow().setAlwaysOnTop(onTop);
}

export async function getWindowPosition(): Promise<{ x: number; y: number }> {
  const position = await getCurrentWindow().outerPosition();
  return { x: position.x, y: position.y };
}

export async function getWindowSize(): Promise<{
  width: number;
  height: number;
}> {
  const size = await getCurrentWindow().outerSize();
  return { width: size.width, height: size.height };
}

export async function hideWindow(): Promise<void> {
  await getCurrentWindow().hide();
}

export async function showWindow(): Promise<void> {
  const window = getCurrentWindow();
  await window.show();
  await window.setFocus();
}

export async function closeWindow(): Promise<void> {
  await getCurrentWindow().close();
}