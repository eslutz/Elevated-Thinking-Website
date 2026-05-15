import { useLayoutEffect } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const revealSelector = "[data-reveal]";
const parallaxSelector = "[data-parallax]";

export function useRevealParallax() {
  useLayoutEffect(() => {
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>(revealSelector)
    );
    const parallaxElements = Array.from(
      document.querySelectorAll<HTMLElement>(parallaxSelector)
    );
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia(reducedMotionQuery).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach((element) => {
        element.dataset.revealed = "true";
      });
      return;
    }

    const isInViewport = (element: HTMLElement) => {
      const bounds = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;

      return bounds.top < viewportHeight * 0.92 && bounds.bottom > 0;
    };

    const observer = new IntersectionObserver(
      (entries, activeObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target as HTMLElement;
          element.dataset.revealed = "true";
          activeObserver.unobserve(element);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.18,
      }
    );

    revealElements.forEach((element) => {
      if (isInViewport(element)) {
        element.dataset.revealed = "true";
        return;
      }

      observer.observe(element);
    });

    let frameId = 0;

    const updateParallax = () => {
      frameId = 0;
      const viewportHeight = window.innerHeight || 1;

      parallaxElements.forEach((element) => {
        if (element.dataset.revealed !== "true") {
          return;
        }

        const bounds = element.getBoundingClientRect();

        if (bounds.bottom < 0 || bounds.top > viewportHeight) {
          return;
        }

        const progress =
          (viewportHeight - bounds.top) / (viewportHeight + bounds.height);
        const speed = Number(element.dataset.parallaxSpeed ?? 28);
        const offset = (progress - 0.5) * speed;

        element.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
      });
    };

    const requestParallaxUpdate = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", requestParallaxUpdate, {
      passive: true,
    });
    window.addEventListener("resize", requestParallaxUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestParallaxUpdate);
      window.removeEventListener("resize", requestParallaxUpdate);

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);
}
