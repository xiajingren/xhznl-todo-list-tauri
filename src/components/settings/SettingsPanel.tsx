import { useSettingsStore } from "../../stores/settingsStore";

export function SettingsPanel() {
  const {
    autoStart,
    mousePenetration,
    alwaysOnTop,
    opacity,
    toggleAutoStart,
    toggleMousePenetration,
    updateSettings,
    setOpacity,
    toggleSettingsPanel,
  } = useSettingsStore();

  return (
    <div
      className="h-full w-full bg-gray-900/95 backdrop-blur-lg p-4 flex flex-col"
      style={{ borderRadius: 12 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-lg font-medium">Settings</h2>
        <button
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          onClick={toggleSettingsPanel}
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {/* Auto-start */}
        <ToggleRow
          label="Launch at startup"
          value={autoStart}
          onToggle={toggleAutoStart}
        />

        {/* Mouse penetration */}
        <ToggleRow
          label="Mouse penetration"
          value={mousePenetration}
          onToggle={toggleMousePenetration}
        />

        {/* Always on top */}
        <ToggleRow
          label="Always on top"
          value={alwaysOnTop}
          onToggle={() => updateSettings({ alwaysOnTop: !alwaysOnTop })}
        />

        {/* Opacity */}
        <div className="bg-gray-800 p-3 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Window opacity</span>
            <span className="text-gray-400 text-xs">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-gray-800 p-3 rounded flex items-center justify-between">
      <span className="text-gray-300 text-sm">{label}</span>
      <button
        className={`w-11 h-6 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-gray-600"}`}
        onClick={onToggle}
      >
        <span
          className={`block w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}