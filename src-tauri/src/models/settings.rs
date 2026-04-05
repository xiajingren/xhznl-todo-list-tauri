use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
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