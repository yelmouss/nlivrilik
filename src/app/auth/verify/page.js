'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Container, Typography, Box, Paper, CircularProgress, Alert } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function VerifyEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const theme = useTheme()
  const t = useTranslations('Auth')
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token || !email) {
      setStatus('error')
      setMessage(t('missingParams'))
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
          setMessage(t('verificationError'))
        }
      } catch (error) {
        console.error('Error verifying email:', error)
        setStatus('error')
        setMessage(t('verificationError'))
      }
    }

    verifyEmail()
  }, [token, email, router, t])

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ padding: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: theme.palette.background.paper }}>
        <Typography component="h1" variant="h5" color="primary" gutterBottom>
          {t('emailVerification')}
        </Typography>

        <Box sx={{ mt: 3, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {status === 'loading' && (
            <>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body1">
                {t('verifyingEmail')}
              </Typography>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {message}
              </Alert>
              <Typography variant="body2">
                {t('returnToSignIn')} {' '}
                <Link href="/auth/verify-email" passHref>
                  <Typography component="span" color="primary" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                    {t('emailVerification')}
                  </Typography>
                </Link>
                {' '} {t('sendVerificationLink')}.
              </Typography>
            </>
          )}
        </Box>

        <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
          <Typography variant="body2">
            {t('returnToSignIn')} {' '}
            <Link href="/auth/signin" passHref>
              <Typography component="span" color="primary" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                {t('signIn')}
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}
