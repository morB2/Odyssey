import { useState } from 'react';
import type { UserProfile } from './types';
import {
  Button,
  Card,
  Avatar,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Link,
  IconButton,
} from '@mui/material';
import { Edit, Users, UserPlus } from 'lucide-react';

interface ProfileHeaderProps {
  user: UserProfile;
  onEditClick: () => void;
}

export function ProfileHeader({ user, onEditClick }: ProfileHeaderProps) {
  const [openFollowers, setOpenFollowers] = useState(false);
  const [openFollowing, setOpenFollowing] = useState(false);
  const [followers, setFollowers] = useState(user.followers || []);
  const [following, setFollowing] = useState(user.following || []);

  const loadFollowers = async () => {
    if (!followers.length) {
      try {
        const res = await fetch(`/profile/${user.id}/followers`);
        const data = await res.json();
        if (data.success && Array.isArray(data.followers)) setFollowers(data.followers);
      } catch (e) {
        console.error('failed to load followers', e);
      }
    }
    setOpenFollowers(true);
  };

  const loadFollowing = async () => {
    if (!following.length) {
      try {
        const res = await fetch(`/profile/${user.id}/following`);
        const data = await res.json();
        if (data.success && Array.isArray(data.following)) setFollowing(data.following);
      } catch (e) {
        console.error('failed to load following', e);
      }
    }
    setOpenFollowing(true);
  };

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <Card
        sx={{
          mb: 6,
          overflow: 'hidden',
          border: '1px solid #e5e5e5',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        }}
      >
        <Box sx={{ px: 3, py: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'center' },
              justifyContent: { xs: 'center', sm: 'space-between' },
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                src={user.profilePicture}
                alt={user.fullName}
                sx={{
                  width: 80,
                  height: 80,
                  border: '1px solid #e5e5e5',
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                  bgcolor: '#171717',
                  color: '#ffffff',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography
                  variant="h4"
                  sx={{ mb: 0.5, fontSize: '1.875rem', fontWeight: 700, color: '#171717' }}
                >
                  {user.fullName}
                </Typography>
                <Typography sx={{ fontSize: '1rem', color: '#525252' }}>{user.username}</Typography>

                {/* מספר עוקבים ונעקבים עם אייקונים */}
                <Box sx={{ mt: 1, display: 'flex', gap: 3, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={loadFollowers} size="small" aria-label="followers">
                      <Users size={16} />
                    </IconButton>
                    <Typography variant="body2">
                      {user.followersCount || followers.length || 0} followers
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={loadFollowing} size="small" aria-label="following">
                      <UserPlus size={16} />
                    </IconButton>
                    <Typography variant="body2">
                      {user.followingCount || following.length || 0} following
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Button
              onClick={onEditClick}
              variant="contained"
              sx={{
                backgroundColor: '#f97316',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#ea580c' },
              }}
            >
              <Edit size={16} style={{ marginRight: '8px' }} />
              Edit Profile
            </Button>
          </Box>
        </Box>
      </Card>

      <Dialog open={openFollowers} onClose={() => setOpenFollowers(false)} fullWidth maxWidth="xs">
        <DialogTitle>Followers</DialogTitle>
        <DialogContent>
          <List>
            {followers.map((f) => (
              <ListItem key={f.id}>
                <ListItemAvatar>
                  <Avatar src={f.profilePicture} alt={f.fullName}>
                    {f.fullName[0].toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Link href={`/profile/${f.id}`} underline="hover">
                      {f.fullName}
                    </Link>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog open={openFollowing} onClose={() => setOpenFollowing(false)} fullWidth maxWidth="xs">
        <DialogTitle>Following</DialogTitle>
        <DialogContent>
          <List>
            {following.map((f) => (
              <ListItem key={f.id}>
                <ListItemAvatar>
                  <Avatar src={f.profilePicture} alt={f.fullName}>
                    {f.fullName[0].toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Link href={`/profile/${f.id}`} underline="hover">
                      {f.fullName}
                    </Link>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}
