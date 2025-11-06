import { useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  Link
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { loginUser, registerUser } from "../services/login.service";
import type { User } from '../models/user.model';

export default function App() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [loginData, setLoginData] = useState<Pick<User, 'email' | 'password'>>({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState<Pick<User, 'firstName' | 'lastName' | 'email' | 'password' | 'birthday'>>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthday: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await loginUser(loginData);
      setSuccess('Login successful!');
      console.log('Login response:', response);
      
      setTimeout(() => {
        setOpen(false);
        setLoginData({ email: '', password: '' });
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (signupData.password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await registerUser({
        ...signupData
      });

      setSuccess('Account created successfully!');
      console.log('Signup response:', response);
      
      setTimeout(() => {
        setActiveTab(0);
        setSignupData({ firstName: '', lastName: '', email: '', password: '', birthday: '' });
        setConfirmPassword('');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Button
        variant="contained"
        startIcon={<LoginIcon />}
        onClick={() => setOpen(true)}
        sx={{
          bgcolor: 'black',
          color: 'white',
          px: 4,
          py: 1.5,
          borderRadius: 3,
          boxShadow: 3,
          '&:hover': { bgcolor: '#1f2937' }
        }}
      >
        Sign In
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, maxHeight: '90vh', overflow: 'hidden' } }}
      >
        <Box sx={{ height: 4, background: 'linear-gradient(to right, #fb923c, #f97316, #ea580c)' }} />
        
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Typography variant="h5" fontWeight="bold">Welcome</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {activeTab === 0 ? 'Sign in to your account' : 'Create a new account'}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 4, pb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="fullWidth"
            sx={{
              mb: 3,
              bgcolor: '#f3f4f6',
              borderRadius: 2,
              p: 0.5,
              '& .MuiTab-root': { borderRadius: 1.5, textTransform: 'none', fontWeight: 500 },
              '& .Mui-selected': { bgcolor: 'white', boxShadow: 1 }
            }}
          >
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>

          {activeTab === 0 ? (
            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Email"
                type="email"
                placeholder="example@email.com"
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f9fafb', borderRadius: 2 } }}
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />

              <Box>
                <TextField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  required
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f9fafb', borderRadius: 2 } }}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <Link href="#" variant="body2" sx={{ color: '#ea580c', mt: 1, display: 'block' }}>
                  Forgot password?
                </Link>
              </Box>

              <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: 'black', color: 'white', py: 1.5, borderRadius: 2, mt: 1, '&:hover': { bgcolor: '#1f2937' } }}>
                Sign In
              </Button>

              <Divider sx={{ my: 1 }}>
                <Typography variant="body2" color="text.secondary">Or continue with</Typography>
              </Divider>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {/* כפתורי Google / Facebook */}
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSignup} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="First Name"
                type="text"
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f9fafb', borderRadius: 2 } }}
                value={signupData.firstName}
                onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
              />
              <TextField
                label="Last Name"
                type="text"
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f9fafb', borderRadius: 2 } }}
                value={signupData.lastName}
                onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
              />
              <TextField
                label="Email"
                type="email"
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f9fafb', borderRadius: 2 } }}
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              />
              <TextField
                label="Password"
                type="password"
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f9fafb', borderRadius: 2 } }}
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              />
              <TextField
                label="Confirm Password"
                type="password"
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f9fafb', borderRadius: 2 } }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <TextField
                label="Birthday (optional)"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f9fafb', borderRadius: 2 } }}
                value={signupData.birthday || ''}
                onChange={(e) => setSignupData({ ...signupData, birthday: e.target.value })}
              />

              <FormControlLabel
                control={<Checkbox required sx={{ color: '#ea580c', '&.Mui-checked': { color: '#ea580c' } }} />}
                label={
                  <Typography variant="body2" color="text.secondary">
                    I agree to the{' '}
                    <Link href="#" sx={{ color: '#ea580c' }}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="#" sx={{ color: '#ea580c' }}>Privacy Policy</Link>
                  </Typography>
                }
              />

              <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: 'black', color: 'white', py: 1.5, borderRadius: 2, mt: 1, '&:hover': { bgcolor: '#1f2937' } }}>
                Create Account
              </Button>

              <Divider sx={{ my: 1 }}>
                <Typography variant="body2" color="text.secondary">Or continue with</Typography>
              </Divider>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {/* כפתורי Google / Facebook */}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
