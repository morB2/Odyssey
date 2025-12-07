import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Tabs, Tab, IconButton, Slider, Switch, FormControlLabel, CircularProgress, Skeleton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { enhance, upscale, grayscale, sepia, blur, vignette, backgroundRemoval } from "@cloudinary/url-gen/actions/effect";
import { brightness, contrast, saturation, vibrance } from "@cloudinary/url-gen/actions/adjust";

// Hook for debouncing
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};
// Extract clean publicId from Cloudinary URL
const getPublicIdFromUrl = (url: string): string => {
  console.log("Extracting public ID from URL:\n", url);
  if (!url.includes("/upload/")) return "";

  try {
    // Split by /upload/
    const parts = url.split("/upload/");
    if (parts.length < 2) return "";

    let afterUpload = parts[1];

    // Remove query parameters (like ?_a=...)
    const queryIndex = afterUpload.indexOf("?");
    if (queryIndex !== -1) {
      afterUpload = afterUpload.substring(0, queryIndex);
    }

    // Split by /
    const segments = afterUpload.split("/");

    // Filter out transformations and version
    const cleanSegments = segments.filter(segment => {
      // Skip transformations (contains _ or :)
      if (segment.includes("_") || segment.includes(":")) {
        return false;
      }
      // Skip version (v1, v2, etc.) - THIS IS THE KEY FIX
      if (/^v\d+$/.test(segment)) {
        return false;
      }
      // Skip empty segments
      if (!segment || segment.trim() === "") {
        return false;
      }
      return true;
    });

    // Join back
    let publicId = cleanSegments.join("/");

    // Remove file extension
    publicId = publicId.replace(/\.[^.]+$/, "");

    console.log("Extracted publicId:", publicId, "from URL:", url);

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return "";
  }
};

// Styled components as single-line
const PreviewBox = ({ children, isLoading }: any) => (
  <Box
    sx={{
      width: "100%",
      aspectRatio: "16/9",
      backgroundColor: "#000",
      borderRadius: 2,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      position: "relative",
    }}
  >
    {isLoading && (
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        sx={{ position: "absolute", bgcolor: "grey.900" }}
      />
    )}
    {children}
    {isLoading && (
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: "50%",
          p: 1,
        }}
      >
        <CircularProgress size={20} sx={{ color: "#fff" }} />
      </Box>
    )}
  </Box>
);

const TabPanel = ({ children, value, index }: any) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
  </div>
);

const SliderControl = ({ label, value, onChange, min = 0, max = 100 }: any) => (
  <Box>
    <Typography variant="caption">
      {label}: {value || "Auto"}
    </Typography>
    <Slider
      value={value}
      onChange={(_, v) => onChange(v)}
      min={min}
      max={max}
      size="small"
    />
  </Box>
);

interface AdvancedMediaEditorProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  onSave: (editedUrl: string) => void;
}

export function AdvancedMediaEditor({
  isOpen,
  onClose,
  mediaUrl,
  onSave,
}: AdvancedMediaEditorProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const publicId = useMemo(() => getPublicIdFromUrl(mediaUrl), [mediaUrl]);
  console.log("Public ID:", publicId);
  const cloudName = import.meta.env.VITE_CLOUD_NAME;
  const cld = useMemo(
    () => new Cloudinary({ cloud: { cloudName } }),
    [cloudName]
  );


  // States
  const [aiEnhance, setAiEnhance] = useState(false);
  const [aiUpscale, setAiUpscale] = useState(false);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [manualBrightness, setManualBrightness] = useState(0);
  const [manualContrast, setManualContrast] = useState(0);
  const [manualSaturation, setManualSaturation] = useState(0);
  const [manualVibrance, setManualVibrance] = useState(0);
  const [manualBlur, setManualBlur] = useState(0);
  const [manualVignette, setManualVignette] = useState(0);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [isSepia, setIsSepia] = useState(false);

  // Debounced states
  const dAiEnhance = useDebounce(aiEnhance, 300);
  const dAiUpscale = useDebounce(aiUpscale, 300);
  const dRemoveBackground = useDebounce(removeBackground, 300);
  const dBrightness = useDebounce(manualBrightness, 300);
  const dContrast = useDebounce(manualContrast, 300);
  const dSaturation = useDebounce(manualSaturation, 300);
  const dVibrance = useDebounce(manualVibrance, 300);
  const dBlur = useDebounce(manualBlur, 300);
  const dVignette = useDebounce(manualVignette, 300);
  const dGrayscale = useDebounce(isGrayscale, 300);
  const dSepia = useDebounce(isSepia, 300);

  // Build transformed image
  const transformedImage = useMemo(() => {
    if (!publicId) return null;

    // Start with clean image (no existing filters)
    let img = cld.image(publicId);

    // AI Effects
    if (dRemoveBackground) img = img.effect(backgroundRemoval());
    if (dAiEnhance) img = img.effect(enhance());
    if (dAiUpscale) img = img.effect(upscale());

    // Filters
    if (dGrayscale) img = img.effect(grayscale());
    if (dSepia) img = img.effect(sepia());

    // Adjustments
    if (dBrightness !== 0) img = img.adjust(brightness(dBrightness));
    if (dContrast !== 0) img = img.adjust(contrast(dContrast));
    if (dSaturation !== 0) img = img.adjust(saturation(dSaturation));
    if (dVibrance !== 0) img = img.adjust(vibrance(dVibrance));

    // Effects
    if (dBlur > 0) img = img.effect(blur(dBlur));
    if (dVignette > 0) img = img.effect(vignette(dVignette));
    console.log("Transformed image:", img);
    return img;
  }, [cld, publicId, dAiEnhance, dAiUpscale, dRemoveBackground, dBrightness, dContrast, dSaturation, dVibrance, dBlur, dVignette, dGrayscale, dSepia]);

  // Loading state management
  useEffect(() => {
    setIsLoading(true);
    setImageLoaded(false);
  }, [transformedImage]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setIsLoading(false);
  };

  const handleSave = () => {
    if (!transformedImage) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSave(transformedImage.toURL());
      onClose();
    }, 500);
  };

  const handleReset = () => {
    [setAiEnhance, setAiUpscale, setRemoveBackground, setIsGrayscale, setIsSepia].forEach((fn) => fn(false));
    [setManualBrightness, setManualContrast, setManualSaturation, setManualVibrance, setManualBlur, setManualVignette].forEach((fn) => fn(0));
  };

  if (!publicId) {
    return (
      <Dialog open={isOpen} onClose={onClose} maxWidth="sm">
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>Invalid Cloudinary URL</Typography>
          <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
            URL: {mediaUrl}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Advanced Media Editor
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 400px" },
            gap: 3,
          }}
        >
          {/* Preview */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Preview
            </Typography>
            <PreviewBox isLoading={isLoading}>
              {transformedImage && (
                <AdvancedImage
                  cldImg={transformedImage}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    opacity: imageLoaded ? 1 : 0,
                    transition: "opacity 0.3s",
                  }}
                  onLoad={handleImageLoad}
                  onError={() => setIsLoading(false)}
                />
              )}
            </PreviewBox>
            <Typography
              variant="caption"
              sx={{ mt: 1, display: "block", color: "text.secondary" }}
            >
              {isLoading ? "Loading..." : "Ready"}
            </Typography>
          </Box>

          {/* Controls */}
          <Box>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
              <Tab label="AI" sx={{ textTransform: "none", minWidth: 80 }} />
              <Tab label="Adjust" sx={{ textTransform: "none", minWidth: 80 }} />
            </Tabs>

            <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
              {/* AI Tab */}
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <FormControlLabel control={<Switch checked={aiEnhance} onChange={(e) => setAiEnhance(e.target.checked)} />} label="AI Enhance (Auto improve)" />
                  <FormControlLabel control={<Switch checked={aiUpscale} onChange={(e) => setAiUpscale(e.target.checked)} />} label="AI Upscale (Increase resolution)" />
                  <FormControlLabel control={<Switch checked={removeBackground} onChange={(e) => setRemoveBackground(e.target.checked)} />} label="Remove Background" />
                </Box>
              </TabPanel>

              {/* Adjust Tab */}
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <FormControlLabel control={<Switch checked={isGrayscale} onChange={(e) => setIsGrayscale(e.target.checked)} />} label="Grayscale" />
                  <FormControlLabel control={<Switch checked={isSepia} onChange={(e) => setIsSepia(e.target.checked)} />} label="Sepia" />
                  <SliderControl label="Brightness" value={manualBrightness} onChange={setManualBrightness} min={-99} max={100} />
                  <SliderControl label="Contrast" value={manualContrast} onChange={setManualContrast} min={-100} max={100} />
                  <SliderControl label="Saturation" value={manualSaturation} onChange={setManualSaturation} min={-100} max={100} />
                  <SliderControl label="Vibrance" value={manualVibrance} onChange={setManualVibrance} min={-100} max={100} />
                  <SliderControl label="Blur" value={manualBlur} onChange={setManualBlur} min={0} max={2000} />
                  <SliderControl label="Vignette" value={manualVignette} onChange={setManualVignette} min={0} max={100} />
                </Box>
              </TabPanel>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleReset} variant="outlined">
          Reset
        </Button>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isProcessing || isLoading}
          sx={{
            backgroundColor: "#f97316",
            "&:hover": { backgroundColor: "#ea580c" },
          }}
        >
          {isProcessing ? <CircularProgress size={20} /> : "Apply Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
