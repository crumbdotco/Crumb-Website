export const metadata = {
  title: "Delete Your Crumbify Account",
  description:
    "How to delete your Crumbify account and associated data, in the app or by email.",
};

export default function DeleteAccountPage() {
  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: 24 }}>
      <h1>Delete Your Crumbify Account</h1>

      <p>
        You can permanently delete your Crumbify account and its associated data
        at any time.
      </p>

      <h2>Option 1 - In the app (recommended)</h2>
      <ol>
        <li>Open Crumbify and go to Account.</li>
        <li>Tap Settings (gear icon).</li>
        <li>Tap Delete Account.</li>
        <li>Confirm with the one-time code sent to your email.</li>
      </ol>
      <p>Your account and data are removed immediately.</p>

      <h2>Option 2 - By email</h2>
      <p>
        If you no longer have the app installed, email admin@crumbify.co.uk from
        the address on your account and ask us to delete it. We action requests
        within 30 days.
      </p>

      <h2>What gets deleted</h2>
      <ul>
        <li>Your profile (name, username, email, avatar)</li>
        <li>Imported order history and items</li>
        <li>Restaurant reviews, ratings, and want-to-try lists</li>
        <li>Friends, groups, messages, and social activity</li>
        <li>Your login account</li>
      </ul>

      <h2>What we keep</h2>
      <ul>
        <li>
          If you joined as a Founding Member, your founding status is tied to
          your email address and is retained so the benefit survives if you sign
          up again later. It holds no personal profile data.
        </li>
        <li>
          Aggregated or anonymized analytics that can no longer identify you.
        </li>
      </ul>

      <h2>Retention</h2>
      <ul>
        <li>App-initiated deletion: immediate.</li>
        <li>Email-requested deletion: within 30 days of a verified request.</li>
      </ul>
    </main>
  );
}
