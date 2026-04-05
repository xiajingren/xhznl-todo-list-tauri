use crate::database::Database;
use crate::models::{AppSettings, WindowState};
use tauri::State;

#[tauri::command]
pub async fn get_settings(db: State<'_, Database>) -> Result<AppSettings, String> {
    db.get_settings().await
}

#[tauri::command]
pub async fn update_settings(
    db: State<'_, Database>,
    settings: AppSettings,
) -> Result<(), String> {
    db.update_settings(settings).await
}

#[tauri::command]
pub async fn get_window_state(db: State<'_, Database>) -> Result<WindowState, String> {
    db.get_window_state().await
}

#[tauri::command]
pub async fn save_window_state(
    db: State<'_, Database>,
    state: WindowState,
) -> Result<(), String> {
    db.save_window_state(state).await
}