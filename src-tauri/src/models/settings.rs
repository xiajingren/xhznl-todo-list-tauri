use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub auto_start: bool,
    pub mouse_penetration: bool,
    pub opacity: f32,
    pub always_on_top: bool,
    pub show_in_dock: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            auto_start: false,
            mouse_penetration: false,
            opacity: 0.9,
            always_on_top: false,
            show_in_dock: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowState {
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
    pub is_maximized: bool,
}

impl Default for WindowState {
    fn default() -> Self {
        Self {
            x: 0,
            y: 0,
            width: 320,
            height: 290,
            is_maximized: false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_settings_default() {
        let settings = AppSettings::default();
        assert_eq!(settings.auto_start, false);
        assert_eq!(settings.mouse_penetration, false);
        assert_eq!(settings.opacity, 0.9);
        assert_eq!(settings.always_on_top, false);
        assert_eq!(settings.show_in_dock, true);
    }

    #[test]
    fn test_app_settings_serialization() {
        let settings = AppSettings {
            auto_start: true,
            mouse_penetration: true,
            opacity: 0.7,
            always_on_top: true,
            show_in_dock: false,
        };

        let json = serde_json::to_string(&settings).unwrap();
        assert!(json.contains("\"autoStart\":true"));
        assert!(json.contains("\"opacity\":0.7"));

        let deserialized: AppSettings = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.auto_start, true);
        assert_eq!(deserialized.opacity, 0.7);
    }

    #[test]
    fn test_window_state_default() {
        let state = WindowState::default();
        assert_eq!(state.x, 0);
        assert_eq!(state.y, 0);
        assert_eq!(state.width, 320);
        assert_eq!(state.height, 290);
        assert_eq!(state.is_maximized, false);
    }

    #[test]
    fn test_window_state_serialization() {
        let state = WindowState {
            x: 100,
            y: 200,
            width: 400,
            height: 500,
            is_maximized: true,
        };

        let json = serde_json::to_string(&state).unwrap();
        assert!(json.contains("\"x\":100"));
        assert!(json.contains("\"isMaximized\":true"));

        let deserialized: WindowState = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.x, 100);
        assert_eq!(deserialized.is_maximized, true);
    }
}