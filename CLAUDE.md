# Todo List - Tauri App

A transparent frameless todo list app built with Tauri v2 + React.

## Commands

```bash
npm install        # Install dependencies
npm run tauri dev  # Start development server
npm run tauri build # Build for production
```

## Architecture

```
src/
  components/    # React components (TitleBar, TodoList, SettingsPanel)
  hooks/         # Custom hooks (useMousePenetration, useAlwaysOnTop, useWindowState)
  stores/        # Zustand state (todoStore, settingsStore)
  services/      # Tauri API wrappers (window, database, settings)
  types/         # TypeScript interfaces

src-tauri/src/
  commands/      # Tauri command handlers (todo, settings, export)
  database/      # SQLite storage via sqlx
  models/        # Rust data models
  tray/          # System tray setup
```

## Key Technical Decisions

1. **Store functions must be synchronous** - Async functions in Zustand stores caused click events to fail in settings panel. Keep toggle functions sync.

2. **Tray icon created once** - Either use `tauri.conf.json` trayIcon config OR manual `TrayIconBuilder`, not both. Duplicate config caused two tray icons.

3. **macOS rounded corners** - Requires Cocoa API calls in `lib.rs` setup. `setCornerRadius` on content view layer.

4. **Mouse penetration** - Must disable when settings panel is open (`setIgnoreCursorEvents(false)`).

5. **Serde naming convention** - Backend uses snake_case, frontend expects camelCase. Add `#[serde(rename_all = "camelCase")]` to all structs returned to frontend.

6. **Window drag region** - Use `data-tauri-drag-region` attribute on draggable elements. CSS `-webkit-app-region: drag` alone may not work in Tauri v2.

7. **sqlx Row trait** - Import `sqlx::Row` when using `.get()` on query results.

## Database

- SQLite database stored at `~/Library/Application Support/com.xhznl.todolist/todos.db`
- Uses sqlx with async operations via `SqlitePool`

## Platform Notes

- **macOS**: Uses `macOSPrivateApi: true` for transparent window effects
- Window is frameless with custom drag region in TitleBar
- Dev server runs on port 1420

## Release Process

1. Update version in `tauri.conf.json`
2. Create and push tag: `git tag v1.0.0 && git push origin v1.0.0`
3. GitHub Actions builds for macOS/Windows/Linux