import { useEffect, useRef } from "react";
import { Button } from "@mui/material";
import { Upload } from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { toast } from 'react-toastify';

interface CloudinaryUploadWidgetProps {
    onUpload: (url: string, publicId: string) => void;
    buttonText?: string;
    folder?: string;
    allowVideos?: boolean;
    cropping?: boolean;
}

declare global {
    interface Window {
        cloudinary: any;
    }
}

export function CloudinaryUploadWidget({
    onUpload,
    buttonText = "Upload Media",
    folder = "odyssey",
    allowVideos = true,
    cropping = true,
}: CloudinaryUploadWidgetProps) {
    const widgetRef = useRef<any>(null);
    const storeUser = useUserStore.getState().user;

    useEffect(() => {
        const scriptId = "cloudinary-upload-widget-script";
        const existingScript = document.getElementById(scriptId);
        const userId = storeUser?._id;
        const initializeWidget = () => {
            if (window.cloudinary && !widgetRef.current) {
                const sources = ["local", "url", "camera"];
                const allowedFormats = allowVideos
                    ? ["image", "video"]
                    : ["image"];

                widgetRef.current = window.cloudinary.createUploadWidget(
                    {
                        cloudName: import.meta.env.VITE_CLOUD_NAME,
                        uploadPreset: import.meta.env.VITE_UPLOAD_PRESET,
                        folder: `users/${userId}`,
                        sources,
                        multiple: false,
                        clientAllowedFormats: allowedFormats,
                        maxFileSize: allowVideos ? 100 * 1024 * 1024 : 2 * 1024 * 1024, // 100MB video / 2MB image
                        resourceType: "auto",
                        cropping,
                        croppingAspectRatio: cropping ? 1 : undefined,
                        showAdvancedOptions: true,
                    },
                    (error: any, result: any) => {
                        if (!error && result && result.event === "success") {
                            onUpload(result.info.secure_url, result.info.public_id);
                        } else if (error) {
                            console.error("Upload error:", error);
                            toast.error("Upload failed: " + error.message);
                        }
                    }
                );
            }
        };

        if (!existingScript) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://upload-widget.cloudinary.com/latest/global/all.js";
            script.async = true;
            script.onload = initializeWidget;
            document.body.appendChild(script);
        } else {
            if (window.cloudinary) {
                initializeWidget();
            } else {
                existingScript.addEventListener("load", initializeWidget);
            }
        }

        return () => {
            if (existingScript) {
                existingScript.removeEventListener("load", initializeWidget);
            }
        };
    }, [folder, allowVideos, cropping, onUpload]);

    const openWidget = () => {
        if (widgetRef.current) {
            widgetRef.current.open();
        } else {
            console.error("Cloudinary widget not initialized yet");
        }
    };

    return (
        <Button
            variant="outlined"
            onClick={openWidget}
            sx={{
                borderColor: "#d4d4d4",
                color: "#171717",
                textTransform: "none",
                "&:hover": {
                    borderColor: "#a3a3a3",
                    backgroundColor: "#fafafa",
                },
            }}
        >
            <Upload size={16} style={{ marginRight: "8px" }} />
            {buttonText}
        </Button>
    );
}
