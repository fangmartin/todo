const previewTodos = [
  { id: 1, title: "Plan the week", done: false },
  { id: 2, title: "Ship the scaffold", done: true },
  { id: 3, title: "Review tomorrow's priorities", done: false },
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="todo-card">
        <div className="hero-copy">
          <p className="eyebrow">Todo App</p>
          <h1>Capture tasks, keep focus, ship cleanly.</h1>
          <p className="lede">
            This starter is intentionally small: App Router, TypeScript, and a
            production-ready foundation for building a real todo workflow.
          </p>
        </div>

        <form className="todo-form" aria-label="Todo composer">
          <label className="field">
            <span className="field-label">New task</span>
            <input
              type="text"
              placeholder="Add a task"
              disabled
              aria-disabled="true"
            />
          </label>
          <button type="button" disabled aria-disabled="true">
            Add todo
          </button>
        </form>

        <section className="todo-list-section" aria-labelledby="preview-heading">
          <div className="section-header">
            <h2 id="preview-heading">Today</h2>
            <span>3 items</span>
          </div>

          <ul className="todo-list">
            {previewTodos.map((todo) => (
              <li key={todo.id} className="todo-item">
                <label>
                  <input type="checkbox" checked={todo.done} readOnly />
                  <span className={todo.done ? "todo-text done" : "todo-text"}>
                    {todo.title}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}
