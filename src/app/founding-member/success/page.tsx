export default function FoundingMemberSuccess() {
  return (
    <div className="min-h-screen bg-crumb-darkest flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">&#x1F389;</div>
        <h1 className="text-3xl font-bold text-crumb-cream mb-4">
          Welcome, Founding Member!
        </h1>
        <p className="text-crumb-muted text-lg mb-8">
          You&apos;re locked in. When Crumb launches, you&apos;ll get first-day access
          and lifetime premium - no subscription needed, ever.
        </p>
        <p className="text-crumb-muted text-sm mb-8">
          We&apos;ll email you the moment it&apos;s ready.
        </p>
        <a
          href="https://crumbify.co.uk"
          className="inline-block bg-crumb-brown text-white font-semibold px-8 py-3 rounded-xl hover:bg-crumb-dark transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
