import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, FormControlLabel, Switch, Box,
    Typography, Checkbox, Avatar, List, ListItem, ListItemButton, ListItemAvatar, ListItemText,
    CircularProgress, IconButton, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { getTrips } from '../../services/profile.service.tsx';
import { createCollection, updateCollection } from '../../services/collection.service';
import type { Collection, Trip } from '../user/types';
import { useUserStore } from '../../store/userStore';
import { toast } from 'react-toastify';

// DnD Imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
   type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CreateCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (collection: Collection) => void;
    existingCollection?: Collection | null;
}

// Sortable Item Component
interface SortableTripItemProps {
    trip: Trip;
    onRemove: (id: string) => void;
}

function SortableTripItem({ trip, onRemove }: SortableTripItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: trip._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <ListItem
            ref={setNodeRef}
            style={style}
            secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => onRemove(trip._id)}>
                    <DeleteIcon />
                </IconButton>
            }
            sx={{
                bgcolor: 'background.paper',
                mb: 1,
                border: '1px solid #eee',
                borderRadius: 1,
            }}
        >
            <Box
                {...attributes}
                {...listeners}
                sx={{ mr: 2, display: 'flex', alignItems: 'center', cursor: 'grab', color: 'text.secondary' }}
            >
                <DragIndicatorIcon />
            </Box>
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
        </ListItem>
    );
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

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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
            // Fetch all user trips
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
        setSelectedTrips(prev => {
            if (prev.includes(tripId)) {
                return prev.filter(id => id !== tripId);
            } else {
                return [...prev, tripId];
            }
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSelectedTrips((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
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
                trips: selectedTrips // Order is preserved here
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

    // Derived state for sorting
    // We need the full trip objects for the selected IDs, in the order of selectedTrips
    const selectedTripObjects = selectedTrips
        .map(id => availableTrips.find(t => t._id === id))
        .filter((t): t is Trip => !!t);

    const unselectedTrips = availableTrips.filter(t => !selectedTrips.includes(t._id));

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{existingCollection ? "Edit Collection" : "New Collection"}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            required
                        />
                        <FormControlLabel
                            control={<Switch checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />}
                            label="Private"
                            sx={{ whiteSpace: 'nowrap' }}
                        />
                    </Box>
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                    />

                    <Divider />

                    <Box sx={{ display: 'flex', gap: 2, height: 400 }}>
                        {/* Left Side: Selection and Ordering */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Selected Trips (Drag to Order)
                            </Typography>
                            <Box sx={{
                                flex: 1,
                                overflowY: 'auto',
                                bgcolor: '#f5f5f5',
                                p: 1,
                                borderRadius: 1
                            }}>
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={selectedTrips}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <List dense disablePadding>
                                            {selectedTripObjects.map(trip => (
                                                <SortableTripItem
                                                    key={trip._id}
                                                    trip={trip}
                                                    onRemove={handleToggleTrip}
                                                />
                                            ))}
                                            {selectedTripObjects.length === 0 && (
                                                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                                    Select trips from the list to add them here.
                                                </Typography>
                                            )}
                                        </List>
                                    </SortableContext>
                                </DndContext>
                            </Box>
                        </Box>

                        {/* Right Side: Available Trips */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Available Trips
                            </Typography>
                            <Box sx={{
                                flex: 1,
                                overflowY: 'auto',
                                border: '1px solid #e0e0e0',
                                borderRadius: 1
                            }}>
                                {loadingTrips ? (
                                    <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
                                ) : (
                                    <List dense>
                                        {unselectedTrips.map(trip => (
                                            <ListItem
                                                key={trip._id}
                                                disablePadding
                                            >
                                                <ListItemButton onClick={() => handleToggleTrip(trip._id)}>
                                                    <ListItemAvatar>
                                                        <Avatar
                                                            src={trip.images?.[0] || trip.user.avatar}
                                                            variant="rounded"
                                                            sx={{ width: 32, height: 32 }}
                                                        />
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={trip.title || "Untitled Trip"}
                                                        primaryTypographyProps={{ noWrap: true }}
                                                    />
                                                    <Button size="small" variant="outlined">Add</Button>
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                        {unselectedTrips.length === 0 && availableTrips.length > 0 && (
                                            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                                All trips selected
                                            </Typography>
                                        )}
                                        {availableTrips.length === 0 && !loadingTrips && (
                                            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                                No trips found
                                            </Typography>
                                        )}
                                    </List>
                                )}
                            </Box>
                        </Box>
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
