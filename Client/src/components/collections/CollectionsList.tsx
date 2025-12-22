import { Box, Typography, Grid, Button, CircularProgress } from "@mui/material";
import { useState } from "react";
import { Plus } from "lucide-react";
import RouteViewer from "./RouteViewer";
import { useTranslation } from "react-i18next";
import { useCollectionsStore } from "../../store/collectionStore";
import type { Collection } from "../user/types";
import ConfirmDialog from "../general/ConfirmDialog";

interface CollectionsListProps {
    onCreate: () => void;
    isOwner: boolean;
    onEdit?: (collection: any) => void;
    onDelete?: (collectionId: string) => void;
}


export default function CollectionsList({
    onCreate,
    isOwner,
    onEdit,
    onDelete,
}: CollectionsListProps) {
    const { t } = useTranslation();
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);

    const {
        collections,
        loading,
        updateCollection,
        removeCollection,
    } = useCollectionsStore();

    const handleDeleteClick = (id: string) => {
        setCollectionToDelete(id);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        if (collectionToDelete) {
            removeCollection(collectionToDelete);
            if (onDelete) onDelete(collectionToDelete);
        }
        setConfirmDeleteOpen(false);
        setCollectionToDelete(null);
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (collections.length === 0) {
        return (
            <Box
                sx={{
                    textAlign: "center",
                    py: 8,
                    bgcolor: "#fff",
                    borderRadius: 3,
                    border: "1px solid #e5e5e5",
                }}
            >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t("collections.empty")}
                </Typography>

                {isOwner && (
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={onCreate}
                        sx={{ mt: 2, bgcolor: "#f97316", "&:hover": { bgcolor: "#ea580c" } }}
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
                <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={onCreate}
                        sx={{ bgcolor: "#f97316", "&:hover": { bgcolor: "#ea580c" } }}
                    >
                        {t("collections.create")}
                    </Button>
                </Box>
            )}

            <Grid
                container
                spacing={3}
                sx={{
                    width: "100%",
                    px: 3,
                    justifyContent: "space-between",
                }}
            >
                {collections.map((collection) => (
                    <Grid
                        key={collection._id}
                        size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    >
                        <RouteViewer
                            collection={collection}
                            onEdit={(col: Collection) => { if (onEdit) onEdit(col); updateCollection(col); }}
                            onDelete={(id: string) => handleDeleteClick(id)}
                        />
                    </Grid>
                ))}
            </Grid>
            <ConfirmDialog
                isOpen={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="collection.deleteTitle"
                message="collection.confirmDelete"
            />
        </Box>
    );
}
