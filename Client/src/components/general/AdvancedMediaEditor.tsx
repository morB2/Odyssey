import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { fill, scale, crop, fit, pad } from '@cloudinary/url-gen/actions/resize';
import {
    enhance,
    upscale,
    grayscale,
    sepia,
    blur,
    vignette,
    backgroundRemoval} from '@cloudinary/url-gen/actions/effect';
import {
  brightness,
  contrast,
  saturation,
  vibrance
} from '@cloudinary/url-gen/actions/adjust';
import { auto } from '@cloudinary/url-gen/qualifiers/quality';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';

interface AdvancedMediaEditorProps {
    isOpen: boolean;
    onClose: () => void;
    mediaUrl: string;
    onSave: (editedUrl: string) => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
        </div>
    );
}

export function AdvancedMediaEditor({ isOpen, onClose, mediaUrl, onSave }: AdvancedMediaEditorProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Extract public ID from Cloudinary URL
    const getPublicIdFromUrl = (url: string): string => {
        if (!url.includes('cloudinary.com')) return '';

        try {
            const parts = url.split('/upload/');
            if (parts.length < 2) return '';

            let afterUpload = parts[1];

            // Remove transformations (everything before the first folder or version)
            const segments = afterUpload.split('/');
            let pathStart = 0;

            // Skip transformation segments (they contain underscores and specific patterns)
            for (let i = 0; i < segments.length; i++) {
                // Check if this looks like a transformation (contains _ or starts with v followed by numbers)
                if (segments[i].includes('_') || segments[i].match(/^v\d+$/)) {
                    pathStart = i + 1;
                } else {
                    // This is the start of the actual path
                    break;
                }
            }

            // Get the path from the start point
            const pathSegments = segments.slice(pathStart);
            const fullPath = pathSegments.join('/');

            // Remove file extension
            const publicId = fullPath.replace(/\.[^.]+$/, '');

            return publicId;
        } catch (error) {
            console.error('Error extracting public ID:', error);
            return '';
        }
    };

    const publicId = getPublicIdFromUrl(mediaUrl);
    const cloudName = import.meta.env.VITE_CLOUD_NAME;

    // Initialize Cloudinary
    const cld = new Cloudinary({
        cloud: {
            cloudName: cloudName
        }
    });

    // AI Enhancement states
    const [aiEnhance, setAiEnhance] = useState(false);
    const [aiRestore, setAiRestore] = useState(false);
    const [aiUpscale, setAiUpscale] = useState(false);
    const [removeBackground, setRemoveBackground] = useState(false);

    // Manual adjustment states
    const [manualBrightness, setManualBrightness] = useState(0);
    const [manualContrast, setManualContrast] = useState(0);
    const [manualSaturation, setManualSaturation] = useState(0);
    const [manualVibrance, setManualVibrance] = useState(0);
    const [manualBlur, setManualBlur] = useState(0);
    const [manualSharpen, setManualSharpen] = useState(0);
    const [manualVignette, setManualVignette] = useState(0);
    const [isGrayscale, setIsGrayscale] = useState(false);
    const [isSepia, setIsSepia] = useState(false);

    // Resize states
    const [resizeWidth, setResizeWidth] = useState(0);
    const [resizeHeight, setResizeHeight] = useState(0);
    const [resizeMode, setResizeMode] = useState<'fill' | 'fit' | 'scale' | 'crop' | 'pad'>('fill');

    // Build the transformed image
    const buildTransformedImage = () => {
        if (!publicId) return null;

        let img = cld.image(publicId);

        // Apply resize if set
        if (resizeWidth > 0 || resizeHeight > 0) {
            const w = resizeWidth;
            const h = resizeHeight;

            switch (resizeMode) {
                case 'fill':
                    img = img.resize(fill().width(w).height(h).gravity(autoGravity()));
                    break;
                case 'fit':
                    img = img.resize(fit().width(w).height(h));
                    break;
                case 'scale':
                    img = img.resize(scale().width(w).height(h));
                    break;
                case 'crop':
                    img = img.resize(crop().width(w).height(h).gravity(autoGravity()));
                    break;
                case 'pad':
                    img = img.resize(pad().width(w).height(h));
                    break;
            }
        }

        // Apply AI enhancements
        if (aiEnhance) img = img.effect(enhance());
        // if (aiRestore) img = img.effect(restore());
        if (aiUpscale) img = img.effect(upscale());
        if (removeBackground) img = img.effect(backgroundRemoval());

        // Apply manual adjustments
        if (manualBrightness !== 0) img = img.adjust(brightness(manualBrightness));
        if (manualContrast !== 0) img = img.adjust(contrast(manualContrast));
        if (manualSaturation !== 0) img = img.adjust(saturation(manualSaturation));
        if (manualVibrance !== 0) img = img.adjust(vibrance(manualVibrance));
        if (manualBlur > 0) img = img.effect(blur(manualBlur));
        // if (manualSharpen > 0) img = img.effect(sharpen(manualSharpen));
        if (manualVignette > 0) img = img.effect(vignette(manualVignette));
        if (isGrayscale) img = img.effect(grayscale());
        if (isSepia) img = img.effect(sepia());

        return img;
    };

    const transformedImage = buildTransformedImage();

    const handleSave = () => {
        if (!transformedImage) return;

        setIsProcessing(true);
        // Get the transformed URL
        const transformedUrl = transformedImage.toURL();

        // Simulate processing delay
        setTimeout(() => {
            setIsProcessing(false);
            onSave(transformedUrl);
            onClose();
        }, 500);
    };

    const handleReset = () => {
        setAiEnhance(false);
        setAiRestore(false);
        setAiUpscale(false);
        setRemoveBackground(false);
        setManualBrightness(0);
        setManualContrast(0);
        setManualSaturation(0);
        setManualVibrance(0);
        setManualBlur(0);
        setManualSharpen(0);
        setManualVignette(0);
        setIsGrayscale(false);
        setIsSepia(false);
        setResizeWidth(0);
        setResizeHeight(0);
    };

    if (!publicId) {
        return (
            <Dialog open={isOpen} onClose={onClose} maxWidth="sm">
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <Typography>Invalid Cloudinary URL. Please use a valid Cloudinary image.</Typography>
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
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={600}>
                        Advanced Media Editor
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 400px' }, gap: 3 }}>
                    {/* Preview */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Preview
                        </Typography>
                        <Box
                            sx={{
                                width: '100%',
                                aspectRatio: '16/9',
                                backgroundColor: '#000',
                                borderRadius: 2,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                        >
                            {transformedImage ? (
                                <AdvancedImage
                                    cldImg={transformedImage}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <Typography color="white">Loading...</Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Controls */}
                    <Box>
                        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                            <Tab label="AI" sx={{ textTransform: 'none', minWidth: 80 }} />
                            <Tab label="Adjust" sx={{ textTransform: 'none', minWidth: 80 }} />
                            <Tab label="Resize" sx={{ textTransform: 'none', minWidth: 80 }} />
                        </Tabs>

                        <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                            {/* AI Tab */}
                            <TabPanel value={activeTab} index={0}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <FormControlLabel
                                        control={<Switch checked={aiEnhance} onChange={(e) => setAiEnhance(e.target.checked)} />}
                                        label="AI Enhance (Auto improve)"
                                    />
                                    <FormControlLabel
                                        control={<Switch checked={aiRestore} onChange={(e) => setAiRestore(e.target.checked)} />}
                                        label="AI Restore (Fix old photos)"
                                    />
                                    <FormControlLabel
                                        control={<Switch checked={aiUpscale} onChange={(e) => setAiUpscale(e.target.checked)} />}
                                        label="AI Upscale (Increase resolution)"
                                    />
                                    <FormControlLabel
                                        control={<Switch checked={removeBackground} onChange={(e) => setRemoveBackground(e.target.checked)} />}
                                        label="Remove Background"
                                    />
                                </Box>
                            </TabPanel>

                            {/* Adjust Tab */}
                            <TabPanel value={activeTab} index={1}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <FormControlLabel
                                        control={<Switch checked={isGrayscale} onChange={(e) => setIsGrayscale(e.target.checked)} />}
                                        label="Grayscale"
                                    />
                                    <FormControlLabel
                                        control={<Switch checked={isSepia} onChange={(e) => setIsSepia(e.target.checked)} />}
                                        label="Sepia"
                                    />

                                    <Box>
                                        <Typography variant="caption">Brightness: {manualBrightness}</Typography>
                                        <Slider
                                            value={manualBrightness}
                                            onChange={(_, v) => setManualBrightness(v as number)}
                                            min={-99}
                                            max={100}
                                            size="small"
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption">Contrast: {manualContrast}</Typography>
                                        <Slider
                                            value={manualContrast}
                                            onChange={(_, v) => setManualContrast(v as number)}
                                            min={-100}
                                            max={100}
                                            size="small"
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption">Saturation: {manualSaturation}</Typography>
                                        <Slider
                                            value={manualSaturation}
                                            onChange={(_, v) => setManualSaturation(v as number)}
                                            min={-100}
                                            max={100}
                                            size="small"
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption">Vibrance: {manualVibrance}</Typography>
                                        <Slider
                                            value={manualVibrance}
                                            onChange={(_, v) => setManualVibrance(v as number)}
                                            min={-100}
                                            max={100}
                                            size="small"
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption">Blur: {manualBlur}</Typography>
                                        <Slider
                                            value={manualBlur}
                                            onChange={(_, v) => setManualBlur(v as number)}
                                            min={0}
                                            max={2000}
                                            size="small"
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption">Sharpen: {manualSharpen}</Typography>
                                        <Slider
                                            value={manualSharpen}
                                            onChange={(_, v) => setManualSharpen(v as number)}
                                            min={0}
                                            max={2000}
                                            size="small"
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption">Vignette: {manualVignette}</Typography>
                                        <Slider
                                            value={manualVignette}
                                            onChange={(_, v) => setManualVignette(v as number)}
                                            min={0}
                                            max={100}
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                            </TabPanel>

                            {/* Resize Tab */}
                            <TabPanel value={activeTab} index={2}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="caption">Width: {resizeWidth || 'Auto'}</Typography>
                                        <Slider
                                            value={resizeWidth}
                                            onChange={(_, v) => setResizeWidth(v as number)}
                                            min={0}
                                            max={2000}
                                            step={10}
                                            size="small"
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption">Height: {resizeHeight || 'Auto'}</Typography>
                                        <Slider
                                            value={resizeHeight}
                                            onChange={(_, v) => setResizeHeight(v as number)}
                                            min={0}
                                            max={2000}
                                            step={10}
                                            size="small"
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                                            Resize Mode
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {(['fill', 'fit', 'scale', 'crop', 'pad'] as const).map((mode) => (
                                                <Button
                                                    key={mode}
                                                    size="small"
                                                    variant={resizeMode === mode ? 'contained' : 'outlined'}
                                                    onClick={() => setResizeMode(mode)}
                                                    sx={{ textTransform: 'capitalize' }}
                                                >
                                                    {mode}
                                                </Button>
                                            ))}
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
                    disabled={isProcessing}
                    sx={{ backgroundColor: '#f97316', '&:hover': { backgroundColor: '#ea580c' } }}
                >
                    {isProcessing ? <CircularProgress size={20} /> : 'Apply Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/**import { useEffect, useRef } from 'react';

interface AdvancedMediaEditorProps {
    isOpen: boolean;
    onClose: () => void;
    mediaUrl: string;
    onSave: (editedUrl: string) => void;
}

declare global {
    interface Window {
        cloudinary: any;
    }
}

export function AdvancedMediaEditor({ isOpen, onClose, mediaUrl, onSave }: AdvancedMediaEditorProps) {
    const editorRef = useRef<any>(null);
    const cloudName = import.meta.env.VITE_CLOUD_NAME;

    // Extract public ID from Cloudinary URL
    const getPublicIdFromUrl = (url: string): string => {
        if (!url.includes('cloudinary.com')) return '';

        try {
            const parts = url.split('/upload/');
            if (parts.length < 2) return '';

            let afterUpload = parts[1];

            // Remove transformations (everything before the first folder or version)
            const segments = afterUpload.split('/');
            let pathStart = 0;

            // Skip transformation segments (they contain underscores and specific patterns)
            for (let i = 0; i < segments.length; i++) {
                // Check if this looks like a transformation (contains _ or starts with v followed by numbers)
                if (segments[i].includes('_') || segments[i].match(/^v\d+$/)) {
                    pathStart = i + 1;
                } else {
                    // This is the start of the actual path
                    break;
                }
            }

            // Get the path from the start point
            const pathSegments = segments.slice(pathStart);
            const fullPath = pathSegments.join('/');

            // Remove file extension
            const publicId = fullPath.replace(/\.[^.]+$/, '');

            return publicId;
        } catch (error) {
            console.error('Error extracting public ID:', error);
            return '';
        }
    };

    const publicId = getPublicIdFromUrl(mediaUrl);

    useEffect(() => {
        if (!isOpen || !publicId) return;

        const scriptId = 'cloudinary-media-editor-script';
        const existingScript = document.getElementById(scriptId);

        const initializeEditor = () => {
            if (window.cloudinary && window.cloudinary.mediaEditor) {
                // Initialize the editor
                const editor = window.cloudinary.mediaEditor();

                editor.update({
                    cloudName: cloudName,
                    publicIds: [publicId],
                    image: {
                        steps: ["resizeAndCrop", "imageOverlay", "textOverlays", "export"],
                        transformation: [
                            { effect: "background_removal" },
                            { effect: "enhance" },
                            { effect: "upscale" },
                            { effect: "restore" },
                            { effect: "art:aurora" },
                            { effect: "art:audrey:70" },
                            { effect: "sepia" },
                            { effect: "grayscale" },
                            { effect: "brightness:30" },
                            { effect: "contrast:50" },
                            { effect: "blur:10" },
                            { effect: "sharpen:50" }
                        ]
                    },
                    video: {
                        steps: ["trim"],
                        transformation: [
                            { effect: "sepia" },
                            { effect: "brightness:30" }
                        ]
                    },
                    // Callback when user saves the edited image
                    onSave: (data: any) => {
                        if (data && data.assets && data.assets.length > 0) {
                            const editedAsset = data.assets[0];
                            const editedUrl = editedAsset.secure_url || editedAsset.url;

                            if (editedUrl) {
                                onSave(editedUrl);
                                onClose();
                            }
                        }
                    },

                    // Callback when user closes the editor
                    onClose: () => {
                        onClose();
                    }
                });

                // Show the editor
                editor.show();
                editorRef.current = editor;
            }
        };

        if (!existingScript) {
            // Load the script
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://media-editor.cloudinary.com/all.js';
            script.async = true;
            script.onload = initializeEditor;
            document.body.appendChild(script);
        } else {
            // Script already loaded
            if (window.cloudinary && window.cloudinary.mediaEditor) {
                initializeEditor();
            } else {
                existingScript.addEventListener('load', initializeEditor);
            }
        }

        // Cleanup
        return () => {
            if (editorRef.current && editorRef.current.hide) {
                editorRef.current.hide();
            }
        };
    }, [isOpen, publicId, cloudName, onSave, onClose]);

    // This component doesn't render anything - the editor is a modal overlay
    return null;
}
 */