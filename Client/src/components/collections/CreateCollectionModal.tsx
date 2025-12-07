import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, FormControlLabel, Switch, Box,
    Typography, Checkbox, Avatar, List, ListItem, ListItemButton, ListItemAvatar, ListItemText,
    CircularProgress
} from '@mui/material';
import { getTrips } from '../../services/profile.service.tsx';
import { createCollection, updateCollection } from '../../services/collection.service';
import type { Collection, Trip, UserProfile } from '../user/types';
import { useUserStore } from '../../store/userStore';
import { toast } from 'react-toastify';

interface CreateCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (collection: Collection) => void;
    existingCollection?: Collection | null;
}

export function CreateCollectionModal({ isOpen, onClose, onSuccess, existingCollection }: CreateCollectionModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(true);
    const [selectedTrips, setSelectedTrips] = useState<string[]>([]);

    // Trip selection state
    const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { user } = useUserStore();

    useEffect(() => {
        if (isOpen) {
            if (existingCollection) {
                setName(existingCollection.name);
                setDescription(existingCollection.description || '');
                setIsPrivate(existingCollection.isPrivate);
                setSelectedTrips(existingCollection.trips.map(t => typeof t === 'string' ? t : t._id));
            } else {
                setName('');
                setDescription('');
                setIsPrivate(true);
                setSelectedTrips([]);
            }
            fetchUserTrips();
        }
    }, [isOpen, existingCollection]);

    const fetchUserTrips = async () => {
        if (!user?._id) return;
        setLoadingTrips(true);
        try {
            // Fetch all user trips (pagination might be needed later, simplified for now)
            const data = await getTrips(user._id, 1, 100);
            setAvailableTrips(data.trips || []);
        } catch (error) {
            console.error("Failed to fetch trips", error);
            toast.error("Could not load your trips");
        } finally {
            setLoadingTrips(false);
        }
    };

    const handleToggleTrip = (tripId: string) => {
        setSelectedTrips(prev =>
            prev.includes(tripId)
                ? prev.filter(id => id !== tripId)
                : [...prev, tripId]
        );
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name,
                description,
                isPrivate,
                trips: selectedTrips // Backend expects array of IDs
            };

            let result;
            if (existingCollection) {
                result = await updateCollection(existingCollection._id, payload);
                toast.success("Collection updated!");
            } else {
                result = await createCollection(payload);
                toast.success("Collection created!");
            }
            onSuccess(result);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save collection");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{existingCollection ? "Edit Collection" : "New Collection"}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    <TextField
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <FormControlLabel
                        control={<Switch checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />}
                        label="Private Collection"
                    />

                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Select Trips ({selectedTrips.length})
                    </Typography>

                    <Box sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        {loadingTrips ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
                        ) : availableTrips.length === 0 ? (
                            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No trips found</Box>
                        ) : (
                            <List dense>
                                {availableTrips.map(trip => (
                                    <ListItem
                                        key={trip._id}
                                        disablePadding
                                    >
                                        <ListItemButton onClick={() => handleToggleTrip(trip._id)}>
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={trip.images?.[0] || trip.user.avatar}
                                                    variant="rounded"
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={trip.title || "Untitled Trip"}
                                                secondary={trip.location}
                                            />
                                            <Checkbox
                                                edge="end"
                                                checked={selectedTrips.includes(trip._id)}
                                                disableRipple
                                                tabIndex={-1}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
                    {submitting ? "Saving..." : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
