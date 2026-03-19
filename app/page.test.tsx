import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the todo preview content and disabled composer controls", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: "Capture tasks, keep focus, ship cleanly.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "New task" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add todo" })).toBeDisabled();
    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    expect(screen.getByText("Ship the scaffold")).toBeInTheDocument();
  });
});
