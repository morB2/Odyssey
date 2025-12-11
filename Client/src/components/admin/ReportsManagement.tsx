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
import { useTranslation } from 'react-i18next';
import ReportsAnalytics from './ReportsAnalytics';

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
        description?: string;
        images?: string[];
        activities?: string[];
        notes?: string;
        optimizedRoute?: {
            ordered_route: Array<{
                name: string;
                lat: number;
                lon: number;
            }>;
        };
        user?: {
            firstName: string;
            lastName: string;
            username: string;
        };
        createdAt?: string;
    };
    reason: string;
    status: 'pending' | 'reviewed' | 'resolved';
    createdAt: string;
}

export default function ReportsManagement() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(0); // 0 = Reports, 1 = Analytics
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
            setError(err.response?.data?.error || t('admin.failedToFetchReports'));
            toast.error(t('admin.failedToFetchReports'));
        } finally {
            setLoading(false);
        }
    };

    const handleDismissReport = async (reportId: string) => {
        try {
            setActionLoading(true);
            await updateReportStatus(reportId, 'reviewed');
            toast.success(t('admin.reportDismissed'));
            fetchReports();
        } catch (err: any) {
            toast.error(err.response?.data?.error || t('admin.failedToDismissReport'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeletePost = async () => {
        if (!selectedReport) return;

        try {
            setActionLoading(true);
            await deleteReportedPost(selectedReport.reportedTrip._id);
            toast.success(t('admin.postDeletedSuccessfully'));
            setDeleteDialogOpen(false);
            setSelectedReport(null);
            fetchReports();
        } catch (err: any) {
            toast.error(err.response?.data?.error || t('admin.failedToDeletePost'));
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
                    <Tab label={t('admin.reportsTab')} />
                    <Tab label={t('admin.analyticsTab')} />
                </Tabs>
            </Box>

            {/* Reports Tab Content */}
            {activeTab === 0 && (
                <>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 500 }}>
                            {t('admin.reportsManagement')}
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
                                label={t('admin.all')}
                                sx={{
                                    color: '#a1a1aa',
                                    '&.Mui-selected': { color: '#ea580c' }
                                }}
                            />
                            <Tab
                                value="pending"
                                label={t('admin.pending')}
                                sx={{
                                    color: '#a1a1aa',
                                    '&.Mui-selected': { color: '#ea580c' }
                                }}
                            />
                            <Tab
                                value="reviewed"
                                label={t('admin.reviewed')}
                                sx={{
                                    color: '#a1a1aa',
                                    '&.Mui-selected': { color: '#ea580c' }
                                }}
                            />
                            <Tab
                                value="resolved"
                                label={t('admin.resolved')}
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
                                    <TableCell sx={{ color: '#a1a1aa', fontWeight: 600 }}>{t('admin.reporter')}</TableCell>
                                    <TableCell sx={{ color: '#a1a1aa', fontWeight: 600 }}>{t('admin.postTitle')}</TableCell>
                                    <TableCell sx={{ color: '#a1a1aa', fontWeight: 600 }}>{t('admin.reason')}</TableCell>
                                    <TableCell sx={{ color: '#a1a1aa', fontWeight: 600 }}>{t('admin.status')}</TableCell>
                                    <TableCell sx={{ color: '#a1a1aa', fontWeight: 600 }}>{t('admin.date')}</TableCell>
                                    <TableCell sx={{ color: '#a1a1aa', fontWeight: 600 }}>{t('admin.actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredReports.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#71717a' }}>
                                            {t('admin.noReportsFound')}
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
                                                {report.reportedTrip?.title || t('admin.deletedPost')}
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
                                                        {t('admin.view')}
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
                                                                {t('admin.dismiss')}
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
                                                                {t('admin.deletePost')}
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
                        maxWidth="md"
                        fullWidth
                        PaperProps={{
                            sx: {
                                bgcolor: '#18181b',
                                border: '1px solid #27272a',
                            }
                        }}
                    >
                        <DialogTitle sx={{ color: 'white', borderBottom: '1px solid #27272a' }}>
                            {t('admin.reportDetails')}
                        </DialogTitle>
                        <DialogContent sx={{ mt: 2 }}>
                            {selectedReport && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {/* Reporter Info */}
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 600 }}>
                                            {t('admin.reporter').toUpperCase()}
                                        </Typography>
                                        <Typography sx={{ color: 'white' }}>
                                            {selectedReport.reporter.firstName} {selectedReport.reporter.lastName}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#71717a' }}>
                                            {selectedReport.reporter.email}
                                        </Typography>
                                    </Box>

                                    {/* Report Reason */}
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 600 }}>
                                            {t('admin.reportReason').toUpperCase()}
                                        </Typography>
                                        <Typography sx={{ color: 'white', mt: 0.5 }}>
                                            {selectedReport.reason}
                                        </Typography>
                                    </Box>

                                    {/* Report Status */}
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 600 }}>
                                            {t('admin.status').toUpperCase()}
                                        </Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            <Chip
                                                label={selectedReport.status}
                                                color={getStatusColor(selectedReport.status) as any}
                                                size="small"
                                            />
                                        </Box>
                                    </Box>

                                    {/* Reported Date */}
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 600 }}>
                                            {t('admin.reportedOn').toUpperCase()}
                                        </Typography>
                                        <Typography sx={{ color: 'white', mt: 0.5 }}>
                                            {new Date(selectedReport.createdAt).toLocaleString()}
                                        </Typography>
                                    </Box>

                                    {/* Divider */}
                                    <Box sx={{ borderTop: '2px solid #27272a', my: 1 }} />

                                    {/* Post Content Section */}
                                    <Typography variant="h6" sx={{ color: '#ea580c', fontWeight: 600 }}>
                                        {t('admin.reportedPostContent')}
                                    </Typography>

                                    {selectedReport.reportedTrip ? (
                                        <>
                                            {/* Post Author */}
                                            {selectedReport.reportedTrip.user && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 600 }}>
                                                        {t('admin.postAuthor').toUpperCase()}
                                                    </Typography>
                                                    <Typography sx={{ color: 'white', mt: 0.5 }}>
                                                        {selectedReport.reportedTrip.user.firstName} {selectedReport.reportedTrip.user.lastName}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#71717a' }}>
                                                        @{selectedReport.reportedTrip.user.username}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Post Title */}
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 600 }}>
                                                    {t('admin.title').toUpperCase()}
                                                </Typography>
                                                <Typography sx={{ color: 'white', mt: 0.5, fontSize: '1.1rem', fontWeight: 500 }}>
                                                    {selectedReport.reportedTrip.title}
                                                </Typography>
                                            </Box>

                                            {/* Post Description */}
                                            {selectedReport.reportedTrip.description && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 600 }}>
                                                        {t('admin.description').toUpperCase()}
                                                    </Typography>
                                                    <Typography sx={{ color: 'white', mt: 0.5, whiteSpace: 'pre-wrap' }}>
                                                        {selectedReport.reportedTrip.description}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Post Images */}
                                            {selectedReport.reportedTrip.images && selectedReport.reportedTrip.images.length > 0 && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 600 }}>
                                                        {t('admin.images').toUpperCase()} ({selectedReport.reportedTrip.images.length})
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                                        {selectedReport.reportedTrip.images.map((img, idx) => (
                                                            <Box
                                                                key={idx}
                                                                component="img"
                                                                src={img}
                                                                alt={`Post image ${idx + 1}`}
                                                                sx={{
                                                                    width: 150,
                                                                    height: 150,
                                                                    objectFit: 'cover',
                                                                    borderRadius: 1,
                                                                    border: '1px solid #27272a'
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* Activities */}
                                            {selectedReport.reportedTrip.activities && selectedReport.reportedTrip.activities.length > 0 && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 600 }}>
                                                        {t('admin.activities').toUpperCase()}
                                                    </Typography>
                                                    <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selectedReport.reportedTrip.activities.map((activity, idx) => (
                                                            <Chip
                                                                key={idx}
                                                                label={activity}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: '#27272a',
                                                                    color: '#ea580c',
                                                                    border: '1px solid #3f3f46'
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* Notes */}
                                            {selectedReport.reportedTrip.notes && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 600 }}>
                                                        {t('admin.notes').toUpperCase()}
                                                    </Typography>
                                                    <Typography sx={{ color: 'white', mt: 0.5, whiteSpace: 'pre-wrap' }}>
                                                        {selectedReport.reportedTrip.notes}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Route Locations */}
                                            {selectedReport.reportedTrip.optimizedRoute?.ordered_route &&
                                                selectedReport.reportedTrip.optimizedRoute.ordered_route.length > 0 && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 600 }}>
                                                            {t('admin.routeLocations').toUpperCase()} ({selectedReport.reportedTrip.optimizedRoute.ordered_route.length})
                                                        </Typography>
                                                        <Box sx={{ mt: 0.5 }}>
                                                            {selectedReport.reportedTrip.optimizedRoute.ordered_route.map((location, idx) => (
                                                                <Typography key={idx} sx={{ color: '#a1a1aa', fontSize: '0.875rem' }}>
                                                                    {idx + 1}. {location.name}
                                                                </Typography>
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                            {/* Post Created Date */}
                                            {selectedReport.reportedTrip.createdAt && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 600 }}>
                                                        {t('admin.postCreated').toUpperCase()}
                                                    </Typography>
                                                    <Typography sx={{ color: 'white', mt: 0.5 }}>
                                                        {new Date(selectedReport.reportedTrip.createdAt).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </>
                                    ) : (
                                        <Typography sx={{ color: '#71717a', fontStyle: 'italic' }}>
                                            {t('admin.postDeleted')}
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ borderTop: '1px solid #27272a', p: 2 }}>
                            <Button
                                onClick={() => setViewDialogOpen(false)}
                                sx={{ color: '#a1a1aa' }}
                            >
                                {t('admin.close')}
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
                            {t('admin.deleteReportedPost')}
                        </DialogTitle>
                        <DialogContent>
                            <Typography sx={{ color: '#a1a1aa' }}>
                                {t('admin.deleteReportedPostConfirm')}
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ borderTop: '1px solid #27272a', p: 2 }}>
                            <Button
                                onClick={() => setDeleteDialogOpen(false)}
                                disabled={actionLoading}
                                sx={{ color: '#a1a1aa' }}
                            >
                                {t('admin.cancel')}
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
                                {actionLoading ? <CircularProgress size={20} /> : t('admin.deletePost')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}

            {/* Analytics Tab Content */}
            {activeTab === 1 && (
                <ReportsAnalytics />
            )}
        </Box>
    );
}
