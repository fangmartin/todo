"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

type TodoFilter = "all" | "active" | "completed";
type FocusTarget =
  | { type: "composer" }
  | { type: "todo-edit-button"; todoId: number };

export const TODO_STORAGE_KEY = "todo-app.todos";
export const STORAGE_UNAVAILABLE_NOTICE =
  "Changes are only saved for this session because browser storage is unavailable.";

const FILTER_OPTIONS: Array<{ label: string; value: TodoFilter }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

const COMPOSER_INPUT_ID = "new-task-input";

const todoMatchesFilter = (todo: Todo, filter: TodoFilter) => {
  if (filter === "active") {
    return !todo.completed;
  }

  if (filter === "completed") {
    return todo.completed;
  }

  return true;
};

const getVisibleTodos = (todos: Todo[], filter: TodoFilter) =>
  todos.filter((todo) => todoMatchesFilter(todo, filter));

const getTodoTitleId = (todoId: number) => `todo-title-${todoId}`;
const getTodoEditInputId = (todoId: number) => `todo-edit-input-${todoId}`;
const getTodoToggleLabelId = (todoId: number) => `todo-toggle-label-${todoId}`;
const getTodoEditLabelId = (todoId: number) => `todo-edit-label-${todoId}`;
const getTodoDeleteLabelId = (todoId: number) => `todo-delete-label-${todoId}`;

type StoredTodosResult = {
  todos: Todo[];
  notice: string | null;
};

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

const readStoredTodos = (): StoredTodosResult => {
  if (typeof window === "undefined") {
    return { todos: [], notice: null };
  }

  let storedTodos: string | null = null;

  try {
    storedTodos = window.localStorage.getItem(TODO_STORAGE_KEY);
  } catch {
    return { todos: [], notice: STORAGE_UNAVAILABLE_NOTICE };
  }

  if (!storedTodos) {
    return { todos: [], notice: null };
  }

  try {
    const parsedTodos: unknown = JSON.parse(storedTodos);

    if (!Array.isArray(parsedTodos)) {
      return { todos: [], notice: null };
    }

    return { todos: parsedTodos.filter(isStoredTodo), notice: null };
  } catch {
    return { todos: [], notice: null };
  }
};

const writeStoredTodos = (todos: Todo[]) => {
  if (typeof window === "undefined") {
    return { notice: null };
  }

  try {
    window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
    return { notice: null };
  } catch {
    return { notice: STORAGE_UNAVAILABLE_NOTICE };
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
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  const [hasLoadedTodos, setHasLoadedTodos] = useState(false);
  const nextTodoId = useRef(1);
  const hasPersistedHydratedTodos = useRef(false);
  const composerInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const editButtonRefs = useRef(new Map<number, HTMLButtonElement | null>());
  const pendingFocusTarget = useRef<FocusTarget | null>(null);

  const trimmedDraft = draft.trim();
  const trimmedEditDraft = editDraft.trim();
  const totalTodoCount = todos.length;
  const activeTodoCount = todos.filter((todo) => !todo.completed).length;
  const completedTodoCount = todos.length - activeTodoCount;
  const visibleTodos = getVisibleTodos(todos, filter);
  const activeTodoCountLabel = `${activeTodoCount} active todo${activeTodoCount === 1 ? "" : "s"} remaining`;
  const visibleTodoCountLabel = `${visibleTodos.length} of ${totalTodoCount} task${totalTodoCount === 1 ? "" : "s"} shown`;
  const emptyStateTitle =
    filter === "active"
      ? "No active tasks right now."
      : filter === "completed"
        ? "No completed tasks to review."
        : "Nothing on your list yet.";
  const emptyStateCopy =
    filter === "active"
      ? "Everything is caught up. Add a new task or reopen a completed one."
      : filter === "completed"
        ? "Finish a task and it will show up here for a quick recap."
        : "Add your first task above to start a calm, focused queue.";
  const sectionNote = !hasLoadedTodos
    ? "Checking for saved tasks before showing the latest state."
    : visibleTodos.length
      ? "Edit details, mark progress, or clear finished work when the list is ready for a reset."
      : filter === "all"
        ? "Start with one clear task and let the rest wait until it matters."
        : filter === "active"
          ? "You're caught up for now. Reopen a completed task or add something new."
          : "Finish a task and it will land here for a quick recap.";

  useEffect(() => {
    const restoredTodos = readStoredTodos();

    setTodos(restoredTodos.todos);
    setStorageNotice(restoredTodos.notice);
    nextTodoId.current =
      restoredTodos.todos.reduce((maxTodoId, todo) => Math.max(maxTodoId, todo.id), 0) + 1;
    setHasLoadedTodos(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedTodos) {
      return;
    }

    if (!hasPersistedHydratedTodos.current) {
      hasPersistedHydratedTodos.current = true;
      return;
    }

    const persistenceResult = writeStoredTodos(todos);

    setStorageNotice(persistenceResult.notice);
  }, [hasLoadedTodos, todos]);

  useEffect(() => {
    const nextFocus = pendingFocusTarget.current;

    if (!nextFocus) {
      return;
    }

    if (nextFocus.type === "todo-edit-button") {
      const editButton = editButtonRefs.current.get(nextFocus.todoId);

      if (editButton) {
        editButton.focus();
        pendingFocusTarget.current = null;
        return;
      }
    }

    composerInputRef.current?.focus();
    pendingFocusTarget.current = null;
  }, [editingTodoId, filter, todos]);

  useEffect(() => {
    if (!editingTodoId) {
      return;
    }

    const editInput = editInputRef.current;

    if (!editInput) {
      return;
    }

    editInput.focus();
    editInput.select();
  }, [editingTodoId]);

  const queueFocus = (target: FocusTarget) => {
    pendingFocusTarget.current = target;
  };

  const resetEditingState = () => {
    setEditingTodoId(null);
    setEditDraft("");
    setEditErrorMessage("");
  };

  const getFocusTargetAfterRemoval = (todoId: number): FocusTarget => {
    const remainingVisibleTodos = visibleTodos.filter((todo) => todo.id !== todoId);

    if (!remainingVisibleTodos.length) {
      return { type: "composer" };
    }

    const removedTodoIndex = visibleTodos.findIndex((todo) => todo.id === todoId);
    const nextTodoIndex =
      removedTodoIndex === -1
        ? 0
        : Math.min(removedTodoIndex, remainingVisibleTodos.length - 1);

    return {
      type: "todo-edit-button",
      todoId: remainingVisibleTodos[nextTodoIndex].id,
    };
  };

  const setEditButtonRef =
    (todoId: number) => (node: HTMLButtonElement | null) => {
      if (node) {
        editButtonRefs.current.set(todoId, node);
        return;
      }

      editButtonRefs.current.delete(todoId);
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedDraft) {
      setErrorMessage("Enter a todo before submitting.");
      composerInputRef.current?.focus();
      return;
    }

    setTodos((currentTodos) => [
      ...currentTodos,
      { id: nextTodoId.current++, title: trimmedDraft, completed: false },
    ]);
    setDraft("");
    setErrorMessage("");
    composerInputRef.current?.focus();
  };

  const handleToggleTodo = (todoId: number) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const handleDeleteTodo = (todoId: number) => {
    queueFocus(getFocusTargetAfterRemoval(todoId));

    if (editingTodoId === todoId) {
      resetEditingState();
    }

    setTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== todoId),
    );
  };

  const handleClearCompleted = () => {
    if (!completedTodoCount) {
      return;
    }

    if (
      editingTodoId !== null &&
      todos.some((todo) => todo.id === editingTodoId && todo.completed)
    ) {
      resetEditingState();
    }

    queueFocus({ type: "composer" });
    setTodos((currentTodos) =>
      currentTodos.filter((todo) => !todo.completed),
    );
  };

  const handleStartEditingTodo = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditDraft(todo.title);
    setEditErrorMessage("");
  };

  const handleCancelEditingTodo = (todoId?: number) => {
    if (typeof todoId === "number") {
      queueFocus({ type: "todo-edit-button", todoId });
    }

    resetEditingState();
  };

  const handleSaveTodoEdit = (todoId: number) => {
    if (!trimmedEditDraft) {
      setEditErrorMessage("Edited todo title cannot be empty.");
      editInputRef.current?.focus();
      return;
    }

    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, title: trimmedEditDraft } : todo,
      ),
    );
    handleCancelEditingTodo(todoId);
  };

  const handleFilterChange = (nextFilter: TodoFilter) => {
    setFilter(nextFilter);

    if (
      editingTodoId !== null &&
      todos.some(
        (todo) =>
          todo.id === editingTodoId && !todoMatchesFilter(todo, nextFilter),
      )
    ) {
      resetEditingState();
    }
  };

  return (
    <main className="page-shell">
      <section className="todo-card">
        <div className="hero-copy">
          <p className="eyebrow">Daily focus</p>
          <h1>Todo App</h1>
          <p className="lede">
            Keep the next task visible, clear finished work with confidence,
            and pick up where you left off when storage is available.
          </p>
          <div className="hero-metrics" aria-label="Todo summary">
            <div className="hero-metric">
              <span className="hero-metric-value">{activeTodoCount}</span>
              <span className="hero-metric-label">Active</span>
            </div>
            <div className="hero-metric">
              <span className="hero-metric-value">{completedTodoCount}</span>
              <span className="hero-metric-label">Completed</span>
            </div>
            <div className="hero-metric">
              <span className="hero-metric-value">{totalTodoCount}</span>
              <span className="hero-metric-label">Total</span>
            </div>
          </div>
        </div>

        <form className="todo-form" aria-label="Todo composer" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor={COMPOSER_INPUT_ID}>
              New task
            </label>
            <input
              id={COMPOSER_INPUT_ID}
              ref={composerInputRef}
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
          </div>
          <button type="submit" disabled={!trimmedDraft}>
            Add todo
          </button>
        </form>

        {storageNotice ? (
          <p className="storage-notice" role="status" aria-live="polite">
            {storageNotice}
          </p>
        ) : null}

        <section className="todo-list-section" aria-labelledby="preview-heading">
          <div className="section-header">
            <div className="section-heading">
              <h2 id="preview-heading">Current tasks</h2>
              <p className="section-kicker">
                A clean view of what still needs attention.
              </p>
            </div>
            <p className="todo-count" aria-live="polite">
              {activeTodoCountLabel}
            </p>
          </div>

          <p className="section-note">{sectionNote}</p>

          <div className="todo-toolbar">
            <p className="toolbar-summary">{visibleTodoCountLabel}</p>
            <fieldset className="todo-filters">
              <legend className="sr-only">Filter todos</legend>
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className="todo-filter-button"
                  type="button"
                  aria-pressed={filter === option.value}
                  onClick={() => handleFilterChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </fieldset>
            {completedTodoCount ? (
              <button
                className="todo-clear-button"
                type="button"
                onClick={handleClearCompleted}
              >
                Clear completed
              </button>
            ) : null}
          </div>

          {!hasLoadedTodos ? (
            <div className="startup-state" role="status" aria-live="polite">
              <p className="startup-state-title">Checking saved tasks</p>
              <p className="startup-state-copy">
                Restoring your list before showing the next step.
              </p>
            </div>
          ) : visibleTodos.length ? (
            <ul className="todo-items" aria-label="Current todos">
              {visibleTodos.map((todo) => (
                <li
                  className={`todo-item${todo.completed ? " todo-item-completed" : ""}`}
                  key={todo.id}
                >
                  <label className="todo-toggle">
                    <input
                      id={`todo-toggle-${todo.id}`}
                      className="todo-toggle-input"
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id)}
                      aria-labelledby={`${getTodoToggleLabelId(todo.id)} ${getTodoTitleId(todo.id)}`}
                    />
                    <span className="todo-toggle-indicator" aria-hidden="true" />
                    <span className="sr-only" id={getTodoToggleLabelId(todo.id)}>
                      Toggle completion for
                    </span>
                  </label>
                  {editingTodoId === todo.id ? (
                    <form
                      className="todo-edit-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleSaveTodoEdit(todo.id);
                      }}
                    >
                      <label
                        className="sr-only"
                        htmlFor={getTodoEditInputId(todo.id)}
                      >
                        {`Edit ${todo.title}`}
                      </label>
                      <input
                        id={getTodoEditInputId(todo.id)}
                        ref={editInputRef}
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
                            handleCancelEditingTodo(todo.id);
                          }
                        }}
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
                      <div
                        className="todo-item-actions"
                        role="group"
                        aria-label={`Editing actions for ${todo.title}`}
                      >
                        <button className="todo-save-button" type="submit">
                          Save
                        </button>
                        <button
                          className="todo-cancel-button"
                          type="button"
                          onClick={() => handleCancelEditingTodo(todo.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="todo-copy">
                        <span
                          id={getTodoTitleId(todo.id)}
                          className={`todo-title${todo.completed ? " todo-title-completed" : ""}`}
                        >
                          {todo.title}
                        </span>
                        <span
                          className={`todo-state${todo.completed ? " todo-state-completed" : ""}`}
                        >
                          {todo.completed ? "Completed" : "In progress"}
                        </span>
                      </div>
                      <div
                        className="todo-item-actions"
                        role="group"
                        aria-label={`Actions for ${todo.title}`}
                      >
                        <button
                          ref={setEditButtonRef(todo.id)}
                          className="todo-edit-button"
                          type="button"
                          onClick={() => handleStartEditingTodo(todo)}
                          aria-labelledby={`${getTodoEditLabelId(todo.id)} ${getTodoTitleId(todo.id)}`}
                        >
                          <span aria-hidden="true">Edit</span>
                          <span className="sr-only" id={getTodoEditLabelId(todo.id)}>
                            Edit
                          </span>
                        </button>
                        <button
                          className="todo-delete-button"
                          type="button"
                          onClick={() => handleDeleteTodo(todo.id)}
                          aria-labelledby={`${getTodoDeleteLabelId(todo.id)} ${getTodoTitleId(todo.id)}`}
                        >
                          <span aria-hidden="true">Delete</span>
                          <span className="sr-only" id={getTodoDeleteLabelId(todo.id)}>
                            Delete
                          </span>
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
