import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  AppBar,
  Toolbar,
  Link,
  Fab,
  Zoom,
  Fade,
  useScrollTrigger,
  CssBaseline,
  Stack,
  Avatar,
  Divider,
  alpha,
} from '@mui/material';
import {
  Speed,
  Security,
  Group,
  Dashboard,
  TrendingUp,
  EmojiObjects,
  Cloud,
  KeyboardArrowUp,
  Star,
  CheckCircle,
  ArrowForward,
  PlayArrow,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { Link as RouterLink } from 'react-router-dom';

// Scroll to top component
function ScrollTop(props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}
      >
        {children}
      </Box>
    </Zoom>
  );
}

/* ========== Shiny pill (sweep) – v2 with stronger contrast & proper stacking ========== */
const shineSweep = keyframes`
  0%   { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
  20%  { opacity: .32; }
  50%  { opacity: .32; }
  100% { transform: translateX(120%) skewX(-20deg); opacity: 0; }
`;

const ShinyPill = ({
  children,
  mode = 'light',        // 'light' => black sweep, 'dark' => white sweep
  duration = 2400,        // ms
  strength = 0.22,        // sweep opacity (0.10–0.35)
  forceAnimation = false, // set true to ignore prefers-reduced-motion during dev/testing
  delay = 0,              // stagger if you render multiple pills
}) => {
  const isDark = mode === 'dark';
  const stripe = isDark
    ? `rgba(255,255,255,${strength})`
    : `rgba(0,0,0,${strength})`;
  const bg = isDark ? 'rgba(255,255,255,0.07)' : alpha('#2563eb', 0.10);
  const border = isDark ? 'rgba(255,255,255,0.18)' : alpha('#2563eb', 0.20);
  const text = isDark ? 'rgba(255,255,255,0.92)' : '#0f172a';

  return (
    <Box
      sx={{
        position: 'relative',
        isolation: 'isolate', // ensures ::before is below text but above bg
        display: 'inline-flex',
        alignItems: 'center',
        px: 2.5,
        py: 1,
        borderRadius: 999,
        bgcolor: bg,
        border: '1px solid',
        borderColor: border,
        color: text,
        fontWeight: 700,
        lineHeight: 1,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '-30%',
          width: '55%',
          zIndex: 1,
          pointerEvents: 'none',
          background: `linear-gradient(90deg, transparent, ${stripe}, transparent)`,
          transform: 'skewX(-20deg)',
          willChange: 'transform, opacity',
          animation: `${shineSweep} ${duration}ms ease-in-out infinite`,
          animationDelay: `${delay}ms`,
        },
        ...(forceAnimation
          ? {}
          : {
              '@media (prefers-reduced-motion: reduce)': {
                '&::before': { animation: 'none' },
              },
            }),
      }}
    >
      <Typography
        component="span"
        variant="body2"
        sx={{ fontWeight: 700, color: text, position: 'relative', zIndex: 2 }}
      >
        {children}
      </Typography>
    </Box>
  );
};
/* ========== /Shiny pill ========== */

const LandingPage = () => {
  // Features
  const features = [
    {
      icon: <Speed />,
      title: 'Lightning Performance',
      description:
        'Optimized architecture delivering safe, responsive performance from low latency connectivity.',
    },
    {
      icon: <Security />,
      title: 'Bank-Grade Security',
      description:
        'Military-grade encryption with industry-standard compliance and zero-trust architecture.',
    },
    {
      icon: <Group />,
      title: 'Unified Collaboration',
      description:
        'Real-time collaboration tools that reduce turnaround time for teams, wherever they are.',
    },
    {
      icon: <TrendingUp />,
      title: 'Advanced Analytics',
      description:
        'Automated insights powered by AI to help you make data-driven decisions.',
    },
    {
      icon: <EmojiObjects />,
      title: 'AI-Powered Intelligence',
      description:
        'Smart automation and predictive insights that enhance any user interface.',
    },
    {
      icon: <Cloud />,
      title: 'Global Infrastructure',
      description:
        '99.99% uptime with data centers across 6 continents for unmatched reliability.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Chief Technology Officer',
      company: 'TechVision Inc.',
      avatar: 'SM',
      content:
        "WorkSpace Pro has fundamentally transformed our operational efficiency. The platform's intuitive design combined with enterprise-grade capabilities has enabled our team to achieve unprecedented productivity.",
      rating: 5,
    },
    {
      name: 'David Chen',
      role: 'VP of Engineering',
      company: 'Innovation Labs',
      avatar: 'DC',
      content:
        'The security architecture and compliance certifications give us complete confidence. This is the only platform we trust with our most sensitive projects and data.',
      rating: 5,
    },
    {
      name: 'Emma Thompson',
      role: 'Founder & CEO',
      company: 'Nexus Ventures',
      avatar: 'ET',
      content:
        'From day one, WorkSpace Pro has been instrumental in scaling our operations. The platform grows with us, providing exactly what we need at every stage.',
      rating: 5,
    },
  ];

  const stats = [
    { value: '500K+', label: 'Global Users' },
    { value: '99.99%', label: 'Uptime SLA' },
    { value: '150+', label: 'Countries' },
    { value: '4.9/5', label: 'User Rating' },
  ];

  return (
    <>
      <CssBaseline />

      {/* Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha('#ffffff', 0.95),
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 70, py: 1 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  background:
                    'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}
              >
                <Dashboard sx={{ color: 'white', fontSize: 22 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: '1.2rem',
                  letterSpacing: '-0.5px',
                }}
              >
                WorkSpace Pro
              </Typography>
            </Box>

            {/* Nav Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, mr: 4 }}>
              <Link
                href="#features"
                sx={{
                  color: '#64748b',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  transition: 'color 0.2s',
                  '&:hover': { color: '#2563eb' },
                }}
              >
                Features
              </Link>
              <Link
                href="#testimonials"
                sx={{
                  color: '#64748b',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  transition: 'color 0.2s',
                  '&:hover': { color: '#2563eb' },
                }}
              >
                Customers
              </Link>
              <Link
                href="#pricing"
                sx={{
                  color: '#64748b',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  transition: 'color 0.2s',
                  '&:hover': { color: '#2563eb' },
                }}
              >
                Pricing
              </Link>
            </Box>

            {/* Auth Buttons */}
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="text"
                component={RouterLink}
                to="/login"
                sx={{
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 2.5,
                  '&:hover': {
                    color: '#2563eb',
                    bgcolor: alpha('#2563eb', 0.05),
                  },
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/register"
                sx={{
                  background:
                    'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  boxShadow: 'none',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  },
                }}
              >
                Get Started
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          pt: { xs: 6, md: 10 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Hero Content */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Fade in timeout={600}>
              <Box sx={{ mb: 3 }}>
                {/* Animated pill with black-ish sweep on light background */}
                <ShinyPill mode="light" duration={2200} strength={0.24} forceAnimation>
                  Now with AI‑Powered Insights
                </ShinyPill>
              </Box>
            </Fade>

            <Fade in timeout={800}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  mb: 3,
                  letterSpacing: '-2px',
                  color: '#0f172a',
                }}
              >
                The Modern Workspace
                <br />
                <Box
                  component="span"
                  sx={{
                    background:
                      'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Built for Excellence
                </Box>
              </Typography>
            </Fade>

            <Fade in timeout={1000}>
              <Typography
                variant="h6"
                sx={{
                  color: '#64748b',
                  fontWeight: 400,
                  lineHeight: 1.7,
                  mb: 4,
                  maxWidth: 700,
                  mx: 'auto',
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                }}
              >
                Enterprise-grade platform trusted by leading organizations worldwide.
                Streamline operations, enhance collaboration, and accelerate growth.
              </Typography>
            </Fade>

            <Fade in timeout={1200}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ justifyContent: 'center', mb: 4 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  endIcon={<ArrowForward />}
                  sx={{
                    background:
                      'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
                    px: 4,
                    py: 1.75,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': {
                      background:
                        'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                      boxShadow: '0 12px 32px rgba(37, 99, 235, 0.35)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PlayArrow />}
                  sx={{
                    borderColor: '#cbd5e1',
                    color: '#64748b',
                    px: 4,
                    py: 1.75,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: '#2563eb',
                      borderWidth: 2,
                      bgcolor: alpha('#2563eb', 0.05),
                      color: '#2563eb',
                    },
                  }}
                >
                  Watch Demo
                </Button>
              </Stack>
            </Fade>

            <Fade in timeout={1400}>
              <Stack
                direction="row"
                spacing={3}
                sx={{
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: { xs: 1, sm: 2 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CheckCircle sx={{ color: '#10b981', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>
                    No credit card required
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CheckCircle sx={{ color: '#10b981', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>
                    14-day free trial
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CheckCircle sx={{ color: '#10b981', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>
                    Cancel anytime
                  </Typography>
                </Box>
              </Stack>
            </Fade>
          </Box>

          {/* Hero Image */}
          <Fade in timeout={1600}>
            <Box
              sx={{
                maxWidth: 900,
                mx: 'auto',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #e2e8f0',
                bgcolor: '#f8fafc',
                height: { xs: 300, sm: 400, md: 500 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Dashboard sx={{ fontSize: 100, color: alpha('#2563eb', 0.2) }} />
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Stats Section – FIXED */}
      <Box
        sx={{
          bgcolor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 2, md: 0 }} alignItems="center" justifyContent="center">
            {stats.map((stat, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Box
                  sx={{
                    textAlign: 'center',
                    px: { xs: 1, md: 3 },
                    py: { xs: 2, md: 0 },
                    borderRight: { xs: 'none', md: idx !== 3 ? '1px solid #e2e8f0' : 'none' },
                  }}
                >
                  <Typography
                    component="div"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '2rem', md: '2.75rem' },
                      lineHeight: 1,
                      letterSpacing: '-0.5px',
                      whiteSpace: 'nowrap',
                      fontFeatureSettings: '"tnum" on, "lnum" on',
                      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      mb: 1.25,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#0f172a',
                      fontWeight: 600,
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      lineHeight: 1.3,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FEATURES SECTION – CLEAN AND SINGLE */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography variant="overline" sx={{ color: '#2563eb', fontWeight: 700, letterSpacing: '1.5px' }}>
              POWERFUL FEATURES
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mt: 1,
                mb: 1.5,
                fontSize: { xs: '2rem', md: '2.75rem' },
                color: '#0f172a',
                letterSpacing: '-1px',
              }}
            >
              Everything you need to succeed
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#64748b',
                fontWeight: 400,
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.125rem' },
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Enterprise-grade tools designed to scale with your business and empower your team
            </Typography>
          </Box>

          {/* Grid (CSS Grid for perfect columns) */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: { xs: 2.5, md: 3.5 },
              alignItems: 'stretch',
            }}
          >
            {features.map((f, i) => (
              <Card
                key={i}
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  gap: 2.5,
                  p: 3,
                  border: '1px solid #e2e8f0',
                  borderRadius: 3,
                  transition: 'all .25s ease',
                  '&:hover': {
                    borderColor: '#2563eb',
                    boxShadow: '0 16px 32px -16px rgba(37,99,235,.2)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    minWidth: 48,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(37,99,235,0.08)',
                    color: '#2563eb',
                  }}
                >
                  {React.cloneElement(f.icon, { sx: { fontSize: 24 } })}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.75 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7 }}>
                    {f.description}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>

          {/* CTA under features */}
          <Box sx={{ textAlign: 'center', mt: { xs: 6, md: 8 } }}>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 3, fontSize: '1.05rem' }}>
              Want to see more? Explore all features
            </Typography>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                borderColor: '#2563eb',
                color: '#2563eb',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  borderColor: '#1d4ed8',
                  bgcolor: alpha('#2563eb', 0.05),
                },
              }}
            >
              View All Features
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section – FIXED GRID */}
      <Box id="testimonials" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="lg">
          {/* Section Header */}
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography
              variant="overline"
              sx={{ color: '#2563eb', fontWeight: 700, letterSpacing: '1.5px' }}
            >
              CUSTOMER STORIES
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mt: 1,
                mb: 1.5,
                fontSize: { xs: '2rem', md: '2.75rem' },
                color: '#0f172a',
                letterSpacing: '-1px',
              }}
            >
              Trusted by leaders worldwide
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#64748b',
                fontWeight: 400,
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.125rem' },
                maxWidth: 720,
                mx: 'auto',
              }}
            >
              See why thousands of organizations choose WorkSpace Pro
            </Typography>
          </Box>

          {/* Grid */}
          <Grid container spacing={{ xs: 2.5, md: 3.5 }} alignItems="stretch">
            {testimonials.map((t, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    border: '1px solid #e2e8f0',
                    borderRadius: 3,
                    bgcolor: '#fff',
                    transition: 'all .25s ease',
                    '&:hover': {
                      boxShadow: '0 20px 40px -12px rgba(0,0,0,0.12)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  {/* Stars */}
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} sx={{ color: '#fbbf24', fontSize: 20 }} />
                    ))}
                  </Box>

                  {/* Quote */}
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#334155',
                      lineHeight: 1.7,
                      fontSize: '1rem',
                      mb: 2.5,
                      flexGrow: 1,
                    }}
                  >
                    “{t.content}”
                  </Typography>

                  {/* Divider */}
                  <Divider sx={{ mb: 2 }} />

                  {/* Author */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        fontWeight: 700,
                        background:
                          'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      }}
                    >
                      {t.avatar}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}
                      >
                        {t.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {t.role}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
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
            top: -200,
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
            bottom: -150,
            left: -100,
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.75rem' },
                letterSpacing: '-1px',
              }}
            >
              Ready to transform your workflow?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.95,
                fontWeight: 400,
                lineHeight: 1.7,
                fontSize: { xs: '1.1rem', md: '1.2rem' },
              }}
            >
              Join thousands of teams already achieving more with WorkSpace Pro
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/register"
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: 'white',
                color: '#2563eb',
                px: 5,
                py: 2,
                fontSize: '1.05rem',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Start Your Free Trial
            </Button>
            <Typography variant="body2" sx={{ mt: 3, opacity: 0.9 }}>
              No credit card required • Full access • Cancel anytime
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: '#0f172a', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Brand */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    background:
                      'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                  }}
                >
                  <Dashboard sx={{ color: 'white', fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  WorkSpace Pro
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: '#94a3b8', lineHeight: 1.7, mb: 3 }}
              >
                Empowering organizations worldwide with cutting-edge tools.
              </Typography>
            </Grid>

            {/* Product */}
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Product
              </Typography>
              <Stack spacing={1.5}>
                {['Features', 'Security', 'Pricing', 'Updates'].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    sx={{
                      color: '#94a3b8',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'color 0.2s',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Stack>
            </Grid>

            {/* Company */}
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Company
              </Typography>
              <Stack spacing={1.5}>
                {['About', 'Careers', 'Blog', 'Contact'].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    sx={{
                      color: '#94a3b8',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'color 0.2s',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Stack>
            </Grid>

            {/* Resources */}
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Resources
              </Typography>
              <Stack spacing={1.5}>
                {['Docs', 'Help', 'Community', 'Status'].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    sx={{
                      color: '#94a3b8',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'color 0.2s',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Stack>
            </Grid>

            {/* Legal */}
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Legal
              </Typography>
              <Stack spacing={1.5}>
                {['Privacy', 'Terms', 'Security', 'Cookies'].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    sx={{
                      color: '#94a3b8',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'color 0.2s',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: alpha('#fff', 0.1), my: 4 }} />
          <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center' }}>
            © 2024 WorkSpace Pro. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Scroll to top */}
      <ScrollTop>
        <Fab
          size="medium"
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
            },
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>
    </>
  );
};

export default LandingPage;