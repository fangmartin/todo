"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

type TodoFilter = "all" | "active" | "completed";

export const TODO_STORAGE_KEY = "todo-app.todos";

const FILTER_OPTIONS: Array<{ label: string; value: TodoFilter }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

const isStoredTodo = (value: unknown): value is Todo => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.title === "string" &&
    typeof candidate.completed === "boolean"
  );
};

const readStoredTodos = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedTodos = window.localStorage.getItem(TODO_STORAGE_KEY);

    if (!storedTodos) {
      return [];
    }

    const parsedTodos: unknown = JSON.parse(storedTodos);

    if (!Array.isArray(parsedTodos)) {
      return [];
    }

    return parsedTodos.filter(isStoredTodo);
  } catch {
    return [];
  }
};

const writeStoredTodos = (todos: Todo[]) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Ignore storage write failures so the UI remains usable.
  }
};

export default function HomePage() {
  const [draft, setDraft] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [hasLoadedTodos, setHasLoadedTodos] = useState(false);
  const nextTodoId = useRef(1);

  const trimmedDraft = draft.trim();
  const trimmedEditDraft = editDraft.trim();
  const activeTodoCount = todos.filter((todo) => !todo.completed).length;
  const visibleTodos = todos.filter((todo) => {
    if (filter === "active") {
      return !todo.completed;
    }

    if (filter === "completed") {
      return todo.completed;
    }

    return true;
  });
  const activeTodoCountLabel = `${activeTodoCount} active todo${activeTodoCount === 1 ? "" : "s"} remaining`;
  const emptyStateTitle =
    filter === "active"
      ? "No active todos."
      : filter === "completed"
        ? "No completed todos."
        : "No todos yet.";
  const emptyStateCopy =
    filter === "active"
      ? "Add a task or mark a completed one as active."
      : filter === "completed"
        ? "Complete a task to see it here."
        : "Add your first task using the input above.";

  useEffect(() => {
    const restoredTodos = readStoredTodos();

    setTodos(restoredTodos);
    nextTodoId.current =
      restoredTodos.reduce((maxTodoId, todo) => Math.max(maxTodoId, todo.id), 0) + 1;
    setHasLoadedTodos(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedTodos) {
      return;
    }

    writeStoredTodos(todos);
  }, [hasLoadedTodos, todos]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedDraft) {
      setErrorMessage("Enter a todo before submitting.");
      return;
    }

    setTodos((currentTodos) => [
      ...currentTodos,
      { id: nextTodoId.current++, title: trimmedDraft, completed: false },
    ]);
    setDraft("");
    setErrorMessage("");
  };

  const handleToggleTodo = (todoId: number) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const handleDeleteTodo = (todoId: number) => {
    if (editingTodoId === todoId) {
      setEditingTodoId(null);
      setEditDraft("");
      setEditErrorMessage("");
    }

    setTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== todoId),
    );
  };

  const handleStartEditingTodo = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditDraft(todo.title);
    setEditErrorMessage("");
  };

  const handleCancelEditingTodo = () => {
    setEditingTodoId(null);
    setEditDraft("");
    setEditErrorMessage("");
  };

  const handleSaveTodoEdit = (todoId: number) => {
    if (!trimmedEditDraft) {
      setEditErrorMessage("Edited todo title cannot be empty.");
      return;
    }

    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, title: trimmedEditDraft } : todo,
      ),
    );
    handleCancelEditingTodo();
  };

  return (
    <main className="page-shell">
      <section className="todo-card">
        <div className="hero-copy">
          <p className="eyebrow">Starter layout</p>
          <h1>Todo App</h1>
          <p className="lede">
            Capture what needs doing, then see each todo appear instantly in
            the list below.
          </p>
        </div>

        <form className="todo-form" aria-label="Todo composer" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">New task</span>
            <input
              type="text"
              placeholder="Add a todo"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (errorMessage) {
                  setErrorMessage("");
                }
              }}
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? "new-task-error" : undefined}
            />
            {errorMessage ? (
              <span className="field-error" id="new-task-error" role="alert">
                {errorMessage}
              </span>
            ) : null}
          </label>
          <button type="submit" disabled={!trimmedDraft}>
            Add todo
          </button>
        </form>

        <section className="todo-list-section" aria-labelledby="preview-heading">
          <div className="section-header">
            <h2 id="preview-heading">Todo List</h2>
            <span>{activeTodoCountLabel}</span>
          </div>

          <p className="section-note">
            {visibleTodos.length
              ? "Todo items appear here as soon as you add them."
              : filter === "all"
                ? "Todo items will appear here."
                : "Switch filters to view other todos."}
          </p>

          <div className="todo-filters" aria-label="Filter todos">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                className="todo-filter-button"
                type="button"
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {visibleTodos.length ? (
            <ul className="todo-items" aria-label="Current todos">
              {visibleTodos.map((todo) => (
                <li
                  className={`todo-item${todo.completed ? " todo-item-completed" : ""}`}
                  key={todo.id}
                >
                  <label className="todo-toggle">
                    <input
                      className="todo-toggle-input"
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id)}
                      aria-label={`Toggle completion for ${todo.title}`}
                    />
                    <span className="todo-toggle-indicator" aria-hidden="true" />
                  </label>
                  {editingTodoId === todo.id ? (
                    <form
                      className="todo-edit-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleSaveTodoEdit(todo.id);
                      }}
                    >
                      <input
                        className="todo-edit-input"
                        type="text"
                        value={editDraft}
                        onChange={(event) => {
                          setEditDraft(event.target.value);
                          if (editErrorMessage) {
                            setEditErrorMessage("");
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            event.preventDefault();
                            handleCancelEditingTodo();
                          }
                        }}
                        aria-label={`Edit ${todo.title}`}
                        aria-invalid={Boolean(editErrorMessage)}
                        aria-describedby={
                          editErrorMessage ? `todo-edit-error-${todo.id}` : undefined
                        }
                        autoFocus
                      />
                      {editErrorMessage ? (
                        <span
                          className="todo-edit-error"
                          id={`todo-edit-error-${todo.id}`}
                          role="alert"
                        >
                          {editErrorMessage}
                        </span>
                      ) : null}
                      <div className="todo-item-actions">
                        <button className="todo-save-button" type="submit">
                          Save
                        </button>
                        <button
                          className="todo-cancel-button"
                          type="button"
                          onClick={handleCancelEditingTodo}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <span
                        className={`todo-title${todo.completed ? " todo-title-completed" : ""}`}
                      >
                        {todo.title}
                      </span>
                      <div className="todo-item-actions">
                        <button
                          className="todo-edit-button"
                          type="button"
                          onClick={() => handleStartEditingTodo(todo)}
                          aria-label={`Edit ${todo.title}`}
                        >
                          Edit
                        </button>
                        <button
                          className="todo-delete-button"
                          type="button"
                          onClick={() => handleDeleteTodo(todo.id)}
                          aria-label={`Delete ${todo.title}`}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state" role="status" aria-live="polite">
              <p className="empty-state-title">{emptyStateTitle}</p>
              <p className="empty-state-copy">{emptyStateCopy}</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
