import { redirect } from "next/navigation";

// This route is retired. /invite?ref=<code> 301-redirects to /ref?u=<code>.
// The old ?ref= param (a short code) is renamed to ?u= (a username) per the canonical contract.
// InviteClient.tsx has been deleted - its localStorage mechanism was dead (the app never reads web storage).

// Validate against the stricter app inbound charset: ^[A-Za-z0-9-]{3,32}$
const USERNAME_RE = /^[A-Za-z0-9-]{3,32}$/;

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const ref = params?.ref;
  const isValid = ref && USERNAME_RE.test(ref.trim());

  if (isValid) {
    redirect(`/ref?u=${encodeURIComponent(ref!.trim())}`);
  } else {
    redirect("/ref");
  }
}
