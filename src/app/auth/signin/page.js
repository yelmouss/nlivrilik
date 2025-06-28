"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslations } from "next-intl";
import Wave from "react-wavify";

export default function SignIn() {
  const router = useRouter();
  const theme = useTheme();
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  // Redirection si l'utilisateur est déjà connecté
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/my-orders");
    }
    setLoading(false);
  }, [status, router]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (result.error) {
      if (result.error === "email_not_verified") {
        router.push(
          `/auth/verify-email?error=email_not_verified&email=${encodeURIComponent(
            email
          )}`
        );
      } else {
        setError(
          result.error === "CredentialsSignin"
            ? t("invalidCredentials")
            : result.error
        );
        console.error(result.error);
      }
    } else {
      router.push("/my-orders");
    }
  };
  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }
  return (
    <Box>
      {" "}
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          py: 4,
          pb: 20, // Espace pour la wave en bas
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Typography component="h1" variant="h5" color="primary">
            {t("signIn")}
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            {error && (
              <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t("emailAddress")}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                "& label.Mui-focused": {
                  color: theme.palette.text.primary,
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
            <Box sx={{ textAlign: "right", width: "100%", mt: -1 }}>
              <Link href="/auth/forgot-password" style={{ textDecoration: "none" }}>
                <Typography
                  component="span"
                  color="primary"
                  sx={{ textDecoration: "underline", cursor: "pointer", fontSize: 14 }}
                >
                  Mot de passe oublié ?
                </Typography>
              </Link>
            </Box>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t("password")}
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                "& label.Mui-focused": {
                  color: theme.palette.text.primary,
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {t("signIn")}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => signIn("google")}
              sx={{ mb: 2 }}
            >
              {t("signInWithGoogle")}
            </Button>
            <Typography variant="body2" align="center">
              {t("dontHaveAccount")}{" "}
              <Link href="/auth/signup" passHref>
                <Typography
                  component="span"
                  color="primary"
                  sx={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  {t("signUp")}
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>{" "}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "100px",
          zIndex: -1,
        }}
      >
        <Wave
          fill="url(#waveGradient)"
          paused={false}
          options={{
            height: 5,
            amplitude: 20,
            speed: 0.15,
            points: 4,
          }}
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={theme.palette.custom.lightTeal} />
              <stop offset="50%" stopColor={theme.palette.custom.mediumTeal} />
              <stop offset="100%" stopColor={theme.palette.custom.darkTeal} />
            </linearGradient>
          </defs>
        </Wave>
      </Box>
    </Box>
  );
}
