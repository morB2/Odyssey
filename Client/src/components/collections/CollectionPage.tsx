import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Box, CircularProgress, IconButton } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { getCollectionById } from "../../services/collection.service";
import type { Collection } from "../user/types";
import { toast } from "react-toastify";
import RouteViewer from "./RouteViewer";
import { useTranslation } from "react-i18next";

export default function CollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        toast.error(t("collection.errors.notFound"));
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id, navigate, t]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!collection) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 2 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ bgcolor: "white", boxShadow: 1 }}
            aria-label={t("collection.back")}
          >
            <ArrowLeft />
          </IconButton>
        </Box>

        <RouteViewer collection={collection} />
      </Container>
    </Box>
  );
}
