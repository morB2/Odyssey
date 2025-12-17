import Grid from '@mui/material/Grid';
import { Card, Typography } from '@mui/material';
import { Plane, LocateIcon, Calendar } from 'lucide-react';

export interface TravelStatistics {
    totalTrips: number;
    countries: number;
    cities: number;
    placesVisited: number;
    yearsOfTravel: number;
}

interface TravelStatsProps {
    stats: TravelStatistics;
}

export default function TravelStats({ stats }: TravelStatsProps) {
    // Provide default values if stats is undefined
    const safeStats = stats || {
        totalTrips: 0,
        placesVisited: 0,
        yearsOfTravel: 0
    };

    const statCards = [
        { label: 'Total Trips', value: safeStats.totalTrips, icon: <Plane/>},
        { label: 'Places Visited', value: safeStats.placesVisited, icon: <LocateIcon/>},
        { label: 'Years Traveling', value: safeStats.yearsOfTravel, icon: <Calendar/>}
    ];

    return (
        <Grid container spacing={2}>
            {statCards.map((stat) => (
                <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                    <Card
                        sx={{
                            textAlign: 'center',
                            p: 3,
                            borderRadius: 3,
                            boxShadow: 2,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4
                            }
                        }}
                    >
                        <Typography variant="h3" sx={{ mb: 1 }}>
                            {stat.icon}
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                mb: 0.5
                            }}
                        >
                            {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                            {stat.label}
                        </Typography>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}
