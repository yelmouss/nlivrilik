'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Container, TextField, Button, Typography, Box, Alert, Paper, CircularProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';

export default function VerifyEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const theme = useTheme();
  const { data: session, status, update } = useSession();
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [emailSent, setEmailSent] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(null)

  // Get parameters from URL
  const error = searchParams.get('error')
  const success = searchParams.get('success')
  const emailParam = searchParams.get('email')
  const autoLogin = searchParams.get('autologin')

  useEffect(() => {
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
    
    if (error === 'email_not_verified') {
      setMessage({ type: 'warning', text: 'Vous devez vérifier votre adresse email avant de pouvoir vous connecter.' })
    } else if (error === 'invalid_token') {
      setMessage({ type: 'error', text: 'Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien.' })
    } else if (error === 'missing_params') {
      setMessage({ type: 'error', text: 'Paramètres manquants. Veuillez demander un nouveau lien de vérification.' })
    } else if (error === 'db_error' || error === 'server_error') {
      setMessage({ type: 'error', text: 'Une erreur serveur s\'est produite. Veuillez réessayer plus tard.' })
    } else if (success === 'true') {
      if (autoLogin === 'true') {
        setMessage({ 
          type: 'success', 
          text: 'Votre adresse email a été vérifiée avec succès. Vous êtes maintenant connecté! Redirection en cours...' 
        });
        
        // Start countdown for redirect
        setRedirectCountdown(5);
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter.' 
        });
      }
    }
  }, [error, success, emailParam, autoLogin]);

  // Handle redirect countdown
  useEffect(() => {
    if (redirectCountdown === null) return;
    
    if (redirectCountdown <= 0) {
      router.push('/');
      return;
    }
    
    const timer = setTimeout(() => {
      setRedirectCountdown(redirectCountdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [redirectCountdown, router]);

  // Update session when auto-login happens
  useEffect(() => {
    if (autoLogin === 'true' && status !== 'loading') {
      // Refresh the session to get updated data
      update();
    }
  }, [autoLogin, status, update]);

  const handleResendEmail = async (e) => {
    e.preventDefault()
    if (!email) {
      setMessage({ type: 'error', text: 'Veuillez entrer votre adresse email.' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (data.verified) {
          setMessage({ type: 'info', text: 'Votre adresse email est déjà vérifiée. Vous pouvez vous connecter.' })
        } else {
          setEmailSent(true)
          setMessage({ type: 'success', text: 'Un email de vérification a été envoyé. Veuillez vérifier votre boîte de réception.' })
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'Échec de l\'envoi de l\'email de vérification.' 
        })
        console.error('Error details:', data.error)
      }
    } catch (error) {
      console.error('Error sending verification email:', error)
      setMessage({ type: 'error', text: 'Une erreur s\'est produite. Veuillez réessayer plus tard.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ padding: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: theme.palette.background.paper }}>
        <Typography component="h1" variant="h5" color="primary" gutterBottom>
          Vérification d'Email
        </Typography>

        {message.type && (
          <Alert severity={message.type} sx={{ width: '100%', mb: 2 }}>
            {message.text}
            {redirectCountdown !== null && redirectCountdown > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Redirection dans {redirectCountdown} seconde{redirectCountdown > 1 ? 's' : ''}...
              </Typography>
            )}
          </Alert>
        )}

        {!emailSent && !autoLogin && (
          <Box component="form" onSubmit={handleResendEmail} sx={{ mt: 1, width: '100%' }}>
            <Typography variant="body2" gutterBottom>
              Veuillez entrer votre adresse email pour recevoir un nouveau lien de vérification.
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& label.Mui-focused': {
                  color: theme.palette.text.primary,
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Envoyer le lien de vérification'}
            </Button>
          </Box>
        )}

        {emailSent && !autoLogin && (
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body1" gutterBottom>
              Un email de vérification a été envoyé à <strong>{email}</strong>.
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Si vous ne recevez pas l'email dans quelques minutes, vérifiez votre dossier spam ou cliquez sur le bouton ci-dessous pour réessayer.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setEmailSent(false)}
              sx={{ mt: 2 }}
            >
              Réessayer
            </Button>
          </Box>
        )}

        {!autoLogin && (
          <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
            <Typography variant="body2">
              Retourner à la {' '}
              <Link href="/auth/signin" passHref>
                <Typography component="span" color="primary" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                  page de connexion
                </Typography>
              </Link>
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  )
}
