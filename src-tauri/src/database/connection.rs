use crate::database::SCHEMA;
use crate::models::{Todo, CreateTodoInput, AppSettings, WindowState};
use chrono::Utc;
use sqlx::Row;
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions, SqliteConnectOptions};
use tauri::AppHandle;
use tauri::Manager;
use uuid::Uuid;

pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new(app_handle: AppHandle) -> Result<Self, Box<dyn std::error::Error>> {
        // Get app data directory for database file
        let app_dir = app_handle.path().app_data_dir()?;
        let db_path = app_dir.join("todos.db");

        // Create directory if not exists
        std::fs::create_dir_all(&app_dir)?;

        // Configure SQLite connection
        let options = SqliteConnectOptions::new()
            .filename(&db_path)
            .create_if_missing(true)
            .foreign_keys(true);

        let pool = SqlitePoolOptions::new()
            .max_connections(1)
            .connect_with(options)
            .await?;

        // Run schema migrations
        sqlx::raw_sql(SCHEMA).execute(&pool).await?;

        Ok(Self { pool })
    }

    // Todo operations
    pub async fn get_all_todos(&self) -> Result<Vec<Todo>, String> {
        sqlx::query_as::<_, Todo>("SELECT * FROM todos ORDER BY sort_order")
            .fetch_all(&self.pool)
            .await
            .map_err(|e| e.to_string())
    }

    pub async fn create_todo(&self, input: CreateTodoInput) -> Result<Todo, String> {
        let now = Utc::now().to_rfc3339();
        let id = Uuid::new_v4().to_string();

        // Get max sort_order
        let max_order: i32 = sqlx::query("SELECT COALESCE(MAX(sort_order), -1) FROM todos")
            .fetch_one(&self.pool)
            .await
            .map_err(|e| e.to_string())?
            .get::<i32, _>(0);

        let sort_order = max_order + 1;

        sqlx::query(
            "INSERT INTO todos (id, content, completed, priority, sort_order, list_type, created_at, updated_at, completed_at)
             VALUES (?, ?, 0, ?, ?, 'todo', ?, ?, NULL)"
        )
        .bind(&id)
        .bind(&input.content)
        .bind(input.priority.unwrap_or(0))
        .bind(sort_order)
        .bind(&now)
        .bind(&now)
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(Todo {
            id,
            content: input.content,
            completed: false,
            priority: input.priority.unwrap_or(0),
            sort_order,
            list_type: "todo".to_string(),
            created_at: now.clone(),
            updated_at: now,
            completed_at: None,
        })
    }

    pub async fn update_todo(
        &self,
        id: String,
        content: Option<String>,
        _completed: Option<bool>,
        priority: Option<i32>,
    ) -> Result<Todo, String> {
        let now = Utc::now().to_rfc3339();

        // Build dynamic update query
        if let Some(c) = content {
            sqlx::query("UPDATE todos SET content = ?, updated_at = ? WHERE id = ?")
                .bind(&c)
                .bind(&now)
                .bind(&id)
                .execute(&self.pool)
                .await
                .map_err(|e| e.to_string())?;
        }

        if let Some(p) = priority {
            sqlx::query("UPDATE todos SET priority = ?, updated_at = ? WHERE id = ?")
                .bind(p)
                .bind(&now)
                .bind(&id)
                .execute(&self.pool)
                .await
                .map_err(|e| e.to_string())?;
        }

        // Fetch updated todo
        sqlx::query_as::<_, Todo>("SELECT * FROM todos WHERE id = ?")
            .bind(&id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| format!("Todo not found: {}", e))
    }

    pub async fn delete_todo(&self, id: String) -> Result<(), String> {
        sqlx::query("DELETE FROM todos WHERE id = ?")
            .bind(&id)
            .execute(&self.pool)
            .await
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub async fn reorder_todos(&self, todo_ids: Vec<String>) -> Result<(), String> {
        for (index, id) in todo_ids.iter().enumerate() {
            sqlx::query("UPDATE todos SET sort_order = ? WHERE id = ?")
                .bind(index as i32)
                .bind(id)
                .execute(&self.pool)
                .await
                .map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    pub async fn move_to_done(&self, id: String) -> Result<Todo, String> {
        let now = Utc::now().to_rfc3339();

        sqlx::query(
            "UPDATE todos SET list_type = 'done', completed = 1, completed_at = ?, updated_at = ? WHERE id = ?"
        )
        .bind(&now)
        .bind(&now)
        .bind(&id)
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        sqlx::query_as::<_, Todo>("SELECT * FROM todos WHERE id = ?")
            .bind(&id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| format!("Todo not found: {}", e))
    }

    pub async fn move_to_todo(&self, id: String) -> Result<Todo, String> {
        let now = Utc::now().to_rfc3339();

        sqlx::query(
            "UPDATE todos SET list_type = 'todo', completed = 0, completed_at = NULL, updated_at = ? WHERE id = ?"
        )
        .bind(&now)
        .bind(&id)
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        sqlx::query_as::<_, Todo>("SELECT * FROM todos WHERE id = ?")
            .bind(&id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| format!("Todo not found: {}", e))
    }

    // Settings operations
    pub async fn get_settings(&self) -> Result<AppSettings, String> {
        let row = sqlx::query("SELECT value FROM settings WHERE key = 'app_settings'")
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| e.to_string())?;

        match row {
            Some(r) => {
                let json: String = r.get::<String, _>(0);
                serde_json::from_str(&json)
                    .map_err(|e| e.to_string())
            },
            None => Ok(AppSettings::default()),
        }
    }

    pub async fn update_settings(&self, settings: AppSettings) -> Result<(), String> {
        let json = serde_json::to_string(&settings)
            .map_err(|e| e.to_string())?;

        sqlx::query("INSERT OR REPLACE INTO settings (key, value) VALUES ('app_settings', ?)")
            .bind(&json)
            .execute(&self.pool)
            .await
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    // Window state operations
    pub async fn get_window_state(&self) -> Result<WindowState, String> {
        let result = sqlx::query_as::<_, WindowStateRow>(
            "SELECT x, y, width, height, is_maximized FROM window_state WHERE id = 1"
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        match result {
            Some(row) => Ok(WindowState {
                x: row.x,
                y: row.y,
                width: row.width,
                height: row.height,
                is_maximized: row.is_maximized != 0,
            }),
            None => Ok(WindowState::default()),
        }
    }

    pub async fn save_window_state(&self, state: WindowState) -> Result<(), String> {
        sqlx::query(
            "INSERT OR REPLACE INTO window_state (id, x, y, width, height, is_maximized)
             VALUES (1, ?, ?, ?, ?, ?)"
        )
        .bind(state.x)
        .bind(state.y)
        .bind(state.width)
        .bind(state.height)
        .bind(state.is_maximized as i32)
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    }
}

// Helper struct for window_state row (SQLite stores boolean as INTEGER)
#[derive(sqlx::FromRow)]
struct WindowStateRow {
    x: i32,
    y: i32,
    width: i32,
    height: i32,
    is_maximized: i32,
}

// Make Database clonable for Tauri State (SqlitePool is clonable)
impl Clone for Database {
    fn clone(&self) -> Self {
        Self {
            pool: self.pool.clone(),
        }
    }
}