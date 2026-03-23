type Service = {
  title: string;
  body: string;
};

export default function ElevatedOnePageSite() {
  const services: Service[] = [
    {
      title: "Product strategy",
      body: "Clarify what to build, why it matters, and how decisions ripple across the system before they harden into roadmap debt.",
    },
    {
      title: "Service & workflow design",
      body: "Map the real-world flow of people, policy, tools, and handoffs so teams can reduce friction instead of decorating it.",
    },
    {
      title: "UX research & design",
      body: "Design for real users, real constraints, and real environments—especially where stakes are high.",
    },
    {
      title: "AI-enabled delivery",
      body: "Use AI where it improves speed, insight, or decision support—without turning judgment into a black box circus.",
    },
  ];

  return (
    <div id="top" className="min-h-screen bg-[#F8F8F6] text-[#2F2F2F]">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#F8F8F6]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#37514E]" />
            <span className="text-xl font-semibold">Elevated</span>
          </a>
          <nav className="hidden gap-8 text-sm text-[#37514E] md:flex">
            <a href="#services">Services</a>
            <a href="#approach">Approach</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div>
          <h1 className="text-5xl leading-[0.95] font-serif md:text-6xl">
            Systems thinking,
            <br />
            designed for reality.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[#37514E]/90">
            Elevated helps teams make better decisions across product, service,
            and operational systems using design, strategy, and AI where it
            actually matters.
          </p>
          <button className="mt-8 rounded-xl bg-[#37514E] px-6 py-3 text-white">
            Start a conversation
          </button>
        </div>

        <div className="relative">
          <div className="aspect-4/5 rounded-3xl bg-[#D9DBD9]" />
          <div className="absolute -bottom-6 -left-6 w-64 rounded-2xl bg-[#C14A11] p-6 text-white shadow-xl">
            <p className="text-lg leading-6">AI-enabled. Not AI-obsessed.</p>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="mx-auto max-w-7xl space-y-24 px-6 py-16"
      >
        {services.map((service, i) => (
          <div
            key={service.title}
            className={`grid items-center gap-10 lg:grid-cols-2 ${
              i % 2 !== 0
                ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
                : ""
            }`}
          >
            <div className="relative">
              <div className="aspect-4/5 rounded-3xl bg-[#D9DBD9]" />
              <div className="absolute -right-5 top-8 w-60 rounded-2xl bg-[#37514E] p-6 text-white shadow-lg">
                <h3 className="text-lg font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm text-white/80">{service.body}</p>
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-serif leading-tight">
                {service.title}
              </h2>
              <p className="mt-4 max-w-md text-lg text-[#37514E]/90">
                {service.body}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section id="approach" className="bg-[#37514E] px-6 py-20 text-white">
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
        <div className="relative rounded-3xl bg-[#B7CBCD] p-12">
          <div className="max-w-xl">
            <h3 className="text-3xl font-serif leading-tight">
              Bring us in when the problem spans teams, systems, or
              consequences.
            </h3>
            <p className="mt-4 text-[#37514E]/90">
              Especially early, before decisions calcify into expensive
              problems.
            </p>
          </div>

          <div className="absolute -bottom-5 right-10 rounded-xl bg-[#C14A11] px-6 py-4 text-white shadow-lg">
            Start a conversation
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-black/5 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 lg:flex-row">
          <div>
            <div className="text-xl font-semibold">Elevated</div>
            <p className="mt-2 text-sm text-[#37514E]/80">
              Design-led strategy and AI-enabled product work.
            </p>
          </div>
          <div className="text-sm">
            <div>
              <a href="mailto:lindsey@elevatedthinking.co?subject=Hello">
                lindsey@elevatedthinking.co
              </a>
            </div>
            <div>
              <a href="mailto:paul@elevatedthinking.co?subject=Hello">
                paul@elevatedthinking.co
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
