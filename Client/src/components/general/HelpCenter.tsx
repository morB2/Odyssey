import React from 'react';
import { Box, Container, Typography, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Navbar from './Navbar';
import { useTranslation } from 'react-i18next';

const HelpCenter: React.FC = () => {
    const { t } = useTranslation();
    const faqs = t('HelpCenter.faqs', { returnObjects: true }) as Array<{ question: string, answer: string }>;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <HelpCircle size={48} color="#d97706" style={{ marginBottom: '1rem' }} />
                    <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 800, color: '#1f2937' }}>
                        {t('HelpCenter.title')}
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#6b7280', maxWidth: '600px', mx: 'auto' }}>
                        {t('HelpCenter.subtitle')}
                    </Typography>
                </Box>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4 }}>
                    <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: '#374151' }}>
                        {t('HelpCenter.faqTitle')}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {faqs.map((faq, index) => (
                            <Accordion key={index} elevation={0} sx={{ border: '1px solid #e5e7eb', '&:before': { display: 'none' }, borderRadius: '8px !important' }}>
                                <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ px: 3 }}>
                                    <Typography sx={{ fontWeight: 600, color: '#4b5563' }}>{faq.question}</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ px: 3, pb: 3 }}>
                                    <Typography sx={{ color: '#6b7280', lineHeight: 1.6 }}>{faq.answer}</Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                </Paper>

                <Box sx={{ mt: 6, textAlign: 'center' }}>
                    <Typography sx={{ color: '#6b7280' }}>
                        {t('HelpCenter.stillHaveQuestions')} <a href="/contact" style={{ color: '#d97706', textDecoration: 'none', fontWeight: 600 }}>{t('HelpCenter.contactSupport')}</a>
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default HelpCenter;
