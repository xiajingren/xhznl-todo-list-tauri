import { useEffect } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import { setAlwaysOnTop } from "../services/window";

export function useAlwaysOnTop() {
  const alwaysOnTop = useSettingsStore((state) => state.alwaysOnTop);

  useEffect(() => {
    const applySetting = async () => {
      await setAlwaysOnTop(alwaysOnTop);
    };
    applySetting();
  }, [alwaysOnTop]);
}