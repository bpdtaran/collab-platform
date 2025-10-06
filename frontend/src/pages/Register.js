import React, { useState, useMemo } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  PersonAdd,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const emailRegex = /\S+@\S+\.\S+/;

function getPasswordScore(pw) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score; // 0–5
}

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const passwordScore = useMemo(() => getPasswordScore(formData.password), [formData.password]);
  const passwordStrength = useMemo(() => {
    if (passwordScore <= 2) return { label: 'Weak', color: '#ef4444' };
    if (passwordScore === 3) return { label: 'Okay', color: '#f59e0b' };
    return { label: 'Strong', color: '#10b981' };
  }, [passwordScore]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (passwordScore < 3 && !newErrors.password) newErrors.password = 'Use a stronger password';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = 'You must agree to the Terms and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // prevent native validation tooltips
    if (!validateForm()) return;

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate('/dashboard'); // or navigate('/') if you prefer
    } catch (err) {
      // errors from context show in `error`
    }
  };

  const isValid =
    formData.name.trim().length > 0 &&
    emailRegex.test(formData.email) &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword &&
    acceptTerms;

  return (
    <Container component="main" maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
          <PersonAdd sx={{ fontSize: 40, mb: 1.5, color: 'primary.main' }} />
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
            Sign Up
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
            Create your account to start collaborating
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" noValidate onSubmit={handleSubmit}>
          {/* Name */}
          <TextField
            margin="normal"
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />

          {/* Email */}
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Password */}
          <TextField
            margin="normal"
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            onKeyUp={(e) => setCapsOn(e.getModifierState('CapsLock'))}
            error={!!errors.password}
            helperText={errors.password || (capsOn ? 'Caps Lock is on' : '')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Password strength */}
          <Box sx={{ mt: 0.5, mb: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(passwordScore / 5) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    '& .MuiLinearProgress-bar': { backgroundColor: passwordStrength.color },
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: passwordStrength.color, fontWeight: 600 }}>
                {passwordStrength.label}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
              {[
                { label: '8+ chars', ok: formData.password.length >= 8 },
                { label: 'Uppercase', ok: /[A-Z]/.test(formData.password) },
                { label: 'Lowercase', ok: /[a-z]/.test(formData.password) },
                { label: 'Number', ok: /[0-9]/.test(formData.password) },
                { label: 'Symbol', ok: /[^A-Za-z0-9]/.test(formData.password) },
              ].map((r, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  sx={{
                    px: 1,
                    py: 0.2,
                    borderRadius: 1,
                    bgcolor: r.ok ? 'success.light' : 'action.hover',
                    color: r.ok ? 'success.dark' : 'text.secondary',
                    border: '1px solid',
                    borderColor: r.ok ? 'success.main' : 'divider',
                  }}
                >
                  {r.label}
                </Typography>
              ))}
            </Stack>
          </Box>

          {/* Confirm Password */}
          <TextField
            margin="normal"
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirm((s) => !s)}
                    edge="end"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Terms */}
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Checkbox
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (errors.acceptTerms) setErrors((prev) => ({ ...prev, acceptTerms: '' }));
                }}
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                I agree to the{' '}
                <Link component={RouterLink} to="/terms" sx={{ fontWeight: 600 }}>
                  Terms
                </Link>{' '}
                and{' '}
                <Link component={RouterLink} to="/privacy" sx={{ fontWeight: 600 }}>
                  Privacy Policy
                </Link>
              </Typography>
            }
          />
          {errors.acceptTerms && (
            <Typography variant="caption" color="error" sx={{ ml: 4, mt: -0.5 }}>
              {errors.acceptTerms}
            </Typography>
          )}

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !isValid}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.4,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                boxShadow: '0 6px 20px rgba(37,99,235,.25)',
              },
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} sx={{ color: 'white' }} />
                Creating Account...
              </Box>
            ) : (
              'Sign Up'
            )}
          </Button>

          {/* Sign in link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;