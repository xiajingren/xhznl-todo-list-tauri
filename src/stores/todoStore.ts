import { create } from "zustand";
import type { Todo, TodoListType } from "../types";
import * as db from "../services/database";

interface TodoState {
  todos: Todo[];
  doneTodos: Todo[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTodos: () => Promise<void>;
  addTodo: (content: string, priority?: number) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  reorderTodos: (listType: TodoListType, todoIds: string[]) => Promise<void>;
  moveToDone: (id: string) => Promise<void>;
  moveToTodo: (id: string) => Promise<void>;
  clearDone: () => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  doneTodos: [],
  isLoading: false,
  error: null,

  loadTodos: async () => {
    set({ isLoading: true, error: null });
    try {
      const allTodos = await db.getAllTodos();
      set({
        todos: allTodos
          .filter((t) => t.listType === "todo")
          .sort((a, b) => a.sortOrder - b.sortOrder),
        doneTodos: allTodos
          .filter((t) => t.listType === "done")
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        isLoading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addTodo: async (content, priority = 0) => {
    try {
      const newTodo = await db.createTodo({ content, priority });
      set((state) => ({
        todos: [...state.todos, newTodo].sort(
          (a, b) => a.sortOrder - b.sortOrder
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateTodo: async (id, updates) => {
    try {
      const updated = await db.updateTodo(id, updates);
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? updated : t)),
        doneTodos: state.doneTodos.map((t) => (t.id === id ? updated : t)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteTodo: async (id) => {
    try {
      await db.deleteTodo(id);
      set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
        doneTodos: state.doneTodos.filter((t) => t.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  toggleComplete: async (id) => {
    const todo = get().todos.find((t) => t.id === id);
    if (todo) {
      await get().moveToDone(id);
    } else {
      await get().moveToTodo(id);
    }
  },

  reorderTodos: async (listType, todo_ids) => {
    try {
      await db.reorderTodos(todo_ids);
      set((state) => {
        if (listType === "todo") {
          const reorderedTodos = todo_ids.map((id, index) => {
            const todo = state.todos.find((t) => t.id === id);
            return todo ? { ...todo, sortOrder: index } : null;
          }).filter(Boolean) as Todo[];
          return { todos: reorderedTodos };
        }
        return state;
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  moveToDone: async (id) => {
    try {
      const updated = await db.moveToDone(id);
      set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
        doneTodos: [updated, ...state.doneTodos],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  moveToTodo: async (id) => {
    try {
      const updated = await db.moveToTodo(id);
      set((state) => ({
        doneTodos: state.doneTodos.filter((t) => t.id !== id),
        todos: [...state.todos, updated].sort(
          (a, b) => a.sortOrder - b.sortOrder
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  clearDone: async () => {
    try {
      for (const todo of get().doneTodos) {
        await db.deleteTodo(todo.id);
      }
      set({ doneTodos: [] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));