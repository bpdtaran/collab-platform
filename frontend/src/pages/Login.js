import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CssBaseline,
  GlobalStyles,
  InputAdornment,
  IconButton,
  Fade,
  Stack,
  Divider,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);
  const [remember, setRemember] = useState(true);
  const [capsOn, setCapsOn] = useState(false);

  const { login, loading, error, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    try {
      await login(formData.email, formData.password, { remember });
      navigate('/dashboard');
    } catch (err) {
      // Error handled by context
    }
  };

  const fillDemo = () =>
    setFormData({ email: 'demo@workspace.com', password: 'demo123' });

  const emailRegex = /\S+@\S+\.\S+/;
  const isValid = emailRegex.test(formData.email) && formData.password.length >= 6;

  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            background: '#ffffff',
            margin: 0,
            padding: 0,
          },
        }}
      />
      <CssBaseline />

      <Box sx={{ minHeight: '100vh', display: 'flex', background: '#ffffff' }}>
        {/* Left Side - Brand */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            p: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <Box
            sx={{
              position: 'absolute',
              width: 400,
              height: 400,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.1)',
              top: -100,
              right: -100,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: 300,
              height: 300,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.1)',
              bottom: -50,
              left: -50,
            }}
          />

          <Fade in={mounted} timeout={800}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, letterSpacing: '-0.5px' }}>
                WorkSpace Pro
              </Typography>
            </Box>
          </Fade>

          <Fade in={mounted} timeout={1000}>
            <Box sx={{ position: 'relative', zIndex: 1, mb: 8 }}>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  mb: 3,
                  lineHeight: 1.2,
                  fontSize: { md: '2.5rem', lg: '3rem' },
                }}
              >
                Manage your work,
                <br />
                beautifully simple.
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  maxWidth: 520,
                }}
              >
                Everything you need to run your business, all in one place.
              </Typography>

              <Stack direction="row" spacing={4} sx={{ mt: 6 }}>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    50K+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Active Users
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    99.9%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Uptime
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    4.9/5
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Rating
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Fade>

          <Fade in={mounted} timeout={1200}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                Trusted by teams at
              </Typography>
              <Stack direction="row" spacing={3}>
                {['Google', 'Microsoft', 'Amazon', 'Apple'].map((company) => (
                  <Typography
                    key={company}
                    sx={{
                      color: 'rgba(255,255,255,0.5)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    {company}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Fade>
        </Box>

        {/* Right Side - Login Form */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, sm: 6, md: 8 },
          }}
        >
          <Fade in={mounted} timeout={600}>
            <Box sx={{ width: '100%', maxWidth: 520 }}>
              {/* Header */}
              <Box sx={{ mb: 5 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: '#0f172a',
                    mb: 1.5,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                  }}
                >
                  Sign in
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.05rem' }}>
                  Welcome back! Please enter your details.
                </Typography>
              </Box>

              {/* Demo Info */}
              <Box
                sx={{
                  p: 2.5,
                  mb: 4,
                  background: '#f8fafc',
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
                  Demo Account
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  Email: demo@workspace.com
                  <br />
                  Password: demo123
                </Typography>
                <Button size="small" onClick={fillDemo} sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}>
                  Fill demo credentials
                </Button>
              </Box>

              {/* Error */}
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit}>
                {/* Email */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#0f172a' }}>
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter your email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#94a3b8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': { borderColor: '#e2e8f0' },
                        '&:hover fieldset': { borderColor: '#2563eb' },
                        '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: 2 },
                      },
                    }}
                  />
                </Box>

                {/* Password */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#0f172a' }}>
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter your password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyUp={(e) => setCapsOn(e.getModifierState('CapsLock'))}
                    error={!!errors.password}
                    helperText={errors.password || (capsOn ? 'Caps Lock is on' : '')}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#94a3b8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                            aria-label="Toggle password visibility"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': { borderColor: '#e2e8f0' },
                        '&:hover fieldset': { borderColor: '#2563eb' },
                        '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: 2 },
                      },
                    }}
                  />
                </Box>

                {/* Remember + Forgot */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                    }
                    label="Keep me signed in"
                  />
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    sx={{
                      color: '#2563eb',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || !isValid}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    boxShadow: 'none',
                    mb: 3,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    },
                    '&:disabled': { background: '#cbd5e1' },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <CircularProgress size={18} sx={{ color: 'white' }} />
                      Signing in...
                    </Box>
                  ) : (
                    'Sign in'
                  )}
                </Button>

                {/* Divider */}
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8', px: 2 }}>
                    or
                  </Typography>
                </Divider>

                {/* Sign Up */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/register"
                      sx={{
                        color: '#2563eb',
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Sign up
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Box>
      </Box>
    </>
  );
};

export default Login;