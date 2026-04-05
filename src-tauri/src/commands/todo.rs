use crate::database::Database;
use crate::models::{Todo, CreateTodoInput};
use tauri::State;

#[tauri::command]
pub async fn get_todos(db: State<'_, Database>) -> Result<Vec<Todo>, String> {
    db.get_all_todos().await
}

#[tauri::command]
pub async fn create_todo(
    db: State<'_, Database>,
    input: CreateTodoInput,
) -> Result<Todo, String> {
    db.create_todo(input).await
}

#[tauri::command]
pub async fn update_todo(
    db: State<'_, Database>,
    id: String,
    content: Option<String>,
    completed: Option<bool>,
    priority: Option<i32>,
) -> Result<Todo, String> {
    db.update_todo(id, content, completed, priority).await
}

#[tauri::command]
pub async fn delete_todo(db: State<'_, Database>, id: String) -> Result<(), String> {
    db.delete_todo(id).await
}

#[tauri::command]
pub async fn reorder_todos(
    db: State<'_, Database>,
    todo_ids: Vec<String>,
) -> Result<(), String> {
    db.reorder_todos(todo_ids).await
}

#[tauri::command]
pub async fn move_to_done(db: State<'_, Database>, id: String) -> Result<Todo, String> {
    db.move_to_done(id).await
}

#[tauri::command]
pub async fn move_to_todo(db: State<'_, Database>, id: String) -> Result<Todo, String> {
    db.move_to_todo(id).await
}