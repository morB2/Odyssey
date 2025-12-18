import { useState, useEffect } from 'react';
import {Box,Typography,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,IconButton,Tooltip,Chip,
    Dialog,DialogTitle,DialogContent,DialogActions,Button,CircularProgress
} from '@mui/material';
import { Trash2, MailOpen, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { fetchContactMessages, markMessageAsRead, deleteContactMessage } from '../../services/admin.service';

interface ContactMessage {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export default function ContactMessages() {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const data = await fetchContactMessages(1, 100); // Fetching 100 for now, add pagination later if needed
            setMessages(data.messages);
        } catch (error) {
            toast.error(t('admin.messages.errorLoading'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewMessage = async (msg: ContactMessage) => {
        setSelectedMessage(msg);
        setOpenDialog(true);
        if (!msg.read) {
            try {
                await markMessageAsRead(msg._id);
                setMessages(prev =>
                    prev.map(m => (m._id === msg._id ? { ...m, read: true } : m))
                );
            } catch (error) {
                console.error("Error marking as read", error);
            }
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(t('admin.messages.confirmDelete'))) {
            try {
                await deleteContactMessage(id);
                setMessages(prev => prev.filter(m => m._id !== id));
                toast.success(t('admin.messages.deleteSuccess'));
                if (selectedMessage?._id === id) {
                    setOpenDialog(false);
                }
            } catch (error) {
                toast.error(t('admin.messages.deleteError'));
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'white' }}>
                {t('admin.contactMessages')}
            </Typography>

            <TableContainer component={Paper} sx={{ bgcolor: '#18181b', borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#a1a1aa' }}>{t('admin.messages.date')}</TableCell>
                            <TableCell sx={{ color: '#a1a1aa' }}>{t('admin.messages.from')}</TableCell>
                            <TableCell sx={{ color: '#a1a1aa' }}>{t('admin.messages.subject')}</TableCell>
                            <TableCell sx={{ color: '#a1a1aa' }}>{t('admin.messages.status')}</TableCell>
                            <TableCell sx={{ color: '#a1a1aa' }} align="right">{t('admin.actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {messages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ color: 'white', py: 4 }}>
                                    {t('admin.messages.noMessages')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            messages.map((msg) => (
                                <TableRow
                                    key={msg._id}
                                    hover
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                                    }}
                                    onClick={() => handleViewMessage(msg)}
                                >
                                    <TableCell sx={{ color: 'white' }}>
                                        {format(new Date(msg.createdAt), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell sx={{ color: 'white' }}>
                                        {msg.firstName} {msg.lastName}
                                        <Typography variant="caption" display="block" sx={{ color: '#71717a' }}>
                                            {msg.email}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: 'white' }}>
                                        {msg.subject}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={msg.read ? t('admin.messages.read') : t('admin.messages.unread')}
                                            size="small"
                                            color={msg.read ? "default" : "primary"}
                                            variant={msg.read ? "outlined" : "filled"}
                                            sx={{
                                                color: msg.read ? '#a1a1aa' : 'white',
                                                borderColor: msg.read ? '#3f3f46' : undefined
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                            <Tooltip title={t('admin.messages.view')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewMessage(msg);
                                                    }}
                                                    sx={{ color: '#a1a1aa' }}
                                                >
                                                    <Eye size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('admin.messages.delete')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleDelete(msg._id, e)}
                                                    sx={{ color: '#ef4444' }}
                                                >
                                                    <Trash2 size={18} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Message Detail Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { bgcolor: '#18181b', color: 'white' }
                }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #27272a' }}>
                    {selectedMessage?.subject}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: '#a1a1aa' }}>{t('admin.messages.from')}</Typography>
                        <Typography variant="body1">
                            {selectedMessage?.firstName} {selectedMessage?.lastName} &lt;{selectedMessage?.email}&gt;
                        </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: '#a1a1aa' }}>{t('admin.messages.date')}</Typography>
                        <Typography variant="body1">
                            {selectedMessage && format(new Date(selectedMessage.createdAt), 'PPpp')}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#a1a1aa', mb: 1 }}>{t('admin.messages.message')}</Typography>
                        <Paper sx={{ p: 2, bgcolor: '#27272a', color: 'white' }} elevation={0}>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                {selectedMessage?.message}
                            </Typography>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #27272a', p: 2 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ color: '#a1a1aa' }}>{t('admin.messages.close')}</Button>
                    <Button
                        onClick={(e) => selectedMessage && handleDelete(selectedMessage._id, e as any)}
                        color="error"
                        startIcon={<Trash2 size={16} />}
                    >
                        {t('admin.messages.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
