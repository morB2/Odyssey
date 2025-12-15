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
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';

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

export const ReportDialog = ({ open, onClose, tripId, userId }: ReportDialogProps) => {
    const { t } = useTranslation();
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
            setError(t('report.errorNoReason'));
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await submitReport(tripId, finalReason, userId);
            onClose();
            // Ideally show a success toast here, but for now just close
            toast.success("Report submitted successfully. Thank you.");
        } catch (err: any) {
            console.error("Failed to submit report:", err);
            if(err.status === 409){
                setError(t('report.alreadyReported'));
            }else{
                setError(t('report.fail'));
            }
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
            disableScrollLock={true}
            fullWidth
            sx={{ zIndex: 10001 }}
            maxWidth="sm"
            onClick={(e) => e.stopPropagation()}
        >
            <DialogTitle>{t('report.title')}</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <Typography variant="body2" color="text.secondary">
                        {t('report.selectReason')}
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel>{t('report.reason')}</InputLabel>
                        <Select
                            value={reason}
                            label={t('report.reason')}
                            onChange={handleReasonChange}
                            MenuProps={{
                                disablePortal: true
                            }}
                        >
                            {REPORT_REASONS.map((r) => (
                                <MenuItem key={r} value={r}>{t(`report.reasons.${r}`)}</MenuItem>
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
                <Button onClick={handleClose} disabled={isSubmitting}>{t('report.cancel')}</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting || !reason}
                >
                    {isSubmitting ? t('report.submitting') : t('report.submit')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
