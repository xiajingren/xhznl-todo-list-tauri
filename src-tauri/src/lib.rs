pub mod commands;
pub mod database;
pub mod models;
pub mod tray;

#[cfg(target_os = "macos")]
use objc::{msg_send, sel, sel_impl};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Plugins
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--hidden"]),
        ))
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            use tauri::Manager;
            let _ = app.get_webview_window("main").and_then(|w| {
                w.show().ok();
                w.set_focus().ok();
                Some(())
            });
        }))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())

        // Setup
        .setup(|app| {
            use tauri::Manager;

            #[cfg(target_os = "macos")]
            {
                // Fix rounded corners on macOS
                if let Some(window) = app.get_webview_window("main") {
                    let ns_window = window.ns_window().unwrap() as cocoa::base::id;

                    unsafe {
                        use cocoa::appkit::CGFloat;
                        use cocoa::base::YES as YES_BOOL;

                        // Get the content view's layer
                        let content_view: cocoa::base::id = msg_send![ns_window, contentView];
                        let _: () = msg_send![content_view, setWantsLayer: YES_BOOL];

                        // Get the layer and set corner radius + masks to bounds
                        let layer: cocoa::base::id = msg_send![content_view, layer];
                        let corner_radius: CGFloat = 12.0;
                        let _: () = msg_send![layer, setCornerRadius: corner_radius];
                        let _: () = msg_send![layer, setMasksToBounds: YES_BOOL];
                    }
                }
            }

            // Initialize database asynchronously
            let app_handle = app.handle().clone();
            tauri::async_runtime::block_on(async {
                let db = database::Database::new(app_handle).await
                    .expect("Failed to initialize database");
                app.manage(db);
            });

            // Setup system tray
            tray::setup::setup_tray(app)?;

            Ok(())
        })

        // Commands
        .invoke_handler(tauri::generate_handler![
            commands::todo::get_todos,
            commands::todo::create_todo,
            commands::todo::update_todo,
            commands::todo::delete_todo,
            commands::todo::reorder_todos,
            commands::todo::move_to_done,
            commands::todo::move_to_todo,
            commands::export::export_to_excel,
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::settings::get_window_state,
            commands::settings::save_window_state,
        ])

        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}