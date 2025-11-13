import React, { useState } from "react";
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
} from "@mui/material";
import { Search, UserPlus, Trash2, Edit } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User" | "Moderator";
  status: "Active" | "Inactive";
  joinDate: string;
};

const initialUsers: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Admin", status: "Active", joinDate: "2024-01-15" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User", status: "Active", joinDate: "2024-02-20" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com", role: "Moderator", status: "Active", joinDate: "2024-03-10" },
  { id: "4", name: "Sarah Williams", email: "sarah@example.com", role: "User", status: "Inactive", joinDate: "2024-01-05" },
  { id: "5", name: "David Brown", email: "david@example.com", role: "User", status: "Active", joinDate: "2024-04-12" },
];

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "User" as User["role"],
    status: "Active" as User["status"],
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    const user: User = {
      id: Date.now().toString(),
      ...newUser,
      joinDate: new Date().toISOString().split("T")[0],
    };
    setUsers([...users, user]);
    setNewUser({ name: "", email: "", role: "User", status: "Active" });
    setIsAddDialogOpen(false);
  };

  const handleEditUser = () => {
    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  const getRoleColor = (role: User["role"]) => {
    switch (role) {
      case "Admin":
        return "warning";
      case "Moderator":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: User["status"]) => {
    return status === "Active" ? "success" : "error";
  };

  return (
    <Box sx={{ p: 3,backgroundColor:"black" }}>
      {/* Header */}
      <Grid container spacing={2} alignItems="center" justifyContent="space-between" mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 ,bgcolor:"#18181B",p:1,borderRadius:1}}>
            <Search size={18} color="gray" />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }} textAlign="right">
          <Button
            variant="contained"
            color="warning"
            startIcon={<UserPlus size={18} />}
            onClick={() => setIsAddDialogOpen(true)}
          >
            Add User
          </Button>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer component={Paper} sx={{ bgcolor: "#18181B", color: "white" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell  sx={{color:"white"}}><b>Name</b></TableCell>
              <TableCell sx={{color:"white"}}><b>Email</b></TableCell>
              <TableCell sx={{color:"white"}}><b>Role</b></TableCell>
              <TableCell sx={{color:"white"}}><b>Status</b></TableCell>
              <TableCell sx={{color:"white"}}><b>Join Date</b></TableCell>
              <TableCell align="right" sx={{color:"white"}}><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} hover sx={{ color:"white"}}>
                <TableCell sx={{color:"white"}}>{user.name}</TableCell>
                <TableCell sx={{color:"white"}}>{user.email}</TableCell>
                <TableCell>
                  <Chip label={user.role} color={getRoleColor(user.role)} />
                </TableCell>
                <TableCell>
                  <Chip label={user.status} color={getStatusColor(user.status)} />
                </TableCell>
                <TableCell sx={{color:"white"}}>{user.joinDate}</TableCell>
                <TableCell align="right">
                  <IconButton color="default" onClick={() => setEditingUser({ ...user })}>
                    <Edit size={18} />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteUser(user.id)}>
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredUsers.length === 0 && (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          No users found matching your search.
        </Typography>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            type="email"
            fullWidth
          />
          <TextField
            label="Role"
            select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User["role"] })}
            fullWidth
          >
            <MenuItem value="User">User</MenuItem>
            <MenuItem value="Moderator">Moderator</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </TextField>
          <TextField
            label="Status"
            select
            value={newUser.status}
            onChange={(e) => setNewUser({ ...newUser, status: e.target.value as User["status"] })}
            fullWidth
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained" color="warning">
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onClose={() => setEditingUser(null)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {editingUser && (
            <>
              <TextField
                label="Name"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                type="email"
                fullWidth
              />
              <TextField
                label="Role"
                select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as User["role"] })}
                fullWidth
              >
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Moderator">Moderator</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </TextField>
              <TextField
                label="Status"
                select
                value={editingUser.status}
                onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as User["status"] })}
                fullWidth
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingUser(null)}>Cancel</Button>
          <Button onClick={handleEditUser} variant="contained" color="warning">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}