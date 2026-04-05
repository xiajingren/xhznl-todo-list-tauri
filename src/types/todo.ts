export interface Todo {
  id: string;
  content: string;
  completed: boolean;
  priority: number;
  sortOrder: number;
  listType: 'todo' | 'done';
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateTodoInput {
  content: string;
  priority?: number;
}

export interface UpdateTodoInput {
  id: string;
  content?: string;
  completed?: boolean;
  priority?: number;
}

export type TodoListType = 'todo' | 'done';