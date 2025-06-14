'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Container, Typography, Box, Paper, CircularProgress, Alert } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Link from 'next/link'

export default function VerifyEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const theme = useTheme()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token || !email) {
      setStatus('error')
      setMessage('Paramètres manquants. Le lien de vérification est invalide.')
      return
    }

    const verifyEmail = async () => {
      try {
        // The route.js handles redirection, so we can just call it and follow the redirect
        const response = await fetch(`/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`)
        
        // If we get here, the redirection didn't happen
        if (response.redirected) {
          router.push(response.url)
        } else {
          setStatus('error')
          setMessage('Une erreur s\'est produite lors de la vérification de votre email.')
        }
      } catch (error) {
        console.error('Error verifying email:', error)
        setStatus('error')
        setMessage('Une erreur s\'est produite lors de la vérification de votre email.')
      }
    }

    verifyEmail()
  }, [token, email, router])

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ padding: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: theme.palette.background.paper }}>
        <Typography component="h1" variant="h5" color="primary" gutterBottom>
          Vérification d'Email
        </Typography>

        <Box sx={{ mt: 3, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {status === 'loading' && (
            <>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body1">
                Vérification de votre adresse email en cours...
              </Typography>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {message}
              </Alert>
              <Typography variant="body2">
                Veuillez retourner à la page de {' '}
                <Link href="/auth/verify-email" passHref>
                  <Typography component="span" color="primary" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                    vérification d'email
                  </Typography>
                </Link>
                {' '} pour demander un nouveau lien.
              </Typography>
            </>
          )}
        </Box>

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
      </Paper>
    </Container>
  )
}
