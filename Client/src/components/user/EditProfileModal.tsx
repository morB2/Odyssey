import { useState, useEffect, useRef } from "react";
import { Modal } from "./Modal";
import { Box, Button, TextField, Typography, Divider, Avatar, IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useUserStore } from "../../store/userStore";
import { changePassword, uploadAvatar } from "../../services/profile.service";
import { CloudinaryUploadWidget } from "../general/CloudinaryUploadWidget";
import { MediaEditorModal } from "../general/MediaEditorModal";
import type { UserProfile } from "./types";
import { useTranslation } from "react-i18next";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onAvatarSaved?: (user: UserProfile) => void;
}

// Shared styles
const labelStyle = { display: "block", mb: 1, fontSize: "0.875rem", fontWeight: 500, color: "#171717" };
const dividerStyle = { backgroundColor: "#e5e5e5" };
const sectionBoxStyle = { display: "flex", flexDirection: "column", gap: 2, borderRadius: 2, border: "1px solid #e5e5e5", backgroundColor: "#fafafa", p: 2 };

export function ChangePasswordModal({ isOpen, onClose, user, onAvatarSaved }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const { t } = useTranslation();

  // Avatar states
  const [avatarUrl, setAvatarUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

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

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError(t('profile.passwordsDoNotMatch'));
      return;
    }
    if (!currentPassword) {
      setError(t('profile.enterCurrentPassword'));
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(currentPassword || undefined, newPassword);
      const body = res;
      if (!res || (res.success === false && (body as any).error)) {
        const msg = (body as any)?.error || (body as any)?.message || "Failed to change password";
        setError(String(msg));
        setLoading(false);
        return;
      }

      setSuccess(t('profile.passwordChangedSuccessfully'));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      closeTimer.current = window.setTimeout(() => {
        setSuccess(null);
      }, 2500);
    } catch (e) {
      console.error("Failed to change password", e);
      setError(t('profile.failedToChangePassword'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvatar = async () => {
    const uid = (user as any).id || (user as any)._id || "";
    if (!user || !uid || !avatarUrl) return;

    setSavingAvatar(true);
    try {
      if (!storeToken) {
        alert("You must be signed in to change your avatar.");
        setSavingAvatar(false);
        return;
      }

      const result = await uploadAvatar(undefined, avatarUrl || undefined, storeToken);
      const payload = result?.data ?? result;
      if (payload && payload.success && payload.user) {
        if (typeof onAvatarSaved === "function") {
          onAvatarSaved(payload.user as unknown as UserProfile);
        }
        setSuccess("Avatar updated successfully");
        setAvatarUrl("");
        setPreview(null);

        closeTimer.current = window.setTimeout(() => {
          setSuccess(null);
        }, 2500);
      }
    } catch (e) {
      console.error("Failed to save avatar", e);
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSaveEditedAvatar = async (editedUrl: string) => {
    setAvatarUrl(editedUrl);
    setPreview(editedUrl);
    setIsEditorOpen(false);

    // Auto-save the edited avatar
    const uid = (user as any).id || (user as any)._id || "";
    if (!user || !uid) return;

    setSavingAvatar(true);
    try {
      if (!storeToken) {
        alert("You must be signed in to change your avatar.");
        setSavingAvatar(false);
        return;
      }

      const result = await uploadAvatar(undefined, editedUrl || undefined, storeToken);
      const payload = result?.data ?? result;
      if (payload && payload.success && payload.user) {
        if (typeof onAvatarSaved === "function") {
          onAvatarSaved(payload.user as unknown as UserProfile);
        }
        setSuccess("Avatar updated successfully");
        setAvatarUrl("");
        setPreview(null);

        closeTimer.current = window.setTimeout(() => {
          setSuccess(null);
        }, 2500);
      }
    } catch (e) {
      console.error("Failed to save avatar", e);
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setSavingAvatar(false);
    }
  };

  const PasswordField = ({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (val: string) => void }) => (
    <Box>
      <Typography component="label" htmlFor={id} sx={labelStyle}>{label}</Typography>
      <TextField id={id} type="password" fullWidth value={value} onChange={(e) => { onChange(e.target.value); if (error) setError(null); }} placeholder={`Enter ${label.toLowerCase()}`} />
    </Box>
  );

  const currentAvatarUrl = preview || user.avatar || "";

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="sm">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Divider sx={dividerStyle} />

          {/* Avatar Section */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#171717" }}>Profile Picture</Typography>
            <Box sx={sectionBoxStyle}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <Avatar src={currentAvatarUrl || undefined} sx={{ width: 100, height: 100, border: "2px solid #e5e5e5" }} />
                  {currentAvatarUrl && (
                    <IconButton
                      onClick={() => setIsEditorOpen(true)}
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        backgroundColor: "#f97316",
                        color: "#fff",
                        width: 32,
                        height: 32,
                        "&:hover": {
                          backgroundColor: "#ea580c",
                        },
                      }}
                      size="small"
                    >
                      <Edit sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>
                <CloudinaryUploadWidget onUpload={(url) => { setAvatarUrl(url); setPreview(url); }} folder="odyssey/avatars" buttonText="Upload New Avatar" />
                {avatarUrl && (
                  <Button onClick={handleSaveAvatar} variant="outlined" fullWidth disabled={savingAvatar} sx={{ textTransform: "none" }}>
                    {savingAvatar ? "Saving..." : "Save Avatar"}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          <Divider sx={dividerStyle} />

          {/* Password Section */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#171717" }}>Change Password</Typography>
            <Box sx={sectionBoxStyle}>
              <PasswordField id="currentPassword" label="Current Password" value={currentPassword} onChange={setCurrentPassword} />
              <PasswordField id="newPassword" label="New Password" value={newPassword} onChange={setNewPassword} />
              <PasswordField id="confirmPassword" label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} />
              <Button onClick={handleChangePassword} variant="outlined" fullWidth disabled={loading || !currentPassword || !newPassword || !confirmPassword} sx={{ textTransform: "none" }}>
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </Box>
          </Box>

          <Divider sx={dividerStyle} />

          {error && (
            <>
              <Typography color="error" sx={{ textAlign: "center" }}>{error}</Typography>
              <Divider sx={dividerStyle} />
            </>
          )}

          {success && (
            <>
              <Typography color="orange" sx={{ textAlign: "center" }}>{success}</Typography>
              <Divider sx={dividerStyle} />
            </>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            <Button variant="outlined" onClick={onClose} sx={{ textTransform: "none" }}>Close</Button>
          </Box>
        </Box>
      </Modal>

      {/* Media Editor Modal */}
      {currentAvatarUrl && (
        <MediaEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          mediaUrl={currentAvatarUrl}
          onSave={handleSaveEditedAvatar}
        />
      )}
    </>
  );
}
