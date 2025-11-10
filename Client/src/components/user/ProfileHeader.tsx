import { Avatar, Box, Typography, Button } from "@mui/material";

interface UserProfile {
  _id?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  location?: string;
  bio?: string;
  tripsCount?: number;
  followersCount?: number;
  followingCount?: number;
}

export default function ProfileHeader({
  user,
  tripsCount,
  onEdit,
}: {
  user: UserProfile;
  tripsCount: number;
  onEdit: () => void;
}) {
  

  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      alignItems="center"
      gap={3}
    >
      <Avatar src={user.avatar} sx={{ width: 120, height: 120 }} />
      <Box textAlign={{ xs: "center", sm: "left" }}>
        <Typography variant="h5" fontWeight={600}>
          {user.firstName} {user.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user.location}
        </Typography>
        {user.email && (
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        )}
        <Typography variant="body1" sx={{ mt: 1 }}>
          {user.bio}
        </Typography>
        <Box
          display="flex"
          justifyContent={{ xs: "center", sm: "flex-start" }}
          gap={2}
          mt={1}
        >
          <Typography variant="body2">Trips: {tripsCount || 0}</Typography>
          <Typography variant="body2">
            Followers: {user.followersCount || 0}
          </Typography>
          <Typography variant="body2">
            Following: {user.followingCount || 0}
          </Typography>
        </Box>
      </Box>
      <Box marginLeft="auto">
        <Button variant="contained" onClick={onEdit}>
          Edit Profile
        </Button>
      </Box>
    </Box>
  );
}
