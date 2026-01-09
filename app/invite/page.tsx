/*
  Invite Page (Server)
  --------------------
  Server page that receives an invitation `token` via `searchParams`,
  validates presence of the token, and renders the `InviteAcceptClient`
  which performs the accept flow. This component is intentionally small and
  delegates authentication and POSTing to the client component.
*/
import InviteAcceptClient from "./InviteAcceptClient";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) {
  console.log("[InvitePage] searchParams:", await searchParams);

  const { token } = await searchParams;

  if (!token) {
    return (
      <div style={{ padding: 40 }}>
        ❌ Invalid or missing invitation token
      </div>
    );
  }

  return <InviteAcceptClient token={token} />;
}
