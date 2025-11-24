import React from 'react';
import { Box, Container, Typography, Paper, Divider } from '@mui/material';
import Navbar from './Navbar';

const TermsOfService: React.FC = () => {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4 }}>
                    <Typography variant="h3" component="h1" sx={{ mb: 4, fontWeight: 800, color: '#1f2937' }}>
                        Terms of Service
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 4, color: '#6b7280' }}>
                        Last updated: November 24, 2025
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <section>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#374151' }}>
                                1. Acceptance of Terms
                            </Typography>
                            <Typography paragraph sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                                By accessing and using Odyssey ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                            </Typography>
                        </section>

                        <Divider />

                        <section>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#374151' }}>
                                2. Use License
                            </Typography>
                            <Typography paragraph sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                                Permission is granted to temporarily download one copy of the materials (information or software) on Odyssey's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                            </Typography>
                            <ul style={{ color: '#4b5563', lineHeight: 1.7, paddingLeft: '1.5rem' }}>
                                <li>modify or copy the materials;</li>
                                <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                                <li>attempt to decompile or reverse engineer any software contained on Odyssey's website;</li>
                                <li>remove any copyright or other proprietary notations from the materials; or</li>
                                <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                            </ul>
                        </section>

                        <Divider />

                        <section>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#374151' }}>
                                3. User Account
                            </Typography>
                            <Typography paragraph sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                                To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password.
                            </Typography>
                        </section>

                        <Divider />

                        <section>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#374151' }}>
                                4. Content
                            </Typography>
                            <Typography paragraph sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                                Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                            </Typography>
                        </section>

                        <Divider />

                        <section>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#374151' }}>
                                5. Termination
                            </Typography>
                            <Typography paragraph sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                                We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                            </Typography>
                        </section>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default TermsOfService;
