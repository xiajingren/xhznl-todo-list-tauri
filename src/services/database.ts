import { invoke } from "@tauri-apps/api/core";
import type { Todo, CreateTodoInput } from "../types";

export async function getAllTodos(): Promise<Todo[]> {
  return invoke<Todo[]>("get_todos");
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  return invoke<Todo>("create_todo", { input });
}

export async function updateTodo(
  id: string,
  updates: Partial<Omit<Todo, "id" | "createdAt">>
): Promise<Todo> {
  return invoke<Todo>("update_todo", { id, ...updates });
}

export async function deleteTodo(id: string): Promise<void> {
  return invoke("delete_todo", { id });
}

export async function reorderTodos(todo_ids: string[]): Promise<void> {
  return invoke("reorder_todos", { todo_ids });
}

export async function moveToDone(id: string): Promise<Todo> {
  return invoke<Todo>("move_to_done", { id });
}

export async function moveToTodo(id: string): Promise<Todo> {
  return invoke<Todo>("move_to_todo", { id });
}