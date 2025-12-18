import { useState, useEffect } from "react";
import type { Trip, ServerTrip } from "./types";
import Modal from "./Modal";
import { Box, Button, TextField, Typography, Divider, Chip, IconButton, Tooltip } from "@mui/material";
import { Save, X, Trash2, Lock, Globe, Plus, Pencil } from "lucide-react";
import ConfirmDialog from "../general/ConfirmDialog";
import { useUserStore } from "../../store/userStore";
import { updateTrip } from "../../services/profile.service";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
import CloudinaryUploadWidget from "../general/CloudinaryUploadWidget";
import { isVideo } from "../../utils/mediaUtils";
import AdvancedMediaEditor from "../general/AdvancedMediaEditor";

interface EditTripModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (trip?: Trip) => void;
}

// Shared styles
const labelStyle = { display: "block", mb: 1, fontSize: "0.875rem", fontWeight: 500, color: "#171717" };
const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#d4d4d4" },
    "&:hover fieldset": { borderColor: "#a3a3a3" },
  },
};
const dividerStyle = { backgroundColor: "#e5e5e5" };

export default function EditTripModal({ trip, isOpen, onClose, onSave }: EditTripModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(trip?.title || "");
  const [description, setDescription] = useState(trip?.description || "");
  const [notes, setNotes] = useState(trip?.notes || "");
  const [images, setImages] = useState<string[]>(trip?.images || []); // Keep for backward compatibility
  const [activities, setActivities] = useState<string[]>(trip?.activities || []);
  const [newActivity, setNewActivity] = useState("");
  // Handle both visibility (client) and visabilityStatus (server) fields
  const [visibility, setVisibility] = useState<"public" | "private">(
    trip?.visibility || ((trip as any)?.visabilityStatus === "public" ? "public" : "private")
  );
  const [showVisibilityConfirm, setShowVisibilityConfirm] = useState(false);
  const [pendingVisibility, setPendingVisibility] = useState<"public" | "private">("public");

  // Editor state
  const [showAdvancedEditor, setShowAdvancedEditor] = useState<number | null>(null);

  useEffect(() => {
    if (!trip) {
      setTitle("");
      setDescription("");
      setNotes("");
      setImages([]);
      setActivities([]);
      setVisibility("public");
      return;
    }
    setTitle(trip.title || "");
    setDescription(trip.description || "");
    setNotes(trip.notes || "");
    setImages(trip.images || []);
    setActivities(trip.activities || []);
    // Handle both visibility (client) and visabilityStatus (server) fields
    setVisibility(
      trip.visibility || ((trip as any)?.visabilityStatus === "public" ? "public" : "private")
    );
  }, [trip]);

  const handleSave = () => {
    (async () => {
      if (!trip) return;
      try {
        const storeUser = useUserStore.getState().user;
        const userId = storeUser?._id;
        if (!userId) throw new Error("Not authenticated");

        const payload: Partial<ServerTrip> = {};
        if (title !== trip.title) payload.title = title;
        if (description !== trip.description) payload.description = description;
        if (notes !== trip.notes) payload.notes = notes;
        if (JSON.stringify(activities || []) !== JSON.stringify(trip.activities || [])) payload.activities = activities;
        if (visibility !== trip.visibility) payload.visabilityStatus = visibility;
        if (JSON.stringify(images) !== JSON.stringify(trip.images)) payload.images = images;

        if (Object.keys(payload).length === 0) {
          onClose();
          return;
        }

        const res = await updateTrip(String(trip._id || trip.id), payload);
        const serverTrip: ServerTrip = (res && (res.trip || res)) as ServerTrip;

        const ordered = serverTrip.optimizedRoute?.ordered_route || [];
        const modeFromOptimized = serverTrip.optimizedRoute?.mode;
        const mapModeTansit = (m?: string): "car" | "walk" | "tansit" => m === "driving" ? "car" : m === "walking" ? "walk" : "tansit";
        const mapModeTransit = (m?: string): "car" | "walk" | "transit" => m === "driving" ? "car" : m === "walking" ? "walk" : "transit";

        const mapped: Trip = {
          ...trip,
          id: serverTrip._id || serverTrip.id || trip.id,
          _id: String(serverTrip._id || serverTrip.id || trip._id || trip.id || ""),
          title: serverTrip.title || title,
          description: serverTrip.description || description,
          images: serverTrip.images || images,
          route: ordered.length ? ordered.map((r: { name?: string }) => r.name || "") : serverTrip.route || [],
          routeInstructions: (((serverTrip.optimizedRoute?.instructions as string[]) || (serverTrip.routeInstructions as string[]) || []) as string[]).map((ins: string, i: number) => ({
            step: i + 1,
            instruction: ins || "",
            mode: mapModeTansit(modeFromOptimized),
            distance: "",
          })),
          mode: mapModeTransit(modeFromOptimized || serverTrip.mode),
          visibility: serverTrip.visabilityStatus === "public" ? "public" : "private",
          activities: serverTrip.activities || activities,
          notes: serverTrip.notes || notes,
        };

        onSave(mapped);
        onClose();
      } catch (e) {
        console.error("Failed to save trip", e);
        toast.error(String(e instanceof Error ? e.message : e));
      }
    })();
  };

  const handleImageUpload = (url: string) => {
    if (images.length >= 3) {
      toast.error(t('editTrip.maxMediaError'));
      return;
    }
    setImages((prev) => [...prev, url]);
  };

  const handleRemoveImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handleAdvancedEditSave = (index: number, editedUrl: string) => {
    setImages((prev) => {
      const updated = prev.map((url, i) => (i === index ? editedUrl : url));
      return updated;
    });
    setShowAdvancedEditor(null);
  };

  const handleAddActivity = () => {
    if (newActivity.trim() && !activities.includes(newActivity.trim())) {
      setActivities([...activities, newActivity.trim()]);
      setNewActivity("");
    }
  };

  const handleRemoveActivity = (activity: string) => setActivities(activities.filter((a) => a !== activity));

  const handleVisibilityChange = (newVisibility: "public" | "private") => {
    setPendingVisibility(newVisibility);
    setShowVisibilityConfirm(true);
  };

  const confirmVisibilityChange = () => {
    setVisibility(pendingVisibility);
    setShowVisibilityConfirm(false);
  };

  const VisibilityButton = ({ type }: { type: "public" | "private" }) => {
    const isActive = visibility === type;
    const Icon = type === "public" ? Globe : Lock;
    return (
      <Box component="button" onClick={() => handleVisibilityChange(type)} sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 1, borderRadius: 2, border: isActive ? "1px solid #f97316" : "1px solid #e5e5e5", backgroundColor: isActive ? "#ffedd5" : "#ffffff", color: isActive ? "#ea580c" : "#525252", p: 2, cursor: "pointer", transition: "all 0.2s", "&:hover": { borderColor: isActive ? "#f97316" : "#d4d4d4" } }}>
        <Icon size={20} />
        <Typography sx={{ fontSize: "1rem" }}>{type === "public" ? t('editTrip.public') : t('editTrip.private')}</Typography>
      </Box>
    );
  };

  if (!trip) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('editTrip.title')} maxWidth="2xl">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Title */}
          <Box>
            <Typography component="label" htmlFor="title" sx={labelStyle}>{t('editTrip.tripTitle')}</Typography>
            <TextField id="title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('editTrip.enterTripTitle')} sx={textFieldStyle} />
          </Box>

          {/* Description */}
          <Box>
            <Typography component="label" htmlFor="description" sx={labelStyle}>{t('editTrip.description')}</Typography>
            <TextField id="description" fullWidth multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('editTrip.describeYourTrip')} sx={textFieldStyle} />
          </Box>

          <Divider sx={dividerStyle} />

          {/* Media (Images & Videos) */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#171717" }}>{t('editTrip.mediaMax3')}</Typography>
              {images.length < 3 && <CloudinaryUploadWidget onUpload={handleImageUpload} folder="odyssey/trips" buttonText={t('editTrip.upload')} allowVideos={true} />}
            </Box>

            {images.length === 0 ? (
              <Box sx={{ borderRadius: 2, border: "1px solid #e5e5e5", backgroundColor: "#fafafa", p: 4, textAlign: "center" }}>
                <Typography sx={{ color: "#737373", fontSize: "0.875rem" }}>{t('editTrip.noMediaYet')}</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" } }}>
                {images.map((mediaUrl, index) => {
                  // Check if image is from Cloudinary (can be edited)
                  const canEdit = mediaUrl && mediaUrl.includes('cloudinary.com');

                  return (
                    <Box key={index} sx={{ position: "relative", overflow: "hidden", borderRadius: 2, border: "1px solid #e5e5e5", "&:hover .overlay": { backgroundColor: "rgba(0, 0, 0, 0.4)" }, "&:hover .delete-btn": { opacity: 1 } }}>
                      {isVideo(mediaUrl) ? (
                        <Box
                          component="video"
                          src={mediaUrl}
                          controls
                          sx={{ aspectRatio: "16/9", width: "100%", objectFit: "cover", backgroundColor: "#000" }}
                        />
                      ) : (
                        <Box component="img" src={mediaUrl} alt={`Trip media ${index + 1}`} sx={{ aspectRatio: "16/9", width: "100%", objectFit: "cover" }} />
                      )}
                      <Box className="overlay" sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, backgroundColor: "rgba(0, 0, 0, 0)", transition: "background-color 0.2s", pointerEvents: "none" }}>
                        <Tooltip
                          title={canEdit ? t('editTrip.advancedEdit') : t('editTrip.cannotEditExternalImage')}
                          arrow
                          placement="top"
                        >
                          <span style={{ pointerEvents: "auto" }}>
                            <IconButton
                              className="delete-btn"
                              onClick={() => canEdit ? setShowAdvancedEditor(index) : null}
                              disabled={!canEdit}
                              sx={{
                                backgroundColor: "#f8893aff",
                                opacity: 0,
                                transition: "opacity 0.2s",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                "&:hover": { backgroundColor: "#d8885dff" },
                                "&:disabled": { opacity: 0.8, cursor: "not-allowed" },
                                "&:disabled:hover": { backgroundColor: "#f8893aff" },
                                width: 32,
                                height: 32,
                                cursor: canEdit ? "pointer" : "not-allowed"
                              }}
                            >
                              <Pencil size={14} color={canEdit ? "#ffffff" : "#6b7280"} />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={t('editTrip.deleteMedia')}
                          arrow
                          placement="top"
                        >
                          <IconButton className="delete-btn" onClick={() => handleRemoveImage(index)} sx={{ backgroundColor: "#ffffff", opacity: 0, transition: "opacity 0.2s", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", "&:hover": { backgroundColor: "#ffffff" }, pointerEvents: "auto", width: 32, height: 32 }}>
                            <Trash2 size={14} color="#dc2626" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box sx={{ position: "absolute", left: 8, top: 8, borderRadius: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)", px: 1, py: 0.5, color: "#ffffff", fontSize: "0.75rem" }}>{index + 1}</Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          <Divider sx={dividerStyle} />

          {/* Activities */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#171717" }}>{t('editTrip.activities')}</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField fullWidth value={newActivity} onChange={(e) => setNewActivity(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddActivity(); } }} placeholder={t('editTrip.addActivity')} sx={textFieldStyle} />
              <Button variant="outlined" onClick={handleAddActivity} sx={{ borderColor: "#d4d4d4", color: "#171717", minWidth: "auto", px: 2, "&:hover": { borderColor: "#a3a3a3", backgroundColor: "#fafafa" } }}>
                <Plus size={16} />
              </Button>
            </Box>
            {activities.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {activities.map((activity, index) => (
                  <Chip key={index} label={activity} onDelete={() => handleRemoveActivity(activity)} deleteIcon={<X size={12} />} sx={{ border: "1px solid #e5e5e5", backgroundColor: "#f5f5f5", color: "#404040", "& .MuiChip-deleteIcon": { color: "#404040", "&:hover": { color: "#dc2626" } } }} />
                ))}
              </Box>
            )}
          </Box>

          <Divider sx={dividerStyle} />

          {/* Notes */}
          <Box>
            <Typography component="label" htmlFor="notes" sx={labelStyle}>{t('editTrip.notes')}</Typography>
            <TextField id="notes" fullWidth multiline rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('editTrip.addNotes')} sx={textFieldStyle} />
          </Box>

          <Divider sx={dividerStyle} />

          {/* Visibility */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#171717" }}>{t('editTrip.visibility')}</Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <VisibilityButton type="public" />
              <VisibilityButton type="private" />
            </Box>
          </Box>

          <Divider sx={dividerStyle} />

          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            <Button variant="outlined" onClick={onClose} sx={{ borderColor: "#d4d4d4", color: "#171717", textTransform: "none", "&:hover": { borderColor: "#a3a3a3", backgroundColor: "#fafafa" } }}>{t('editTrip.cancel')}</Button>
            <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: "#f97316", textTransform: "none", "&:hover": { backgroundColor: "#ea580c" } }}>
              <Save size={16} style={{ marginRight: "8px" }} />
              {t('editTrip.saveChanges')}
            </Button>
          </Box>
        </Box>
      </Modal>

      <ConfirmDialog isOpen={showVisibilityConfirm} onClose={() => setShowVisibilityConfirm(false)} onConfirm={confirmVisibilityChange} title={t('editTrip.changeVisibility')} message={t('editTrip.changeVisibilityMessage')} />

      {/* Advanced Editor Modal */}
      {showAdvancedEditor !== null && (
        <AdvancedMediaEditor
          isOpen={true}
          onClose={() => setShowAdvancedEditor(null)}
          mediaUrl={images[showAdvancedEditor]}
          onSave={(editedUrl) => handleAdvancedEditSave(showAdvancedEditor, editedUrl)}
        />
      )}
    </>
  );
}
