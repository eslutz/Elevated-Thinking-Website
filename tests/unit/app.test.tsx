import { render, screen } from "@testing-library/react";

import App from "../../src/App";

const calendarUrl = "https://calendar.app.google/ShyxHfNAutZC3Dg7A";

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

  it("uses the requested logo, images, contact email, and calendar CTAs", () => {
    render(<App />);

    expect(screen.getAllByRole("img", { name: /elevated/i })).toHaveLength(2);

    for (const link of screen.getAllByRole("link", {
      name: /start a conversation/i,
    })) {
      expect(link).toHaveAttribute("href", calendarUrl);
    }

    expect(
      screen.getByRole("link", { name: /hello@elevatedthinking\.co/i })
    ).toHaveAttribute("href", "mailto:hello@elevatedthinking.co");
    expect(
      screen.queryByRole("link", { name: /lindsey@elevatedthinking\.co/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /paul@elevatedthinking\.co/i })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("img", { name: /person writing on white paper/i })
    ).toHaveAttribute("src", expect.stringContaining("photo-1586717791821"));
    expect(
      screen.getByRole("img", { name: /macbook near an open book/i })
    ).toHaveAttribute("src", expect.stringContaining("photo-1501504905252"));
    expect(
      screen.getByRole("img", { name: /workflow diagram/i })
    ).toHaveAttribute("src", expect.stringContaining("photo-1743385779347"));
    expect(
      screen.getByRole("img", { name: /two women sitting together/i })
    ).toHaveAttribute("src", expect.stringContaining("photo-1573497620053"));
    expect(
      screen.getByRole("img", { name: /person using a macbook/i })
    ).toHaveAttribute("src", expect.stringContaining("photo-1541560052"));

    expect(
      screen.queryByText(/AI-enabled\. Not AI-obsessed\./i)
    ).not.toBeInTheDocument();
  });
});
