import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
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
});
