import React from 'react';
import { Box, Container, Typography, Paper, Divider } from '@mui/material';
import Navbar from './Navbar';

const PrivacyPolicy: React.FC = () => {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4 }}>
                    <Typography variant="h3" component="h1" sx={{ mb: 4, fontWeight: 800, color: '#1f2937' }}>
                        Privacy Policy
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 4, color: '#6b7280' }}>
                        Last updated: November 24, 2025
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <section>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#374151' }}>
                                1. Information We Collect
                            </Typography>
                            <Typography paragraph sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                                We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), delivery notes, and other information you choose to provide.
                            </Typography>
                        </section>

                        <Divider />

                        <section>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#374151' }}>
                                2. How We Use Your Information
                            </Typography>
                            <Typography paragraph sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                                We use the information we collect about you to:
                            </Typography>
                            <ul style={{ color: '#4b5563', lineHeight: 1.7, paddingLeft: '1.5rem' }}>
                                <li>Provide, maintain, and improve our Services;</li>
                                <li>Process transactions and send you related information;</li>
                                <li>Send you technical notices, updates, security alerts, and support and administrative messages;</li>
                                <li>Respond to your comments, questions, and requests;</li>
                                <li>Communicate with you about products, services, offers, promotions, rewards, and events offered by Odyssey and others;</li>
                                <li>Monitor and analyze trends, usage, and activities in connection with our Services;</li>
                                <li>Personalize and improve the Services and provide advertisements, content, or features that match user profiles or interests.</li>
                            </ul>
                        </section>

                        <Divider />

                        <section>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#374151' }}>
                                3. Sharing of Information
                            </Typography>
                            <Typography paragraph sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                                We may share information about you as follows or as otherwise described in this Privacy Policy:
                            </Typography>
                            <ul style={{ color: '#4b5563', lineHeight: 1.7, paddingLeft: '1.5rem' }}>
                                <li>With other users, e.g., if you use our social features;</li>
                                <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf;</li>
                                <li>In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation, or legal process;</li>
                                <li>If we believe your actions are inconsistent with the spirit or language of our user agreements or policies, or to protect the rights, property, and safety of Odyssey or others.</li>
                            </ul>
                        </section>

                        <Divider />

                        <section>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#374151' }}>
                                4. Security
                            </Typography>
                            <Typography paragraph sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                                Odyssey takes reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                            </Typography>
                        </section>

                        <Divider />

                        <section>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#374151' }}>
                                5. Contact Us
                            </Typography>
                            <Typography paragraph sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                                If you have any questions about this Privacy Policy, please contact us at support@odyssey.com.
                            </Typography>
                        </section>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default PrivacyPolicy;
