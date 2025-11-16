import { useState } from "react";
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Link,
  IconButton,
} from "@mui/material";
import { Edit, Users, UserPlus } from "lucide-react";

const BASE_URL = "http://localhost:3000";

interface ProfileHeaderProps {
  user: UserProfile;
  onEditClick: () => void;
}

export function ProfileHeader({ user, onEditClick }: ProfileHeaderProps) {
  const [openDialog, setOpenDialog] = useState<
    "followers" | "following" | null
  >(null);
  const [followers, setFollowers] = useState(user.followers || []);
  const [following, setFollowing] = useState(user.following || []);
  const [followersCount, setFollowersCount] = useState<number>(
    user.followersCount || 0
  );
  const [followingCount, setFollowingCount] = useState<number>(
    user.followingCount || 0
  );

  /** Generic loader for followers/following */
  const loadList = async (listType: "followers" | "following") => {
    const setter = listType === "followers" ? setFollowers : setFollowing;
    const currentList = listType === "followers" ? followers : following;

    // If we already have items cached, show them. Otherwise fetch from follow routes.
    if (!currentList.length) {
      try {
        const res = await fetch(`${BASE_URL}/follow/${user._id}/${listType}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          // Map server user objects to { id, fullName, profilePicture }
          const mapped = data.map((u) => {
            console.log(u);
            
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
              <Avatar
                src={user.avatar}
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
                // debug log to verify click handler is reached
                console.log("ProfileHeader: Change Password clicked");
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
    </>
  );
}
