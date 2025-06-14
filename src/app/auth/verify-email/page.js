'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Container, Typography, Box, Paper, TextField, Button, Alert, CircularProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'

export default function VerifyEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const theme = useTheme();
  const { data: session, status, update } = useSession();
  const t = useTranslations('Auth');
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
      setMessage({ type: 'warning', text: t('emailNotVerified') })
    } else if (error === 'invalid_token') {
      setMessage({ type: 'error', text: t('invalidToken') })
    } else if (error === 'missing_params') {
      setMessage({ type: 'error', text: t('missingParams') })
    } else if (error === 'db_error') {
      setMessage({ type: 'error', text: t('dbError') })
    } else if (error === 'server_error') {
      setMessage({ type: 'error', text: t('serverError') })
    } else if (success === 'true') {
      if (autoLogin === 'true') {
        setMessage({ 
          type: 'success', 
          text: t('emailVerified') 
        });
        
        // Start countdown for redirect
        setRedirectCountdown(5);
      } else {
        setMessage({ 
          type: 'success', 
          text: t('emailVerifiedNotLoggedIn') 
        });
      }
    }
  }, [error, success, emailParam, autoLogin, t]);

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
      setMessage({ type: 'error', text: t('enterYourEmail') })
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
          setMessage({ type: 'info', text: t('emailAlreadyVerified') })
        } else {
          setEmailSent(true)
          setMessage({ type: 'success', text: t('verificationEmailSent') })
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || t('emailSendingFailed') 
        })
        console.error('Error details:', data.error)
      }
    } catch (error) {
      console.error('Error sending verification email:', error)
      setMessage({ type: 'error', text: t('serverError') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ padding: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: theme.palette.background.paper }}>
        <Typography component="h1" variant="h5" color="primary" gutterBottom>
          {t('emailVerification')}
        </Typography>

        {message.type && (
          <Alert severity={message.type} sx={{ width: '100%', mb: 2 }}>
            {message.text}
            {redirectCountdown !== null && redirectCountdown > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {t('redirectingIn', {
                  seconds: redirectCountdown,
                  plural: redirectCountdown > 1 ? 's' : ''
                })}
              </Typography>
            )}
          </Alert>
        )}

        {!emailSent && !autoLogin && (
          <Box component="form" onSubmit={handleResendEmail} sx={{ mt: 1, width: '100%' }}>
            <Typography variant="body2" gutterBottom>
              {t('enterEmailForVerification')}
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('emailAddress')}
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
              {loading ? <CircularProgress size={24} /> : t('sendVerificationLink')}
            </Button>
          </Box>
        )}        

        {emailSent && !autoLogin && (
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body1" gutterBottom>
              {t('verificationLinkSent')} <strong>{email}</strong>.
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('checkSpamFolder')}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setEmailSent(false)}
              sx={{ mt: 2 }}
            >
              {t('retry')}
            </Button>
          </Box>
        )}

        {!autoLogin && (
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
        )}
      </Paper>
    </Container>
  )
}
