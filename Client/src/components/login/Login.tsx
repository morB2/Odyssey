import { useEffect, useState, type FormEvent } from 'react';
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
  Divider,
  Link
} from '@mui/material';
import { loginUser, registerUser } from "../../services/login.service";
import type { User } from '../../models/user.model';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import GLogin from './GoogleLogin';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useUserStore } from '../../store/userStore';


const Login = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "signup") setActiveTab(1);
    else setActiveTab(0);
  }, [searchParams]);

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

      const userInfo = {
        _id: response.user._id,
        firstName: response.user.firstName,
        googleId: response.user.googleId,
        avatar: response.user.avatar,
      };

      useUserStore.getState().setUser(userInfo, response.token);
      setOpen(false);
      setTimeout(() => navigate(-1), 200);
      console.log("User saved in store after login:", useUserStore.getState().user, "token", response.token);

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

      const userInfo = {
        _id: response.user._id,
        firstName: response.user.firstName,
        googleId: response.user.googleId,
        avatar: response.user.avatar,
      };

      useUserStore.getState().setUser(userInfo, response.token);
      setOpen(false);
      setTimeout(() => navigate(-1), 200);
      console.log("User saved in store after signup:", useUserStore.getState().user);

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
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setTimeout(() => navigate(-1), 200);
        }}
        maxWidth="sm"
        fullWidth
        disableScrollLock={true}
        PaperProps={{ sx: { borderRadius: 4, maxHeight: '90vh', overflow: 'hidden' } }}
      >
        <Box sx={{ height: 4, background: 'linear-gradient(to right, #fb923c, #f97316, #ea580c)' }} />

        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Typography component="div" variant="h5" fontWeight="bold">Welcome</Typography>
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
                <Link
                  component={RouterLink}
                  to="/forgotPassword"
                  variant="body2"
                  sx={{ color: '#ea580c', mt: 1, display: 'block' }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: 'black', color: 'white', py: 1.5, borderRadius: 2, mt: 1, '&:hover': { bgcolor: '#1f2937' } }}>
                Sign In
              </Button>

              <Divider sx={{ my: 1 }}>
                <Typography variant="body2" color="text.secondary">Or continue with</Typography>
              </Divider>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}>
                  <div>
                    <GLogin onSuccess={() => {
                      setOpen(false);
                      setTimeout(() => navigate(-1), 200);
                    }} />
                  </div>
                </GoogleOAuthProvider>
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

              {/* מאשר את תנאי השימוש */}
              {/* <FormControlLabel
                control={<Checkbox required sx={{ color: '#ea580c', '&.Mui-checked': { color: '#ea580c' } }} />}
                label={
                  <Typography variant="body2" color="text.secondary">
                    I agree to the{' '}
                    <Link href="#" sx={{ color: '#ea580c' }}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="#" sx={{ color: '#ea580c' }}>Privacy Policy</Link>
                  </Typography>
                }
              /> */}

              <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: 'black', color: 'white', py: 1.5, borderRadius: 2, mt: 1, '&:hover': { bgcolor: '#1f2937' } }}>
                Create Account
              </Button>

              <Divider sx={{ my: 1 }}>
                <Typography variant="body2" color="text.secondary">Or continue with</Typography>
              </Divider>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}>
                  <div>
                    <GLogin />
                  </div>
                </GoogleOAuthProvider>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Login;

