import { Dialog, DialogContent, IconButton, Box } from "@mui/material";
import { X } from "lucide-react";
import type { Collection } from "../user/types";
import { CollectionDetails } from "./CollectionDetails";

interface CollectionDetailsModalProps {
    isOpen: boolean;
    collection: Collection | null;
    onClose: () => void;
}

export function CollectionDetailsModal({ isOpen, collection, onClose }: CollectionDetailsModalProps) {
    if (!collection) return null;
   console.log(collection);
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: { minHeight: '80vh', p: 2 }
            }}
        >
            <Box sx={{ position: 'absolute', right: 16, top: 16, zIndex: 10 }}>
                <IconButton onClick={onClose}>
                    <X />
                </IconButton>
            </Box>

            <DialogContent>
                <CollectionDetails collection={collection} />
            </DialogContent>
        </Dialog>
    );
}
