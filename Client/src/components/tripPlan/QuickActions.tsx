import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { Calendar, DollarSign, MapPin } from 'lucide-react';

interface QuickActionsProps {
    onQuickAction: (action: string) => void;
}

export default function QuickActions({ onQuickAction }: QuickActionsProps) {
    return (
        <Box sx={{ px: 3, py: 2, borderTop: '1px solid #f5f5f5', bgcolor: '#fffaf5' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                Quick suggestions:
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
                <Chip
                    label="Beach vacation"
                    icon={<MapPin size={14} />}
                    variant="outlined"
                    onClick={() => onQuickAction('I want a relaxing beach vacation')}
                    sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }}
                />
                <Chip
                    label="Adventure trip"
                    icon={<MapPin size={14} />}
                    variant="outlined"
                    onClick={() => onQuickAction('I want an adventure trip with hiking and exploring')}
                    sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }}
                />
                <Chip
                    label="Cultural experience"
                    icon={<MapPin size={14} />}
                    variant="outlined"
                    onClick={() => onQuickAction('Cultural experience with local food tours')}
                    sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }}
                />
                <Chip
                    label="1 week"
                    icon={<Calendar size={14} />}
                    variant="outlined"
                    onClick={() => onQuickAction('1 week trip')}
                    sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }}
                />
                <Chip
                    label="Moderate budget"
                    icon={<DollarSign size={14} />}
                    variant="outlined"
                    onClick={() => onQuickAction('Moderate budget')}
                    sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }}
                />
            </Stack>
        </Box>
    );
}