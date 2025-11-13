import { useState } from "react";
import {
    Box,
    Grid,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
    InputAdornment,
    MenuItem,
} from "@mui/material";
import { Search, Plus, Trash2, Edit, Eye } from "lucide-react";

type Post = {
    id: string;
    title: string;
    author: string;
    status: "Published" | "Draft" | "Archived";
    category: string;
    date: string;
    views: number;
};

const initialPosts: Post[] = [
    { id: "1", title: "Getting Started with React", author: "John Doe", status: "Published", category: "Tutorial", date: "2024-11-10", views: 1523 },
    { id: "2", title: "Advanced TypeScript Patterns", author: "Jane Smith", status: "Published", category: "Development", date: "2024-11-08", views: 892 },
    { id: "3", title: "Building a REST API", author: "Mike Johnson", status: "Draft", category: "Backend", date: "2024-11-12", views: 0 },
    { id: "4", title: "CSS Grid Layout Guide", author: "Sarah Williams", status: "Published", category: "Design", date: "2024-11-05", views: 2341 },
    { id: "5", title: "Introduction to Node.js", author: "David Brown", status: "Archived", category: "Backend", date: "2024-10-15", views: 5632 },
];

export default function PostsManagement() {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [newPost, setNewPost] = useState({
        title: "",
        author: "",
        status: "Draft" as Post["status"],
        category: "",
    });

    const filteredPosts = posts.filter(
        (post) =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddPost = () => {
        const post: Post = {
            id: Date.now().toString(),
            ...newPost,
            date: new Date().toISOString().split("T")[0],
            views: 0,
        };
        setPosts([...posts, post]);
        setNewPost({ title: "", author: "", status: "Draft", category: "" });
        setIsAddDialogOpen(false);
    };

    const handleEditPost = () => {
        if (editingPost) {
            setPosts(posts.map((p) => (p.id === editingPost.id ? editingPost : p)));
            setEditingPost(null);
        }
    };

    const handleDeletePost = (id: string) => {
        setPosts(posts.filter((p) => p.id !== id));
    };

    const getStatusChipColor = (status: Post["status"]) => {
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

    return (
        <Box sx={{ p: 3,backgroundColor:"black" }}>
            {/* Header Actions */}
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                 <Box sx={{ display: "flex", alignItems: "center", gap: 1 ,bgcolor:"#18181B",p:1,borderRadius:1}}>
                           <Search size={18} color="white" />
                           <TextField
                           sx={{color:"white"}}
                             fullWidth
                             variant="outlined"
                             size="small"
                             placeholder="Search posts by title, author or category..."
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                           />
                         </Box>

                <Grid size={{ xs: 12, md: "auto" }}>
                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={<Plus size={18} />}
                        onClick={() => setIsAddDialogOpen(true)}
                    >
                        Add Post
                    </Button>
                </Grid>
            </Grid>

            {/* Posts Table */}
            <TableContainer component={Paper} sx={{ mt: 4, bgcolor: "#18181B", color: "white" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{color:"white"}}>Title</TableCell>
                            <TableCell sx={{color:"white"}}   >Author</TableCell>
                            <TableCell sx={{color:"white"}}>Category</TableCell>
                            <TableCell sx={{color:"white"}}>Status</TableCell>
                            <TableCell sx={{color:"white"}}>Date</TableCell>
                            <TableCell sx={{color:"white"}}>Views</TableCell>
                            <TableCell align="right" sx={{color:"white"}}>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredPosts.map((post) => (
                            <TableRow key={post.id} sx={{color:"white"}}>
                                <TableCell sx={{color:"white"}}>{post.title}</TableCell>
                                <TableCell sx={{color:"white"}}>{post.author}</TableCell>
                                <TableCell sx={{color:"white"}}>{post.category}</TableCell>
                                <TableCell>
                                    <Chip label={post.status} color={getStatusChipColor(post.status)} />
                                </TableCell>
                                <TableCell sx={{color:"white"}}>{post.date}</TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Eye size={16} />
                                        {post.views.toLocaleString()}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="inherit" onClick={() => setEditingPost({ ...post })}>
                                        <Edit size={18} />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDeletePost(post.id)}>
                                        <Trash2 size={18} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {filteredPosts.length === 0 && (
                    <Typography align="center" sx={{ py: 3, color: "text.secondary" }}>
                        No posts found matching your search.
                    </Typography>
                )}
            </TableContainer>

            {/* Add Dialog */}
            <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add New Post</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            label="Title"
                            fullWidth
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        />
                        <TextField
                            label="Author"
                            fullWidth
                            value={newPost.author}
                            onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                        />
                        <TextField
                            label="Category"
                            fullWidth
                            value={newPost.category}
                            onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                        />
                        <TextField
                            select
                            label="Status"
                            fullWidth
                            value={newPost.status}
                            onChange={(e) => setNewPost({ ...newPost, status: e.target.value as Post["status"] })}
                        >
                            <MenuItem value="Draft">Draft</MenuItem>
                            <MenuItem value="Published">Published</MenuItem>
                            <MenuItem value="Archived">Archived</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="warning" onClick={handleAddPost}>
                        Add Post
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            {editingPost && (
                <Dialog open={!!editingPost} onClose={() => setEditingPost(null)} fullWidth maxWidth="sm">
                    <DialogTitle>Edit Post</DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <TextField
                                label="Title"
                                fullWidth
                                value={editingPost.title}
                                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                            />
                            <TextField
                                label="Author"
                                fullWidth
                                value={editingPost.author}
                                onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                            />
                            <TextField
                                label="Category"
                                fullWidth
                                value={editingPost.category}
                                onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                            />
                            <TextField
                                select
                                label="Status"
                                fullWidth
                                value={editingPost.status}
                                onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as Post["status"] })}
                            >
                                <MenuItem value="Draft">Draft</MenuItem>
                                <MenuItem value="Published">Published</MenuItem>
                                <MenuItem value="Archived">Archived</MenuItem>
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditingPost(null)}>Cancel</Button>
                        <Button variant="contained" color="warning" onClick={handleEditPost}>
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
}