import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

export default function EditProfileDialog({
  open,
  onClose,
  firstName,
  lastName,
  birthday,
  avatar,
  email,
  setFirstName,
  setLastName,
  setBirthday,
  setAvatar,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  firstName: string;
  lastName: string;
  birthday: string | null;
  avatar: string;
  email?: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setBirthday: (v: string | null) => void;
  setAvatar: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
        <TextField
          label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          label="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          label="Email (cannot be changed)"
          value={email || ""}
          disabled
        />
        <TextField
          label="Birthday"
          type="date"
          value={birthday ? birthday.split("T")[0] : ""}
          onChange={(e) => setBirthday(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Avatar URL"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
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
