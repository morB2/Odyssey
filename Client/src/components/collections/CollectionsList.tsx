import { Box, Typography, Grid, Button, CircularProgress } from "@mui/material";
import { Plus } from "lucide-react";
import type { Collection } from "../user/types";
import RouteViewer from "./RouteViewer";
import { useTranslation } from "react-i18next";
interface CollectionsListProps {
    collections: Collection[];
    onCreate: () => void;
    onEdit: (collection: Collection) => void;
    onDelete: (collectionId: string) => void;
    isOwner: boolean;
    loading?: boolean;
}

export default function CollectionsList({
    collections = [],
    onCreate,
    onEdit,
    onDelete,
    isOwner,
    loading = false
}: CollectionsListProps) {

    const { t } = useTranslation();
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (collections.length === 0) {
        return (
            <Box sx={{
                textAlign: 'center',
                py: 8,
                bgcolor: '#fff',
                borderRadius: 3,
                border: '1px solid #e5e5e5'
            }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t("collections.empty")}
                </Typography>
                {isOwner && (
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => onCreate()}

                        sx={{ mt: 2, bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
                    >
                        {t("collections.create")}
                    </Button>
                )}
            </Box>
        );
    }

    return (
        <Box>
            {isOwner && (
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => onCreate()}

                        sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
                    >
                        {t("collections.create")}
                    </Button>
                </Box>
            )}

            <Grid container spacing={3} sx={{
                width: "100%", px: 3, justifyContent: "space-between", // ✅ spreads evenly
            }}>
                {collections.map(collection => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={collection._id}>
                        <RouteViewer
                            collection={collection}
                            onEdit={(col) => onEdit(col)}
                            onDelete={(id) => onDelete(id)}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
