import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { useTodoStore } from "../../stores/todoStore";
import { TodoItem } from "./TodoItem";
import { TodoInput } from "./TodoInput";
import type { TodoListType } from "../../types";

export function TodoList() {
  const [activeTab, setActiveTab] = useState<TodoListType>("todo");
  const todos = useTodoStore((state) => state.todos);
  const doneTodos = useTodoStore((state) => state.doneTodos);
  const reorderTodos = useTodoStore((state) => state.reorderTodos);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentList = activeTab === "todo" ? todos : doneTodos;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = currentList.findIndex((t) => t.id === active.id);
      const newIndex = currentList.findIndex((t) => t.id === over.id);

      const newOrder = [...currentList];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);

      reorderTodos(activeTab, newOrder.map((t) => t.id));
    }
  };

  return (
    <div className="todo-list">
      {/* Tab switcher */}
      <div className="flex mb-3 bg-gray-800 rounded-lg p-1">
        <TabButton active={activeTab === "todo"} onClick={() => setActiveTab("todo")}>
          Todo ({todos.length})
        </TabButton>
        <TabButton active={activeTab === "done"} onClick={() => setActiveTab("done")}>
          Done ({doneTodos.length})
        </TabButton>
      </div>

      {/* Input (only for todo tab) */}
      {activeTab === "todo" && <TodoInput />}

      {/* List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={currentList.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <motion.div layout className="space-y-2 mt-3 max-h-[200px] overflow-y-auto scrollbar">
            <AnimatePresence mode="popLayout">
              {currentList.map((todo) => (
                <TodoItem key={todo.id} todo={todo} listType={activeTab} />
              ))}
            </AnimatePresence>
          </motion.div>
        </SortableContext>
      </DndContext>

      {/* Empty state */}
      {currentList.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 py-8"
        >
          {activeTab === "todo" ? "No todos yet. Add one above!" : "No completed todos yet."}
        </motion.div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-1 px-2 rounded text-sm transition-colors ${
        active
          ? "bg-gray-700 text-white font-medium"
          : "text-gray-400 hover:text-gray-300"
      }`}
    >
      {children}
    </button>
  );
}