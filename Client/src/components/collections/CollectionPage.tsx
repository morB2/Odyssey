import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Box, CircularProgress, IconButton } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { getCollectionById } from "../../services/collection.service";
import { CollectionDetails } from "./CollectionDetails";
import type { Collection } from "../user/types";
import { toast } from "react-toastify";

export default function CollectionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollection = async () => {
            if (!id) return;
            try {
                const data = await getCollectionById(id);
                setCollection(data);
            } catch (error) {
                console.error("Error fetching collection:", error);
                toast.error("Collection not found or access denied");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, [id, navigate]);

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!collection) return null;

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", py: 4 }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 2 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', boxShadow: 1 }}>
                        <ArrowLeft />
                    </IconButton>
                </Box>

                <CollectionDetails collection={collection} />
            </Container>
        </Box>
    );
}
