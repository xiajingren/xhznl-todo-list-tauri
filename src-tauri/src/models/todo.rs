use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Todo {
    pub id: String,
    pub content: String,
    pub completed: bool,
    pub priority: i32,
    pub sort_order: i32,
    pub list_type: String,  // "todo" or "done"
    pub created_at: String,
    pub updated_at: String,
    pub completed_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTodoInput {
    pub content: String,
    pub priority: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateTodoInput {
    pub id: String,
    pub content: Option<String>,
    pub completed: Option<bool>,
    pub priority: Option<i32>,
}