import { Check } from "lucide-react";
import {
  Card,
  CardActions,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

interface CreateTripLandingCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  accentColor: "orange" | "black";
  buttonText: string;
  onClick: () => void;
}

export function CreateTripLandingCard({
  icon,
  title,
  description,
  features,
  accentColor,
  buttonText,
  onClick,
}: CreateTripLandingCardProps) {
  const color = accentColor === "orange" ? "#ff8a00" : "#000";

  return (
    <Card
      sx={{
        p: 4,
        borderRadius: 3,
        border: "2px solid #eaeaea",
        transition: "0.25s",
        ":hover": { boxShadow: 6, transform: "translateY(-4px)" },
      }}
    >
      <Box sx={{ color, mb: 2, display: "flex", fontSize: 50 }}>{icon}</Box>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>

      <Typography sx={{ color: "grey.700", mb: 3 }}>{description}</Typography>

      <List sx={{ mb: 3 }}>
        {features.map((feature, i) => (
          <ListItem key={i} sx={{ p: 0, mb: 1 }}>
            <ListItemIcon>
              <Check size={20} color={color} />
            </ListItemIcon>
            <ListItemText primary={feature} />
          </ListItem>
        ))}
      </List>

      <CardActions>
        <Button
          fullWidth
          onClick={onClick}
          sx={{
            py: 1.5,
            borderRadius: 2,
            backgroundColor: color,
            color: "#fff",
            ":hover": { backgroundColor: accentColor === "orange" ? "#e67600" : "#222" },
          }}
        >
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  );
}
