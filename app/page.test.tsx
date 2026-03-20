import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the empty todo shell with disabled composer controls", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "Todo App" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "New task" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add todo" })).toBeDisabled();
    expect(screen.getByRole("heading", { name: "Todo List" })).toBeInTheDocument();
    expect(screen.getByText("Todo items will appear here.")).toBeInTheDocument();
    expect(screen.getByText("No todos yet.")).toBeInTheDocument();
  });
});
