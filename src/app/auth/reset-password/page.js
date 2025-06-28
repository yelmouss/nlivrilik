"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, TextField, Button, Typography, Alert, Paper } from "@mui/material";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!password || !confirmPassword) {
      setError("Veuillez remplir les deux champs.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Votre mot de passe a été réinitialisé. Vous pouvez vous connecter.");
      } else {
        setError(data.message || "Erreur lors de la réinitialisation.");
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
          Réinitialiser le mot de passe
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Nouveau mot de passe"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirmer le mot de passe"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mb: 2 }}>
            {loading ? "Réinitialisation..." : "Réinitialiser"}
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
