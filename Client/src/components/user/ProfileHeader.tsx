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
import { Edit, Users, UserPlus } from "lucide-react";
import { useUserStore } from "../../store/userStore";
const BASE_URL = "http://localhost:3000";

// Server now returns absolute avatar URLs; client no longer needs BASE_URL prefixing

interface ProfileHeaderProps {
  user: UserProfile;
  onEditClick: () => void;
  onAvatarSaved?: (user: UserProfile) => void;
}

type SimpleFollow = { id?: string; fullName?: string; profilePicture?: string };

export function ProfileHeader({
  user,
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
    }
    if (Array.isArray(u.following)) {
      const arr = u.following as unknown[];
      const hasObjects = arr.length > 0 && typeof arr[0] === "object";
      if (hasObjects) setFollowing(arr as SimpleFollow[]);
      else setFollowing([]);
    }
  }, [user]);

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

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
        const res = await fetch(`${BASE_URL}/follow/${uid}/${listType}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          // Map server user objects to { id, fullName, profilePicture }
          const mapped = data.map((u) => {
            const usr = u || {};
            const id = usr._id || usr.id || usr._doc?._id || "";
            const firstName = usr.firstName || usr.first_name || usr.name || "";
            const lastName = usr.lastName || usr.last_name || "";
            const fullName =
              `${firstName} ${lastName}`.trim() ||
              String(
                usr.fullName || usr.fullname || usr.name || usr.username || ""
              );
            const profilePicture =
              usr.avatar || usr.profilePicture || usr.picture || "";
            return { id, fullName, profilePicture };
          });

          setter(mapped);
          if (listType === "followers") setFollowersCount(mapped.length);
          else setFollowingCount(mapped.length);
        } else {
          console.warn(`unexpected ${listType} response`, data);
        }
      } catch (err) {
        console.error(`Failed to load ${listType}`, err);
      }
    }

    setOpenDialog(listType);
  };

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

      const url = `${BASE_URL}/profile/${uid}/avatar`;
      let res;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        res = await fetch(url, {
          method: "PUT",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: fd,
        });
      } else if (avatarUrl && avatarUrl.trim()) {
        res = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ avatarUrl: avatarUrl.trim() }),
        });
      } else {
        setSavingAvatar(false);
        return;
      }

      // attempt to parse response body intelligently
      let data;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        data = await res.json().catch(() => null);
      } else {
        data = await res.text().catch(() => null);
      }
      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          String(data || "Upload failed");
        throw new Error(msg);
      }

      // refresh profile and notify parent
      const updatedRes = await fetch(`${BASE_URL}/profile/${uid}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const updatedBody = await updatedRes.json().catch(() => null);
      if (updatedBody && updatedBody.success && updatedBody.user) {
        if (typeof onAvatarSaved === "function")
          onAvatarSaved(updatedBody.user as unknown as UserProfile);
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
              <ListItem key={f.id}>
                <ListItemAvatar>
                  <Avatar src={f.profilePicture} alt={f.fullName}>
                    {f.fullName?.[0]?.toUpperCase()}
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
            <Button
              type="button"
              onClick={() => {
                try {
                  onEditClick();
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
