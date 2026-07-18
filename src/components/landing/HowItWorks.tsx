const STEPS = [
  {
    idx: "01",
    title: "Post it",
    body: "Log a place you ate, add a photo and a score.",
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="6" width="18" height="14" rx="3" />
        <circle cx="12" cy="13" r="3.4" />
        <path d="M9 6l1.3-2h3.4L15 6" />
      </svg>
    ),
  },
  {
    idx: "02",
    title: "Friends see it",
    body: "It lands in your friends' feed. They react and comment.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
        <circle cx="12" cy="12" r="2.6" />
      </svg>
    ),
  },
  {
    idx: "03",
    title: "Discover",
    body: "Find new spots ranked to your taste and your friends' scores.",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M15.5 8.5l-2 5-5 2 2-5z" />
      </svg>
    ),
  },
  {
    idx: "04",
    title: "Save it",
    body: "Anything that looks good goes on your Want to Try list.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" />
      </svg>
    ),
  },
  {
    idx: "05",
    title: "Go eat",
    body: "Cross it off, rate it, post it. And the loop starts again.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M6 3v8a2.5 2.5 0 0 0 5 0V3M8.5 3v18M18 3c-1.6 0-2.5 2-2.5 5s.9 4 2.5 4v9" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how">
      <div className="wrap how-grid">
        <div className="how-intro reveal">
          <span className="eyebrow">How it works</span>
          <h2>
            Post it, and the <em className="s">loop</em> begins.
          </h2>
          <p>Crumbify runs on one simple habit, shared with the people whose taste you actually trust.</p>
        </div>
        <ol className="how-list stagger">
          {STEPS.map((step) => (
            <li className="reveal" key={step.idx}>
              <span className="idx">{step.idx}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
              <span className="hicon">{step.icon}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
