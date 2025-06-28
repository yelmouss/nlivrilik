"use client";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!form.fullName || !form.email || !form.subject || !form.message) {
      setError("Merci de remplir tous les champs.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Votre message a bien été envoyé. Nous vous répondrons rapidement.");
        setForm({ fullName: "", email: "", subject: "", message: "" });
      } else {
        setError(data.error || "Erreur lors de l'envoi du message.");
      }
    } catch (err) {
      setError("Erreur lors de l'envoi du message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center  py-16 px-2">
      <Paper elevation={12} className="w-full max-w-2xl p-12 rounded-3xl shadow-2xl border border-green-200 bg-white/80 backdrop-blur-md">
        <Box className="flex flex-col items-center mb-8">
          <Box className=" rounded-full p-4 mb-2 shadow-lg">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 12.713l11.985-7.713A1 1 0 0 0 23 4H1a1 1 0 0 0-.985 1.001L12 12.713z"/><path fill="#22c55e" d="M12 14.713L1.015 7.001A1 1 0 0 0 1 8v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a1 1 0 0 0-.015-.999L12 14.713z"/></svg>
          </Box>
          <Typography variant="h3" className="font-extrabold text-center text-green-700 mb-1 tracking-tight" gutterBottom>
            Contactez-nous
          </Typography>
          <Typography variant="subtitle1" className="mb-2 text-center text-gray-700 text-lg">
            Une question, une réclamation ou un besoin ? Remplissez le formulaire ci-dessous !
          </Typography>
        </Box>
        <form onSubmit={handleSubmit} className="space-y-7">
          <TextField
            label="Nom complet"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            slotProps={{ input: { className: "bg-white/90 rounded-xl mb-5" } }}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            slotProps={{ input: { className: "bg-white/90 rounded-xl mb-5" } }}
          />
          <TextField
            label="Sujet"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            slotProps={{ input: { className: "bg-white/90 rounded-xl mb-5" } }}
          />
          <TextField
            label="Message"
            name="message"
            value={form.message}
            onChange={handleChange}
            fullWidth
            required
            multiline
            minRows={5}
            variant="outlined"
            slotProps={{ input: { className: "bg-white/90 rounded-xl mb-5" } }}
          />
          {success && (
            <Box className="flex items-center gap-2 text-green-700 font-semibold text-lg">
              <CheckCircleIcon color="success" />
              {success}
            </Box>
          )}
          {error && (
            <Box className="flex items-center gap-2 text-red-600 font-semibold text-lg">
              <ErrorIcon color="error" />
              {error}
            </Box>
          )}
          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
            size="large"
            className="font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition disabled:opacity-60 text-xl tracking-wide"
            disabled={loading}
            sx={{
              background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff',
              boxShadow: '0 8px 24px 0 rgba(34,197,94,0.15)',
            }}
          >
            {loading ? "Envoi..." : "Envoyer"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
