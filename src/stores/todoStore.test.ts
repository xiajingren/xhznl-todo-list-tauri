import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTodoStore } from '../stores/todoStore';
import type { Todo } from '../types';

// Mock database service
vi.mock('../services/database', () => ({
  getAllTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  reorderTodos: vi.fn(),
  moveToDone: vi.fn(),
  moveToTodo: vi.fn(),
}));

import * as db from '../services/database';

const mockTodo: Todo = {
  id: 'test-1',
  content: 'Test todo item',
  completed: false,
  priority: 0,
  sortOrder: 0,
  listType: 'todo',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  completedAt: null,
};

const mockDoneTodo: Todo = {
  id: 'test-2',
  content: 'Completed todo',
  completed: true,
  priority: 0,
  sortOrder: 0,
  listType: 'done',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  completedAt: '2024-01-02T00:00:00Z',
};

describe('todoStore', () => {
  beforeEach(() => {
    // Reset store state
    useTodoStore.setState({
      todos: [],
      doneTodos: [],
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('loadTodos', () => {
    it('should load todos and split by listType', async () => {
      vi.mocked(db.getAllTodos).mockResolvedValue([mockTodo, mockDoneTodo]);

      await useTodoStore.getState().loadTodos();

      const state = useTodoStore.getState();
      expect(state.todos).toHaveLength(1);
      expect(state.todos[0].listType).toBe('todo');
      expect(state.doneTodos).toHaveLength(1);
      expect(state.doneTodos[0].listType).toBe('done');
      expect(state.isLoading).toBe(false);
    });

    it('should set error on failure', async () => {
      vi.mocked(db.getAllTodos).mockRejectedValue(new Error('Database error'));

      await useTodoStore.getState().loadTodos();

      const state = useTodoStore.getState();
      expect(state.error).toBe('Database error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('addTodo', () => {
    it('should add a new todo to the list', async () => {
      vi.mocked(db.createTodo).mockResolvedValue(mockTodo);

      await useTodoStore.getState().addTodo('New task');

      const state = useTodoStore.getState();
      expect(state.todos).toContainEqual(mockTodo);
      expect(db.createTodo).toHaveBeenCalledWith({ content: 'New task', priority: 0 });
    });

    it('should add todo with priority', async () => {
      const priorityTodo = { ...mockTodo, priority: 1 };
      vi.mocked(db.createTodo).mockResolvedValue(priorityTodo);

      await useTodoStore.getState().addTodo('High priority task', 1);

      expect(db.createTodo).toHaveBeenCalledWith({ content: 'High priority task', priority: 1 });
    });
  });

  describe('deleteTodo', () => {
    it('should remove todo from list', async () => {
      useTodoStore.setState({ todos: [mockTodo] });
      vi.mocked(db.deleteTodo).mockResolvedValue(undefined);

      await useTodoStore.getState().deleteTodo('test-1');

      const state = useTodoStore.getState();
      expect(state.todos).toHaveLength(0);
      expect(db.deleteTodo).toHaveBeenCalledWith('test-1');
    });

    it('should remove from doneTodos if present', async () => {
      useTodoStore.setState({ doneTodos: [mockDoneTodo] });
      vi.mocked(db.deleteTodo).mockResolvedValue(undefined);

      await useTodoStore.getState().deleteTodo('test-2');

      const state = useTodoStore.getState();
      expect(state.doneTodos).toHaveLength(0);
    });
  });

  describe('moveToDone', () => {
    it('should move todo from todos to doneTodos', async () => {
      useTodoStore.setState({ todos: [mockTodo], doneTodos: [] });
      const doneVersion = { ...mockTodo, listType: 'done', completed: true };
      vi.mocked(db.moveToDone).mockResolvedValue(doneVersion);

      await useTodoStore.getState().moveToDone('test-1');

      const state = useTodoStore.getState();
      expect(state.todos).toHaveLength(0);
      expect(state.doneTodos).toHaveLength(1);
      expect(state.doneTodos[0].listType).toBe('done');
    });
  });

  describe('moveToTodo', () => {
    it('should move todo from doneTodos to todos', async () => {
      useTodoStore.setState({ todos: [], doneTodos: [mockDoneTodo] });
      const todoVersion = { ...mockDoneTodo, listType: 'todo', completed: false };
      vi.mocked(db.moveToTodo).mockResolvedValue(todoVersion);

      await useTodoStore.getState().moveToTodo('test-2');

      const state = useTodoStore.getState();
      expect(state.doneTodos).toHaveLength(0);
      expect(state.todos).toHaveLength(1);
      expect(state.todos[0].listType).toBe('todo');
    });
  });

  describe('reorderTodos', () => {
    it('should reorder todos based on given IDs', async () => {
      const todo1 = { ...mockTodo, id: 'todo-1', sortOrder: 0 };
      const todo2 = { ...mockTodo, id: 'todo-2', sortOrder: 1 };
      const todo3 = { ...mockTodo, id: 'todo-3', sortOrder: 2 };

      useTodoStore.setState({ todos: [todo1, todo2, todo3] });
      vi.mocked(db.reorderTodos).mockResolvedValue(undefined);

      // Reorder: move todo-3 to first position
      await useTodoStore.getState().reorderTodos('todo', ['todo-3', 'todo-1', 'todo-2']);

      const state = useTodoStore.getState();
      expect(state.todos[0].id).toBe('todo-3');
      expect(state.todos[0].sortOrder).toBe(0);
      expect(state.todos[1].id).toBe('todo-1');
      expect(state.todos[1].sortOrder).toBe(1);
    });
  });

  describe('toggleComplete', () => {
    it('should call moveToDone if todo is in todos list', async () => {
      useTodoStore.setState({ todos: [mockTodo] });
      const doneVersion = { ...mockTodo, listType: 'done' };
      vi.mocked(db.moveToDone).mockResolvedValue(doneVersion);

      await useTodoStore.getState().toggleComplete('test-1');

      expect(db.moveToDone).toHaveBeenCalledWith('test-1');
    });

    it('should call moveToTodo if todo is in doneTodos list', async () => {
      useTodoStore.setState({ doneTodos: [mockDoneTodo] });
      const todoVersion = { ...mockDoneTodo, listType: 'todo' };
      vi.mocked(db.moveToTodo).mockResolvedValue(todoVersion);

      await useTodoStore.getState().toggleComplete('test-2');

      expect(db.moveToTodo).toHaveBeenCalledWith('test-2');
    });
  });

  describe('clearDone', () => {
    it('should delete all done todos', async () => {
      useTodoStore.setState({ doneTodos: [mockDoneTodo] });
      vi.mocked(db.deleteTodo).mockResolvedValue(undefined);

      await useTodoStore.getState().clearDone();

      const state = useTodoStore.getState();
      expect(state.doneTodos).toHaveLength(0);
      expect(db.deleteTodo).toHaveBeenCalledWith('test-2');
    });
  });
});