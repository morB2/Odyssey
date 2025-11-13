import type { Trip } from "./types";
import { TripCard } from "./TripCard";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import { User, Heart, Bookmark } from "lucide-react";

interface TripsListProps {
  trips: Trip[];
  activeTab: "my-trips" | "liked" | "saved";
  onTabChange: (tab: "my-trips" | "liked" | "saved") => void;
  onTripClick: (trip: Trip) => void;
}

export function TripsList({
  trips,
  activeTab,
  onTabChange,
  onTripClick,
}: TripsListProps) {
  // defensive: ensure we always work with an array
  const list = Array.isArray(trips) ? trips : [];
  const tabsMap = {
    "my-trips": 0,
    liked: 1,
    saved: 2,
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const tabs: ("my-trips" | "liked" | "saved")[] = [
      "my-trips",
      "liked",
      "saved",
    ];
    onTabChange(tabs[newValue]);
  };

  return (
    <Box>
      {/* Icon Navigation */}
      <Box
        sx={{
          mb: 5,
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        <Tabs
          value={tabsMap[activeTab]}
          onChange={handleTabChange}
          centered
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#f97316",
              height: "2px",
            },
            minHeight: "auto",
          }}
        >
          <Tab
            icon={<User size={20} />}
            iconPosition="start"
            label="My Trips"
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              px: 3,
              py: 1.5,
              minHeight: "auto",
              color: "#525252",
              transition: "color 0.2s",
              "&:hover": {
                color: "#171717",
              },
              "&.Mui-selected": {
                color: "#f97316",
              },
              "& .MuiTab-iconWrapper": {
                mr: 1,
              },
            }}
          />
          <Tab
            icon={<Heart size={20} />}
            iconPosition="start"
            label="Liked"
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              px: 3,
              py: 1.5,
              minHeight: "auto",
              color: "#525252",
              transition: "color 0.2s",
              "&:hover": {
                color: "#171717",
              },
              "&.Mui-selected": {
                color: "#f97316",
              },
              "& .MuiTab-iconWrapper": {
                mr: 1,
              },
            }}
          />
          <Tab
            icon={<Bookmark size={20} />}
            iconPosition="start"
            label="Saved"
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              px: 3,
              py: 1.5,
              minHeight: "auto",
              color: "#525252",
              transition: "color 0.2s",
              "&:hover": {
                color: "#171717",
              },
              "&.Mui-selected": {
                color: "#f97316",
              },
              "& .MuiTab-iconWrapper": {
                mr: 1,
              },
            }}
          />
        </Tabs>
      </Box>

      {list.length === 0 ? (
        <Box
          sx={{
            border: "1px solid #e5e5e5",
            backgroundColor: "#ffffff",
            p: 6,
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "#737373", fontSize: "1rem" }}>
            No trips to display yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {list.map((trip) => (
            <Grid
              key={trip.id}
              sx={{ width: { xs: "100%", sm: "50%", md: "33.333%" } }}
            >
              <TripCard trip={trip} onClick={() => onTripClick(trip)} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
