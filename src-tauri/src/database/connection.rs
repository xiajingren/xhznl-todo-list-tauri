use crate::models::{Todo, CreateTodoInput, AppSettings, WindowState};
use chrono::Utc;
use std::sync::Mutex;
use tauri::AppHandle;
use uuid::Uuid;

pub struct Database {
    app_handle: AppHandle,
    // In-memory storage for now (will be replaced with SQLite)
    todos: Mutex<Vec<Todo>>,
    settings: Mutex<AppSettings>,
    window_state: Mutex<WindowState>,
}

impl Database {
    pub fn new(app_handle: AppHandle) -> Self {
        Self {
            app_handle,
            todos: Mutex::new(Vec::new()),
            settings: Mutex::new(AppSettings::default()),
            window_state: Mutex::new(WindowState::default()),
        }
    }

    pub fn initialize(&self) -> Result<(), Box<dyn std::error::Error>> {
        // Add some default todos for testing
        let now = Utc::now().to_rfc3339();
        let default_todos = vec![
            Todo {
                id: Uuid::new_v4().to_string(),
                content: "Click to edit, double-click checkbox to complete".to_string(),
                completed: false,
                priority: 0,
                sort_order: 0,
                list_type: "todo".to_string(),
                created_at: now.clone(),
                updated_at: now.clone(),
                completed_at: None,
            },
            Todo {
                id: Uuid::new_v4().to_string(),
                content: "Drag handle to reorder".to_string(),
                completed: false,
                priority: 0,
                sort_order: 1,
                list_type: "todo".to_string(),
                created_at: now.clone(),
                updated_at: now.clone(),
                completed_at: None,
            },
        ];

        let mut todos = self.todos.lock().unwrap();
        *todos = default_todos;

        Ok(())
    }

    // Todo operations
    pub async fn get_all_todos(&self) -> Result<Vec<Todo>, String> {
        let todos = self.todos.lock().unwrap();
        Ok(todos.clone())
    }

    pub async fn create_todo(&self, input: CreateTodoInput) -> Result<Todo, String> {
        let now = Utc::now().to_rfc3339();
        let id = Uuid::new_v4().to_string();

        let mut todos = self.todos.lock().unwrap();
        let sort_order = todos.len() as i32;

        let todo = Todo {
            id: id.clone(),
            content: input.content,
            completed: false,
            priority: input.priority.unwrap_or(0),
            sort_order,
            list_type: "todo".to_string(),
            created_at: now.clone(),
            updated_at: now,
            completed_at: None,
        };

        todos.push(todo.clone());
        Ok(todo)
    }

    pub async fn update_todo(
        &self,
        id: String,
        content: Option<String>,
        _completed: Option<bool>,
        priority: Option<i32>,
    ) -> Result<Todo, String> {
        let mut todos = self.todos.lock().unwrap();

        if let Some(todo) = todos.iter_mut().find(|t| t.id == id) {
            if let Some(c) = content {
                todo.content = c;
            }
            if let Some(p) = priority {
                todo.priority = p;
            }
            todo.updated_at = Utc::now().to_rfc3339();
            return Ok(todo.clone());
        }

        Err("Todo not found".to_string())
    }

    pub async fn delete_todo(&self, id: String) -> Result<(), String> {
        let mut todos = self.todos.lock().unwrap();
        todos.retain(|t| t.id != id);
        Ok(())
    }

    pub async fn reorder_todos(&self, todo_ids: Vec<String>) -> Result<(), String> {
        let mut todos = self.todos.lock().unwrap();

        for (index, id) in todo_ids.iter().enumerate() {
            if let Some(todo) = todos.iter_mut().find(|t| t.id == *id) {
                todo.sort_order = index as i32;
            }
        }

        todos.sort_by(|a, b| a.sort_order.cmp(&b.sort_order));
        Ok(())
    }

    pub async fn move_to_done(&self, id: String) -> Result<Todo, String> {
        let mut todos = self.todos.lock().unwrap();

        if let Some(todo) = todos.iter_mut().find(|t| t.id == id) {
            todo.list_type = "done".to_string();
            todo.completed = true;
            todo.completed_at = Some(Utc::now().to_rfc3339());
            todo.updated_at = Utc::now().to_rfc3339();
            return Ok(todo.clone());
        }

        Err("Todo not found".to_string())
    }

    pub async fn move_to_todo(&self, id: String) -> Result<Todo, String> {
        let mut todos = self.todos.lock().unwrap();

        if let Some(todo) = todos.iter_mut().find(|t| t.id == id) {
            todo.list_type = "todo".to_string();
            todo.completed = false;
            todo.completed_at = None;
            todo.updated_at = Utc::now().to_rfc3339();
            return Ok(todo.clone());
        }

        Err("Todo not found".to_string())
    }

    // Settings operations
    pub async fn get_settings(&self) -> Result<AppSettings, String> {
        let settings = self.settings.lock().unwrap();
        Ok(settings.clone())
    }

    pub async fn update_settings(&self, settings: AppSettings) -> Result<(), String> {
        let mut current = self.settings.lock().unwrap();
        *current = settings;
        Ok(())
    }

    // Window state operations
    pub async fn get_window_state(&self) -> Result<WindowState, String> {
        let state = self.window_state.lock().unwrap();
        Ok(state.clone())
    }

    pub async fn save_window_state(&self, state: WindowState) -> Result<(), String> {
        let mut current = self.window_state.lock().unwrap();
        *current = state;
        Ok(())
    }
}

// Make Database clonable for Tauri State
impl Clone for Database {
    fn clone(&self) -> Self {
        Self {
            app_handle: self.app_handle.clone(),
            todos: Mutex::new(self.todos.lock().unwrap().clone()),
            settings: Mutex::new(self.settings.lock().unwrap().clone()),
            window_state: Mutex::new(self.window_state.lock().unwrap().clone()),
        }
    }
}