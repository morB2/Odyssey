import { useState, useEffect } from "react";
import type { UserProfile } from "./types";
import { Button, Card, Avatar, Box, Typography, List, ListItem, ListItemAvatar, ListItemText, Link, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Edit, Users, UserPlus } from "lucide-react";
import { getFollowers as svcGetFollowers, getFollowing as svcGetFollowing } from "../../services/profile.service";

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
}

// Shared styles
const cardStyle = { mb: 6, overflow: "hidden", border: "1px solid #e5e5e5", backgroundColor: "#fff", boxShadow: "0 1px 2px rgb(0 0 0 / 0.05)" };
const avatarStyle = { width: 80, height: 80, border: "1px solid #e5e5e5", boxShadow: "0 1px 2px rgb(0 0 0 / 0.05)", bgcolor: "#171717", color: "#fff", fontSize: "1.5rem", fontWeight: 600 };

export function ProfileHeader({ user, isOwner = false, onEditClick }: ProfileHeaderProps) {
  const [openDialog, setOpenDialog] = useState<"followers" | "following" | null>(null);
  const [followers, setFollowers] = useState<SimpleFollow[]>([]);
  const [following, setFollowing] = useState<SimpleFollow[]>([]);
  const [followersCount, setFollowersCount] = useState<number>(user.followersCount || 0);
  const [followingCount, setFollowingCount] = useState<number>(user.followingCount || 0);

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

  const FollowButton = ({ type, count, Icon }: { type: "followers" | "following"; count: number; Icon: any }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <IconButton onClick={() => loadList(type)} size="small">
        <Icon size={16} />
      </IconButton>
      <Typography variant="body2">{count} {type}</Typography>
    </Box>
  );

  const renderDialog = (type: "followers" | "following") => {
    const list = type === "followers" ? followers : following;
    return (
      <Dialog open={openDialog === type} onClose={() => setOpenDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>{type === "followers" ? "Followers" : "Following"}</DialogTitle>
        <DialogContent>
          <List>
            {list.map((f) => (
              <ListItem key={f._id || f.id}>
                <ListItemAvatar>
                  <Avatar src={f.avatar || undefined} alt={`${f.firstName || ""} ${f.lastName || ""}`}>
                    {(f.firstName || f.lastName || "")[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={
                  <Link component={RouterLink} to={`/profile/${f._id || f.id}`} underline="hover" onClick={() => setOpenDialog(null)}>
                    {String(`${f.firstName || ""} ${f.lastName || ""}`.trim() || (f.email as string) || (f.username as string) || (f._id as string) || "")}
                  </Link>
                } />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Card sx={cardStyle}>
        <Box sx={{ px: 3, py: 4 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", gap: 2 }}>
              <Avatar src={user.avatar || undefined} alt={user.firstName + " " + user.lastName} sx={avatarStyle} />
              <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700, color: "#171717" }}>
                  {user.firstName + " " + user.lastName}
                </Typography>
                <Box sx={{ mt: 1, display: "flex", gap: 3, justifyContent: { xs: "center", sm: "flex-start" } }}>
                  <FollowButton type="followers" count={followersCount || followers.length} Icon={Users} />
                  <FollowButton type="following" count={followingCount || following.length} Icon={UserPlus} />
                </Box>
              </Box>
            </Box>

            {isOwner && (
              <Button type="button" onClick={() => { try { onEditClick?.(); } catch (e) { console.error("onEditClick failed", e); } }} variant="contained" sx={{ backgroundColor: "#f97316", textTransform: "none", "&:hover": { backgroundColor: "#ea580c" } }}>
                <Edit size={16} style={{ marginRight: 8 }} />
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>
      </Card>

      {renderDialog("followers")}
      {renderDialog("following")}
    </>
  );
}
