import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
const FeatureCard = ({ icon, title, text, bg }: { icon: React.ReactNode; title: string; text: string; bg: string }) => {
  return (
    <Paper sx={{ textAlign: 'center', p: 4, borderRadius: 3, border: '1px solid #ffe4cc', bgcolor: '#fff7ed' }}>
      <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>{icon}</Box>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{text}</Typography>
    </Paper>
  );
}

export default FeatureCard;