import logoUrl from "./assets/elevated-logo.svg";
import { useRevealParallax } from "./useRevealParallax";

const calendarUrl = "https://calendar.app.google/ShyxHfNAutZC3Dg7A";
const footerEmail = "hello@elevatedthinking.co";

type ImageAsset = {
  photoId: string;
  alt: string;
  position?: string;
};

type Service = {
  title: string;
  body: string;
  image: ImageAsset;
};

const imageWidths = [640, 960, 1280, 1600] as const;

const heroImage: ImageAsset = {
  photoId: "photo-1586717791821-3f44a563fa4c",
  alt: "Person writing on white paper",
  position: "center",
};

const services: readonly Service[] = [
  {
    title: "Product strategy",
    body: "Clarify what to build, why it matters, and how decisions ripple across the system before they harden into roadmap debt.",
    image: {
      photoId: "photo-1501504905252-473c47e087f8",
      alt: "MacBook near an open book",
      position: "center",
    },
  },
  {
    title: "Service & workflow design",
    body: "Map the real-world flow of people, policy, tools, and handoffs so teams can reduce friction instead of decorating it.",
    image: {
      photoId: "photo-1743385779347-1549dabf1320",
      alt: "Workflow diagram showing product brief and user goals",
      position: "center",
    },
  },
  {
    title: "UX research & design",
    body: "Design for real users, real constraints, and real environments—especially where stakes are high.",
    image: {
      photoId: "photo-1573497620053-ea5300f94f21",
      alt: "Two women sitting together",
      position: "center",
    },
  },
  {
    title: "AI-enabled delivery",
    body: "Use AI where it improves speed, insight, or decision support—without turning judgment into a black box circus.",
    image: {
      photoId: "photo-1541560052-5e137f229371",
      alt: "Person using a MacBook",
      position: "center",
    },
  },
];

function unsplashUrl(photoId: string, width: number) {
  return `https://images.unsplash.com/${photoId}?q=80&w=${width}&auto=format&fit=crop`;
}

function unsplashSrcSet(photoId: string) {
  return imageWidths
    .map((width) => `${unsplashUrl(photoId, width)} ${width}w`)
    .join(", ");
}

function ResponsiveImage({
  image,
  sizes,
  eager = false,
  className = "",
}: {
  image: ImageAsset;
  sizes: string;
  eager?: boolean;
  className?: string;
}) {
  return (
    <img
      alt={image.alt}
      className={`h-full w-full object-cover ${className}`}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      loading={eager ? "eager" : "lazy"}
      sizes={sizes}
      src={unsplashUrl(image.photoId, 960)}
      srcSet={unsplashSrcSet(image.photoId)}
      style={{ objectPosition: image.position }}
    />
  );
}

export default function ElevatedOnePageSite() {
  useRevealParallax();

  return (
    <div
      id="top"
      className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--color-primary)] focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-black/5 bg-[var(--color-background)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a
            href="#top"
            className="flex items-center"
            aria-label="Elevated home"
          >
            <img
              src={logoUrl}
              alt="Elevated"
              className="brand-logo brand-logo-header"
              width="895"
              height="130"
            />
          </a>
          <nav
            className="hidden gap-8 text-sm text-[var(--color-primary)] md:flex"
            aria-label="Primary"
          >
            <a href="#services">Services</a>
            <a href="#approach">Approach</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div
            className="reveal-copy"
            data-reveal="copy"
            style={{ transitionDelay: "80ms" }}
          >
            <h1 className="text-5xl leading-[0.95] font-serif md:text-6xl">
              Systems thinking,
              <br />
              designed for reality.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-[var(--color-primary)]/90">
              Elevated helps teams make better decisions across product,
              service, and operational systems using design, strategy, and AI
              where it actually matters.
            </p>
            <a
              href={calendarUrl}
              className="mt-8 inline-block rounded-xl bg-[var(--color-primary)] px-6 py-3 text-white"
            >
              Start a conversation
            </a>
          </div>

          <div
            className="reveal-image image-frame"
            data-parallax
            data-parallax-speed="34"
            data-reveal="image"
            data-reveal-direction="right"
          >
            <ResponsiveImage
              image={heroImage}
              sizes="(min-width: 1024px) 50vw, 100vw"
              eager
            />
          </div>
        </section>

        <section
          id="services"
          className="mx-auto max-w-7xl space-y-24 px-6 py-16"
        >
          <h2 className="sr-only">Services</h2>
          <ul className="space-y-24">
            {services.map((service, i) => (
              <li
                key={service.title}
                className={`grid items-center gap-10 lg:grid-cols-2 ${
                  i % 2 !== 0
                    ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
                    : ""
                }`}
              >
                <div
                  className="reveal-image image-frame"
                  data-parallax
                  data-parallax-speed="30"
                  data-reveal="image"
                  data-reveal-direction={i % 2 === 0 ? "left" : "right"}
                >
                  <ResponsiveImage
                    image={service.image}
                    sizes="(min-width: 1024px) 45vw, 100vw"
                  />
                </div>

                <article
                  className="reveal-copy"
                  data-reveal="copy"
                  style={{ transitionDelay: `${120 + i * 80}ms` }}
                >
                  <h3 className="text-4xl font-serif leading-tight">
                    {service.title}
                  </h3>
                  <p className="mt-4 max-w-md text-lg text-[var(--color-primary)]/90">
                    {service.body}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="approach"
          className="bg-[var(--color-primary)] px-6 py-20 text-white"
        >
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-4xl font-serif leading-tight">
              Built for work where decisions actually matter.
            </h2>
            <p className="mt-6 text-lg text-white/80">
              Government. Defense. Enterprise. Regulated environments. Places
              where complexity is real and shortcuts do not survive contact.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="relative rounded-3xl bg-[var(--color-surface)] p-12">
            <div className="max-w-xl">
              <h2 className="text-3xl font-serif leading-tight">
                Bring us in when the problem spans teams, systems, or
                consequences.
              </h2>
              <p className="mt-4 text-[var(--color-primary)]">
                Especially early, before decisions calcify into expensive
                problems.
              </p>
            </div>

            <a
              href={calendarUrl}
              className="absolute -bottom-5 right-10 rounded-xl bg-[var(--color-accent)] px-6 py-4 text-white shadow-lg"
            >
              Start a conversation
            </a>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-black/5 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 lg:flex-row">
          <div>
            <img
              src={logoUrl}
              alt="Elevated"
              className="brand-logo brand-logo-footer"
              width="895"
              height="130"
            />
            <p className="mt-2 text-sm text-[var(--color-primary)]/80">
              Design-led strategy and AI-enabled product work.
            </p>
          </div>
          <address className="text-sm not-italic">
            <div>
              <a className="text-inherit" href={`mailto:${footerEmail}`}>
                {footerEmail}
              </a>
            </div>
          </address>
        </div>
      </footer>
    </div>
  );
}
