import { render, screen } from "@testing-library/react";

import { useRevealParallax } from "../../src/useRevealParallax";

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly callback: IntersectionObserverCallback;
  readonly observed: Element[] = [];
  readonly unobserved: Element[] = [];
  disconnected = false;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe = (element: Element) => {
    this.observed.push(element);
  };

  unobserve = (element: Element) => {
    this.unobserved.push(element);
  };

  disconnect = () => {
    this.disconnected = true;
  };

  trigger(element: Element, isIntersecting = true) {
    this.callback(
      [{ isIntersecting, target: element } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
}

function RevealHarness({ withOffscreen = false, withParallax = false }) {
  useRevealParallax();

  return (
    <>
      <div data-reveal="copy" data-testid="visible-copy" />
      <div
        data-parallax={withParallax ? "" : undefined}
        data-parallax-speed="40"
        data-reveal="image"
        data-testid="visible-image"
      />
      {withOffscreen ? (
        <div data-reveal="copy" data-testid="offscreen-copy" />
      ) : null}
    </>
  );
}

const originalMatchMedia = window.matchMedia;
const originalIntersectionObserver = window.IntersectionObserver;
const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;

function setMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: jest.fn().mockReturnValue({ matches }),
  });
}

function setIntersectionObserver(
  value: typeof MockIntersectionObserver | undefined
) {
  Object.defineProperty(window, "IntersectionObserver", {
    configurable: true,
    value,
  });
}

function setViewportHeight(height: number) {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
  });
}

function rect(top: number, bottom: number, height = bottom - top) {
  return {
    bottom,
    height,
    left: 0,
    right: 100,
    toJSON: () => ({}),
    top,
    width: 100,
    x: 0,
    y: top,
  };
}

describe("useRevealParallax", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    setMatchMedia(false);
    setIntersectionObserver(MockIntersectionObserver);
    setViewportHeight(800);

    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: jest.fn((callback: FrameRequestCallback) => {
        callback(0);
        return 123;
      }),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: jest.fn(),
    });

    jest
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockImplementation(function getBounds(this: Element) {
        if (this.getAttribute("data-testid") === "offscreen-copy") {
          return rect(900, 1000, 100);
        }

        return rect(100, 300, 200);
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: originalIntersectionObserver,
    });
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: originalRequestAnimationFrame,
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: originalCancelAnimationFrame,
    });
  });

  it("reveals content immediately when reduced motion is preferred", () => {
    setMatchMedia(true);

    render(<RevealHarness />);

    expect(screen.getByTestId("visible-copy")).toHaveAttribute(
      "data-revealed",
      "true"
    );
    expect(screen.getByTestId("visible-image")).toHaveAttribute(
      "data-revealed",
      "true"
    );
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("reveals content immediately when IntersectionObserver is unavailable", () => {
    Reflect.deleteProperty(window, "IntersectionObserver");

    render(<RevealHarness />);

    expect(screen.getByTestId("visible-copy")).toHaveAttribute(
      "data-revealed",
      "true"
    );
    expect(screen.getByTestId("visible-image")).toHaveAttribute(
      "data-revealed",
      "true"
    );
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("observes offscreen content and reveals it when it enters the viewport", () => {
    render(<RevealHarness withOffscreen />);

    const visibleCopy = screen.getByTestId("visible-copy");
    const offscreenCopy = screen.getByTestId("offscreen-copy");
    const [observer] = MockIntersectionObserver.instances;

    expect(visibleCopy).toHaveAttribute("data-revealed", "true");
    expect(offscreenCopy).not.toHaveAttribute("data-revealed");
    expect(observer.observed).toContain(offscreenCopy);

    observer.trigger(offscreenCopy);

    expect(offscreenCopy).toHaveAttribute("data-revealed", "true");
    expect(observer.unobserved).toContain(offscreenCopy);
  });

  it("updates parallax for revealed images and cleans up listeners", () => {
    const addEventListener = jest.spyOn(window, "addEventListener");
    const removeEventListener = jest.spyOn(window, "removeEventListener");
    const { unmount } = render(<RevealHarness withParallax />);
    const image = screen.getByTestId("visible-image");
    const [observer] = MockIntersectionObserver.instances;

    expect(image.style.getPropertyValue("--parallax-y")).toBe("8.00px");

    window.dispatchEvent(new Event("scroll"));

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(addEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
      { passive: true }
    );
    expect(addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );

    unmount();

    expect(observer.disconnected).toBe(true);
    expect(removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function)
    );
    expect(removeEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });
});
