import { Box, Typography, Chip } from '@mui/material';
import { useSearchStore } from '../../store/searchStore';
interface TripPostContentProps {
    title: string;
    duration: string;
    description: string;
    activities: string[];
    maxLines?: number;
    showDescription?: boolean;
}

export default function TripPostContent({ title, duration, description, activities, maxLines = 3, showDescription = true }: TripPostContentProps) {
    const { triggerSearch } = useSearchStore();
    const handleActivityClick = (activity: string) => {
        triggerSearch(activity)
    };
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
            {showDescription && (
                <Typography
                    variant="body1"
                    paragraph
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: maxLines,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {description}
                </Typography>
            )}

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
                        onClick={(e) => { e.stopPropagation(), handleActivityClick(activity) }}
                    />
                ))}
            </Box>
        </>
    );
}