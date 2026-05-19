import { SignIn } from "@clerk/react";

export default function SignInPage() {
  return (
    <div
      style={{
        backgroundColor: "#0A0A0C",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: "1.5px solid #E8C16F",
            borderRadius: "50%",
            margin: "0 auto 16px",
          }}
        />
        <h1
          style={{
            color: "#F2EDE4",
            fontWeight: 300,
            fontSize: 28,
            margin: 0,
          }}
        >
          HelixA
        </h1>
        <p
          style={{
            color: "#8B8478",
            fontSize: 14,
            marginTop: 8,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Sync your biology. Train with your cycle.
        </p>
      </div>

      <SignIn
        routing="path"
        path="/sign-in"
        appearance={{
          variables: {
            colorBackground: "#14141A",
            colorText: "#F2EDE4",
            colorPrimary: "#E8C16F",
            colorInputBackground: "#0A0A0C",
            colorInputText: "#F2EDE4",
            borderRadius: "8px",
            fontFamily: "Inter, sans-serif",
          },
          elements: {
            card: { boxShadow: "0 0 32px rgba(232,193,111,0.1)", border: "1px solid rgba(255,255,255,0.06)" },
            footerAction: { color: "#8B8478" },
          },
        }}
      />
    </div>
  );
}
