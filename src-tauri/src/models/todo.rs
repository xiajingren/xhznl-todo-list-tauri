use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Todo {
    pub id: String,
    pub content: String,
    #[sqlx(rename = "completed")]
    pub completed: bool,
    pub priority: i32,
    #[serde(rename = "sortOrder")]
    #[sqlx(rename = "sort_order")]
    pub sort_order: i32,
    #[serde(rename = "listType")]
    #[sqlx(rename = "list_type")]
    pub list_type: String,
    #[serde(rename = "createdAt")]
    #[sqlx(rename = "created_at")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    #[sqlx(rename = "updated_at")]
    pub updated_at: String,
    #[serde(rename = "completedAt")]
    #[sqlx(rename = "completed_at")]
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_todo_serialization() {
        let todo = Todo {
            id: "test-123".to_string(),
            content: "Test todo".to_string(),
            completed: false,
            priority: 0,
            sort_order: 0,
            list_type: "todo".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            completed_at: None,
        };

        let json = serde_json::to_string(&todo).unwrap();
        assert!(json.contains("test-123"));
        assert!(json.contains("Test todo"));
        assert!(json.contains("\"listType\":\"todo\""));

        let deserialized: Todo = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.id, todo.id);
        assert_eq!(deserialized.content, todo.content);
    }

    #[test]
    fn test_todo_with_completed_at() {
        let todo = Todo {
            id: "test-456".to_string(),
            content: "Completed todo".to_string(),
            completed: true,
            priority: 1,
            sort_order: 0,
            list_type: "done".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-02T00:00:00Z".to_string(),
            completed_at: Some("2024-01-02T00:00:00Z".to_string()),
        };

        let json = serde_json::to_string(&todo).unwrap();
        assert!(json.contains("completedAt"));
        assert!(json.contains("\"listType\":\"done\""));
        assert!(json.contains("\"completed\":true"));
    }

    #[test]
    fn test_create_todo_input() {
        let input = CreateTodoInput {
            content: "New task".to_string(),
            priority: Some(2),
        };

        let json = serde_json::to_string(&input).unwrap();
        assert!(json.contains("New task"));
        assert!(json.contains("\"priority\":2"));

        let input_no_priority = CreateTodoInput {
            content: "Simple task".to_string(),
            priority: None,
        };

        let json2 = serde_json::to_string(&input_no_priority).unwrap();
        assert!(json2.contains("Simple task"));
        assert!(json2.contains("null") || !json2.contains("priority"));
    }

    #[test]
    fn test_update_todo_input() {
        let input = UpdateTodoInput {
            id: "todo-1".to_string(),
            content: Some("Updated content".to_string()),
            completed: Some(true),
            priority: None,
        };

        let json = serde_json::to_string(&input).unwrap();
        assert!(json.contains("todo-1"));
        assert!(json.contains("Updated content"));
        assert!(json.contains("\"completed\":true"));
    }
}