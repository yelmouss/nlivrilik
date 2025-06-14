"use client";

import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
  TextField,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

export default function TestEmail() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [customTest, setCustomTest] = useState(false);
  const [email, setEmail] = useState("");

  const testEmailConnection = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "test-email" }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || "Une erreur est survenue lors du test");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors du test");
    } finally {
      setLoading(false);
    }
  };

  const testNewRouteEmail = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/test-email");
      const data = await response.json();

      if (response.ok) {
        setResult({
          status: data.success ? "success" : "error",
          message: data.message,
          testResult: data.result,
          config: {
            host: process.env.EMAIL_SERVER_HOST || data.config?.host,
            port: process.env.EMAIL_SERVER_PORT || data.config?.port,
            user: process.env.EMAIL_SERVER_USER || data.config?.user,
            from: process.env.EMAIL_FROM || data.config?.from,
            adminEmails: ADMIN_EMAILS || data.config?.adminEmails,
          },
        });
      } else {
        setError(data.message || "Une erreur est survenue lors du test");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors du test");
    } finally {
      setLoading(false);
    }
  };

  const sendCustomTestEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/test-email/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          status: data.success ? "success" : "error",
          message: data.message,
          testResult: data.result,
          config: {
            host: process.env.EMAIL_SERVER_HOST || data.config?.host,
            port: process.env.EMAIL_SERVER_PORT || data.config?.port,
            user: process.env.EMAIL_SERVER_USER || data.config?.user,
            from: process.env.EMAIL_FROM || data.config?.from,
            adminEmails: ADMIN_EMAILS || data.config?.adminEmails,
          },
        });
      } else {
        setError(data.message || "Une erreur est survenue lors du test");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors du test");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Test de configuration email
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="body1" paragraph>
            Cet outil vous permet de tester la configuration de l'envoi d'emails
            pour votre application. Un email de test sera envoyé à l'adresse
            configurée dans les variables d'environnement.
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<MailOutlineIcon />}
              onClick={testEmailConnection}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                "Tester (API standard)"
              )}
            </Button>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<MailOutlineIcon />}
              onClick={testNewRouteEmail}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                "Tester (Nouvelle API)"
              )}
            </Button>

            <Button
              variant="outlined"
              onClick={() => setCustomTest(!customTest)}
            >
              {customTest ? "Masquer" : "Test personnalisé"}
            </Button>
          </Box>

          {customTest && (
            <Box
              component="form"
              onSubmit={sendCustomTestEmail}
              sx={{ mt: 4, maxWidth: "500px", mx: "auto" }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Envoyer un email de test à une adresse spécifique
              </Typography>

              <Grid container spacing={2}>
                <Grid size xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type="email"
                    size="small"
                  />
                </Grid>
                <Grid size xs={12} sm={4}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading || !email}
                    sx={{ height: "100%" }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Envoyer"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 3, mb: 3 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Box sx={{ mt: 3 }}>
            <Alert
              severity={result.status === "success" ? "success" : "error"}
              sx={{ mb: 3 }}
            >
              {result.message}
            </Alert>

            <Typography variant="h6" gutterBottom>
              Configuration
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Serveur SMTP"
                  secondary={`${result.config.host}:${result.config.port}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Utilisateur"
                  secondary={result.config.user}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Expéditeur"
                  secondary={result.config.from}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Emails administrateurs"
                  secondary={
                    Array.isArray(result.config.adminEmails)
                      ? result.config.adminEmails.join(", ")
                      : result.config.adminEmails
                  }
                />
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Résultat du test
            </Typography>
            <Paper
              variant="outlined"
              sx={{ p: 2, bgcolor: theme.palette.grey[50] }}
            >
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                {JSON.stringify(result.testResult, null, 2)}
              </pre>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
