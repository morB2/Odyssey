import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import ProfileHeader from "./ProfileHeader";
import TripsList from "./TripsList";
import ChangePasswordModal from "./EditProfileModal";
import type { UserProfile } from "./types";
import { getProfile, deleteTrip as svcDeleteTrip } from "../../services/profile.service.tsx";
import CreateCollectionModal from "../collections/CreateCollectionModal";
import { useUserStore } from "../../store/userStore";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
import ConfirmDialog from "../general/ConfirmDialog";
import { useCollectionsStore } from "../../store/collectionStore";
const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background: 'white',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.5
  }
};

const paperStyle = {
  p: { xs: 2, md: 4 },
  borderRadius: 4,
  bgcolor: "rgba(255, 255, 255, 0.95)",
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  position: 'relative',
  zIndex: 1
};

const guestUser = {
  id: "",
  firstName: "Guest",
  lastName: "guest",
  email: "",
  avatar: ""
};

export default function Profile() {
  const { t } = useTranslation();
  const storeUser = useUserStore((s) => s.user);
  const params = useParams();
  const viewedUserId = (params.userId as string) || undefined;
  const profileId = viewedUserId || storeUser?._id || "";
  const isOwner = Boolean(storeUser?._id && viewedUserId ? storeUser._id === viewedUserId : !viewedUserId);

  // Simplified state - only user profile and modals
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"my-trips" | "liked" | "saved" | "collections" | "journey">("my-trips");
  const { removeCollection } = useCollectionsStore();
  // Fetch user profile only
  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      if (!profileId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const userRes = await getProfile(profileId);
        if (!mounted) return;
        if (!userRes || !userRes.success) throw new Error(t('general.error'));
        setUser(userRes.user);
      } catch (e) {
        if (!mounted) return;
        toast.error(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();
    return () => { mounted = false; };
  }, [profileId, t]);

  // Reset tab when switching between own/other profiles
  useEffect(() => {
    if (!isOwner) setActiveTab("my-trips");
  }, [isOwner]);



  const handleDeleteTrip = async (tripId: string) => {
    try {
      const res = await svcDeleteTrip(tripId);
      const body = res as any;
      if (!body || (body.success === false && body.error)) throw new Error(body.error || "Failed to delete trip");
      toast.success(t('profilePage.tripDeletedSuccessfully'));
    } catch (e) {
      toast.error(String(e));
      throw e; // Re-throw so TripsList knows it failed
    }
  };

  const handleProfileUpdated = async () => {
    // Refresh user profile after avatar/password change
    try {
      const userRes = await getProfile(profileId);
      if (userRes && userRes.success) {
        setUser(userRes.user);
      }
    } catch (e) {
      console.error("Failed to refresh profile", e);
    }
  };

  const handleCreateCollectionClick = () => {
    setEditingCollection(null);
    setIsCollectionModalOpen(true);
  };

  const handleEditCollectionClick = (collection: any) => {
    setEditingCollection(collection);
    setIsCollectionModalOpen(true);
  };

  const handleCollectionSaveSuccess = () => {
    setIsCollectionModalOpen(false);
    // TripsList will handle its own refresh
  };



  const handleCollectionDelete = async (id: string) => {
    try {
      const { deleteCollection } = await import("../../services/collection.service");
      await deleteCollection(id);
      removeCollection(id);
      toast.success(t("collection.deleted"));
    } catch {
      toast.error(t("collection.deleteFailed"));
      throw new Error("Failed to delete collection");
    }
  };

  return (
    <>
      <Box sx={containerStyle}>
        <Paper elevation={3} sx={paperStyle}>
          <ProfileHeader
            user={user || guestUser}
            isOwner={isOwner}
            onEditClick={() => isOwner && setIsEditModalOpen(true)}
            loading={loading}
          />

          <Box sx={{ mt: 4 }}>
            <TripsList
              profileId={profileId}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onDelete={handleDeleteTrip}
              onCollectionCreate={handleCreateCollectionClick}
              onCollectionEdit={handleEditCollectionClick}
              onCollectionDelete={handleCollectionDelete}
            />
          </Box>
        </Paper>

        <ChangePasswordModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user || guestUser}
          onProfileUpdated={handleProfileUpdated}
        />



        <CreateCollectionModal
          isOpen={isCollectionModalOpen}
          onClose={() => setIsCollectionModalOpen(false)}
          onSuccess={handleCollectionSaveSuccess}
          existingCollection={editingCollection}
        />
      </Box>


    </>
  );
}
