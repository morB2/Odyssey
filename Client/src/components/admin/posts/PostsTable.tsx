import React from 'react';
import {
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
    Box,
    CircularProgress
} from "@mui/material";
import { Trash2, Eye } from "lucide-react";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useTranslation } from "react-i18next";

interface Post {
    id: string;
    title: string;
    author: string;
    status: "Published" | "Draft" | "Archived";
    category: string;
    date: string;
    views: number;
    _fullData?: any;
}

interface PostsTableProps {
    posts: Post[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    searchQuery: string;
    onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
    onViewPost: (tripData: any) => void;
    onDeleteClick: (id: string) => void;
}

const PostsTable: React.FC<PostsTableProps> = ({
    posts,
    isLoading,
    page,
    totalPages,
    searchQuery,
    onPageChange,
    onViewPost,
    onDeleteClick
}) => {
    const { t } = useTranslation();

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

    if (isLoading) {
        return <CircularProgress size={30} />;
    }

    if (posts.length === 0) {
        return (
            <Typography sx={{ color: "white" }}>
                {searchQuery
                    ? t("PostsManagement.noResults") || "No results found"
                    : t("PostsManagement.noPosts") || "No posts available"
                }
            </Typography>
        );
    }

    return (
        <>
            <TableContainer component={Paper} sx={{ bgcolor: "#18181B", color: "white" }}>
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
                        {posts.map((post) => (
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
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <VisibilityOutlinedIcon style={{ color: "white" }} />
                                        <Typography sx={{ color: "white" }}>{post.views.toLocaleString()}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        onClick={() => onViewPost(post._fullData)}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    >
                                        <Eye size={18} />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => onDeleteClick(post.id)}
                                        size="small"
                                    >
                                        <Trash2 size={18} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Stack spacing={2} sx={{ mt: 3, alignItems: "center" }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={onPageChange}
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
        </>
    );
};

export default PostsTable;
