import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { useTodoStore } from "../../stores/todoStore";
import type { Todo, TodoListType } from "../../types";

interface Props {
  todo: Todo;
  listType: TodoListType;
}

export function TodoItem({ todo, listType }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(todo.content);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);
  const moveToDone = useTodoStore((state) => state.moveToDone);
  const moveToTodo = useTodoStore((state) => state.moveToTodo);
  const updateTodo = useTodoStore((state) => state.updateTodo);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggle = async () => {
    if (listType === "todo") {
      await moveToDone(todo.id);
    } else {
      await moveToTodo(todo.id);
    }
  };

  const handleDelete = async () => {
    await deleteTodo(todo.id);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim()) {
      await updateTodo(todo.id, { content: editContent.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditContent(todo.content);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`group flex items-center gap-2 p-2 rounded-lg ${
        isDragging ? "bg-gray-700 shadow-lg z-10" : "bg-gray-800/50"
      } ${todo.completed ? "opacity-60" : ""}`}
      {...attributes}
    >
      {/* Drag handle */}
      <button
        className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-400"
        {...listeners}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          todo.completed
            ? "bg-green-500 border-green-500"
            : "border-gray-500 hover:border-gray-400"
        }`}
      >
        {todo.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      {isEditing ? (
        <input
          type="text"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSaveEdit}
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={`flex-1 text-sm cursor-pointer ${
            todo.completed ? "line-through text-gray-500" : "text-gray-200"
          }`}
        >
          {todo.content}
        </span>
      )}

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4 text-gray-400 hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </motion.div>
  );
}