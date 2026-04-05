import { useEffect, useRef } from "react";
import { getCurrentWindow, PhysicalPosition, PhysicalSize } from "@tauri-apps/api/window";
import { useSettingsStore } from "../stores/settingsStore";

export function useWindowState() {
  const windowState = useSettingsStore((state) => state.windowState);
  const saveWindowState = useSettingsStore((state) => state.saveWindowState);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore window position on mount
  useEffect(() => {
    const restorePosition = async () => {
      const window = getCurrentWindow();

      if (windowState.x !== 0 || windowState.y !== 0) {
        await window.setPosition(new PhysicalPosition(windowState.x, windowState.y));
      }

      await window.setSize(new PhysicalSize(windowState.width, windowState.height));
    };

    restorePosition();
  }, []);

  // Save position on move/resize (debounced)
  useEffect(() => {
    const saveState = async () => {
      const window = getCurrentWindow();
      const position = await window.outerPosition();
      const size = await window.outerSize();

      await saveWindowState({
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        isMaximized: false,
      });
    };

    const handleMove = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(saveState, 300);
    };

    // Listen for window events using Tauri's event system
    let unlistenMove: (() => void) | null = null;
    let unlistenResize: (() => void) | null = null;

    const setupListeners = async () => {
      const window = getCurrentWindow();
      unlistenMove = await window.onMoved(() => handleMove());
      unlistenResize = await window.onResized(() => handleMove());
    };

    setupListeners();

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (unlistenMove) unlistenMove();
      if (unlistenResize) unlistenResize();
    };
  }, [saveWindowState]);
}