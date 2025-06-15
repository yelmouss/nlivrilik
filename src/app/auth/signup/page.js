'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Container, TextField, Button, Typography, Box, Alert, Paper, CircularProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Wave from 'react-wavify'

export default function SignUp() {
  const router = useRouter()
  const theme = useTheme();
  const { data: session, status } = useSession();
  const t = useTranslations('Auth');
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  // Redirection si l'utilisateur est déjà connecté
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/my-orders')
    }
    setLoading(false)
  }, [status, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!name || !email || !password) {
      setError(t('allFieldsRequired'))
      setLoading(false)
      return
    }

    try {
      const resUserExists = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const { user } = await resUserExists.json()

      if (user) {
        setError(t('userAlreadyExists'))
        setLoading(false)
        return
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      setLoading(false)

      if (res.ok) {
        const data = await res.json()
        setSuccess(data.message || t('registrationSuccess'))
        setName('')
        setEmail('')
        setPassword('')
        // router.push('/auth/signin'); // Optionally redirect
      } else {
        const data = await res.json()
        setError(data.message || t('registrationFailed'))
      }
    } catch (error) {
      console.error('Error during registration:', error)
      setError(t('registrationError'))
      setLoading(false)
    }
  }
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box>
    <Container 
      component="main" 
      maxWidth="xs" 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        py: 4
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: theme.palette.background.paper }}>
        <Typography component="h1" variant="h5" color="primary">
          {t('signUp')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {success}
            </Alert>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label={t('name')}
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('emailAddress')}
            name="email"
            autoComplete="email"
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
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={t('password')}
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : t('signUp')}
          </Button>
          <Typography variant="body2" align="center">
            {t('alreadyHaveAccount')}{' '}
            <Link href="/auth/signin" passHref>
              <Typography component="span" color="primary" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                {t('signIn')}
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
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
  )
}
