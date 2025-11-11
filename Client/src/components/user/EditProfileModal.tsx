import { useState } from 'react';
import type { UserProfile } from './types';
import { Modal } from './Modal';
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  
} from '@mui/material';
import { Lock, Save } from 'lucide-react';

interface EditProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserProfile) => void;
}

export function EditProfileModal({ user, isOpen, onClose, onSave }: EditProfileModalProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [username, setUsername] = useState(user.username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    onSave({
      ...user,
      fullName,
      username,
    });

    // Reset password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (!currentPassword) {
      alert('Please enter your current password');
      return;
    }
    // Password change logic would go here
    console.log('Change password');
    alert('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="lg">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Profile Information */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography
              component="label"
              htmlFor="fullName"
              sx={{
                display: 'block',
                mb: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#171717',
              }}
            >
              Full Name
            </Typography>
            <TextField
              id="fullName"
              fullWidth
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d4d4d4',
                  },
                  '&:hover fieldset': {
                    borderColor: '#a3a3a3',
                  },
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              component="label"
              htmlFor="username"
              sx={{
                display: 'block',
                mb: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#171717',
              }}
            >
              Username
            </Typography>
            <TextField
              id="username"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d4d4d4',
                  },
                  '&:hover fieldset': {
                    borderColor: '#a3a3a3',
                  },
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              component="label"
              htmlFor="email"
              sx={{
                display: 'block',
                mb: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#171717',
              }}
            >
              Email
            </Typography>
            <TextField
              id="email"
              fullWidth
              value={user.email}
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fafafa',
                  '& fieldset': {
                    borderColor: '#d4d4d4',
                  },
                  '& input': {
                    color: '#737373',
                  },
                },
              }}
            />
            <Typography sx={{ mt: 0.5, fontSize: '0.875rem', color: '#737373' }}>
              Email cannot be changed
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ backgroundColor: '#e5e5e5' }} />

        {/* Change Password Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lock size={20} color="#525252" />
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#171717',
              }}
            >
              Change Password
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              borderRadius: 2,
              border: '1px solid #e5e5e5',
              backgroundColor: '#fafafa',
              p: 2,
            }}
          >
            <Box>
              <Typography
                component="label"
                htmlFor="currentPassword"
                sx={{
                  display: 'block',
                  mb: 1,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#171717',
                }}
              >
                Current Password
              </Typography>
              <TextField
                id="currentPassword"
                type="password"
                fullWidth
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: '#d4d4d4',
                    },
                    '&:hover fieldset': {
                      borderColor: '#a3a3a3',
                    },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                component="label"
                htmlFor="newPassword"
                sx={{
                  display: 'block',
                  mb: 1,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#171717',
                }}
              >
                New Password
              </Typography>
              <TextField
                id="newPassword"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: '#d4d4d4',
                    },
                    '&:hover fieldset': {
                      borderColor: '#a3a3a3',
                    },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                component="label"
                htmlFor="confirmPassword"
                sx={{
                  display: 'block',
                  mb: 1,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#171717',
                }}
              >
                Confirm New Password
              </Typography>
              <TextField
                id="confirmPassword"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: '#d4d4d4',
                    },
                    '&:hover fieldset': {
                      borderColor: '#a3a3a3',
                    },
                  },
                }}
              />
            </Box>

            <Button
              onClick={handleChangePassword}
              variant="outlined"
              fullWidth
              disabled={!currentPassword || !newPassword || !confirmPassword}
              sx={{
                borderColor: '#d4d4d4',
                color: '#171717',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#a3a3a3',
                  backgroundColor: '#fafafa',
                },
                '&.Mui-disabled': {
                  borderColor: '#e5e5e5',
                  color: '#a3a3a3',
                },
              }}
            >
              Change Password
            </Button>
          </Box>
        </Box>

        <Divider sx={{ backgroundColor: '#e5e5e5' }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: '#d4d4d4',
              color: '#171717',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#a3a3a3',
                backgroundColor: '#fafafa',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              backgroundColor: '#f97316',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#ea580c',
              },
            }}
          >
            <Save size={16} style={{ marginRight: '8px' }} />
            Save Changes
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}