import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export default function TripEditDialog({
  open,
  onClose,
  title,
  setTitle,
  description,
  setDescription,
  activities,
  setActivities,
  notes,
  setNotes,
  visibility,
  setVisibility,
  optimizedRouteText,
  setOptimizedRouteText,
  mode,
  setMode,
  googleMapsUrl,
  setGoogleMapsUrl,
  instructionsText,
  setInstructionsText,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  activities: string;
  setActivities: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  visibility: "private" | "public";
  setVisibility: (v: "private" | "public") => void;
  optimizedRouteText: string;
  setOptimizedRouteText: (v: string) => void;
  mode: "driving" | "walking" | "transit";
  setMode: (v: "driving" | "walking" | "transit") => void;
  googleMapsUrl: string;
  setGoogleMapsUrl: (v: string) => void;
  instructionsText: string;
  setInstructionsText: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Trip</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
        />
        <TextField
          label="Activities (comma separated)"
          value={activities}
          onChange={(e) => setActivities(e.target.value)}
        />
        <TextField
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={2}
        />
        <FormControl>
          <InputLabel id="vis-label">Visibility</InputLabel>
          <Select
            labelId="vis-label"
            value={visibility}
            label="Visibility"
            onChange={(e) => {
              const v = e.target.value as string;
              setVisibility(v === "public" ? "public" : "private");
            }}
          >
            <MenuItem value="private">Private</MenuItem>
            <MenuItem value="public">Public</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Optimized route (JSON)"
          value={optimizedRouteText}
          onChange={(e) => setOptimizedRouteText(e.target.value)}
          multiline
          rows={6}
          helperText="Edit the optimizedRoute object as JSON (advanced)"
        />
        <TextField
          label="Mode"
          value={mode}
          onChange={(e) => {
            const v = e.target.value as string;
            // only allow the known modes; default to driving
            setMode(
              v === "walking" || v === "transit"
                ? (v as "walking" | "transit")
                : "driving"
            );
          }}
        />
        <TextField
          label="Google Maps URL"
          value={googleMapsUrl}
          onChange={(e) => setGoogleMapsUrl(e.target.value)}
        />
        <TextField
          label="Instructions (one per line)"
          value={instructionsText}
          onChange={(e) => setInstructionsText(e.target.value)}
          multiline
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
