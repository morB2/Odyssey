import { useState, useEffect, useRef } from "react";
import { Modal } from "./Modal";
import { Box, Button, TextField, Typography, Divider } from "@mui/material";
import { useUserStore } from "../../store/userStore";

import { changePassword as svcChangePassword } from "../../services/profile.service";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen && closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    };
  }, [isOpen]);

  const storeToken = useUserStore((s) => s.token);
  const user = useUserStore((s) => s.user);

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }

    setLoading(true);
    try {
      const res = await svcChangePassword(
        user?._id as string,
        currentPassword || undefined,
        newPassword,
        storeToken || undefined
      );
      const body = res;
      if (!res || (res.success === false && (body as any).error)) {
        const msg =
          (body as any)?.error ||
          (body as any)?.message ||
          "Failed to change password";
        setError(String(msg));
        setLoading(false);
        return;
      }

      setSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      closeTimer.current = window.setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 2500);
    } catch (e) {
      console.error("Failed to change password", e);
      setError("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
      maxWidth="sm"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Divider sx={{ backgroundColor: "#e5e5e5" }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              borderRadius: 2,
              border: "1px solid #e5e5e5",
              backgroundColor: "#fafafa",
              p: 2,
            }}
          >
            <Box>
              <Typography
                component="label"
                htmlFor="currentPassword"
                sx={{
                  display: "block",
                  mb: 1,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#171717",
                }}
              >
                Current Password
              </Typography>
              <TextField
                id="currentPassword"
                type="password"
                fullWidth
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter current password"
              />
            </Box>

            <Box>
              <Typography
                component="label"
                htmlFor="newPassword"
                sx={{
                  display: "block",
                  mb: 1,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#171717",
                }}
              >
                New Password
              </Typography>
              <TextField
                id="newPassword"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter new password"
              />
            </Box>

            <Box>
              <Typography
                component="label"
                htmlFor="confirmPassword"
                sx={{
                  display: "block",
                  mb: 1,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#171717",
                }}
              >
                Confirm New Password
              </Typography>
              <TextField
                id="confirmPassword"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Confirm new password"
              />
            </Box>

            <Button
              onClick={handleChangePassword}
              variant="outlined"
              fullWidth
              disabled={
                loading || !currentPassword || !newPassword || !confirmPassword
              }
              sx={{ textTransform: "none" }}
            >
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ backgroundColor: "#e5e5e5" }} />

        {error && (
          <>
            <Typography color="error" sx={{ textAlign: "center" }}>
              {error}
            </Typography>
            <Divider sx={{ backgroundColor: "#e5e5e5" }} />
          </>
        )}

        {success && (
          <>
            <Typography color="orange" sx={{ textAlign: "center" }}>
              {success}
            </Typography>
            <Divider sx={{ backgroundColor: "#e5e5e5" }} />
          </>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
