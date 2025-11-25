import React from 'react';
import { Box, Container, Typography, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Navbar from './Navbar';

const HelpCenter: React.FC = () => {
    const faqs = [
        {
            question: "How do I create a new trip?",
            answer: "To create a new trip, simply click on the 'Plan Your Trip' button on the homepage or navigate to the 'Plan Trip' section. You'll be guided through a few steps to set your preferences, budget, and dates."
        },
        {
            question: "Is Odyssey free to use?",
            answer: "Yes, Odyssey is currently free to use for all travelers. You can create itineraries, share them with friends, and explore the community feed without any cost."
        },
        {
            question: "Can I share my itinerary with friends?",
            answer: "Absolutely! Once you've created a trip, you can share it by clicking the 'Share' button. You can also invite friends to collaborate on the trip planning."
        },
        {
            question: "How do I report inappropriate content?",
            answer: "If you see content that violates our community guidelines, you can report it by clicking the 'Report' option available on every post and comment."
        },
        {
            question: "Can I use Odyssey offline?",
            answer: "Currently, Odyssey requires an internet connection to access all features, including AI route planning and social feeds. We are working on offline capabilities for saved itineraries."
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <HelpCircle size={48} color="#d97706" style={{ marginBottom: '1rem' }} />
                    <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 800, color: '#1f2937' }}>
                        Help Center
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#6b7280', maxWidth: '600px', mx: 'auto' }}>
                        Find answers to common questions and learn how to get the most out of Odyssey.
                    </Typography>
                </Box>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4 }}>
                    <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: '#374151' }}>
                        Frequently Asked Questions
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
                        Still have questions? <a href="/contact" style={{ color: '#d97706', textDecoration: 'none', fontWeight: 600 }}>Contact Support</a>
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default HelpCenter;
