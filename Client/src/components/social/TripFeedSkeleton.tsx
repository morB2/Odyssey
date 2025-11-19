import { Card, CardContent, Box, Skeleton } from '@mui/material';

export default function TripFeedSkeleton() {
    return (
        <Card
            sx={{
                maxWidth: { xs: '100%', sm: 600, md: 700 },
                mx: 'auto',
                mb: 3,
                borderRadius: '16px',
                boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                overflow: 'hidden',
            }}
        >
            {/* Header Skeleton */}
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box>
                            <Skeleton variant="text" width={120} height={24} />
                            <Skeleton variant="text" width={80} height={20} />
                        </Box>
                    </Box>
                    <Skeleton variant="rounded" width={80} height={32} />
                </Box>
            </CardContent>

            {/* Image Skeleton */}
            <Skeleton variant="rectangular" width="100%" height={300} />

            {/* Actions Skeleton */}
            <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="circular" width={24} height={24} />
            </Box>

            {/* Content Skeleton */}
            <CardContent>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="80%" />
            </CardContent>
        </Card>
    );
}
