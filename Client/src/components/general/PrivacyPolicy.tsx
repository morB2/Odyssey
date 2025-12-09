import React from 'react';
import { Box, Container, Typography, Paper, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy: React.FC = () => {
    const { t } = useTranslation();
    const sections = t('PrivacyPolicy.sections', { returnObjects: true }) as Array<{ title: string, content: string, list?: string[] }>;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4 }}>
                    <Typography variant="h3" component="h1" sx={{ mb: 4, fontWeight: 800, color: '#1f2937' }}>
                        {t('PrivacyPolicy.title')}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 4, color: '#6b7280' }}>
                        {t('PrivacyPolicy.lastUpdated')}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {sections.map((section, index) => (
                            <React.Fragment key={index}>
                                <section>
                                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#374151' }}>
                                        {section.title}
                                    </Typography>
                                    <Typography paragraph sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                                        {section.content}
                                    </Typography>
                                    {section.list && (
                                        <ul style={{ color: '#4b5563', lineHeight: 1.7, paddingLeft: '1.5rem' }}>
                                            {section.list.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    )}
                                </section>
                                {index < sections.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default PrivacyPolicy;
