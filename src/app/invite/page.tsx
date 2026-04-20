import { Suspense } from "react";
import { InviteClient } from "./InviteClient";

export const metadata = {
  title: "You've been invited to Crumb",
  description: "Your friend invited you — install Crumb to claim 7 days Premium.",
};

export default function InvitePage() {
  return (
    <Suspense fallback={null}>
      <InviteClient />
    </Suspense>
  );
}
