import { Box, Typography, Grid, Button, CircularProgress } from "@mui/material";

import { Plus } from "lucide-react";
import type { Collection } from "../user/types";
import { CollectionCard } from "./CollectionCard";
import { useTranslation } from 'react-i18next';
interface CollectionsListProps {
    collections: Collection[];
    onCreate: () => void;
    onEdit: (collection: Collection) => void;
    onDelete: (collectionId: string) => void;
    isOwner: boolean;
    loading?: boolean;
}

export function CollectionsList({
    collections = [],
    onCreate,
    onEdit,
    onDelete,
    isOwner,
    loading = false
}: CollectionsListProps) {
    const { t } = useTranslation(); // Assuming translation keys exist or falling back


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
                    No collections yet
                </Typography>
                {isOwner && (
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => onCreate()}

                        sx={{ mt: 2, bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
                    >
                        Create Collection
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
                        Create Collection
                    </Button>
                </Box>
            )}

            <Grid container spacing={3}>
                {collections.map(collection => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={collection._id}>
                        <CollectionCard
                            collection={collection}
                            onEdit={() => onEdit(collection)}
                            onDelete={() => onDelete(collection._id)}
                            isOwner={isOwner}
                        />
                    </Grid>
                ))}
            </Grid>

        </Box>
    );
}
