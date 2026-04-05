import { useEffect } from "react";
import { useTodoStore } from "./stores/todoStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useMousePenetration } from "./hooks/useMousePenetration";
import { useAlwaysOnTop } from "./hooks/useAlwaysOnTop";
import { useWindowState } from "./hooks/useWindowState";
import { TitleBar } from "./components/layout/TitleBar";
import { TodoList } from "./components/todo/TodoList";
import { SettingsPanel } from "./components/settings/SettingsPanel";

export default function App() {
  const loadTodos = useTodoStore((state) => state.loadTodos);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const showSettings = useSettingsStore((state) => state.showSettings);
  const opacity = useSettingsStore((state) => state.opacity);

  // Initialize data
  useEffect(() => {
    loadTodos();
    loadSettings();
  }, [loadTodos, loadSettings]);

  // Apply mouse penetration
  useMousePenetration();

  // Apply always on top
  useAlwaysOnTop();

  // Track window state
  useWindowState();

  return (
    <div className="relative h-full">
      <div className="app-container h-full flex flex-col" style={{ opacity }}>
        <TitleBar />

        <main className="flex-1 overflow-hidden p-3">
          <TodoList />
        </main>
      </div>

      {showSettings && (
        <div className="absolute inset-0 z-50 h-full w-full">
          <SettingsPanel />
        </div>
      )}
    </div>
  );
}