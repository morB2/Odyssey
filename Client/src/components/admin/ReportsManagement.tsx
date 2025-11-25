import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
} from '@mui/material';
import { AlertTriangle, Trash2, CheckCircle, Eye } from 'lucide-react';
import { getReports, updateReportStatus, deleteReportedPost } from '../../services/report.service';
import { toast } from 'react-toastify';

interface Report {
    _id: string;
    reporter: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    reportedTrip: {
        _id: string;
        title: string;
    };
    reason: string;
    status: 'pending' | 'reviewed' | 'resolved';
    createdAt: string;
}

export default function ReportsManagement() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await getReports();
            setReports(data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch reports');
            toast.error('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const handleDismissReport = async (reportId: string) => {
        try {
            setActionLoading(true);
            await updateReportStatus(reportId, 'reviewed');
            toast.success('Report dismissed');
            fetchReports();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to dismiss report');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeletePost = async () => {
        if (!selectedReport) return;

        try {
            setActionLoading(true);
            await deleteReportedPost(selectedReport.reportedTrip._id);
            toast.success('Post deleted successfully');
            setDeleteDialogOpen(false);
            setSelectedReport(null);
            fetchReports();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to delete post');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'reviewed':
                return 'info';
            case 'resolved':
                return 'success';
            default:
                return 'default';
        }
    };

    const filteredReports = reports.filter(report =>
        filterStatus === 'all' ? true : report.status === filterStatus
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#ea580c' }} />
            </Box>
        );
    }

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 500 }}>
                    Reports Management
                </Typography>
                <Tabs
                    value={filterStatus}
                    onChange={(e, val) => setFilterStatus(val)}
                    sx={{
                        '& .MuiTabs-indicator': { bgcolor: '#ea580c' },
                    }}
                >
                    <Tab
                        value="all"
                        label="All"
                        sx={{
                            color: '#a1a1aa',
                            '&.Mui-selected': { color: '#ea580c' }
                        }}
                    />
                    <Tab
                        value="pending"
                        label="Pending"
                        sx={{
                            color: '#a1a1aa',
                            '&.Mui-selected': { color: '#ea580c' }
                        }}
                    />
                    <Tab
                        value="reviewed"
                        label="Reviewed"
                        sx={{
                            color: '#a1a1aa',
                            '&.Mui-selected': { color: '#ea580c' }
                        }}
                    />
                    <Tab
                        value="resolved"
                        label="Resolved"
                        sx={{
                            color: '#a1a1aa',
                            '&.Mui-selected': { color: '#ea580c' }
                        }}
                    />
                </Tabs>
            </Box>

            <TableContainer component={Paper} sx={{ bgcolor: '#18181b', border: '1px solid #27272a' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#09090b' }}>
                            <TableCell sx={{ color: '#a1a1aa', fontWeight: 600 }}>Reporter</TableCell>
                            <TableCell sx={{ color: '#a1a1aa', fontWeight: 600 }}>Post Title</TableCell>
                            <TableCell sx={{ color: '#a1a1aa', fontWeight: 600 }}>Reason</TableCell>
                            <TableCell sx={{ color: '#a1a1aa', fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ color: '#a1a1aa', fontWeight: 600 }}>Date</TableCell>
                            <TableCell sx={{ color: '#a1a1aa', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredReports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#71717a' }}>
                                    No reports found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredReports.map((report) => (
                                <TableRow
                                    key={report._id}
                                    sx={{
                                        '&:hover': { bgcolor: '#27272a' },
                                        borderBottom: '1px solid #27272a'
                                    }}
                                >
                                    <TableCell sx={{ color: 'white' }}>
                                        <Typography variant="body2">
                                            {report.reporter.firstName} {report.reporter.lastName}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#71717a' }}>
                                            {report.reporter.email}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: 'white' }}>
                                        {report.reportedTrip?.title || 'Deleted Post'}
                                    </TableCell>
                                    <TableCell sx={{ color: 'white', maxWidth: 300 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {report.reason}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={report.status}
                                            color={getStatusColor(report.status) as any}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: '#a1a1aa' }}>
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                size="small"
                                                startIcon={<Eye size={16} />}
                                                onClick={() => {
                                                    setSelectedReport(report);
                                                    setViewDialogOpen(true);
                                                }}
                                                sx={{
                                                    color: '#a1a1aa',
                                                    '&:hover': { bgcolor: '#27272a', color: 'white' }
                                                }}
                                            >
                                                View
                                            </Button>
                                            {report.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="small"
                                                        startIcon={<CheckCircle size={16} />}
                                                        onClick={() => handleDismissReport(report._id)}
                                                        disabled={actionLoading}
                                                        sx={{
                                                            color: '#22c55e',
                                                            '&:hover': { bgcolor: '#27272a' }
                                                        }}
                                                    >
                                                        Dismiss
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        startIcon={<Trash2 size={16} />}
                                                        onClick={() => {
                                                            setSelectedReport(report);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                        disabled={actionLoading}
                                                        sx={{
                                                            color: '#ef4444',
                                                            '&:hover': { bgcolor: '#27272a' }
                                                        }}
                                                    >
                                                        Delete Post
                                                    </Button>
                                                </>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* View Report Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                PaperProps={{
                    sx: {
                        bgcolor: '#18181b',
                        border: '1px solid #27272a',
                        minWidth: 500
                    }
                }}
            >
                <DialogTitle sx={{ color: 'white', borderBottom: '1px solid #27272a' }}>
                    Report Details
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedReport && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#71717a' }}>
                                    Reporter
                                </Typography>
                                <Typography sx={{ color: 'white' }}>
                                    {selectedReport.reporter.firstName} {selectedReport.reporter.lastName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#71717a' }}>
                                    {selectedReport.reporter.email}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#71717a' }}>
                                    Reported Post
                                </Typography>
                                <Typography sx={{ color: 'white' }}>
                                    {selectedReport.reportedTrip?.title || 'Deleted Post'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#71717a' }}>
                                    Reason
                                </Typography>
                                <Typography sx={{ color: 'white' }}>
                                    {selectedReport.reason}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#71717a' }}>
                                    Status
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip
                                        label={selectedReport.status}
                                        color={getStatusColor(selectedReport.status) as any}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#71717a' }}>
                                    Reported On
                                </Typography>
                                <Typography sx={{ color: 'white' }}>
                                    {new Date(selectedReport.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #27272a', p: 2 }}>
                    <Button
                        onClick={() => setViewDialogOpen(false)}
                        sx={{ color: '#a1a1aa' }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{
                    sx: {
                        bgcolor: '#18181b',
                        border: '1px solid #27272a',
                    }
                }}
            >
                <DialogTitle sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AlertTriangle size={24} color="#ef4444" />
                    Delete Reported Post
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: '#a1a1aa' }}>
                        Are you sure you want to delete this post? This action cannot be undone.
                        All reports for this post will be marked as resolved.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #27272a', p: 2 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={actionLoading}
                        sx={{ color: '#a1a1aa' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeletePost}
                        disabled={actionLoading}
                        sx={{
                            bgcolor: '#ef4444',
                            color: 'white',
                            '&:hover': { bgcolor: '#dc2626' }
                        }}
                    >
                        {actionLoading ? <CircularProgress size={20} /> : 'Delete Post'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
