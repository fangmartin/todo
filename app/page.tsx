export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="todo-card">
        <div className="hero-copy">
          <p className="eyebrow">Starter layout</p>
          <h1>Todo App</h1>
          <p className="lede">
            A clean shell for capturing tasks is ready. Adding, listing, and
            managing todos will come next.
          </p>
        </div>

        <form className="todo-form" aria-label="Todo composer">
          <label className="field">
            <span className="field-label">New task</span>
            <input
              type="text"
              placeholder="Add a todo"
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
            <h2 id="preview-heading">Todo List</h2>
            <span>0 items</span>
          </div>

          <p className="section-note">Todo items will appear here.</p>

          <div className="empty-state" role="status" aria-live="polite">
            <p className="empty-state-title">No todos yet.</p>
            <p className="empty-state-copy">
              Add your first task using the input above when todo creation is
              enabled.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
