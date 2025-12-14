import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Grid, TextField, Button, CircularProgress } from '@mui/material';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../services/httpService';

const Contact: React.FC = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const { firstName, lastName, email, subject, message } = formData;
        if (!firstName || !lastName || !email || !subject || !message) {
            toast.error(t('allFieldsRequired') || "All fields are required");
            return;
        }

        setLoading(true);
        try {
            await api.post('/contact', formData);
            toast.success(t('messageSentSuccess') || "Message sent successfully");
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(t('messageSentFail') || "Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 800, color: '#1f2937' }}>
                        {t('contact.getInTouch')}
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#6b7280', maxWidth: '600px', mx: 'auto' }}>
                        {t('contact.haveQuestions')}
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Paper elevation={0} sx={{ p: 4, height: '100%', borderRadius: 4, bgcolor: '#1f2937', color: 'white' }}>
                            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>{t('contact.contactInformation')}</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Mail style={{ color: '#d97706' }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 0.5 }}>{t('contact.email')}</Typography>
                                        <Typography>support@odyssey.com</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Phone style={{ color: '#d97706' }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 0.5 }}>{t('contact.phone')}</Typography>
                                        <Typography>+1 (555) 123-4567</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <MapPin style={{ color: '#d97706' }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 0.5 }}>{t('contact.office')}</Typography>
                                        <Typography>
                                            123 Adventure Lane<br />
                                            Travel City, TC 90210<br />
                                            United States
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 7 }}>
                        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
                            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: '#374151' }}>{t('contact.sendUsMessage')}</Typography>
                            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label={t('contact.firstName')}
                                            variant="outlined"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label={t('contact.lastName')}
                                            variant="outlined"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                </Grid>
                                <TextField
                                    fullWidth
                                    label={t('contact.emailAddress')}
                                    variant="outlined"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <TextField
                                    fullWidth
                                    label={t('contact.subject')}
                                    variant="outlined"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                />
                                <TextField
                                    fullWidth
                                    label={t('contact.message')}
                                    variant="outlined"
                                    multiline
                                    rows={4}
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                />

                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send size={18} />}
                                    sx={{
                                        bgcolor: '#d97706',
                                        '&:hover': { bgcolor: '#b45309' },
                                        alignSelf: 'flex-start',
                                        mt: 2,
                                        px: 4
                                    }}
                                >
                                    {loading ? t('sending') : t('contact.sendMessage')}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Contact;
