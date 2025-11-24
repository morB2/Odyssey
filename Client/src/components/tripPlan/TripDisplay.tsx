import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  CardMedia,
  Typography,
  Chip,
  Divider,
  Button,
  Box,
  Stack,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation, ExternalLink, Save } from "lucide-react";
import { AuthSaveDialog } from "./AuthSaveDialog";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface Location {
  name: string;
  lat: number;
  lon: number;
  note?: string;
}

interface RouteData {
  title?: string;
  description?: string;
  ordered_route: Location[];
  mode: string;
  instructions?: string[];
  google_maps_url: string;
  activities?: string[];
}

interface TripDisplayProps {
  data: {
    success: boolean;
    route: RouteData;
  };
}
interface StoredUser {
  state: {
    user: {
      _id: string;
    };
  };
}

export const TripDisplay: React.FC<TripDisplayProps> = ({ data }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  if (!data?.route) return <Typography>{t('tripDisplay.noRouteData')}</Typography>;
  const [imageUrl, setImageUrl] = useState<string>("");
  const { title, description, ordered_route, mode, instructions = [], google_maps_url, activities = [] } = data.route;
  useEffect(() => {
    const fetchImage = async () => {
      const query = title ? title : t('tripDisplay.defaultTravel');
      try {
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)} travel landscape&orientation=landscape&per_page=1`,
          {
            headers: {
              Authorization: import.meta.env.VITE_PEXELS_KEY
            }
          }
        );
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          setImageUrl(data.photos[0].src.large);
        }
      } catch (error) {
        console.error("Failed to fetch image:", error);
        // Optional: toast.error("Failed to load trip image"); - might be too noisy for a background image
      }
    };

    fetchImage();
  }, [title, t]);
  const orange = "#ff9800";
  const lightOrange = "#fff3e0";
  const borderOrange = "#ffe0b2";

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [openAuthDialog, setOpenAuthDialog] = useState(false);

  const handleSaveClick = () => {
    const userStorage = localStorage.getItem('user-storage');
    const user = userStorage ? (JSON.parse(userStorage) as StoredUser).state.user : null;

    if (user) {
      setOpenDialog(true);
    } else {
      setOpenAuthDialog(true);
    }
  };

  const handleCloseDialog = () => setOpenDialog(false);
  const handleCloseAuthDialog = () => setOpenAuthDialog(false);

  const handlePrint = () => {
    window.print();
    setOpenAuthDialog(false);
  };

  const handleLoginRedirect = () => {
    navigate("/login?tab=login", { state: { backgroundLocation: location.pathname } })
    setOpenAuthDialog(false);
  };

  const handleSaveOption = async (type: "private" | "public") => {
    setOpenDialog(false);
    const userStorage = localStorage.getItem('user-storage');
    const id: string | undefined = userStorage
      ? (JSON.parse(userStorage) as StoredUser).state.user._id
      : undefined;

    try {
      const response = await fetch('http://localhost:3000/createTrip/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          { userId: id, title, description, optimizedRoute: { ordered_route, mode, instructions, google_maps_url }, activities, visabilityStatus: type, image: imageUrl }
        ),
      });
      const result = await response.json();
      console.log('Trip save response:', result);
      if (result.success) {
        toast.success('Trip saved successfully!');
      } else {
        toast.error('Failed to save trip.');
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred while saving the trip.");
    }
  };

  return (
    <Card className="trip-print-container"
      sx={{
        maxWidth: 800,
        mx: "auto",
        boxShadow: 4,
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${borderOrange}`,
      }}
    >
      {/* Header Image */}
      <CardMedia
        component="img"
        height="240"
        image={imageUrl}
        alt={t('tripDisplay.tripCover')}
        sx={{ objectFit: "cover" }}
      />

      {/* Header */}
      <CardHeader
        sx={{ bgcolor: lightOrange, borderBottom: `1px solid ${borderOrange}` }}
        title={
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: orange }}>
                {title || t('tripDisplay.untitledTrip')}
              </Typography>
              {description && (
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {description}
                </Typography>
              )}
            </Box>
            <Chip
              icon={<Navigation size={16} color={orange} />}
              label={t(`tripDisplay.travelModes.${mode.toLowerCase()}`)}
              sx={{
                borderColor: orange,
                color: orange,
                bgcolor: "#fff",
                textTransform: "capitalize",
                fontWeight: 500,
              }}
              variant="outlined"
            />
          </Stack>
        }
      />

      {/* Content */}
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 4, bgcolor: "#fffaf3" }}>
        {/* Route Stops */}
        <Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1, color: orange }}
          >
            <MapPin size={18} color={orange} />
            {t('tripDisplay.routeStops')}
          </Typography>
          <List disablePadding>
            {ordered_route.map((location, index) => (
              <ListItem key={index} sx={{ alignItems: "flex-start", pl: 0 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: orange,
                    color: "#fff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    mr: 2,
                    flexShrink: 0,
                    fontWeight: "bold",
                  }}
                >
                  {index + 1}
                </Box>
                <ListItemText
                  primary={location.name}
                  secondary={location.note}
                  primaryTypographyProps={{ fontWeight: 500 }}
                  secondaryTypographyProps={{ color: "text.secondary" }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Travel Instructions */}
        {instructions.length > 0 && (
          <>
            <Divider sx={{ borderColor: borderOrange }} />
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: orange }}>
                {t('tripDisplay.travelInstructions')}
              </Typography>
              <List sx={{ pl: 2, listStyleType: "decimal" }}>
                {instructions.map((instruction, index) => (
                  <ListItem key={index} sx={{ display: "list-item", pl: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {instruction}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}

        {/* Activities */}
        {activities.length > 0 && (
          <>
            <Divider sx={{ borderColor: borderOrange }} />
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: orange }}>
                {t('tripDisplay.activities')}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {activities.map((activity, index) => (
                  <Chip
                    key={index}
                    label={activity}
                    variant="outlined"
                    sx={{
                      borderColor: orange,
                      color: orange,
                      bgcolor: "#fff",
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </>
        )}
      </CardContent>

      {/* Footer */}
      <Divider sx={{ borderColor: borderOrange }} />
      <CardActions sx={{ justifyContent: "space-between", p: 2, bgcolor: lightOrange }}>
        <Button
          variant="contained"
          href={google_maps_url}
          target="_blank"
          startIcon={<ExternalLink size={18} />}
          sx={{
            backgroundColor: orange,
            "&:hover": { backgroundColor: "#fb8c00" },
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          {t('tripDisplay.openInGoogleMaps')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Save size={18} />}
          onClick={handleSaveClick}
          sx={{
            borderColor: orange,
            color: orange,
            "&:hover": { borderColor: "#fb8c00", color: "#fb8c00" },
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t('tripDisplay.save')}
        </Button>
      </CardActions>

      {/* Save Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ color: orange, fontWeight: "bold" }}>{t('tripDisplay.saveTrip.title')}</DialogTitle>
        <DialogContent>
          <Typography>{t('tripDisplay.saveTrip.prompt')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleSaveOption("private")} variant="contained" sx={{ bgcolor: orange }}>
            {t('tripDisplay.saveTrip.private')}
          </Button>
          <Button onClick={() => handleSaveOption("public")} variant="outlined" sx={{ borderColor: orange, color: orange }}>
            {t('tripDisplay.saveTrip.public')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auth Save Dialog */}
      <AuthSaveDialog
        open={openAuthDialog}
        onClose={handleCloseAuthDialog}
        onLogin={handleLoginRedirect}
        onPrint={handlePrint}
      />
    </Card>
  );
}
