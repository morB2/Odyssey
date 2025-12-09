import { useEffect, useState } from "react";
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
import { useTranslation } from "react-i18next";
import { searchTravelImage } from "../../services/image.service";

interface ItineraryItem {
    name: string;
    notes: string;
}

interface ItinerarySummaryProps {
    items: ItineraryItem[];
    discription?: string;
    title?: string;
}

export const ItinerarySummary = ({
    items,
    discription,
    title,
}: ItinerarySummaryProps) => {

    const { t } = useTranslation();
    const displayTitle = title || t("itinerarySummary.defaultTitle");

    const [imageUrl, setImageUrl] = useState<string>("");
    useEffect(() => {
        const fetchImage = async () => {
            const query = items.length > 0 ? items[0].name : title;
            const url = await searchTravelImage(query || "Travel");
            if (url) {
                setImageUrl(url);
            }
        };

        fetchImage();
    }, [items, displayTitle]);

    return (
        <Card
            sx={{
                maxWidth: 600,
                width: "100%",
                borderRadius: 3,
                boxShadow: 3,
                overflow: "hidden",
                border: 'none',
            }}
        >
            {/* Header Image */}
            <Box sx={{ position: "relative" }}>
                {imageUrl && (
                    <CardMedia
                        component="img"
                        height="180"
                        image={imageUrl}
                        alt={displayTitle}
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
                        top: 10,
                        left: 16,
                        color: "white",
                        fontWeight: 600,
                    }}
                >
                    {displayTitle}
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
                        {t("itinerarySummary.noItems")}
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
