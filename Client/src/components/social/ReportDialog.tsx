import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    type SelectChangeEvent,
    Typography,
    Box
} from '@mui/material';
import { submitReport } from '../../services/report.service';

interface ReportDialogProps {
    open: boolean;
    onClose: () => void;
    tripId: string;
    userId: string;
}

const REPORT_REASONS = [
    "Inappropriate content",
    "Spam or misleading",
    "Harassment or hate speech",
    "Violence or dangerous organizations",
    "Intellectual property violation",
    "Other"
];

export default function ReportDialog({ open, onClose, tripId, userId }: ReportDialogProps) {
    const [reason, setReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReasonChange = (event: SelectChangeEvent) => {
        setReason(event.target.value);
        setError(null);
    };

    const handleSubmit = async () => {
        const finalReason = reason === "Other" ? customReason : reason;

        if (!finalReason.trim()) {
            setError("Please provide a reason for reporting.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            console.log("submitting report", tripId, finalReason, userId);
            await submitReport(tripId, finalReason, userId);
            onClose();
            // Ideally show a success toast here, but for now just close
            alert("Report submitted successfully. Thank you.");
        } catch (err) {
            console.error("Failed to submit report:", err);
            setError("Failed to submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
            setReason('');
            setCustomReason('');
        }
    };

    const handleClose = () => {
        setReason('');
        setCustomReason('');
        setError(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            onClick={(e) => e.stopPropagation()}
        >
            <DialogTitle>Report Post</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <Typography variant="body2" color="text.secondary">
                        Please select a reason for reporting this post.
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel>Reason</InputLabel>
                        <Select
                            value={reason}
                            label="Reason"
                            onChange={handleReasonChange}
                        >
                            {REPORT_REASONS.map((r) => (
                                <MenuItem key={r} value={r}>{r}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {reason === "Other" && (
                        <TextField
                            label="Please specify"
                            multiline
                            rows={3}
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            fullWidth
                        />
                    )}

                    {error && (
                        <Typography color="error" variant="caption">
                            {error}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting || !reason}
                >
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
