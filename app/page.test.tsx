import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import HomePage, { TODO_STORAGE_KEY } from "./page";

const activeTodoCountLabel = (count: number) =>
  `${count} active todo${count === 1 ? "" : "s"} remaining`;

describe("HomePage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds a new todo from the composer and shows it in the list", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "Todo App" })).toBeInTheDocument();
    const input = screen.getByRole("textbox", { name: "New task" });
    const button = screen.getByRole("button", { name: "Add todo" });

    expect(button).toBeDisabled();

    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.click(button);

    expect(screen.getByRole("list", { name: "Current todos" })).toBeInTheDocument();
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Toggle completion for Buy milk" }),
    ).toBeInTheDocument();
    expect(screen.getByText(activeTodoCountLabel(1))).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(screen.queryByText("No todos yet.")).not.toBeInTheDocument();
  });

  it("toggles a todo completed state on and off", () => {
    render(<HomePage />);

    const input = screen.getByRole("textbox", { name: "New task" });
    const button = screen.getByRole("button", { name: "Add todo" });

    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.click(button);

    expect(screen.getByText(activeTodoCountLabel(1))).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox", {
      name: "Toggle completion for Buy milk",
    });

    expect(checkbox).not.toBeChecked();
    expect(screen.getByText("Buy milk").closest("li")).not.toHaveClass(
      "todo-item-completed",
    );
    expect(screen.getByText("Buy milk")).not.toHaveClass("todo-title-completed");

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByText("Buy milk").closest("li")).toHaveClass(
      "todo-item-completed",
    );
    expect(screen.getByText("Buy milk")).toHaveClass("todo-title-completed");
    expect(screen.getByText(activeTodoCountLabel(0))).toBeInTheDocument();

    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.getByText("Buy milk").closest("li")).not.toHaveClass(
      "todo-item-completed",
    );
    expect(screen.getByText("Buy milk")).not.toHaveClass("todo-title-completed");
    expect(screen.getByText(activeTodoCountLabel(1))).toBeInTheDocument();
  });

  it("deletes a todo immediately without affecting the remaining items", () => {
    render(<HomePage />);

    const input = screen.getByRole("textbox", { name: "New task" });
    const button = screen.getByRole("button", { name: "Add todo" });

    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.click(button);
    fireEvent.change(input, { target: { value: "Walk dog" } });
    fireEvent.click(button);

    expect(screen.getByText(activeTodoCountLabel(2))).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete Buy milk" }));

    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
    expect(screen.getByText("Walk dog")).toBeInTheDocument();
    expect(screen.getByText(activeTodoCountLabel(1))).toBeInTheDocument();
  });

  it("restores the empty state after deleting the last todo", () => {
    render(<HomePage />);

    const input = screen.getByRole("textbox", { name: "New task" });
    const button = screen.getByRole("button", { name: "Add todo" });

    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.click(button);

    fireEvent.click(screen.getByRole("button", { name: "Delete Buy milk" }));

    expect(screen.queryByRole("list", { name: "Current todos" })).not.toBeInTheDocument();
    expect(screen.getByText(activeTodoCountLabel(0))).toBeInTheDocument();
    expect(screen.getByText("No todos yet.")).toBeInTheDocument();
  });

  it("rejects whitespace-only todos", () => {
    render(<HomePage />);

    const input = screen.getByRole("textbox", { name: "New task" });
    const form = input.closest("form");

    if (!form) {
      throw new Error("Expected todo composer form to be present.");
    }

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.submit(form);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a todo before submitting.",
    );
    expect(screen.queryByRole("list", { name: "Current todos" })).not.toBeInTheDocument();
    expect(screen.getByText(activeTodoCountLabel(0))).toBeInTheDocument();
    expect(screen.getByText("No todos yet.")).toBeInTheDocument();
  });

  it("enters edit mode, saves an updated title, and restores the edit after reload", () => {
    window.localStorage.setItem(
      TODO_STORAGE_KEY,
      JSON.stringify([{ id: 1, title: "Buy milk", completed: false }]),
    );

    const { unmount } = render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "Edit Buy milk" }));

    const editInput = screen.getByRole("textbox", { name: "Edit Buy milk" });

    expect(editInput).toHaveValue("Buy milk");
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    fireEvent.change(editInput, { target: { value: "Buy oat milk" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.queryByRole("textbox", { name: "Edit Buy milk" })).not.toBeInTheDocument();
    expect(screen.getByText("Buy oat milk")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Toggle completion for Buy oat milk" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit Buy oat milk" }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem(TODO_STORAGE_KEY)).toBe(
      JSON.stringify([{ id: 1, title: "Buy oat milk", completed: false }]),
    );

    unmount();
    render(<HomePage />);

    expect(screen.getByText("Buy oat milk")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit Buy oat milk" }),
    ).toBeInTheDocument();
  });

  it("rejects whitespace-only edits and keeps the original title unchanged", () => {
    window.localStorage.setItem(
      TODO_STORAGE_KEY,
      JSON.stringify([{ id: 1, title: "Buy milk", completed: false }]),
    );

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "Edit Buy milk" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Edit Buy milk" }), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Edited todo title cannot be empty.",
    );
    expect(screen.getByRole("textbox", { name: "Edit Buy milk" })).toHaveValue("   ");
    expect(window.localStorage.getItem(TODO_STORAGE_KEY)).toBe(
      JSON.stringify([{ id: 1, title: "Buy milk", completed: false }]),
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit Buy milk" }),
    ).toBeInTheDocument();
  });

  it("restores persisted todos with their completed state on load", () => {
    window.localStorage.setItem(
      TODO_STORAGE_KEY,
      JSON.stringify([
        { id: 1, title: "Buy milk", completed: false },
        { id: 2, title: "Walk dog", completed: true },
      ]),
    );

    render(<HomePage />);

    expect(screen.getByText(activeTodoCountLabel(1))).toBeInTheDocument();

    const completedTodo = screen.getByText("Walk dog");
    const completedCheckbox = screen.getByRole("checkbox", {
      name: "Toggle completion for Walk dog",
    });

    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(completedCheckbox).toBeChecked();
    expect(completedTodo.closest("li")).toHaveClass("todo-item-completed");
    expect(completedTodo).toHaveClass("todo-title-completed");
  });

  it("persists todo changes to localStorage", () => {
    render(<HomePage />);

    const input = screen.getByRole("textbox", { name: "New task" });
    const button = screen.getByRole("button", { name: "Add todo" });

    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.click(button);
    fireEvent.change(input, { target: { value: "Walk dog" } });
    fireEvent.click(button);
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Toggle completion for Buy milk" }),
    );

    expect(window.localStorage.getItem(TODO_STORAGE_KEY)).toBe(
      JSON.stringify([
        { id: 1, title: "Buy milk", completed: true },
        { id: 2, title: "Walk dog", completed: false },
      ]),
    );
  });

  it("updates the active count when todos are added, completed, uncompleted, and deleted", () => {
    render(<HomePage />);

    const input = screen.getByRole("textbox", { name: "New task" });
    const button = screen.getByRole("button", { name: "Add todo" });

    expect(screen.getByText(activeTodoCountLabel(0))).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.click(button);
    expect(screen.getByText(activeTodoCountLabel(1))).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Walk dog" } });
    fireEvent.click(button);
    expect(screen.getByText(activeTodoCountLabel(2))).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Toggle completion for Buy milk" }),
    );
    expect(screen.getByText(activeTodoCountLabel(1))).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Toggle completion for Buy milk" }),
    );
    expect(screen.getByText(activeTodoCountLabel(2))).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete Walk dog" }));
    expect(screen.getByText(activeTodoCountLabel(1))).toBeInTheDocument();
  });

  it("filters todos by all, active, and completed states", () => {
    window.localStorage.setItem(
      TODO_STORAGE_KEY,
      JSON.stringify([
        { id: 1, title: "Buy milk", completed: false },
        { id: 2, title: "Walk dog", completed: true },
      ]),
    );

    render(<HomePage />);

    const allFilter = screen.getByRole("button", { name: "All" });
    const activeFilter = screen.getByRole("button", { name: "Active" });
    const completedFilter = screen.getByRole("button", { name: "Completed" });

    expect(allFilter).toHaveAttribute("aria-pressed", "true");
    expect(activeFilter).toHaveAttribute("aria-pressed", "false");
    expect(completedFilter).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByText("Walk dog")).toBeInTheDocument();
    expect(screen.getByText(activeTodoCountLabel(1))).toBeInTheDocument();

    fireEvent.click(activeFilter);

    expect(allFilter).toHaveAttribute("aria-pressed", "false");
    expect(activeFilter).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.queryByText("Walk dog")).not.toBeInTheDocument();
    expect(screen.getByText(activeTodoCountLabel(1))).toBeInTheDocument();

    fireEvent.click(completedFilter);

    expect(activeFilter).toHaveAttribute("aria-pressed", "false");
    expect(completedFilter).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
    expect(screen.getByText("Walk dog")).toBeInTheDocument();
    expect(screen.getByText(activeTodoCountLabel(1))).toBeInTheDocument();

    fireEvent.click(allFilter);

    expect(allFilter).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByText("Walk dog")).toBeInTheDocument();
    expect(screen.getByText(activeTodoCountLabel(1))).toBeInTheDocument();
  });

  it("shows a filter-specific empty state when no todos match", () => {
    window.localStorage.setItem(
      TODO_STORAGE_KEY,
      JSON.stringify([{ id: 1, title: "Buy milk", completed: false }]),
    );

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "Completed" }));

    expect(screen.queryByRole("list", { name: "Current todos" })).not.toBeInTheDocument();
    expect(screen.getByText("No completed todos.")).toBeInTheDocument();
    expect(screen.getByText("Complete a task to see it here.")).toBeInTheDocument();
    expect(screen.getByText(activeTodoCountLabel(1))).toBeInTheDocument();
  });

  it("falls back to an empty list when persisted storage is empty", () => {
    window.localStorage.setItem(TODO_STORAGE_KEY, "");

    render(<HomePage />);

    expect(screen.queryByRole("list", { name: "Current todos" })).not.toBeInTheDocument();
    expect(screen.getByText(activeTodoCountLabel(0))).toBeInTheDocument();
    expect(screen.getByText("No todos yet.")).toBeInTheDocument();
  });
});
