import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Avatar,
    Stack,
} from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";

interface ItineraryItem {
    name: string;
    notes: string;
}

interface ItinerarySummaryProps {
    items: ItineraryItem[];
    discription?: string;
    title?: string;
}

export function ItinerarySummary({
    items,
    discription,
    title = "Travel Itinerary",
}: ItinerarySummaryProps) {
    const [imageUrl, setImageUrl] = useState<string>("");

    useEffect(() => {
        const fetchImage = async () => {
            const query = items.length > 0 ? items[0].name : title;
            try {
                const response = await fetch(
                    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)},travel,landscape&content_filter=high&orientation=landscape&client_id=${import.meta.env.VITE_UNSPLASH_KEY}`
                );
                const data = await response.json();
                setImageUrl(data.urls.regular);
            } catch (error) {
                console.error("Failed to fetch image:", error);
            }
        };

        fetchImage();
    }, [items, title]);

    return (
        <Card
            sx={{
                maxWidth: 600,
                width: "100%",
                borderRadius: 3,
                boxShadow: 3,
                overflow: "hidden",
            }}
        >
            {/* Header Image */}
            <Box sx={{ position: "relative" }}>
                {imageUrl && (
                    <CardMedia
                        component="img"
                        height="180"
                        image={imageUrl}
                        alt={title}
                        sx={{ objectFit: "cover" }}
                    />
                )}
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))",
                    }}
                />
                <Typography
                    variant="h6"
                    sx={{
                        position: "absolute",
                        bottom: 30,
                        left: 16,
                        color: "white",
                        fontWeight: 600,
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    sx={{
                        position: "absolute",
                        bottom: 10,
                        left: 16,
                        color: "white",
                        fontWeight: 600,
                    }}
                >
                    {discription}
                </Typography>
            </Box>

            {/* Itinerary Items */}
            <CardContent>
                {items.length === 0 ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ py: 3 }}
                    >
                        No itinerary items yet
                    </Typography>
                ) : (
                    <Stack spacing={2}>
                        {items.map((item, index) => (
                            <Box key={index} display="flex" gap={2}>
                                <Avatar
                                    sx={{
                                        bgcolor: "primary.light",
                                        width: 28,
                                        height: 28,
                                        mt: 0.5,
                                    }}
                                >
                                    <RoomIcon sx={{ fontSize: 16, color: "primary.main" }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" color="text.primary">
                                        {item.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.notes}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}
