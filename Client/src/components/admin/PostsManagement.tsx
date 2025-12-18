import { useState, useEffect, useCallback } from "react";
import { Box, Dialog, CircularProgress, Tabs, Tab, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { fetchAdminTrips, deleteAdminTrip } from "../../services/admin.service";
import { toast } from "react-toastify";
import TripPost from "../social/TripPost";
import type { Trip } from "../social/types";
import { useUserStore } from "../../store/userStore";
import ConfirmDialog from "../general/ConfirmDialog";
import PostsAnalytics from "./posts/PostsAnalytics";
import PostsTable from "./posts/PostsTable";
import PostsFilterBar from "./posts/PostsFilterBar";
import { adaptCommentsForUI } from "../../utils/tripAdapters";

// Types
type Post = { id: string; title: string; author: string; status: "Published" | "Draft" | "Archived"; category: string; date: string; views: number; _fullData?: any; };

// Constants
const POSTS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 500;
const DIALOG_MAX_HEIGHT = '90vh';

const CONTAINER_STYLE = { p: 3, backgroundColor: "black", minHeight: "100vh" };

const TABS_CONTAINER_STYLE = { borderBottom: 1, borderColor: '#27272A', mb: 3 };

const TABS_STYLE = { '& .MuiTab-root': { color: '#71717A', fontSize: '16px', fontWeight: 500, textTransform: 'none', minWidth: 120, }, '& .Mui-selected': { color: '#ea580c', }, '& .MuiTabs-indicator': { backgroundColor: '#ea580c', height: 3, }, };

const DIALOG_PAPER_STYLE = { backgroundColor: '#f5f5f5', maxHeight: DIALOG_MAX_HEIGHT, overflowY: 'auto' };

const TAB_CONFIG = [
    { label: 'PostsManagement.postsTab', value: 0 },
    { label: 'PostsManagement.analyticsTab', value: 1 }
];

// Helper Functions

// Maps API trip data to Post format for table display
const mapTripToPost = (trip: any, t: any): Post => ({
    id: trip._id,
    title: trip.title || t("PostsManagement.untitledTrip") || "Untitled Trip",
    author: trip.user
        ? `${trip.user.firstName} ${trip.user.lastName}`
        : t("PostsManagement.unknown") || "Unknown",
    status: trip.visabilityStatus === "public" ? "Published" : "Draft",
    category: trip.activities?.[0] || t("PostsManagement.general") || "General",
    date: new Date(trip.createdAt).toISOString().split("T")[0],
    views: trip.views || 0,
    _fullData: trip
});

// Formats trip data for detailed view in dialog
const formatTripForView = (tripData: any, t: any, userId: string): Trip => ({
    ...tripData,
    user: {
        ...tripData.user,
        isFollowing: false
    },
    comments: adaptCommentsForUI(tripData.comments || []) || [],
    title: tripData.title || t("PostsManagement.untitledTrip") || "Untitled Trip",
    likes: tripData.likes?.length || tripData.likes || 0,
    currentUserId: userId,
    isLiked: false,
    isSaved: false
});

export default function PostsManagement() {
    const { t } = useTranslation();
    const { user } = useUserStore();

    // Tab state: 0 = Posts list, 1 = Analytics dashboard
    const [activeTab, setActiveTab] = useState(0);

    // Posts data and pagination
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Search functionality with debouncing
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Trip viewing state
    const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);
    const [isLoadingTrip, setIsLoadingTrip] = useState(false);

    // Posts loading and error state
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    // Delete confirmation state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

    // Debounce search query to reduce API calls
    // Waits 500ms after user stops typing before triggering search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to first page on new search
        }, DEBOUNCE_DELAY);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetches posts from API with pagination and search support
    const loadPosts = useCallback(async () => {
        setIsLoadingPosts(true);
        setError(undefined); // Clear previous errors
        try {
            const data = await fetchAdminTrips(page, POSTS_PER_PAGE, debouncedSearch);
            const mappedPosts: Post[] = data.trips.map((trip: any) => mapTripToPost(trip, t));
            setPosts(mappedPosts);
            setTotalPages(data.pages);
        } catch (error) {
            const errorMessage = t("PostsManagement.loadError") || "Failed to load posts";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error("Failed to load posts", error);
        } finally {
            setIsLoadingPosts(false);
        }
    }, [page, debouncedSearch, t]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    // Handles delete button click - shows confirmation dialog
    const handleDeleteClick = useCallback((id: string) => {
        setDeletingPostId(id);
        setShowDeleteConfirm(true);
    }, []);

    // Executes the actual delete operation after confirmation
    const handleDeleteConfirm = async () => {
        if (!deletingPostId) return;

        try {
            await deleteAdminTrip(deletingPostId);
            await loadPosts(); // Reload current page after deletion
            toast.success(t("PostsManagement.deleteSuccess") || "Post deleted successfully");
        } catch (error) {
            console.error("Failed to delete post:", error);
            toast.error(t("PostsManagement.deleteError") || "Failed to delete post");
        } finally {
            setShowDeleteConfirm(false);
            setDeletingPostId(null);
        }
    };

    // Formats and displays trip data in a dialog
    const handleViewPost = useCallback(async (tripData: any) => {
        setIsLoadingTrip(true);
        try {
            const formattedTrip = formatTripForView(tripData, t, user?._id || '');
            setViewingTrip(formattedTrip);
        } catch (error) {
            console.error("Failed to load trip", error);
            toast.error(t("PostsManagement.viewError") || "Failed to view trip");
        } finally {
            setIsLoadingTrip(false);
        }
    }, [t, user?._id]);

    // Closes the trip viewing dialog
    const handleCloseDialog = useCallback(() => {
        setViewingTrip(null);
    }, []);

    // Handles pagination page change
    const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    }, []);

    // Handles tab switching between Posts and Analytics
    const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setSearchQuery('');
        setPage(1);
    }, []);

    return (
        <Box sx={CONTAINER_STYLE}>
            {/* Tabs Navigation */}
            <Box sx={TABS_CONTAINER_STYLE}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={TABS_STYLE}>
                    {TAB_CONFIG.map((tab) => (
                        <Tab key={tab.value} label={t(tab.label)} />
                    ))}
                </Tabs>
            </Box>

            {/* Posts Tab Content */}
            {activeTab === 0 && (
                <>
                    {/* Search bar with refresh button */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Box sx={{ flex: 1 }}>
                            <PostsFilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} isLoading={isLoadingPosts} /></Box>
                    </Box>

                    {/* Posts table */}
                    <PostsTable posts={posts} isLoading={isLoadingPosts} page={page} totalPages={totalPages} searchQuery={debouncedSearch} onPageChange={handlePageChange} onViewPost={handleViewPost} onDeleteClick={handleDeleteClick} error={error} />

                    {/* View Trip Dialog */}
                    <Dialog open={!!viewingTrip || isLoadingTrip} onClose={handleCloseDialog} PaperProps={{ sx: DIALOG_PAPER_STYLE }}>
                        {isLoadingTrip ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 4 }}>
                                <CircularProgress />
                                <Typography color="text.secondary">{t('PostsManagement.loadingTrip') || 'Loading trip...'}</Typography>
                            </Box>
                        ) : viewingTrip ? (
                            <Box sx={{ maxHeight: DIALOG_MAX_HEIGHT, overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
                                <TripPost trip={viewingTrip} />
                            </Box>
                        ) : null}
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDeleteConfirm} title={t("PostsManagement.deleteTitle") || "Delete Trip"} message={t("PostsManagement.deleteMessage") || "Are you sure you want to delete this trip? This action cannot be undone."} />
                </>
            )}

            {/* Analytics Tab Content */}
            {activeTab === 1 && <PostsAnalytics />}
        </Box>
    );
}