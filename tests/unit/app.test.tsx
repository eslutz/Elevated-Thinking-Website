import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import App from "../../src/App";

describe("App", () => {
  it("renders the hero heading", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /systems thinking,\s*designed for reality\./i,
      })
    ).toBeInTheDocument();
  });

  it("shows all service sections", () => {
    render(<App />);

    const serviceHeadings = screen.getAllByRole("heading", { level: 2 });
    expect(serviceHeadings).toHaveLength(6);

    expect(
      screen.getByRole("heading", { level: 2, name: /product strategy/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /service & workflow design/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /ux research & design/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /ai-enabled delivery/i })
    ).toBeInTheDocument();
  });
});
