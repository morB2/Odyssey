import { useState } from "react";
import { Box, Typography, Chip, Grid, Collapse, IconButton } from "@mui/material";
import { Lock, Globe, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import type { Collection, Trip } from "../user/types";
import TripPostAdapter from "../user/TripPostAdapter";

interface ExpandableCollectionProps {
    collection: Collection;
    onTripClick?: (trip: Trip) => void;
}

export function CollectionDetails({ collection }: ExpandableCollectionProps) {
    const [expanded, setExpanded] = useState(false);

    if (!collection) return null;

    const formattedDate = collection.createdAt ? new Date(collection.createdAt).toLocaleDateString() : '';

    return (
        <Box sx={{ border: '1px solid #e5e5e5', borderRadius: 3, mb: 3, overflow: 'hidden', backgroundColor: '#fff' }}>
            
            {/* Header */}
            <Box
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, cursor: 'pointer' }}
                onClick={() => setExpanded(!expanded)}
            >
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{collection.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                        <Chip
                            icon={collection.isPrivate ? <Lock size={14} /> : <Globe size={14} />}
                            label={collection.isPrivate ? "Private" : "Public"}
                            size="small"
                            variant="outlined"
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                            <Calendar size={12} />
                            <span>Created {formattedDate}</span>
                        </Box>
                    </Box>
                </Box>

                <IconButton size="small">
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </IconButton>
            </Box>

            {/* Trips Grid */}
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2, borderTop: '1px solid #e5e5e5' }}>
                    <Grid container spacing={2}>
                        {collection.trips && collection.trips.length > 0 ? (
                            collection.trips.map((trip) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={trip._id || trip.id}>
                                    <TripPostAdapter
                                        trip={trip}
                                        onEdit={() => {}}
                                        onDelete={() => {}}
                                    />
                                </Grid>
                            ))
                        ) : (
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                    <Typography>No trips in this collection yet.</Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Collapse>
        </Box>
    );
}
