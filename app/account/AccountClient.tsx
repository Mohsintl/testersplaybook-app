"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

type Props = {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export default function AccountClient({ user }: Props) {
  const [name, setName] = useState(user.name ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/account/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Update failed");
      }

      setMessage("Profile updated successfully");
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "24px", maxWidth: "600px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 600 }}>
        Account
      </h1>

      <div style={{ marginTop: "24px" }}>
        <label>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "6px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <label>Email</label>
        <input
          value={user.email}
          disabled
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "6px",
            background: "#f3f3f3",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "10px 14px",
          background: "black",
          color: "white",
          borderRadius: "6px",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>

      {message && (
        <p style={{ marginTop: "12px" }}>
          {message}
        </p>
      )}

      <hr style={{ margin: "32px 0" }} />

      <button
        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        style={{
          padding: "10px 14px",
          background: "#ef4444",
          color: "white",
          borderRadius: "6px",
        }}
      >
        Logout
      </button>
    </main>
  );
}
