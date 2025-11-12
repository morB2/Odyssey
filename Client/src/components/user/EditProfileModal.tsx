import { useState, useEffect, useRef } from "react";
import type { UserProfile } from "./types";
import { Modal } from "./Modal";
import { Box, Button, TextField, Typography, Divider } from "@mui/material";
import { useUserStore } from "../../store/userStore";

interface EditProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserProfile) => void;
}

const BASE_URL = "http://localhost:3000";

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    // clear timer when modal closes or component unmounts
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
      const res = await fetch(
        `${BASE_URL}/profile/${user?._id}/changePassword`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${storeToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = body?.error || body?.message || "Failed to change password";
        setError(String(msg));
        setLoading(false);
        return;
      }

      setSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // auto-close modal after 2.5 seconds
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
      maxWidth="lg"
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    "& fieldset": {
                      borderColor: "#d4d4d4",
                    },
                    "&:hover fieldset": {
                      borderColor: "#a3a3a3",
                    },
                  },
                }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    "& fieldset": {
                      borderColor: "#d4d4d4",
                    },
                    "&:hover fieldset": {
                      borderColor: "#a3a3a3",
                    },
                  },
                }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    "& fieldset": {
                      borderColor: "#d4d4d4",
                    },
                    "&:hover fieldset": {
                      borderColor: "#a3a3a3",
                    },
                  },
                }}
              />
            </Box>

            <Button
              onClick={handleChangePassword}
              variant="outlined"
              fullWidth
              disabled={
                loading || !currentPassword || !newPassword || !confirmPassword
              }
              sx={{
                borderColor: "#d4d4d4",
                color: "#171717",
                textTransform: "none",
                "&:hover": {
                  borderColor: "#a3a3a3",
                  backgroundColor: "#fafafa",
                },
                "&.Mui-disabled": {
                  borderColor: "#e5e5e5",
                  color: "#a3a3a3",
                },
              }}
            >
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ backgroundColor: "#e5e5e5" }} />
        {/** Error / Success Messages */}
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
            {/**color of the success message is orange */}
            <Typography color="orange" sx={{ textAlign: "center" }}>
              {success}
            </Typography>
            <Divider sx={{ backgroundColor: "#e5e5e5" }} />
            {/* <Typography color="primary" sx={{ textAlign: "center" }}>
              {success}
            </Typography>
            <Divider sx={{ backgroundColor: "#e5e5e5" }} /> */}
          </>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: "#d4d4d4",
              color: "#171717",
              textTransform: "none",
              "&:hover": {
                borderColor: "#a3a3a3",
                backgroundColor: "#fafafa",
              },
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
