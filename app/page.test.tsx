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
    expect(screen.getByText("1 item")).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(screen.queryByText("No todos yet.")).not.toBeInTheDocument();
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
