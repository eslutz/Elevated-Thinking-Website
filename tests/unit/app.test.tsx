import { render, screen } from "@testing-library/react";

import App from "../../src/App";

describe("App", () => {
  it("renders the hero heading", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /systems thinking,\s*designed for reality\./i,
      })
    ).toBeInTheDocument();
  });

  it("shows all named services", () => {
    render(<App />);

    expect(
      screen.getAllByRole("heading", { name: /product strategy/i })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("heading", { name: /service & workflow design/i })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("heading", { name: /ux research & design/i })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("heading", { name: /ai-enabled delivery/i })
    ).toHaveLength(1);
  });

  it("includes navigation and accessibility landmarks", () => {
    render(<App />);

    expect(
      screen.getByRole("link", { name: /skip to main content/i })
    ).toHaveAttribute("href", "#main-content");

    expect(
      screen.getByRole("navigation", { name: /primary/i })
    ).toBeInTheDocument();

    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");

    expect(
      screen.getAllByRole("link", {
        name: /start a conversation/i,
      })
    ).toHaveLength(2);
  });
});
