import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import HomePage, { TODO_STORAGE_KEY } from "./page";

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
    expect(screen.getByText("1 item")).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(screen.queryByText("No todos yet.")).not.toBeInTheDocument();
  });

  it("toggles a todo completed state on and off", () => {
    render(<HomePage />);

    const input = screen.getByRole("textbox", { name: "New task" });
    const button = screen.getByRole("button", { name: "Add todo" });

    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.click(button);

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

    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.getByText("Buy milk").closest("li")).not.toHaveClass(
      "todo-item-completed",
    );
    expect(screen.getByText("Buy milk")).not.toHaveClass("todo-title-completed");
  });

  it("deletes a todo immediately without affecting the remaining items", () => {
    render(<HomePage />);

    const input = screen.getByRole("textbox", { name: "New task" });
    const button = screen.getByRole("button", { name: "Add todo" });

    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.click(button);
    fireEvent.change(input, { target: { value: "Walk dog" } });
    fireEvent.click(button);

    fireEvent.click(screen.getByRole("button", { name: "Delete Buy milk" }));

    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
    expect(screen.getByText("Walk dog")).toBeInTheDocument();
    expect(screen.getByText("1 item")).toBeInTheDocument();
  });

  it("restores the empty state after deleting the last todo", () => {
    render(<HomePage />);

    const input = screen.getByRole("textbox", { name: "New task" });
    const button = screen.getByRole("button", { name: "Add todo" });

    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.click(button);

    fireEvent.click(screen.getByRole("button", { name: "Delete Buy milk" }));

    expect(screen.queryByRole("list", { name: "Current todos" })).not.toBeInTheDocument();
    expect(screen.getByText("0 items")).toBeInTheDocument();
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
    expect(screen.getByText("0 items")).toBeInTheDocument();
    expect(screen.getByText("No todos yet.")).toBeInTheDocument();
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

    expect(screen.getByText("2 items")).toBeInTheDocument();

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

  it("falls back to an empty list when persisted storage is empty", () => {
    window.localStorage.setItem(TODO_STORAGE_KEY, "");

    render(<HomePage />);

    expect(screen.queryByRole("list", { name: "Current todos" })).not.toBeInTheDocument();
    expect(screen.getByText("0 items")).toBeInTheDocument();
    expect(screen.getByText("No todos yet.")).toBeInTheDocument();
  });
});
