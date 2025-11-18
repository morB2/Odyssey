import { Box, Typography, Chip } from '@mui/material';

interface TripPostContentProps {
    title: string;
    duration: string;
    description: string;
    activities: string[];
}

export default function TripPostContent({ title, duration, description, activities }: TripPostContentProps) {
    return (
        <>
            <Box mb={1.5}>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {duration}
                </Typography>
            </Box>
            <Typography variant="body1" paragraph>
                {description}
            </Typography>

            {/* Hashtags from activities */}
            <Box display="flex" flexWrap="wrap" gap={1}>
                {activities.map((activity, index) => (
                    <Chip
                        key={index}
                        label={`#${activity.toLowerCase().replace(/\s+/g, '')}`}
                        size="small"
                        clickable
                        color="primary"
                        variant="outlined"
                    />
                ))}
            </Box>
        </>
    );
}