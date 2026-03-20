"use client";

import { FormEvent, useState } from "react";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export default function HomePage() {
  const [draft, setDraft] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const trimmedDraft = draft.trim();
  const todoCountLabel = `${todos.length} item${todos.length === 1 ? "" : "s"}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedDraft) {
      setErrorMessage("Enter a todo before submitting.");
      return;
    }

    setTodos((currentTodos) => [
      ...currentTodos,
      { id: currentTodos.length + 1, title: trimmedDraft, completed: false },
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
            <span>{todoCountLabel}</span>
          </div>

          <p className="section-note">
            {todos.length
              ? "Todo items appear here as soon as you add them."
              : "Todo items will appear here."}
          </p>

          {todos.length ? (
            <ul className="todo-items" aria-label="Current todos">
              {todos.map((todo) => (
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
                  <span
                    className={`todo-title${todo.completed ? " todo-title-completed" : ""}`}
                  >
                    {todo.title}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state" role="status" aria-live="polite">
              <p className="empty-state-title">No todos yet.</p>
              <p className="empty-state-copy">
                Add your first task using the input above.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
