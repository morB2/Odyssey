import { useState, useEffect } from "react";
import type { UserProfile } from "./types";
import { Button, Card, Avatar, Box, Typography, List, ListItem, ListItemAvatar, ListItemText, Link, Dialog, DialogTitle, DialogContent, Skeleton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Edit, Users, UserPlus } from "lucide-react";
import { getFollowers as svcGetFollowers, getFollowing as svcGetFollowing } from "../../services/profile.service";
import { useTranslation } from 'react-i18next';
type SimpleFollow = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: unknown;
};

interface ProfileHeaderProps {
  user: UserProfile;
  isOwner?: boolean;
  onEditClick?: () => void;
  loading?: boolean;
}

export function ProfileHeader({ user, isOwner = false, onEditClick, loading = false }: ProfileHeaderProps) {
  const [openDialog, setOpenDialog] = useState<"followers" | "following" | null>(null);
  const [followers, setFollowers] = useState<SimpleFollow[]>([]);
  const [following, setFollowing] = useState<SimpleFollow[]>([]);
  const [followersCount, setFollowersCount] = useState<number>(user.followersCount || 0);
  const [followingCount, setFollowingCount] = useState<number>(user.followingCount || 0);
  const { t } = useTranslation();

  useEffect(() => {
    setOpenDialog(null);
    const u = user as unknown as { followersCount?: number; followingCount?: number; followers?: unknown[]; following?: unknown[] };
    const fCount = u.followersCount ?? (Array.isArray(u.followers) ? u.followers.length : 0);
    const foCount = u.followingCount ?? (Array.isArray(u.following) ? u.following.length : 0);
    setFollowersCount(fCount || 0);
    setFollowingCount(foCount || 0);

    if (Array.isArray(u.followers)) {
      const arr = u.followers as unknown[];
      const hasObjects = arr.length > 0 && typeof arr[0] === "object";
      if (hasObjects) setFollowers(arr as SimpleFollow[]);
      else setFollowers([]);
    } else {
      setFollowers([]);
    }
    if (Array.isArray(u.following)) {
      const arr = u.following as unknown[];
      const hasObjects = arr.length > 0 && typeof arr[0] === "object";
      if (hasObjects) setFollowing(arr as SimpleFollow[]);
      else setFollowing([]);
    } else {
      setFollowing([]);
    }
  }, [user]);

  const loadList = async (listType: "followers" | "following") => {
    const setter = listType === "followers" ? setFollowers : setFollowing;
    const currentList = listType === "followers" ? followers : following;
    if (!currentList.length) {
      try {
        const u = user as unknown as { id?: string; _id?: string };
        const uid = u.id || u._id || "";
        if (!uid) throw new Error("Missing user id for follow list");
        const data = listType === "followers" ? await svcGetFollowers(uid) : await svcGetFollowing(uid);
        const payload = Array.isArray(data) ? data : data?.data || data?.users || data;
        if (Array.isArray(payload)) {
          setter(payload as SimpleFollow[]);
          if (listType === "followers") setFollowersCount((payload as unknown[]).length);
          else setFollowingCount((payload as unknown[]).length);
        } else {
          console.warn(`unexpected ${listType} response`, data);
        }
      } catch (err) {
        console.error(`Failed to load ${listType}`, err);
      }
    }
    setOpenDialog(listType);
  };

  const renderDialog = (type: "followers" | "following") => {
    const list = type === "followers" ? followers : following;
    return (
      <Dialog open={openDialog === type} onClose={() => setOpenDialog(null)} fullWidth maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' } }}>

        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', color: '#111', py: 2 }}>
          {type === "followers" ? t('profile.followers') : t('profile.following')}
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          <List sx={{ py: 0 }}>
            {list.map((f) => (
              <ListItem key={f._id || f.id}
                sx={{ display: 'flex', alignItems: 'center', py: 1, borderRadius: 2, mb: 0.5, '&:hover': { bgcolor: '#fafafa' } }}>

                <ListItemAvatar>
                  <Avatar src={f.avatar || undefined} alt=""
                    sx={{ width: 42, height: 42, fontSize: '0.9rem', border: '1px solid #f97316' }}>
                    {(f.firstName || f.lastName || "")[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Link component={RouterLink} to={`/profile/${f._id || f.id}`} underline="none"
                      onClick={() => setOpenDialog(null)}
                      sx={{ fontWeight: 600, color: '#222', fontSize: '0.95rem', '&:hover': { color: '#f97316' } }}>
                      {String(`${f.firstName || ""} ${f.lastName || ""}`.trim() ||
                        f.email || f.username || f._id || "")}
                    </Link>
                  }
                  sx={{ m: 0 }}
                />

              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Card sx={{ mb: 4, borderRadius: 4, boxShadow: '0 6px 28px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={88} height={88} sx={{ border: '2px solid #f97316' }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="55%" height={30} sx={{ mb: 1 }} />
              <Skeleton width="35%" height={18} />
            </Box>
          </Box>
        </Box>
      </Card>
    );

  }

  return (
    <>
      <Card
        sx={{
          mb: 3,
          boxShadow: '0 0 0 transparent',
          borderRadius: 0,
          borderBottom: '1px solid #eee',
          background: '#fff',
          px: { xs: 2, md: 3 },
          pt: 3,
          pb: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: { xs: 2, md: 3 },
          }}
        >
          {/* Avatar */}
          <Avatar
            src={user.avatar || undefined}
            alt={user.firstName + ' ' + user.lastName}
            sx={{
              width: 80,
              height: 80,
              fontSize: '2rem',
              bgcolor: '#f97316',
              color: '#fff',
              border: '2px solid #fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            }}
          />

          {/* User Info */}
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#111',
                }}
              >
                {user.firstName + ' ' + user.lastName}
              </Typography>

              {isOwner && (
                <Button
                  onClick={onEditClick}
                  variant="text"
                  sx={{
                    minWidth: 0,
                    p: 0.5,
                    color: '#f97316',
                    '&:hover': { background: 'rgba(249,115,22,0.1)' },
                  }}
                >
                  <Edit size={18} />
                </Button>
              )}
            </Box>

            {/* Stats */}
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                mt: 1,
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Box
                onClick={() => loadList('followers')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  color: '#555',
                  '&:hover': { color: '#f97316' },
                }}
              >
                <Users size={16} />
                <Typography sx={{ fontWeight: 600 }}>{followersCount}</Typography>
                <Typography sx={{ fontSize: '0.8rem' }}>{t('profile.followers')}</Typography>
              </Box>

              <Box
                onClick={() => loadList('following')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  color: '#555',
                  '&:hover': { color: '#f97316' },
                }}
              >
                <UserPlus size={16} />
                <Typography sx={{ fontWeight: 600 }}>{followingCount}</Typography>
                <Typography sx={{ fontSize: '0.8rem' }}> {t('profile.following')}</Typography>
              </Box>

            </Box>
          </Box>
        </Box>
      </Card>

      {renderDialog('followers')}
      {renderDialog('following')}
    </>
  );

}
