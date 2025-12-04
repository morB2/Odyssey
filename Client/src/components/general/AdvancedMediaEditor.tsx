// import { useState, useEffect, useMemo } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Box,
//   Typography,
//   Tabs,
//   Tab,
//   IconButton,
//   Slider,
//   Switch,
//   FormControlLabel,
//   CircularProgress,
// } from "@mui/material";
// import { Close } from "@mui/icons-material";
// import { Cloudinary } from "@cloudinary/url-gen";
// import { AdvancedImage } from "@cloudinary/react";
// import {
//   fill,
//   scale,
//   crop,
//   fit,
//   pad,
// } from "@cloudinary/url-gen/actions/resize";
// import {
//   enhance,
//   upscale,
//   grayscale,
//   sepia,
//   blur,
//   vignette,
//   backgroundRemoval,
//   type EffectActions,
// } from "@cloudinary/url-gen/actions/effect";
// import {
//   brightness,
//   contrast,
//   saturation,
//   vibrance,
// } from "@cloudinary/url-gen/actions/adjust";
// import { auto } from "@cloudinary/url-gen/qualifiers/quality";

// // Debounce hook
// function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

// interface AdvancedMediaEditorProps {
//   isOpen: boolean;
//   onClose: () => void;
//   mediaUrl: string;
//   onSave: (editedUrl: string) => void;
// }

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// function TabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props;
//   return (
//     <div role="tabpanel" hidden={value !== index} {...other}>
//       {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
//     </div>
//   );
// }

// export function AdvancedMediaEditor({
//   isOpen,
//   onClose,
//   mediaUrl,
//   onSave,
// }: AdvancedMediaEditorProps) {
//   const [activeTab, setActiveTab] = useState(0);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [previewKey, setPreviewKey] = useState(0);

//   // Extract public ID from Cloudinary URL
//   // const getPublicIdFromUrl = (url: string): string => {
//   //   if (!url.includes("cloudinary.com")) return "";

//   //   try {
//   //     const uploadIndex = url.indexOf("/upload/");
//   //     if (uploadIndex === -1) return "";

//   //     const afterUpload = url.substring(uploadIndex + 8);
//   //     const parts = afterUpload.split("/");

//   //     // Find where the actual file path starts (after transformations and version)
//   //     let filePathIndex = 0;
//   //     for (let i = 0; i < parts.length; i++) {
//   //       const part = parts[i];

//   //       // If we find a version segment, that's where the file path starts
//   //       if (/^v\d+$/.test(part)) {
//   //         filePathIndex = i;
//   //         break;
//   //       }

//   //       // Check if this looks like a file (has extension)
//   //       if (
//   //         /\.(jpg|jpeg|png|gif|webp|svg|bmp|mp4|webm|ogg|mov|avi)$/i.test(part)
//   //       ) {
//   //         filePathIndex = i;
//   //         break;
//   //       }

//   //       // If the segment doesn't look like a transformation, it's the start of public_id
//   //       if (!/[_,]/.test(part) && !/^[a-z]_/.test(part)) {
//   //         filePathIndex = i;
//   //         break;
//   //       }
//   //     }

//   //     // Get the path from filePathIndex onwards
//   //     const filePath = parts.slice(filePathIndex).join("/");

//   //     // Remove file extension
//   //     const publicId = filePath.replace(/\.[^.]+$/, "");

//   //     return publicId;
//   //   } catch (error) {
//   //     console.error("Error extracting public ID:", error);
//   //     return "";
//   //   }
//   // };
//   // --- Apply effects from original URL ---
//   // const afterUpload = mediaUrl.split("/upload/")[1] || "";
//   // const parts = afterUpload.split("/");
//   // const effectParts = parts.filter((p) => p.startsWith("e_"));

//   // // Map effect names to SDK functions
//   // type EffectFunction = ((value?: number) => unknown) | (() => unknown);
//   // const effectMap: Record<string, EffectFunction> = {
//   //   blur: (val?: number) => blur(val || 0),
//   //   vignette: (val?: number) => vignette(val || 0),
//   //   sepia,
//   //   grayscale,
//   //   enhance,
//   //   upscale,
//   //   backgroundRemoval,
//   // };

//   // effectParts.forEach((eff) => {
//   //   const [name, param] = eff.replace("e_", "").split(":");
//   //   const effectFunc = effectMap[name];
//   //   if (effectFunc && typeof effectFunc === "function") {
//   //     const effect = param ? effectFunc(Number(param)) : effectFunc();
//   //     img = img.effect(effect as EffectActions);
//   //   }
//   // });
//   const getPublicIdFromUrl = (url: string): string => {
//     console.log(url);
//     if (!url.includes("/upload/")) return "";

//     try {
//       const afterUpload = url.split("/upload/")[1];
//       if (!afterUpload) return "";

//       const parts = afterUpload.split("/");

//       const cleanedParts = parts.filter((p) => !p.startsWith("e_"));

//       const versionIndex = cleanedParts.findIndex((p) => /^v\d+$/.test(p));
//       const startIndex = versionIndex !== -1 ? versionIndex + 1 : 0;

//       let joined = cleanedParts.slice(startIndex).join("/");

//       joined = joined.replace(/\.[a-zA-Z0-9]+$/, "");

//       const qIndex = joined.indexOf("?");
//       if (qIndex !== -1) joined = joined.slice(0, qIndex);

//       return joined;
//     } catch (e) {
//       console.error("Failed extracting publicId:", e);
//       return "";
//     }
//   };

//   const publicId = getPublicIdFromUrl(mediaUrl);
//   console.log("publicId\n", publicId, "\nmediaUrl\n", mediaUrl);

//   const cloudName = import.meta.env.VITE_CLOUD_NAME;

//   // Initialize Cloudinary (memoized to prevent re-creation on every render)
//   const cld = useMemo(
//     () =>
//       new Cloudinary({
//         cloud: {
//           cloudName: cloudName,
//         },
//       }),
//     [cloudName]
//   );

//   // AI Enhancement states
//   const [aiEnhance, setAiEnhance] = useState(false);
//   const [aiRestore, setAiRestore] = useState(false);
//   const [aiUpscale, setAiUpscale] = useState(false);
//   const [removeBackground, setRemoveBackground] = useState(false);

//   // Manual adjustment states
//   const [manualBrightness, setManualBrightness] = useState(0);
//   const [manualContrast, setManualContrast] = useState(0);
//   const [manualSaturation, setManualSaturation] = useState(0);
//   const [manualVibrance, setManualVibrance] = useState(0);
//   const [manualBlur, setManualBlur] = useState(0);
//   const [manualSharpen, setManualSharpen] = useState(0);
//   const [manualVignette, setManualVignette] = useState(0);
//   const [isGrayscale, setIsGrayscale] = useState(false);
//   const [isSepia, setIsSepia] = useState(false);

//   // Resize states
//   const [resizeWidth, setResizeWidth] = useState(0);
//   const [resizeHeight, setResizeHeight] = useState(0);
//   const [resizeMode, setResizeMode] = useState<
//     "fill" | "fit" | "scale" | "crop" | "pad"
//   >("fill");

//   // Debounce all states
//   const debouncedAiEnhance = useDebounce(aiEnhance, 300);
//   const debouncedAiRestore = useDebounce(aiRestore, 300);
//   const debouncedAiUpscale = useDebounce(aiUpscale, 300);
//   const debouncedRemoveBackground = useDebounce(removeBackground, 300);
//   const debouncedBrightness = useDebounce(manualBrightness, 300);
//   const debouncedContrast = useDebounce(manualContrast, 300);
//   const debouncedSaturation = useDebounce(manualSaturation, 300);
//   const debouncedVibrance = useDebounce(manualVibrance, 300);
//   const debouncedBlur = useDebounce(manualBlur, 300);
//   const debouncedSharpen = useDebounce(manualSharpen, 300);
//   const debouncedVignette = useDebounce(manualVignette, 300);
//   const debouncedGrayscale = useDebounce(isGrayscale, 300);
//   const debouncedSepia = useDebounce(isSepia, 300);
//   const debouncedResizeWidth = useDebounce(resizeWidth, 300);
//   const debouncedResizeHeight = useDebounce(resizeHeight, 300);
//   const debouncedResizeMode = useDebounce(resizeMode, 300);

//   // Build the transformed image with useMemo - start with clean image
//   const transformedImage = useMemo(() => {
//     if (!publicId) return null;

//     // Start with the original image without any existing filters
//     let img = cld.image(publicId);

//     // Apply resize if set
//     if (debouncedResizeWidth > 0 || debouncedResizeHeight > 0) {
//       const w = debouncedResizeWidth;
//       const h = debouncedResizeHeight;

//       switch (debouncedResizeMode) {
//         case "fill":
//           // img = img.resize(fill().width(w).height(h).gravity(autoGravity()));
//           break;
//         case "fit":
//           img = img.resize(fit().width(w).height(h));
//           break;
//         case "scale":
//           img = img.resize(scale().width(w).height(h));
//           break;
//         case "crop":
//           // img = img.resize(crop().width(w).height(h).gravity(autoGravity()));
//           break;
//         case "pad":
//           img = img.resize(pad().width(w).height(h));
//           break;
//       }
//     }

//     // Apply AI enhancements
//     if (debouncedAiEnhance) img = img.effect(enhance());
//     if (debouncedAiUpscale) img = img.effect(upscale());
//     if (debouncedRemoveBackground) img = img.effect(backgroundRemoval());

//     // Apply manual adjustments
//     if (debouncedBrightness !== 0)
//       img = img.adjust(brightness(debouncedBrightness));
//     if (debouncedContrast !== 0) img = img.adjust(contrast(debouncedContrast));
//     if (debouncedSaturation !== 0)
//       img = img.adjust(saturation(debouncedSaturation));
//     if (debouncedVibrance !== 0) img = img.adjust(vibrance(debouncedVibrance));
//     if (debouncedBlur > 0) img = img.effect(blur(debouncedBlur));
//     if (debouncedVignette > 0) img = img.effect(vignette(debouncedVignette));
//     if (debouncedGrayscale) img = img.effect(grayscale());
//     if (debouncedSepia) img = img.effect(sepia());

//     return img;
//   }, [
//     cld,
//     publicId,
//     mediaUrl,
//     debouncedAiEnhance,
//     debouncedAiUpscale,
//     debouncedRemoveBackground,
//     debouncedBrightness,
//     debouncedContrast,
//     debouncedSaturation,
//     debouncedVibrance,
//     debouncedBlur,
//     debouncedVignette,
//     debouncedGrayscale,
//     debouncedSepia,
//     debouncedResizeWidth,
//     debouncedResizeHeight,
//     debouncedResizeMode,
//   ]);

//   // Update loading state when transformations change
//   useEffect(() => {
//     console.log("transformedImage", transformedImage);
//     setIsLoading(true);
//     const timer = setTimeout(() => setIsLoading(false), 100);
//     return () => clearTimeout(timer);
//   }, [transformedImage]);

//   const handleSave = () => {
//     if (!transformedImage) return;

//     setIsProcessing(true);
//     // Get the transformed URL
//     const transformedUrl = transformedImage.toURL();

//     // Simulate processing delay
//     setTimeout(() => {
//       setIsProcessing(false);
//       onSave(transformedUrl);
//       onClose();
//     }, 500);
//   };

//   const handleReset = () => {
//     setAiEnhance(false);
//     setAiRestore(false);
//     setAiUpscale(false);
//     setRemoveBackground(false);
//     setManualBrightness(0);
//     setManualContrast(0);
//     setManualSaturation(0);
//     setManualVibrance(0);
//     setManualBlur(0);
//     setManualSharpen(0);
//     setManualVignette(0);
//     setIsGrayscale(false);
//     setIsSepia(false);
//     setResizeWidth(0);
//     setResizeHeight(0);
//   };

//   if (!publicId) {
//     return (
//       <Dialog open={isOpen} onClose={onClose} maxWidth="sm">
//         <DialogTitle>Error</DialogTitle>
//         <DialogContent>
//           <Typography>
//             Invalid Cloudinary URL. Please use a valid Cloudinary image.
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={onClose}>Close</Button>
//         </DialogActions>
//       </Dialog>
//     );
//   }

//   return (
//     <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
//       <DialogTitle>
//         <Box display="flex" justifyContent="space-between" alignItems="center">
//           <Typography variant="h6" fontWeight={600}>
//             Advanced Media Editor
//           </Typography>
//           <IconButton onClick={onClose} size="small">
//             <Close />
//           </IconButton>
//         </Box>
//       </DialogTitle>

//       <DialogContent sx={{ p: 3 }}>
//         <Box
//           sx={{
//             display: "grid",
//             gridTemplateColumns: { xs: "1fr", md: "1fr 400px" },
//             gap: 3,
//           }}
//         >
//           {/* Preview */}
//           <Box>
//             <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
//               Preview
//             </Typography>
//             <Box
//               sx={{
//                 width: "100%",
//                 aspectRatio: "16/9",
//                 backgroundColor: "#000",
//                 borderRadius: 2,
//                 overflow: "hidden",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
//                 position: "relative",
//               }}
//             >
//               {transformedImage ? (
//                 <AdvancedImage
//                   key={previewKey}
//                   cldImg={transformedImage}
//                   style={{
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "contain",
//                   }}
//                 />
//               ) : (
//                 // <img
//                 //   src={mediaUrl}
//                 //   style={{ width: "100%", height: "100%", objectFit: "contain" }}
//                 // />

//                 <Typography color="white">Loading...</Typography>
//               )}
//               {isLoading && (
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     top: 8,
//                     right: 8,
//                     backgroundColor: "rgba(0, 0, 0, 0.6)",
//                     borderRadius: "50%",
//                     p: 1,
//                   }}
//                 >
//                   <CircularProgress size={20} sx={{ color: "#fff" }} />
//                 </Box>
//               )}
//             </Box>
//           </Box>

//           {/* Controls */}
//           <Box>
//             <Tabs
//               value={activeTab}
//               onChange={(_, v) => setActiveTab(v)}
//               sx={{ mb: 2 }}
//             >
//               <Tab label="AI" sx={{ textTransform: "none", minWidth: 80 }} />
//               <Tab
//                 label="Adjust"
//                 sx={{ textTransform: "none", minWidth: 80 }}
//               />
//               <Tab
//                 label="Resize"
//                 sx={{ textTransform: "none", minWidth: 80 }}
//               />
//             </Tabs>

//             <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
//               {/* AI Tab */}
//               <TabPanel value={activeTab} index={0}>
//                 <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                   <FormControlLabel
//                     control={
//                       <Switch
//                         checked={aiEnhance}
//                         onChange={(e) => setAiEnhance(e.target.checked)}
//                       />
//                     }
//                     label="AI Enhance (Auto improve)"
//                   />
//                   <FormControlLabel
//                     control={
//                       <Switch
//                         checked={aiRestore}
//                         onChange={(e) => setAiRestore(e.target.checked)}
//                       />
//                     }
//                     label="AI Restore (Fix old photos)"
//                   />
//                   <FormControlLabel
//                     control={
//                       <Switch
//                         checked={aiUpscale}
//                         onChange={(e) => setAiUpscale(e.target.checked)}
//                       />
//                     }
//                     label="AI Upscale (Increase resolution)"
//                   />
//                   <FormControlLabel
//                     control={
//                       <Switch
//                         checked={removeBackground}
//                         onChange={(e) => setRemoveBackground(e.target.checked)}
//                       />
//                     }
//                     label="Remove Background"
//                   />
//                 </Box>
//               </TabPanel>

//               {/* Adjust Tab */}
//               <TabPanel value={activeTab} index={1}>
//                 <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                   <FormControlLabel
//                     control={
//                       <Switch
//                         checked={isGrayscale}
//                         onChange={(e) => setIsGrayscale(e.target.checked)}
//                       />
//                     }
//                     label="Grayscale"
//                   />
//                   <FormControlLabel
//                     control={
//                       <Switch
//                         checked={isSepia}
//                         onChange={(e) => setIsSepia(e.target.checked)}
//                       />
//                     }
//                     label="Sepia"
//                   />

//                   <Box>
//                     <Typography variant="caption">
//                       Brightness: {manualBrightness}
//                     </Typography>
//                     <Slider
//                       value={manualBrightness}
//                       onChange={(_, v) => setManualBrightness(v as number)}
//                       min={-99}
//                       max={100}
//                       size="small"
//                     />
//                   </Box>

//                   <Box>
//                     <Typography variant="caption">
//                       Contrast: {manualContrast}
//                     </Typography>
//                     <Slider
//                       value={manualContrast}
//                       onChange={(_, v) => setManualContrast(v as number)}
//                       min={-100}
//                       max={100}
//                       size="small"
//                     />
//                   </Box>

//                   <Box>
//                     <Typography variant="caption">
//                       Saturation: {manualSaturation}
//                     </Typography>
//                     <Slider
//                       value={manualSaturation}
//                       onChange={(_, v) => setManualSaturation(v as number)}
//                       min={-100}
//                       max={100}
//                       size="small"
//                     />
//                   </Box>

//                   <Box>
//                     <Typography variant="caption">
//                       Vibrance: {manualVibrance}
//                     </Typography>
//                     <Slider
//                       value={manualVibrance}
//                       onChange={(_, v) => setManualVibrance(v as number)}
//                       min={-100}
//                       max={100}
//                       size="small"
//                     />
//                   </Box>

//                   <Box>
//                     <Typography variant="caption">
//                       Blur: {manualBlur}
//                     </Typography>
//                     <Slider
//                       value={manualBlur}
//                       onChange={(_, v) => setManualBlur(v as number)}
//                       min={0}
//                       max={2000}
//                       size="small"
//                     />
//                   </Box>

//                   <Box>
//                     <Typography variant="caption">
//                       Sharpen: {manualSharpen}
//                     </Typography>
//                     <Slider
//                       value={manualSharpen}
//                       onChange={(_, v) => setManualSharpen(v as number)}
//                       min={0}
//                       max={2000}
//                       size="small"
//                     />
//                   </Box>

//                   <Box>
//                     <Typography variant="caption">
//                       Vignette: {manualVignette}
//                     </Typography>
//                     <Slider
//                       value={manualVignette}
//                       onChange={(_, v) => setManualVignette(v as number)}
//                       min={0}
//                       max={100}
//                       size="small"
//                     />
//                   </Box>
//                 </Box>
//               </TabPanel>

//               {/* Resize Tab */}
//               <TabPanel value={activeTab} index={2}>
//                 <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                   <Box>
//                     <Typography variant="caption">
//                       Width: {resizeWidth || "Auto"}
//                     </Typography>
//                     <Slider
//                       value={resizeWidth}
//                       onChange={(_, v) => setResizeWidth(v as number)}
//                       min={0}
//                       max={2000}
//                       step={10}
//                       size="small"
//                     />
//                   </Box>

//                   <Box>
//                     <Typography variant="caption">
//                       Height: {resizeHeight || "Auto"}
//                     </Typography>
//                     <Slider
//                       value={resizeHeight}
//                       onChange={(_, v) => setResizeHeight(v as number)}
//                       min={0}
//                       max={2000}
//                       step={10}
//                       size="small"
//                     />
//                   </Box>

//                   <Box>
//                     <Typography
//                       variant="caption"
//                       sx={{ mb: 1, display: "block" }}
//                     >
//                       Resize Mode
//                     </Typography>
//                     <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//                       {(["fill", "fit", "scale", "crop", "pad"] as const).map(
//                         (mode) => (
//                           <Button
//                             key={mode}
//                             size="small"
//                             variant={
//                               resizeMode === mode ? "contained" : "outlined"
//                             }
//                             onClick={() => setResizeMode(mode)}
//                             sx={{ textTransform: "capitalize" }}
//                           >
//                             {mode}
//                           </Button>
//                         )
//                       )}
//                     </Box>
//                   </Box>
//                 </Box>
//               </TabPanel>
//             </Box>
//           </Box>
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{ p: 2, gap: 1 }}>
//         <Button onClick={handleReset} variant="outlined">
//           Reset
//         </Button>
//         <Button onClick={onClose} variant="outlined">
//           Cancel
//         </Button>
//         <Button
//           onClick={handleSave}
//           variant="contained"
//           disabled={isProcessing}
//           sx={{
//             backgroundColor: "#f97316",
//             "&:hover": { backgroundColor: "#ea580c" },
//           }}
//         >
//           {isProcessing ? <CircularProgress size={20} /> : "Apply Changes"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

// /**import { useEffect, useRef } from 'react';

// interface AdvancedMediaEditorProps {
//     isOpen: boolean;
//     onClose: () => void;
//     mediaUrl: string;
//     onSave: (editedUrl: string) => void;
// }

// declare global {
//     interface Window {
//         cloudinary: any;
//     }
// }

// export function AdvancedMediaEditor({ isOpen, onClose, mediaUrl, onSave }: AdvancedMediaEditorProps) {
//     const editorRef = useRef<any>(null);
//     const cloudName = import.meta.env.VITE_CLOUD_NAME;

//     // Extract public ID from Cloudinary URL
//     const getPublicIdFromUrl = (url: string): string => {
//         if (!url.includes('cloudinary.com')) return '';

//         try {
//             const parts = url.split('/upload/');
//             if (parts.length < 2) return '';

//             let afterUpload = parts[1];

//             // Remove transformations (everything before the first folder or version)
//             const segments = afterUpload.split('/');
//             let pathStart = 0;

//             // Skip transformation segments (they contain underscores and specific patterns)
//             for (let i = 0; i < segments.length; i++) {
//                 // Check if this looks like a transformation (contains _ or starts with v followed by numbers)
//                 if (segments[i].includes('_') || segments[i].match(/^v\d+$/)) {
//                     pathStart = i + 1;
//                 } else {
//                     // This is the start of the actual path
//                     break;
//                 }
//             }

//             // Get the path from the start point
//             const pathSegments = segments.slice(pathStart);
//             const fullPath = pathSegments.join('/');

//             // Remove file extension
//             const publicId = fullPath.replace(/\.[^.]+$/, '');

//             return publicId;
//         } catch (error) {
//             console.error('Error extracting public ID:', error);
//             return '';
//         }
//     };

//     const publicId = getPublicIdFromUrl(mediaUrl);

//     useEffect(() => {
//         if (!isOpen || !publicId) return;

//         const scriptId = 'cloudinary-media-editor-script';
//         const existingScript = document.getElementById(scriptId);

//         const initializeEditor = () => {
//             if (window.cloudinary && window.cloudinary.mediaEditor) {
//                 // Initialize the editor
//                 const editor = window.cloudinary.mediaEditor();

//                 editor.update({
//                     cloudName: cloudName,
//                     publicIds: [publicId],
//                     image: {
//                         steps: ["resizeAndCrop", "imageOverlay", "textOverlays", "export"],
//                         transformation: [
//                             { effect: "background_removal" },
//                             { effect: "enhance" },
//                             { effect: "upscale" },
//                             { effect: "restore" },
//                             { effect: "art:aurora" },
//                             { effect: "art:audrey:70" },
//                             { effect: "sepia" },
//                             { effect: "grayscale" },
//                             { effect: "brightness:30" },
//                             { effect: "contrast:50" },
//                             { effect: "blur:10" },
//                             { effect: "sharpen:50" }
//                         ]
//                     },
//                     video: {
//                         steps: ["trim"],
//                         transformation: [
//                             { effect: "sepia" },
//                             { effect: "brightness:30" }
//                         ]
//                     },
//                     // Callback when user saves the edited image
//                     onSave: (data: any) => {
//                         if (data && data.assets && data.assets.length > 0) {
//                             const editedAsset = data.assets[0];
//                             const editedUrl = editedAsset.secure_url || editedAsset.url;

//                             if (editedUrl) {
//                                 onSave(editedUrl);
//                                 onClose();
//                             }
//                         }
//                     },

//                     // Callback when user closes the editor
//                     onClose: () => {
//                         onClose();
//                     }
//                 });

//                 // Show the editor
//                 editor.show();
//                 editorRef.current = editor;
//             }
//         };

//         if (!existingScript) {
//             // Load the script
//             const script = document.createElement('script');
//             script.id = scriptId;
//             script.src = 'https://media-editor.cloudinary.com/all.js';
//             script.async = true;
//             script.onload = initializeEditor;
//             document.body.appendChild(script);
//         } else {
//             // Script already loaded
//             if (window.cloudinary && window.cloudinary.mediaEditor) {
//                 initializeEditor();
//             } else {
//                 existingScript.addEventListener('load', initializeEditor);
//             }
//         }

//         // Cleanup
//         return () => {
//             if (editorRef.current && editorRef.current.hide) {
//                 editorRef.current.hide();
//             }
//         };
//     }, [isOpen, publicId, cloudName, onSave, onClose]);

//     // This component doesn't render anything - the editor is a modal overlay
//     return null;
// }
//  */
import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Slider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import {
  fill,
  scale,
  crop,
  fit,
  pad,
} from "@cloudinary/url-gen/actions/resize";
import {
  enhance,
  upscale,
  grayscale,
  sepia,
  blur,
  vignette,
  backgroundRemoval,
  // sharpen,
} from "@cloudinary/url-gen/actions/effect";
import {
  brightness,
  contrast,
  saturation,
  vibrance,
} from "@cloudinary/url-gen/actions/adjust";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";

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
// const getPublicIdFromUrl = (url: string): string => {
//   if (!url.includes("/upload/")) return "";
//   try {
//     let afterUpload = url.split("/upload/")[1];
//     if (!afterUpload) return "";

//     const queryIndex = afterUpload.indexOf("?");
//     if (queryIndex !== -1) afterUpload = afterUpload.substring(0, queryIndex);

//     const cleanSegments = afterUpload
//       .split("/")
//       .filter((s) => !s.includes("_") && !s.includes(":") && !/^v\d+$/.test(s));

//     return cleanSegments.join("/").replace(/\.[^.]+$/, "");
//   } catch (error) {
//     console.error("Error extracting public ID:", error);
//     return "";
//   }
// };
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
  const [manualSharpen, setManualSharpen] = useState(0);
  const [manualVignette, setManualVignette] = useState(0);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [isSepia, setIsSepia] = useState(false);
  const [resizeWidth, setResizeWidth] = useState(0);
  const [resizeHeight, setResizeHeight] = useState(0);
  const [resizeMode, setResizeMode] = useState<
    "fill" | "fit" | "scale" | "crop" | "pad"
  >("fill");

  // Debounced states
  const dAiEnhance = useDebounce(aiEnhance, 300);
  const dAiUpscale = useDebounce(aiUpscale, 300);
  const dRemoveBackground = useDebounce(removeBackground, 300);
  const dBrightness = useDebounce(manualBrightness, 300);
  const dContrast = useDebounce(manualContrast, 300);
  const dSaturation = useDebounce(manualSaturation, 300);
  const dVibrance = useDebounce(manualVibrance, 300);
  const dBlur = useDebounce(manualBlur, 300);
  const dSharpen = useDebounce(manualSharpen, 300);
  const dVignette = useDebounce(manualVignette, 300);
  const dGrayscale = useDebounce(isGrayscale, 300);
  const dSepia = useDebounce(isSepia, 300);
  const dResizeWidth = useDebounce(resizeWidth, 300);
  const dResizeHeight = useDebounce(resizeHeight, 300);
  const dResizeMode = useDebounce(resizeMode, 300);

  // Build transformed image
  const transformedImage = useMemo(() => {
    if (!publicId) return null;

    // Start with clean image (no existing filters)
    let img = cld.image(publicId);

    // Resize
    // if (dResizeWidth > 0 || dResizeHeight > 0) {
    //   const w = dResizeWidth;
    //   const h = dResizeHeight;
    //   const resizeFuncs = {
    //     fill: () =>
    //       w && h ? fill().width(w).height(h).gravity(autoGravity()) : null,
    //     fit: () => fit().width(w).height(h),
    //     scale: () => scale().width(w).height(h),
    //     crop: () =>
    //       w && h ? crop().width(w).height(h).gravity(autoGravity()) : null,
    //     pad: () => pad().width(w).height(h),
    //   };
    //   const resizeFunc = resizeFuncs[dResizeMode]();
    //   if (resizeFunc) img = img.resize(resizeFunc);
    // }

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
  }, [
    cld,
    publicId,
    dAiEnhance,
    dAiUpscale,
    dRemoveBackground,
    dBrightness,
    dContrast,
    dSaturation,
    dVibrance,
    dBlur,
    dSharpen,
    dVignette,
    dGrayscale,
    dSepia,
    dResizeWidth,
    dResizeHeight,
    dResizeMode,
  ]);

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
    [
      setAiEnhance,
      setAiUpscale,
      setRemoveBackground,
      setIsGrayscale,
      setIsSepia,
    ].forEach((fn) => fn(false));
    [
      setManualBrightness,
      setManualContrast,
      setManualSaturation,
      setManualVibrance,
      setManualBlur,
      setManualSharpen,
      setManualVignette,
      setResizeWidth,
      setResizeHeight,
    ].forEach((fn) => fn(0));
    setResizeMode("fill");
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
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{ mb: 2 }}
            >
              <Tab label="AI" sx={{ textTransform: "none", minWidth: 80 }} />
              <Tab
                label="Adjust"
                sx={{ textTransform: "none", minWidth: 80 }}
              />
              {/*<Tab
                label="Resize"
                sx={{ textTransform: "none", minWidth: 80 }}
              />*/}
            </Tabs>

            <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
              {/* AI Tab */}
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={aiEnhance}
                        onChange={(e) => setAiEnhance(e.target.checked)}
                      />
                    }
                    label="AI Enhance (Auto improve)"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={aiUpscale}
                        onChange={(e) => setAiUpscale(e.target.checked)}
                      />
                    }
                    label="AI Upscale (Increase resolution)"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={removeBackground}
                        onChange={(e) => setRemoveBackground(e.target.checked)}
                      />
                    }
                    label="Remove Background"
                  />
                </Box>
              </TabPanel>

              {/* Adjust Tab */}
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isGrayscale}
                        onChange={(e) => setIsGrayscale(e.target.checked)}
                      />
                    }
                    label="Grayscale"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isSepia}
                        onChange={(e) => setIsSepia(e.target.checked)}
                      />
                    }
                    label="Sepia"
                  />
                  <SliderControl
                    label="Brightness"
                    value={manualBrightness}
                    onChange={setManualBrightness}
                    min={-99}
                    max={100}
                  />
                  <SliderControl
                    label="Contrast"
                    value={manualContrast}
                    onChange={setManualContrast}
                    min={-100}
                    max={100}
                  />
                  <SliderControl
                    label="Saturation"
                    value={manualSaturation}
                    onChange={setManualSaturation}
                    min={-100}
                    max={100}
                  />
                  <SliderControl
                    label="Vibrance"
                    value={manualVibrance}
                    onChange={setManualVibrance}
                    min={-100}
                    max={100}
                  />
                  <SliderControl
                    label="Blur"
                    value={manualBlur}
                    onChange={setManualBlur}
                    min={0}
                    max={2000}
                  />
                  <SliderControl
                    label="Vignette"
                    value={manualVignette}
                    onChange={setManualVignette}
                    min={0}
                    max={100}
                  />
                </Box>
              </TabPanel>

              {/* Resize Tab */}
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <SliderControl
                    label="Width"
                    value={resizeWidth}
                    onChange={setResizeWidth}
                    min={0}
                    max={2000}
                  />
                  <SliderControl
                    label="Height"
                    value={resizeHeight}
                    onChange={setResizeHeight}
                    min={0}
                    max={2000}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ mb: 1, display: "block" }}
                    >
                      Resize Mode
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {(["fill", "fit", "scale", "crop", "pad"] as const).map(
                        (mode) => (
                          <Button
                            key={mode}
                            size="small"
                            variant={
                              resizeMode === mode ? "contained" : "outlined"
                            }
                            onClick={() => setResizeMode(mode)}
                            sx={{ textTransform: "capitalize" }}
                          >
                            {mode}
                          </Button>
                        )
                      )}
                    </Box>
                  </Box>
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
