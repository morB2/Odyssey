import { useState, useEffect } from "react";
import type { UserProfile } from "./types";
import {
  Button,
  Card,
  Avatar,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Link,
  IconButton,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Edit, Users, UserPlus } from "lucide-react";
import { useUserStore } from "../../store/userStore";
import {
  uploadAvatar,
  getFollowers as svcGetFollowers,
  getFollowing as svcGetFollowing,
} from "../../services/profile.service";
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
  onAvatarSaved?: (user: UserProfile) => void;
}

export function ProfileHeader({
  user,
  isOwner = false,
  onEditClick,
  onAvatarSaved,
}: ProfileHeaderProps) {
  const token = useUserStore((s) => s.token);
  const [openDialog, setOpenDialog] = useState<
    "followers" | "following" | null
  >(null);
  // start with empty lists; only cache server-returned objects (not raw id arrays)
  const [followers, setFollowers] = useState<SimpleFollow[]>([]);
  const [following, setFollowing] = useState<SimpleFollow[]>([]);
  const [followersCount, setFollowersCount] = useState<number>(
    user.followersCount || 0
  );
  const [followingCount, setFollowingCount] = useState<number>(
    user.followingCount || 0
  );

  // keep counts in sync when the parent provides an updated `user` object
  useEffect(() => {
    setOpenDialog(null);
    const u = user as unknown as {
      followersCount?: number;
      followingCount?: number;
      followers?: unknown[];
      following?: unknown[];
    };
    const fCount =
      u.followersCount ?? (Array.isArray(u.followers) ? u.followers.length : 0);
    const foCount =
      u.followingCount ?? (Array.isArray(u.following) ? u.following.length : 0);
    setFollowersCount(fCount || 0);
    setFollowingCount(foCount || 0);
    // also sync cached lists if the parent provided populated user objects
    if (Array.isArray(u.followers)) {
      const arr = u.followers as unknown[];
      const hasObjects = arr.length > 0 && typeof arr[0] === "object";
      if (hasObjects) setFollowers(arr as SimpleFollow[]);
      else setFollowers([]); // clear so loadList will fetch full objects
    } else {
      // if the parent didn't provide follower objects for this user, clear cached list
      setFollowers([]);
    }
    if (Array.isArray(u.following)) {
      const arr = u.following as unknown[];
      const hasObjects = arr.length > 0 && typeof arr[0] === "object";
      if (hasObjects) setFollowing(arr as SimpleFollow[]);
      else setFollowing([]);
    } else {
      // if the parent didn't provide following objects for this user, clear cached list
      setFollowing([]);
    }
  }, [user]);

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    if (!avatarFile) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(avatarFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const handleOpenAvatarDialog = () => {
    setAvatarFile(null);
    setAvatarUrl("");
    setPreview(null);
    setAvatarDialogOpen(true);
  };

  /** Generic loader for followers/following */
  const loadList = async (listType: "followers" | "following") => {
    const setter = listType === "followers" ? setFollowers : setFollowing;
    const currentList = listType === "followers" ? followers : following;
    // If we already have items cached, show them. Otherwise fetch from follow routes.
    if (!currentList.length) {
      try {
        const u = user as unknown as { id?: string; _id?: string };
        const uid = u.id || u._id || "";
        if (!uid) throw new Error("Missing user id for follow list");
        const data =
          listType === "followers"
            ? await svcGetFollowers(uid)
            : await svcGetFollowing(uid);

        // svc returns server response object or array; normalize
        const payload = Array.isArray(data)
          ? data
          : data?.data || data?.users || data;
        if (Array.isArray(payload)) {
          setter(payload as SimpleFollow[]);
          if (listType === "followers")
            setFollowersCount((payload as unknown[]).length);
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

  const handleSaveAvatar = async () => {
    const u = user as unknown as { id?: string; _id?: string };
    const uid = u.id || u._id || "";
    if (!user || !uid) return;
    setSavingAvatar(true);
    try {
      if (!token) {
        alert("You must be signed in to change your avatar.");
        setSavingAvatar(false);
        return;
      }

      // use service to upload avatar (file or URL)
      const result = await uploadAvatar(
        uid,
        avatarFile || undefined,
        avatarUrl || undefined,
        token
      );
      // normalize response shapes: service returns res.data from axios
      const payload = result?.data ?? result;
      if (payload && payload.success && payload.user) {
        if (typeof onAvatarSaved === "function")
          onAvatarSaved(payload.user as unknown as UserProfile);
      }

      setAvatarDialogOpen(false);
    } catch (e) {
      console.error("Failed to save avatar", e);
      alert(String(e instanceof Error ? e.message : e));
    } finally {
      setSavingAvatar(false);
    }
  };

  /** Reusable dialog component */
  const renderDialog = (type: "followers" | "following") => {
    const list = type === "followers" ? followers : following;

    return (
      <Dialog
        open={openDialog === type}
        onClose={() => setOpenDialog(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {type === "followers" ? "Followers" : "Following"}
        </DialogTitle>
        <DialogContent>
          <List>
            {list.map((f) => (
              <ListItem key={f._id || f.id}>
                <ListItemAvatar>
                  <Avatar
                    src={f.avatar || undefined}
                    alt={`${f.firstName || ""} ${f.lastName || ""}`}
                  >
                    {(f.firstName || f.lastName || "")[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Link
                      component={RouterLink}
                      to={`/profile/${f._id || f.id}`}
                      underline="hover"
                      onClick={() => setOpenDialog(null)}
                    >
                      {String(
                        `${f.firstName || ""} ${f.lastName || ""}`.trim() ||
                          (f.email as string) ||
                          (f.username as string) ||
                          (f._id as string) ||
                          ""
                      )}
                    </Link>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Card
        sx={{
          mb: 6,
          overflow: "hidden",
          border: "1px solid #e5e5e5",
          backgroundColor: "#fff",
          boxShadow: "0 1px 2px rgb(0 0 0 / 0.05)",
        }}
      >
        <Box sx={{ px: 3, py: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* Left side */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  src={user.avatar || undefined}
                  alt={user.firstName + " " + user.lastName}
                  sx={{
                    width: 80,
                    height: 80,
                    border: "1px solid #e5e5e5",
                    boxShadow: "0 1px 2px rgb(0 0 0 / 0.05)",
                    bgcolor: "#171717",
                    color: "#fff",
                    fontSize: "1.5rem",
                    fontWeight: 600,
                  }}
                />
                {isOwner && (
                  <IconButton
                    onClick={handleOpenAvatarDialog}
                    size="small"
                    sx={{
                      position: "absolute",
                      right: -6,
                      bottom: -6,
                      bgcolor: "background.paper",
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: 1,
                    }}
                  >
                    <Edit size={14} />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                <Typography
                  variant="h4"
                  sx={{
                    mb: 0.5,
                    fontWeight: 700,
                    color: "#171717",
                  }}
                >
                  {user.firstName + " " + user.lastName}
                </Typography>

                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    gap: 3,
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  {/* Followers */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                      onClick={() => loadList("followers")}
                      size="small"
                    >
                      <Users size={16} />
                    </IconButton>
                    <Typography variant="body2">
                      {followersCount || followers.length} followers
                    </Typography>
                  </Box>

                  {/* Following */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                      onClick={() => loadList("following")}
                      size="small"
                    >
                      <UserPlus size={16} />
                    </IconButton>
                    <Typography variant="body2">
                      {followingCount || following.length} following
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Edit button */}
            {isOwner && (
              <Button
                type="button"
                onClick={() => {
                  try {
                    onEditClick?.();
                  } catch (e) {
                    // ensure exceptions don't prevent UI updates
                    console.error("onEditClick failed", e);
                  }
                }}
                variant="contained"
                sx={{
                  backgroundColor: "#f97316",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#ea580c" },
                }}
              >
                <Edit size={16} style={{ marginRight: 8 }} />
                Change Password
              </Button>
            )}
          </Box>
        </Box>
      </Card>

      {/* Modals */}
      {renderDialog("followers")}
      {renderDialog("following")}
      <Dialog
        open={avatarDialogOpen}
        onClose={() => setAvatarDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
              py: 1,
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 8,
                  objectFit: "cover",
                }}
              />
            ) : (
              <Avatar
                src={user.avatar || undefined}
                sx={{ width: 120, height: 120 }}
              />
            )}

            <input
              id="avatar-file"
              type="file"
              accept="image/*"
              style={{ display: "block" }}
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (f) setAvatarFile(f);
              }}
            />

            <TextField
              label="Or paste image URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveAvatar}
            variant="contained"
            disabled={savingAvatar}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
