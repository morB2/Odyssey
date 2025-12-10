import { Plane, Map, Sparkles } from "lucide-react";
import { Box, Typography, Grid, Container } from "@mui/material";
import { CreateTripLandingCard } from "./createTripLandingCard";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserStore } from "../../store/userStore";

export default function CreateTripLandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUserStore();

  return (
    <Box sx={{ bgcolor: "white", minHeight: "100vh" }}>

      {/* Hero */}
      <Box
        sx={{
          height: "35vh",
          position: "relative",
          backgroundColor: "black",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1597434429739-2574d7e06807?auto=format&q=80&w=1600"
          sx={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }}
        />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            px: 2,
          }}
        >
          <Plane size={48} color="#ff8a00" />

          <Typography variant="h3" color="white" sx={{ mt: 1 }}>
            {t("tripLanding.heroTitle")}
          </Typography>

          <Typography sx={{ color: "white", opacity: 0.8, maxWidth: 600, mt: 1 }}>
            {t("tripLanding.heroSubtitle")}
          </Typography>
        </Box>
      </Box>

      {/* Planning Cards */}
      <Container sx={{ py: 10 }}>
        <Typography variant="h4" textAlign="center" fontWeight={700}>
          {t("tripLanding.chooseStyle")}
        </Typography>

        <Typography textAlign="center" sx={{ color: "grey.600", maxWidth: 600, mx: "auto", mb: 6 }}>
          {t("tripLanding.selectMethod")}
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {/* AI Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CreateTripLandingCard
              icon={<Sparkles size={50} />}
              title={t("tripLanding.ai.title")}
              description={t("tripLanding.ai.subtitle")}
              features={[
                t("tripLanding.ai.features.0"),
                t("tripLanding.ai.features.1"),
                t("tripLanding.ai.features.2"),
                t("tripLanding.ai.features.3"),
              ]}
              accentColor="orange"
              buttonText={t("tripLanding.ai.button")}
              onClick={() => navigate("/createtripAI")}
            />
          </Grid>

          {user &&
            <Grid size={{ xs: 12, md: 6 }}>
              <CreateTripLandingCard
                icon={<Map size={50} />}
                title={t("tripLanding.manual.title")}
                description={t("tripLanding.manual.subtitle")}
                features={[
                  t("tripLanding.manual.features.0"),
                  t("tripLanding.manual.features.1"),
                  t("tripLanding.manual.features.2"),
                  t("tripLanding.manual.features.3"),
                ]}
                accentColor="black"
                buttonText={t("tripLanding.manual.button")}
                onClick={() => navigate("/createtripmanual")}
              />
            </Grid>
          }
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: "black", py: 6, textAlign: "center" }}>
        <Typography sx={{ color: "white", opacity: 0.7 }}>
          {t("tripLanding.footer")}
        </Typography>
      </Box>
    </Box>
  );
}
