import { memo, useCallback } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Chip, IconButton,
    Pagination, Stack, Box, Skeleton, Tooltip
} from "@mui/material";
import { Trash2, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

// Constants
const ICON_SIZE = 18;
const VIEW_ICON_SIZE = 16;
const SKELETON_ROWS = 5;

const TABLE_CONTAINER_STYLE = {bgcolor: "#18181B",color: "white"};

const TABLE_CELL_HEADER_STYLE = {color: "white", fontWeight: 600};

const TABLE_CELL_STYLE = {color: "white"};

const TABLE_ROW_HOVER_STYLE = { '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },transition: 'background-color 0.2s' };

const PAGINATION_STYLE = {"& .MuiPaginationItem-root": { color: "white" },"& .Mui-selected": {backgroundColor: "primary.main",color: "white"}};

// Status color mapping for chip display
const STATUS_COLOR_MAP: Record<Post["status"], "success" | "warning" | "default" | "info"> = {"Published": "success","Draft": "warning","Archived": "default"};

interface Post {id: string,title: string;author: string;status: "Published" | "Draft" | "Archived";category: string;date: string;views: number;_fullData?: any;}

interface PostsTableProps {posts: Post[];isLoading: boolean;page: number;totalPages: number;searchQuery: string;onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;onViewPost: (tripData: any) => void;onDeleteClick: (id: string) => void;error?: string;}

// Skeleton loading component - displays while data is being fetched
const TableSkeleton = () => {
    const { t } = useTranslation();

    return (
        <TableContainer component={Paper} sx={TABLE_CONTAINER_STYLE}>
            <Table aria-label="Loading posts table">
                <TableHead>
                    <TableRow>
                        <TableCell sx={TABLE_CELL_HEADER_STYLE}>{t("PostsManagement.title") || "Title"}</TableCell>
                        <TableCell sx={TABLE_CELL_HEADER_STYLE}>{t("PostsManagement.author") || "Author"}</TableCell>
                        <TableCell sx={TABLE_CELL_HEADER_STYLE}>{t("PostsManagement.category") || "Category"}</TableCell>
                        <TableCell sx={TABLE_CELL_HEADER_STYLE}>{t("PostsManagement.status") || "Status"}</TableCell>
                        <TableCell sx={TABLE_CELL_HEADER_STYLE}>{t("PostsManagement.date") || "Date"}</TableCell>
                        <TableCell sx={TABLE_CELL_HEADER_STYLE}>{t("PostsManagement.views") || "Views"}</TableCell>
                        <TableCell align="right" sx={TABLE_CELL_HEADER_STYLE}>{t("PostsManagement.actions") || "Actions"}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {[...Array(SKELETON_ROWS)].map((_, index) => (
                        <TableRow key={index}>
                            <TableCell><Skeleton variant="text" sx={{ bgcolor: '#27272A' }} /></TableCell>
                            <TableCell><Skeleton variant="text" sx={{ bgcolor: '#27272A' }} /></TableCell>
                            <TableCell><Skeleton variant="text" sx={{ bgcolor: '#27272A' }} /></TableCell>
                            <TableCell><Skeleton variant="rectangular" width={80} height={24} sx={{ bgcolor: '#27272A', borderRadius: 1 }} /></TableCell>
                            <TableCell><Skeleton variant="text" sx={{ bgcolor: '#27272A' }} /></TableCell>
                            <TableCell><Skeleton variant="text" sx={{ bgcolor: '#27272A' }} /></TableCell>
                            <TableCell align="right">
                                <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: '#27272A', display: 'inline-block', mr: 1 }} />
                                <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: '#27272A', display: 'inline-block' }} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

// Individual table row component - memoized to prevent unnecessary re-renders
interface PostTableRowProps {
    post: Post;
    onViewPost: (data: any) => void;
    onDeleteClick: (id: string) => void;
}

const PostTableRow = memo<PostTableRowProps>(({ post, onViewPost, onDeleteClick }) => {
    const { t } = useTranslation();

    // Maps post status to corresponding Material-UI chip color
    const getStatusChipColor = useCallback((status: Post["status"]) => {
        return STATUS_COLOR_MAP[status] || "info";
    }, []);

    return (
        <TableRow sx={TABLE_ROW_HOVER_STYLE}>
            <TableCell sx={TABLE_CELL_STYLE}>{post.title}</TableCell>
            <TableCell sx={TABLE_CELL_STYLE}>{post.author}</TableCell>
            <TableCell sx={TABLE_CELL_STYLE}>{post.category}</TableCell>
            <TableCell><Chip label={t(`PostsManagement.${post.status.toLowerCase()}`) || post.status} color={getStatusChipColor(post.status)} size="small" /></TableCell>
            <TableCell sx={TABLE_CELL_STYLE}>{post.date}</TableCell>
            <TableCell>
                {/* Views count with eye icon */}
                <Box display="flex" alignItems="center" gap={1}><Eye size={VIEW_ICON_SIZE} color="white" /><Typography sx={TABLE_CELL_STYLE}>{post.views.toLocaleString()}</Typography></Box>
            </TableCell>
            <TableCell align="right">
                {/* View post action */}
                <Tooltip title={t('PostsManagement.viewPost') || 'View post'}><IconButton color="primary" onClick={() => onViewPost(post._fullData)} size="small" sx={{ mr: 1 }} aria-label={`View ${post.title}`}><Eye size={ICON_SIZE} /></IconButton></Tooltip>

                {/* Delete post action */}
                <Tooltip title={t('PostsManagement.deletePost') || 'Delete post'}><IconButton color="error" onClick={() => onDeleteClick(post.id)} size="small" aria-label={`Delete ${post.title}`}><Trash2 size={ICON_SIZE} /></IconButton></Tooltip>
            </TableCell>
        </TableRow>
    );
});

PostTableRow.displayName = 'PostTableRow';

const PostsTable: React.FC<PostsTableProps> = ({
    posts,
    isLoading,
    page,
    totalPages,
    searchQuery,
    onPageChange,
    onViewPost,
    onDeleteClick,
    error
}) => {
    const { t } = useTranslation();

    // Show skeleton loading state while fetching data
    if (isLoading) {
        return <TableSkeleton />;
    }

    // Display error state if data fetching failed
    if (error) {
        return <Box sx={{ textAlign: 'center', py: 4 }}><Typography color="error">{error}</Typography></Box>;
    }

    // Display appropriate empty state message based on search context
    if (posts.length === 0) {
        return (
            <Typography sx={{ color: "white" }}>{searchQuery ? t("PostsManagement.noResults") || "No results found" : t("PostsManagement.noPosts") || "No posts available"}</Typography>
        );
    }

    return (
        <>
            {/* Main posts table with all post data */}
            <TableContainer component={Paper} sx={TABLE_CONTAINER_STYLE}>
                <Table aria-label={t('PostsManagement.postsTableLabel') || 'Posts management table'}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={TABLE_CELL_HEADER_STYLE}>{t("PostsManagement.title") || "Title"}</TableCell>
                            <TableCell sx={TABLE_CELL_HEADER_STYLE}>{t("PostsManagement.author") || "Author"}</TableCell>
                            <TableCell sx={TABLE_CELL_HEADER_STYLE}>{t("PostsManagement.category") || "Category"}</TableCell>
                            <TableCell sx={TABLE_CELL_HEADER_STYLE}>{t("PostsManagement.status") || "Status"}</TableCell>
                            <TableCell sx={TABLE_CELL_HEADER_STYLE}>{t("PostsManagement.date") || "Date"}</TableCell>
                            <TableCell sx={TABLE_CELL_HEADER_STYLE}>{t("PostsManagement.views") || "Views"}</TableCell>
                            <TableCell align="right" sx={TABLE_CELL_HEADER_STYLE}>{t("PostsManagement.actions") || "Actions"}</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {/* Render memoized rows to optimize performance */}
                        {posts.map((post) => (
                            <PostTableRow key={post.id} post={post} onViewPost={onViewPost} onDeleteClick={onDeleteClick} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination controls for navigating through pages */}
            <Stack spacing={2} sx={{ mt: 3, alignItems: "center" }}>
                <Pagination count={totalPages} page={page} onChange={onPageChange} color="primary" sx={PAGINATION_STYLE} aria-label="Posts pagination" />
            </Stack>
        </>
    );
};

export default PostsTable;
