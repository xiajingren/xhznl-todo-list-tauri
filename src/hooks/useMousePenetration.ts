import { useEffect } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import { setIgnoreMouseEvents } from "../services/window";

export function useMousePenetration() {
  const mousePenetration = useSettingsStore((state) => state.mousePenetration);
  const showSettings = useSettingsStore((state) => state.showSettings);

  useEffect(() => {
    // Disable mouse penetration when settings panel is open
    if (showSettings) {
      setIgnoreMouseEvents(false);
    } else {
      setIgnoreMouseEvents(mousePenetration);
    }
  }, [mousePenetration, showSettings]);
}