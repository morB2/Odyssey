import { useState, useEffect, useCallback } from "react";
import {
    Box,
    Dialog,
    CircularProgress,
    Tabs,
    Tab
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { fetchAdminTrips, deleteAdminTrip } from "../../services/admin.service";
import { toast } from "react-toastify";
import TripPost from "../social/TripPost";
import type { Trip } from "../social/types";
import { useUserStore } from "../../store/userStore";
import ConfirmDialog from "../general/ConfirmDialog";
import PostsAnalytics from "./posts/PostsAnalytics";
import PostsTable from "./posts/PostsTable"; // Import extracted component
import PostsFilterBar from "./posts/PostsFilterBar"; // Import extracted component

type Post = {
    id: string;
    title: string;
    author: string;
    status: "Published" | "Draft" | "Archived";
    category: string;
    date: string;
    views: number;
    _fullData?: any;
};

const POSTS_PER_PAGE = 10;

export default function PostsManagement() {
    const { t } = useTranslation();
    const { user } = useUserStore();

    const [activeTab, setActiveTab] = useState(0); // 0 = Posts, 1 = Analytics
    const [posts, setPosts] = useState<Post[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);
    const [isLoadingTrip, setIsLoadingTrip] = useState(false);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

    // Debounce search query - wait 500ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to first page on new search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load posts from API with search support
    const loadPosts = useCallback(async () => {
        setIsLoadingPosts(true);
        try {
            const data = await fetchAdminTrips(page, POSTS_PER_PAGE, debouncedSearch);

            const mappedPosts: Post[] = data.trips.map((trip: any) => ({
                id: trip._id,
                title: trip.title || t("PostsManagement.untitledTrip") || "Untitled Trip",
                author: trip.user ? `${trip.user.firstName} ${trip.user.lastName}` : t("PostsManagement.unknown") || "Unknown",
                status: trip.visabilityStatus === "public" ? "Published" : "Draft",
                category: trip.activities?.[0] || t("PostsManagement.general") || "General",
                date: new Date(trip.createdAt).toISOString().split("T")[0],
                views: trip.views || 0,
                _fullData: trip
            }));

            setPosts(mappedPosts);
            setTotalPages(data.pages);
        } catch (error) {
            console.error("Failed to load posts", error);
            toast.error(t("PostsManagement.loadError") || "Failed to load posts");
        } finally {
            setIsLoadingPosts(false);
        }
    }, [page, debouncedSearch, t]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const handleDeleteClick = (id: string) => {
        setDeletingPostId(id);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingPostId) return;

        try {
            await deleteAdminTrip(deletingPostId);

            // Reload current page after deletion
            await loadPosts();

            toast.success(t("PostsManagement.deleteSuccess") || "Post deleted successfully");
        } catch (error) {
            console.error("Failed to delete post:", error);
            toast.error(t("PostsManagement.deleteError") || "Failed to delete post");
        } finally {
            setShowDeleteConfirm(false);
            setDeletingPostId(null);
        }
    };

    const handleViewPost = async (tripData: any) => {
        setIsLoadingTrip(true);
        try {
            const formattedTrip: Trip = {
                _id: tripData._id,
                user: {
                    _id: tripData.user._id,
                    firstName: tripData.user.firstName,
                    lastName: tripData.user.lastName,
                    avatar: tripData.user.avatar || '',
                    isFollowing: false
                },
                title: tripData.title || t("PostsManagement.untitledTrip") || "Untitled Trip",
                description: tripData.description || "",
                activities: tripData.activities || [],
                images: tripData.images || [],
                likes: tripData.likes?.length || 0,
                comments: tripData.comments || [],
                views: tripData.views || 0,
                isLiked: false,
                isSaved: false,
                currentUserId: user?._id || '',
                duration: tripData.duration || '',
                notes: tripData.notes || '',
                optimizedRoute: tripData.optimizedRoute || [],
                visabilityStatus: tripData.visabilityStatus || '',
            };
            setViewingTrip(formattedTrip);
        } catch (error) {
            console.error("Failed to load trip", error);
            toast.error(t("PostsManagement.viewError") || "Failed to view trip");
        } finally {
            setIsLoadingTrip(false);
        }
    };

    const handleCloseDialog = () => {
        setViewingTrip(null);
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{ p: 3, backgroundColor: "black", minHeight: "100vh" }}>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: '#27272A', mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        '& .MuiTab-root': {
                            color: '#71717A',
                            fontSize: '16px',
                            fontWeight: 500,
                            textTransform: 'none',
                            minWidth: 120,
                        },
                        '& .Mui-selected': {
                            color: '#ea580c',
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#ea580c',
                            height: 3,
                        },
                    }}
                >
                    <Tab label={t('PostsManagement.postsTab')} />
                    <Tab label={t('PostsManagement.analyticsTab')} />
                </Tabs>
            </Box>

            {/* Posts Tab Content */}
            {activeTab === 0 && (
                <>
                    <PostsFilterBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        isLoading={isLoadingPosts}
                    />

                    <PostsTable
                        posts={posts}
                        isLoading={isLoadingPosts}
                        page={page}
                        totalPages={totalPages}
                        searchQuery={debouncedSearch}
                        onPageChange={handlePageChange}
                        onViewPost={handleViewPost}
                        onDeleteClick={handleDeleteClick}
                    />

                    {/* View Trip Dialog */}
                    <Dialog
                        open={!!viewingTrip || isLoadingTrip}
                        onClose={handleCloseDialog}
                        PaperProps={{
                            sx: {
                                backgroundColor: '#f5f5f5',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }
                        }}
                    >
                        {isLoadingTrip ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : viewingTrip ? (
                            <Box sx={{ maxHeight: '90vh', overflowY: 'auto' }}>
                                <TripPost trip={viewingTrip} />
                            </Box>
                        ) : null}
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <ConfirmDialog
                        isOpen={showDeleteConfirm}
                        onClose={() => setShowDeleteConfirm(false)}
                        onConfirm={handleDeleteConfirm}
                        title={t("PostsManagement.deleteTitle") || "Delete Trip"}
                        message={t("PostsManagement.deleteMessage") || "Are you sure you want to delete this trip? This action cannot be undone."}
                    />
                </>
            )}

            {/* Analytics Tab Content */}
            {activeTab === 1 && (
                <PostsAnalytics />
            )}
        </Box>
    );
}