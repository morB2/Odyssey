import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

export default function ChangePasswordDialog({
  open,
  onClose,
  currentPwd,
  setCurrentPwd,
  newPwd,
  setNewPwd,
  confirmPwd,
  setConfirmPwd,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  currentPwd: string;
  setCurrentPwd: (v: string) => void;
  newPwd: string;
  setNewPwd: (v: string) => void;
  confirmPwd: string;
  setConfirmPwd: (v: string) => void;
  onChange: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Change password</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2, pt: 1, width: 400 }}>
        <TextField
          label="Current password"
          type="password"
          value={currentPwd}
          onChange={(e) => setCurrentPwd(e.target.value)}
        />
        <TextField
          label="New password"
          type="password"
          value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
        />
        <TextField
          label="Confirm new password"
          type="password"
          value={confirmPwd}
          onChange={(e) => setConfirmPwd(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onChange}>
          Change
        </Button>
      </DialogActions>
    </Dialog>
  );
}
