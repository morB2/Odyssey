import { useState, useEffect, useCallback } from "react";
import {
    Box,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    IconButton,
    Pagination,
    Stack,
    Dialog,
    CircularProgress
} from "@mui/material";
import { Search, Trash2, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchAdminTrips, deleteAdminTrip } from "../../services/admin.service";
import { toast } from "react-toastify";
import TripPost from "../social/TripPost";
import type { Trip } from "../social/types";
import { useUserStore } from "../../store/userStore";
import { ConfirmDialog } from "../user/ConfirmDialog";

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

    const [posts, setPosts] = useState<Post[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
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
                views: 0,
                _fullData: trip
            }));

            setPosts(mappedPosts);
            setTotalPages(data.pages);
            setTotalCount(data.total || 0);
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

    const getStatusChipColor = (status: Post["status"]): "success" | "warning" | "default" | "info" => {
        switch (status) {
            case "Published":
                return "success";
            case "Draft":
                return "warning";
            case "Archived":
                return "default";
            default:
                return "info";
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
                isLiked: false,
                isSaved: false,
                currentUserId: user?._id || '',
                duration: tripData.duration || '',
                notes: tripData.notes || ''
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

    return (
        <Box sx={{ p: 3, backgroundColor: "black", minHeight: "100vh" }}>
            {/* Search Bar */}
            <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "#18181B",
                p: 1.5,
                borderRadius: 1,
                mb: 3
            }}>
                <Search size={20} color="gray" />
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder={t('PostsManagement.searchPlaceholder') || 'Search by title, author, or category...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        '& .MuiInputBase-input': { color: 'white' },
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    }}
                />
                {isLoadingPosts && searchQuery && (
                    <CircularProgress size={20} sx={{ color: 'gray' }} />
                )}
            </Box>



            {/* Table */}
            {isLoadingPosts ? (
                <CircularProgress size={30} />
            ) : posts.length === 0 ? (
                <Typography sx={{ color: "white" }}>
                    {debouncedSearch
                        ? t("PostsManagement.noResults") || "No results found"
                        : t("PostsManagement.noPosts") || "No posts available"
                    }
                </Typography>
            ) : (<TableContainer component={Paper} sx={{ bgcolor: "#18181B", color: "white" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>
                                {t("PostsManagement.title") || "Title"}
                            </TableCell>
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>
                                {t("PostsManagement.author") || "Author"}
                            </TableCell>
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>
                                {t("PostsManagement.category") || "Category"}
                            </TableCell>
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>
                                {t("PostsManagement.status") || "Status"}
                            </TableCell>
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>
                                {t("PostsManagement.date") || "Date"}
                            </TableCell>
                            <TableCell align="right" sx={{ color: "white", fontWeight: 600 }}>
                                {t("PostsManagement.actions") || "Actions"}
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {
                            posts.map((post) => (
                                <TableRow
                                    key={post.id}
                                    sx={{
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <TableCell sx={{ color: "white" }}>{post.title}</TableCell>
                                    <TableCell sx={{ color: "white" }}>{post.author}</TableCell>
                                    <TableCell sx={{ color: "white" }}>{post.category}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={t(`PostsManagement.${post.status.toLowerCase()}`) || post.status}
                                            color={getStatusChipColor(post.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: "white" }}>{post.date}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleViewPost(post._fullData)}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            <Eye size={18} />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteClick(post.id)}
                                            size="small"
                                        >
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>)}


            {/* Pagination */}
            {!isLoadingPosts && posts.length > 0 && (
                <Stack spacing={2} sx={{ mt: 3, alignItems: "center" }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        sx={{
                            "& .MuiPaginationItem-root": { color: "white" },
                            "& .Mui-selected": {
                                backgroundColor: "primary.main",
                                color: "white"
                            }
                        }}
                    />
                </Stack>
            )}

            {/* View Trip Dialog */}
            <Dialog
                open={!!viewingTrip || isLoadingTrip}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: '#f5f5f5',
                        maxHeight: '90vh'
                    }
                }}
            >
                {isLoadingTrip ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : viewingTrip ? (
                    <TripPost trip={viewingTrip} />
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
        </Box>
    );
}