"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "360px",
          padding: "24px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: 600 }}>
          Sign in to TestersPlaybook
        </h1>

        <p style={{ marginTop: "8px", color: "#666" }}>
          Use your Google account to continue
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/projects" })}
          style={{
            marginTop: "24px",
            width: "100%",
            padding: "10px",
            background: "black",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
