import { useState } from "react";
import {
    Box,
    Dialog,
    Grid,
    IconButton,
    Chip,
    Tooltip,
} from "@mui/material";
import type { Collection } from "../user/types";
import { Share2, Globe, Lock, Trash2, Edit2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { CollectionDetails } from "./CollectionDetails";
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

    const trips = collection.trips || [];

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

    return (
        <>
            {/* ✅ STACK PREVIEW */}
            <Box
                sx={{
                    position: "relative",
                    width: 240,
                    height: 320,
                    cursor: "pointer",
                    margin: 2,
                }}
                onClick={() => setOpenModal(true)}
            >
                {/* ✅ BASE OFFSET WRAPPER (IMPORTANT) */}
                {collection.trips?.slice(0, 3).map((trip, index) => {
                    const isFirst = index === 0;

                    return (
                        <Box
                            key={trip._id}
                            sx={{
                                position: "absolute",
                                inset: 0,                     // ✅ forces same size & origin
                                transform: `translate(${index * 8
                                    }px, ${index * 8}px)`,       // ✅ consistent diagonal stack
                                zIndex: 10 - index,
                                borderRadius: 3,
                                overflow: "hidden",
                                boxShadow: 4,
                                bgcolor: "#000",
                            }}
                        >
                            {/* ✅ FIRST CARD = COLLECTION INFO */}
                            {isFirst ? (
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        backgroundImage: `url(${collection.coverImage ||
                                            trip.images?.[0] ||
                                            "https://images.unsplash.com/photo-1488646953014-85cb44e25828"
                                            })`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        position: "relative",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            inset: 0,
                                            bgcolor: "rgba(0,0,0,0.55)",
                                        }}
                                    />

                                    <Box
                                        sx={{
                                            position: "relative",
                                            zIndex: 2,
                                            height: "100%",
                                            p: 2,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "flex-end",
                                            color: "white",
                                        }}
                                    >
                                        <Box sx={{ fontWeight: 800, fontSize: 17 }}>
                                            {collection.name}
                                        </Box>

                                        {collection.description && (
                                            <Box sx={{ fontSize: 13, opacity: 0.9, mt: 0.5 }}>
                                                {collection.description}
                                            </Box>
                                        )}

                                        <Box sx={{ fontSize: 12, mt: 1, opacity: 0.8 }}>
                                            {collection.trips?.length || 0} trips
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
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
                            )}
                        </Box>
                    );
                })}
            </Box>


            {/* ✅ FULL SCREEN GRID MODAL */}
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                fullScreen
                PaperProps={{
                    sx: {
                        bgcolor: "#0b0b0b",
                        overflow: "hidden", // ✅ NO SCROLLBAR
                    },
                }}
                sx={{
                    "& .MuiBackdrop-root": {
                        backgroundColor: "rgba(0,0,0,0.95)",
                    },
                }}
            >

                <Box sx={{ p: 3 }}>
                    {/* Close Button */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
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

                    {/* ✅ POSTS GRID INSTEAD OF COLLECTION DETAILS */}
                    <Grid
                        container
                        spacing={3}
                        sx={{
                            height: "calc(100vh - 80px)",
                            overflowY: "auto",
                            px: 2,
                            scrollbarWidth: "none", // Firefox
                            "&::-webkit-scrollbar": {
                                display: "none", // Chrome
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
