import InviteAcceptClient from "./InviteAcceptClient";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) {
  console.log("[InvitePage] searchParams:", await searchParams);

  const { token } =  await searchParams;

  if (!token) {
    return (
      <div style={{ padding: 40 }}>
        ❌ Invalid or missing invitation token
      </div>
    );
  }

  return <InviteAcceptClient token={token} />;
}
