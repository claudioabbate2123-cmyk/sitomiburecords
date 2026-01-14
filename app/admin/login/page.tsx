"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenziali non valide");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <main style={styles.page}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h1 style={styles.title}>Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Accesso..." : "Accedi"}
        </button>

        {error && <p style={styles.error}>{error}</p>}
      </form>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #111, #333)",
    fontFamily: "sans-serif",
  },
  card: {
    background: "#fff",
    padding: 32,
    borderRadius: 8,
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: 600,
  },
  input: {
    padding: 10,
    borderRadius: 4,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  button: {
    padding: 10,
    background: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
  },
  error: {
    color: "red",
    fontSize: 13,
    textAlign: "center",
  },
};
