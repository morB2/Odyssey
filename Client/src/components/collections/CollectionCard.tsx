import { useState } from "react";
import {
    Box,
    Dialog,
    Grid,
    IconButton,
    Card,
    CardContent,
    Avatar,
    Typography,
} from "@mui/material";
import type { Collection } from "../user/types";
import { Share2, Globe, Lock, Trash2, Edit2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import TripPostAdapter from "../user/TripPostAdapter";

interface CollectionCardProps {
    collection: Collection;
    onEdit?: () => void;
    onDelete?: () => void;
    isOwner?: boolean;
}

export function CollectionCard({
    collection,
    onEdit,
    onDelete,
    isOwner,
}: CollectionCardProps) {
    const { t } = useTranslation();
    const [openModal, setOpenModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const trips = collection.trips || [];
    const coverTrip = trips[0]; // First trip for the cover

    const handleCopyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/collection/${collection._id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied!");
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.();
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => 
            prev === 0 ? (coverTrip?.images?.length || 1) - 1 : prev - 1
        );
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => 
            prev === (coverTrip?.images?.length || 1) - 1 ? 0 : prev + 1
        );
    };

    return (
        <>
            {/* ✅ WRAPPER WITH STACK BEHIND */}
            <Box
                sx={{
                    position: "relative",
                   width: '100%',
                    mx: 'auto',
                    mb: 3,
                    // Add padding to accommodate the stack offset
                    pb: 2,
                    pr: 2,
                }}
            >
                {/* ✅ STACK CARDS IN BACK (2nd and 3rd trips) */}
                {collection.trips?.slice(1, 3).map((trip, index) => {
                    const stackIndex = index + 1; // 1 for second card, 2 for third card
                    
                    return (
                        <Box
                            key={trip._id}
                            sx={{
                                position: "absolute",
                                top: stackIndex * 8,
                                left: stackIndex * 8,
                                right: -stackIndex * 8,
                                bottom: -stackIndex * 8,
                                borderRadius: '16px',
                                overflow: "hidden",
                                boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                                zIndex: -stackIndex,
                                bgcolor: "#f5f5f5",
                            }}
                        >
                            <Box
                                component="img"
                                src={
                                    trip.images?.[0] ||
                                    "https://images.unsplash.com/photo-1488646953014-85cb44e25828"
                                }
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </Box>
                    );
                })}

                {/* ✅ MAIN TripPost-Style Card (FRONT) */}
                <Card
                    sx={{
                        position: 'relative',
                        zIndex: 10,
                        borderRadius: '16px',
                        boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        },
                    }}
                    onClick={() => setOpenModal(true)}
                >
                    {/* ✅ Header - styled like TripPostHeader */}
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: '#eb7c31ff',
                                }}
                            >
                                {collection.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    {collection.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {collection.trips?.length || 0} trips
                                </Typography>
                            </Box>
                        </Box>

                        {isOwner && (
                            <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                                <IconButton
                                    size="small"
                                    onClick={handleEdit}
                                    sx={{ color: 'text.secondary' }}
                                >
                                    <Edit2 size={18} />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={handleDelete}
                                    sx={{ color: 'text.secondary' }}
                                >
                                    <Trash2 size={18} />
                                </IconButton>
                            </Box>
                        )}
                    </Box>

                    {/* ✅ Image Carousel - styled like TripImageCarousel */}
                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            paddingTop: '125%', // 4:5 aspect ratio like TripPost
                            bgcolor: '#f5f5f5',
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            component="img"
                            src={
                                coverTrip?.images?.[currentImageIndex] ||
                                collection.coverImage ||
                                "https://images.unsplash.com/photo-1488646953014-85cb44e25828"
                            }
                            alt={collection.name}
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />

                        {/* Navigation arrows */}
                        {coverTrip?.images && coverTrip.images.length > 1 && (
                            <>
                                <IconButton
                                    onClick={handlePrevImage}
                                    sx={{
                                        position: 'absolute',
                                        left: 8,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'white' },
                                        zIndex: 2,
                                    }}
                                >
                                    ←
                                </IconButton>
                                <IconButton
                                    onClick={handleNextImage}
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'white' },
                                        zIndex: 2,
                                    }}
                                >
                                    →
                                </IconButton>
                            </>
                        )}

                        {/* Image indicators */}
                        {coverTrip?.images && coverTrip.images.length > 1 && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 12,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    gap: 0.5,
                                    zIndex: 2,
                                }}
                            >
                                {coverTrip.images.map((_, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            bgcolor: idx === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                                            transition: 'all 0.3s',
                                        }}
                                    />
                                ))}
                            </Box>
                        )}

                        {/* Collection badge */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                bgcolor: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                px: 2,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                zIndex: 2,
                            }}
                        >
                            Collection
                        </Box>
                    </Box>

                    {/* ✅ Actions - ONLY share */}
                    <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                            <IconButton size="small" onClick={handleCopyLink}>
                                <Share2 size={20} />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* ✅ Content - styled like TripPostContent with fixed height */}
                    <CardContent sx={{ height: 120, overflow: 'hidden' }}>
                        <Typography 
                            variant="h6" 
                            fontWeight={700} 
                            gutterBottom
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {collection.name}
                        </Typography>
                        
                        {collection.description && (
                            <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    mb: 1,
                                }}
                            >
                                {collection.description}
                            </Typography>
                        )}

                        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {!collection.isPrivate ? (
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        px: 1.5,
                                        py: 0.5,
                                        bgcolor: '#e8f5e9',
                                        color: '#2e7d32',
                                        borderRadius: 2,
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    <Globe size={14} />
                                    Public
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        px: 1.5,
                                        py: 0.5,
                                        bgcolor: '#fff3e0',
                                        color: '#e65100',
                                        borderRadius: 2,
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    <Lock size={14} />
                                    Private
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* ✅ FULL SCREEN GRID MODAL */}
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                fullScreen
                PaperProps={{
                    sx: {
                        bgcolor: "#0b0b0b",
                        overflow: "hidden",
                    },
                }}
                sx={{
                    "& .MuiBackdrop-root": {
                        backgroundColor: "rgba(0,0,0,0.95)",
                    },
                }}
            >
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                        <Typography variant="h5" color="white" fontWeight={700}>
                            {collection.name}
                        </Typography>
                        <IconButton
                            onClick={() => setOpenModal(false)}
                            sx={{
                                color: "white",
                                bgcolor: "rgba(255,255,255,0.1)",
                            }}
                        >
                            <X />
                        </IconButton>
                    </Box>

                    <Grid
                        container
                        spacing={3}
                        sx={{
                            height: "calc(100vh - 120px)",
                            overflowY: "auto",
                            px: 2,
                            scrollbarWidth: "none",
                            "&::-webkit-scrollbar": {
                                display: "none",
                            },
                        }}
                    >
                        {collection.trips?.map((trip) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={trip._id}>
                                <Box
                                    sx={{
                                        width: "100%",
                                        aspectRatio: "3 / 4",
                                        transition: "transform 0.3s ease",
                                        "&:hover": {
                                            transform: "scale(1.05)",
                                        },
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <TripPostAdapter trip={trip} onDelete={() => { }} onEdit={() => { }} />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Dialog>
        </>
    );
}