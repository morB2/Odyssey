import React, { useEffect, useState } from "react";
import {
  Box, Grid, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Typography,
  TextField, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Chip,
  Checkbox, Tabs, Tab,
} from "@mui/material";
import { Search, Trash2, Edit } from "lucide-react";
import { getAllUsers, updateUser } from "../../services/user.service";
import type { User, UserRole } from "../../models/user.model";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import UsersAnalytics from "./UsersAnalytics";


export default function UsersManagement() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0); // 0 = Users, 1 = Analytics
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);


  useEffect(() => {
    const fetchUsers = async () => {
      const allUers = await getAllUsers();
      setUsers(allUers);
    };

    fetchUsers();
  }, []);


  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditUser = async () => {
    if (editingUser) {
      try {
        const updatedUser = await updateUser(editingUser._id, editingUser);
        setUsers(users.map(u => (u._id === updatedUser._id ? updatedUser : u)));
        setEditingUser(null);
      } catch (error) {
        console.error("Error updating user:", error);
      }
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u._id !== id));
  };

  const getRoleColor = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "warning";
      case "user":
        return "info";
      default:
        return "secondary";
    }
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
          <Tab label={t('UsersManagement.usersTab')} />
          <Tab label={t('UsersManagement.analyticsTab')} />
        </Tabs>
      </Box>

      {/* Users Tab Content */}
      {activeTab === 0 && (
        <>
          {/* Header */}
          <Grid container spacing={2} alignItems="center" justifyContent="space-between" mb={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#18181B", p: 1, borderRadius: 1 }}>
                <Search size={18} color="gray" />
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder={t('UsersManagement.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    '& .MuiInputBase-input': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'gray' },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white', },
                    '& .MuiInputLabel-root': { color: 'white', }
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Table */}
          <TableContainer component={Paper} sx={{ bgcolor: "#18181B", color: "white" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "white" }}><b>{t('UsersManagement.table.name')}</b></TableCell>
                  <TableCell sx={{ color: "white" }}><b>{t('UsersManagement.table.email')}</b></TableCell>
                  <TableCell sx={{ color: "white" }}><b>{t('UsersManagement.table.role')}</b></TableCell>
                  <TableCell sx={{ color: "white" }}><b>{t('UsersManagement.table.status')}</b></TableCell>
                  <TableCell sx={{ color: "white" }}><b>{t('UsersManagement.table.joinDate')}</b></TableCell>
                  <TableCell align="right" sx={{ color: "white" }}><b>{t('UsersManagement.table.actions')}</b></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} hover sx={{ color: "white" }}>
                    <TableCell sx={{ color: "white" }}>{user.firstName} {user.lastName}</TableCell>
                    <TableCell sx={{ color: "white" }}>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={t(`UsersManagement.roles.${user.role}`)} color={getRoleColor(user.role)} />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={user.status}
                        disabled
                        icon={<CheckBoxOutlineBlank sx={{ color: "white" }} />}
                        checkedIcon={<CheckBox sx={{ color: "white" }} />}
                        sx={{ p: 0 }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>{user.createdAt}</TableCell>
                    <TableCell align="right">
                      <IconButton sx={{ color: "white" }} onClick={() => setEditingUser({ ...user })}>
                        <Edit size={18} />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteUser(user._id!)}>
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
              {t('UsersManagement.noUsersFound')}
            </Typography>
          )}
        </>
      )}

      {/* Analytics Tab Content */}
      {activeTab === 1 && (
        <UsersAnalytics />
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onClose={() => setEditingUser(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ padding: "10px" }}>{t('UsersManagement.editUser')}</DialogTitle>
        <DialogContent sx={{ display: "flex", padding: '16px', flexDirection: "column", gap: 3, pt: 2, mb: 2, mt: 1 }}>
          {editingUser && (
            <>
              <TextField
                label={t('UsersManagement.labels.name')}
                value={editingUser.firstName}
                onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                fullWidth
              />
              <TextField
                label={t('UsersManagement.labels.email')}
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                type="email"
                fullWidth
              />
              <TextField
                label={t('UsersManagement.labels.role')}
                select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                fullWidth
              >
                <MenuItem value="user">{t('UsersManagement.roles.user')}</MenuItem>
                <MenuItem value="admin">{t('UsersManagement.roles.admin')}</MenuItem>
              </TextField>
              <TextField
                label={t('UsersManagement.labels.status')}
                select
                value={editingUser.status ? "true" : "false"}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, status: e.target.value === "true" })
                }
                fullWidth
              >
                <MenuItem value="true">{t('UsersManagement.status.active')}</MenuItem>
                <MenuItem value="false">{t('UsersManagement.status.inactive')}</MenuItem>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingUser(null)}>{t('UsersManagement.buttons.cancel')}</Button>
          <Button onClick={handleEditUser} variant="contained" color="warning">
            {t('UsersManagement.buttons.saveChanges')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}