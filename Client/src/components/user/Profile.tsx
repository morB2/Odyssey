import React from "react";
import { GridView as GridIcon, Bookmark, Map as MapIcon, FavoriteBorder as Heart } from "@mui/icons-material";
import { Avatar, Box, Container, Grid, Tab, Tabs, Typography, Card, CardMedia, CardContent, CardActions } from "@mui/material";

interface UserProfile { avatar: string; firstName: string; lastName: string; email: string; role: "user" | "admin"; birthday: Date; preferences: string[]; createdAt: Date; bio: string; location: string; tripsCount: number; followersCount: number; followingCount: number; }
interface Trip { id: string; image: string; title: string; location: string; likes: number; comments: number; }

const userProfile: UserProfile = { avatar: "https://images.unsplash.com/photo-1664312572933-0563f14484a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", firstName: "Alex", lastName: "Johnson", email: "alex.johnson@example.com", role: "user", birthday: new Date("1995-06-15"), preferences: ["🌍 Adventure Seeker", "📸 Travel Blogger", "🏔️ Mountain Lover", "🏖️ Beach Explorer"], createdAt: new Date("2023-03-15"), bio: "✈️ Full-time traveler | 📍 45 countries & counting | Sharing my adventures around the globe 🌎", location: "Currently in Bali, Indonesia", tripsCount: 127, followersCount: 12453, followingCount: 892 };

const trips: Trip[] = [
  { id: "1", image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "Romantic Evening in Paris", location: "Paris, France", likes: 1234, comments: 56 },
  { id: "2", image: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "Beach Paradise", location: "Bali, Indonesia", likes: 2341, comments: 89 },
  { id: "3", image: "https://images.unsplash.com/photo-1587653263995-422546a7a569?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "Neon Nights", location: "Tokyo, Japan", likes: 3456, comments: 134 },
  { id: "4", image: "https://images.unsplash.com/photo-1610123598147-f632aa18b275?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "Land of Fire and Ice", location: "Iceland", likes: 4567, comments: 201 },
];

const ProfileHeader: React.FC<UserProfile> = ({ avatar, firstName, lastName, bio, location, preferences, followersCount, followingCount, tripsCount }) => (
  <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} alignItems="center" gap={3}>
    <Avatar src={avatar} sx={{ width: 120, height: 120 }} />
    <Box textAlign={{ xs: "center", sm: "left" }}>
      <Typography variant="h5" fontWeight={600}>{firstName} {lastName}</Typography>
      <Typography variant="body2" color="text.secondary">{location}</Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>{bio}</Typography>
      <Box display="flex" justifyContent={{ xs: "center", sm: "flex-start" }} gap={2} mt={1}>
        <Typography variant="body2">Trips: {tripsCount}</Typography>
        <Typography variant="body2">Followers: {followersCount}</Typography>
        <Typography variant="body2">Following: {followingCount}</Typography>
      </Box>
      <Box mt={1} display="flex" flexWrap="wrap" gap={1} justifyContent={{ xs: "center", sm: "flex-start" }}>
        {preferences.map((p, i) => (<Typography key={i} variant="caption" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: "grey.200", color: "text.secondary" }}>{p}</Typography>))}
      </Box>
    </Box>
  </Box>
);

const TripCard: React.FC<Trip> = ({ image, title, location, likes, comments }) => (
  <Card sx={{ borderRadius: 3 }}>
    <CardMedia component="img" height="180" image={image} alt={title} />
    <CardContent>
      <Typography variant="h6" fontWeight={600}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{location}</Typography>
    </CardContent>
    <CardActions sx={{ justifyContent: "space-between" }}>
      <Typography variant="caption">❤️ {likes}</Typography>
      <Typography variant="caption">💬 {comments}</Typography>
    </CardActions>
  </Card>
);

export default function App() {
  const [tab, setTab] = React.useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setTab(newValue);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="lg">
        <ProfileHeader {...userProfile} />
        <Box sx={{ mt: 5 }}>
          <Tabs value={tab} onChange={handleTabChange} centered>
            <Tab icon={<GridIcon />} label="Trips" />
            <Tab icon={<Bookmark />} label="Saved" />
            <Tab icon={<MapIcon />} label="Map" />
            <Tab icon={<Heart />} label="Liked" />
          </Tabs>

          {tab === 0 && (<Grid container spacing={3} sx={{ mt: 2 }}>{trips.map((trip) => (<Grid size={{ xs:12, sm:6, md:4}} key={trip.id}><TripCard {...trip} /></Grid>))}</Grid>)}
          {tab === 1 && (<Grid container spacing={3} sx={{ mt: 2 }}>{trips.slice(0, 2).map((trip) => (<Grid size={{ xs:12, sm:6, md:4}} key={trip.id}><TripCard {...trip} /></Grid>))}</Grid>)}
          {tab === 2 && (<Box sx={{ mt: 4, height: 400, borderRadius: 3, bgcolor: "grey.100", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><MapIcon sx={{ fontSize: 60, color: "grey.500" }} /><Typography color="text.secondary" fontWeight={500}>Map view coming soon</Typography><Typography variant="body2" color="text.secondary">See all your trips on an interactive world map</Typography></Box>)}
          {tab === 3 && (<Grid container spacing={3} sx={{ mt: 2 }}>{trips.slice(0, 3).map((trip) => (<Grid size={{ xs:12, sm:6, md:4}} key={trip.id}><TripCard {...trip} /></Grid>))}</Grid>)}
        </Box>
      </Container>
    </Box>
  );
}
