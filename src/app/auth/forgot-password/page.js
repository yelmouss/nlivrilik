"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, TextField, Button, Typography, Alert, Paper } from "@mui/material";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Un email de réinitialisation a été envoyé si l'adresse existe.");
      } else {
        setError(data.message || "Erreur lors de l'envoi de l'email.");
      }
    } catch (err) {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <Paper elevation={3} sx={{ padding: 4, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5" color="primary" gutterBottom>
          Mot de passe oublié
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Votre email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mb: 2 }}>
            {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
          </Button>
        </form>
        {message && <Alert severity="success" sx={{ width: "100%", mt: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ width: "100%", mt: 2 }}>{error}</Alert>}
        <Button onClick={() => router.push("/auth/signin") } sx={{ mt: 2 }}>
          Retour à la connexion
        </Button>
      </Paper>
    </Container>
  );
}
