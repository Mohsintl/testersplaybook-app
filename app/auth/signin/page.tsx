"use client";

import { signIn } from "next-auth/react";
import Button from "@mui/material/Button";

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

        <Button
          onClick={() => signIn("google", { callbackUrl: "/projects" })}
          variant="contained"
          color="primary"
          sx={{ mt: 3, width: "100%" }}
        >
          Continue with Google
        </Button>
      </div>
    </main>
  );
}
