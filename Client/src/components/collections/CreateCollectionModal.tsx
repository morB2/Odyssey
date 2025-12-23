import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, FormControlLabel, Switch, Box,
    Typography, Avatar, List, ListItem, ListItemButton,
    ListItemAvatar, ListItemText, CircularProgress, IconButton, Divider,
    Tooltip,
    InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { getTrips } from '../../services/profile.service.tsx';
import { createCollection, updateCollection, generateCollectionTitle, generateCollectionDescription } from '../../services/collection.service';
import type { Collection, Trip } from '../user/types';
import { useUserStore } from '../../store/userStore';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useCollectionsStore } from '../../store/collectionStore.ts';
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

interface SortableTripItemProps {
    trip: Trip;
    onRemove: (id: string) => void;
}
/* ------------------- Sortable Trip Item ------------------- */

function SortableTripItem({ trip, onRemove }: SortableTripItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: trip._id });

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
            sx={{ bgcolor: 'background.paper', mb: 1, border: '1px solid #eee', borderRadius: 1 }}
        >
            <Box
                {...attributes}
                {...listeners}
                sx={{
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'grab',
                    color: 'text.secondary'
                }}
            >
                <DragIndicatorIcon />
            </Box>

            <ListItemAvatar>
                <Avatar src={trip.images?.[0] || trip.user.avatar} variant="rounded" />
            </ListItemAvatar>

            <ListItemText
                primary={trip.title || "Untitled Trip"}
                secondary={trip.location}
            />
        </ListItem>
    );
}


/* ------------------- Main Component ------------------- */

export default function CreateCollectionModal({
    isOpen,
    onClose,
    onSuccess,
    existingCollection
}: CreateCollectionModalProps) {
    const { t } = useTranslation();
    const { user } = useUserStore();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(true);
    const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
    const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [generatingTitle, setGeneratingTitle] = useState(false);
    const [generatingDescription, setGeneratingDescription] = useState(false);

    // NEW: confirmation dialog state
    const [showPrivateWarning, setShowPrivateWarning] = useState(false);
    const { addCollection,updateCollection:postCollection } = useCollectionsStore();
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
                setSelectedTrips(
                    existingCollection.trips.map(t => typeof t === "string" ? t : t._id)
                );
            } else {
                setName('');
                setDescription('');
                setIsPrivate(true);
                setSelectedTrips([]);
            }
            fetchUserTrips();
        }
    }, [isOpen, existingCollection]);


    /* ------------------- Fetch Trips ------------------- */
    const fetchUserTrips = async () => {
        if (!user?._id) return;
        setLoadingTrips(true);

        try {
            const data = await getTrips(user._id, 1, 100);
            setAvailableTrips(data.trips || []);
        } catch {
            toast.error(t("collection.errors.loadTrips"));
        } finally {
            setLoadingTrips(false);
        }
    };


    /* ------------------- UI Logic ------------------- */

    const handleToggleTrip = (tripId: string) => {
        setSelectedTrips(prev =>
            prev.includes(tripId)
                ? prev.filter(id => id !== tripId)
                : [...prev, tripId]
        );
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setSelectedTrips(items => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    /* ------------------- AI Generation Handlers ------------------- */

    const handleGenerateTitle = async () => {
        if (selectedTrips.length === 0) {
            toast.error(t('collection.errors.selectTripsFirst'));
            return;
        }

        setGeneratingTitle(true);
        try {
            const title = await generateCollectionTitle(selectedTrips);
            setName(title);
            toast.success(t('collection.aiTitleGenerated'));
        } catch (error) {
            console.error('AI title generation error:', error);
            toast.error(t('collection.errors.aiGenerationFailed'));
        } finally {
            setGeneratingTitle(false);
        }
    };

    const handleGenerateDescription = async () => {
        if (selectedTrips.length === 0) {
            toast.error(t('collection.errors.selectTripsFirst'));
            return;
        }

        setGeneratingDescription(true);
        try {
            const description = await generateCollectionDescription(selectedTrips);
            setDescription(description);
            toast.success(t('collection.aiDescriptionGenerated'));
        } catch (error) {
            console.error('AI description generation error:', error);
            toast.error(t('collection.errors.aiGenerationFailed'));
        } finally {
            setGeneratingDescription(false);
        }
    };

    const selectedTripObjects = selectedTrips
        .map(id => availableTrips.find(t => t._id === id))
        .filter((t): t is Trip => !!t);

    const unselectedTrips = availableTrips.filter(t => !selectedTrips.includes(t._id));


    /* ------------------- Submit Logic ------------------- */

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error(t("collection.errors.nameRequired"));
            return;
        }

        // ⚠️ Check for private trips in a public collection
        if (
            !isPrivate &&
            selectedTripObjects.some(trip => trip.visabilityStatus === "private")
        ) {
            setShowPrivateWarning(true);
            return;
        }

        saveCollection();
    };

    const saveCollection = async () => {
        setSubmitting(true);

        try {
            const payload = {
                name,
                description,
                isPrivate,
                trips: selectedTrips
            };

            let result;

            if (existingCollection) {
                result = await updateCollection(existingCollection._id, payload);
                postCollection(result); // Update global store
                toast.success(t("collection.success.updated"));
            } else {
                result = await createCollection(payload);
                addCollection(result); // Update global store
                toast.success(t("collection.success.created"));
            }

            onSuccess(result);
            onClose();

        } catch {
            toast.error(t("collection.errors.saveFailed"));
        } finally {
            setSubmitting(false);
        }
    };


    /* ------------------- Render ------------------- */

    return (
        <>
            <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {existingCollection ? t("collection.edit") : t("collection.new")}
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>

                        {/* Name + Private + AI Button */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <TextField
                                label={t("collection.name")}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip
                                                title={selectedTrips.length === 0 ? t('collection.selectTripsFirst') : t('collection.generateTitle')}
                                                arrow
                                            >
                                                <span>
                                                    <IconButton
                                                        onClick={handleGenerateTitle}
                                                        disabled={selectedTrips.length === 0 || generatingTitle}
                                                        edge="end"
                                                        sx={{
                                                            color: '#f97316',
                                                            '&:hover': { backgroundColor: '#fff7ed' },
                                                            '&:disabled': { color: '#d1d5db' }
                                                        }}
                                                    >
                                                        {generatingTitle ? (
                                                            <CircularProgress size={20} />
                                                        ) : (
                                                            <AutoAwesomeIcon />
                                                        )}
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </InputAdornment>
                                    )
                                }}
                            />


                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isPrivate}
                                        onChange={(e) => setIsPrivate(e.target.checked)}
                                    />
                                }
                                label={t("collection.private")}
                                sx={{ whiteSpace: 'nowrap', mt: 1 }}
                            />
                        </Box>

                        {/* Description + AI Button */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <TextField
                                label={t("collection.description")}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip
                                                title={selectedTrips.length === 0 ? t('collection.selectTripsFirst') : t('collection.generateDescription')}
                                                arrow
                                            >
                                                <span>
                                                    <IconButton
                                                        onClick={handleGenerateDescription}
                                                        disabled={selectedTrips.length === 0 || generatingDescription}
                                                        edge="end"
                                                        sx={{
                                                            color: '#f97316',
                                                            '&:hover': { backgroundColor: '#fff7ed' },
                                                            '&:disabled': { color: '#d1d5db' }
                                                        }}
                                                    >
                                                        {generatingDescription ? (
                                                            <CircularProgress size={20} />
                                                        ) : (
                                                            <AutoAwesomeIcon />
                                                        )}
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>

                        <Divider />

                        {/* Trip Selection */}
                        <Box sx={{ display: 'flex', gap: 2, height: 400 }}>
                            {/* Selected Trips */}
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    {t("collection.selectedTrips")}
                                </Typography>

                                <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={selectedTrips} strategy={verticalListSortingStrategy}>
                                            <List dense disablePadding>
                                                {selectedTripObjects.map(trip => (
                                                    <SortableTripItem
                                                        key={trip._id}
                                                        trip={trip}
                                                        onRemove={handleToggleTrip}
                                                    />
                                                ))}

                                                {selectedTripObjects.length === 0 && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ p: 2, textAlign: 'center' }}
                                                    >
                                                        {t("collection.emptySelected")}
                                                    </Typography>
                                                )}
                                            </List>
                                        </SortableContext>
                                    </DndContext>
                                </Box>
                            </Box>

                            {/* Available Trips */}
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    {t("collection.availableTrips")}
                                </Typography>

                                <Box sx={{ flex: 1, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                    {loadingTrips ? (
                                        <Box sx={{ p: 4, textAlign: 'center' }}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    ) : (
                                        <List dense>
                                            {unselectedTrips.map(trip => (
                                                <ListItem key={trip._id} disablePadding>
                                                    <ListItemButton onClick={() => handleToggleTrip(trip._id)}>
                                                        <ListItemAvatar>
                                                            <Avatar
                                                                src={trip.images?.[0] || trip.user.avatar}
                                                                variant="rounded"
                                                                sx={{ width: 32, height: 32 }}
                                                            />
                                                        </ListItemAvatar>

                                                        <ListItemText
                                                            primary={trip.title || t("collection.untitledTrip")}
                                                            primaryTypographyProps={{ noWrap: true }}
                                                        />

                                                        <Button variant="outlined" size="small">
                                                            {t("collection.add")}
                                                        </Button>
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}

                                            {unselectedTrips.length === 0 && availableTrips.length > 0 && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ p: 2, textAlign: 'center' }}
                                                >
                                                    {t("collection.allSelected")}
                                                </Typography>
                                            )}

                                            {availableTrips.length === 0 && !loadingTrips && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ p: 2, textAlign: 'center' }}
                                                >
                                                    {t("collection.noTrips")}
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
                    <Button onClick={onClose} color="inherit">
                        {t("general.cancel")}
                    </Button>

                    <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
                        {submitting ? t("general.saving") : t("general.save")}
                    </Button>
                </DialogActions>
            </Dialog>


            {/* ------------------- PRIVATE TRIPS WARNING DIALOG ------------------- */}

            <Dialog open={showPrivateWarning} onClose={() => setShowPrivateWarning(false)}>
                <DialogTitle>{t("collection.privateTripsWarningTitle")}</DialogTitle>

                <DialogContent>
                    <Typography>
                        {t("collection.privateTripsWarningMessage")}
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setShowPrivateWarning(false)}>
                        {t("general.cancel")}
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => {
                            setShowPrivateWarning(false);
                            saveCollection();
                        }}
                    >
                        {t("collection.continueAnyway")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
