
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Typography,
    Box,
    CircularProgress,
    Stack,
    Divider,
    Paper
} from '@mui/material';
import { Wallet, Car, Utensils, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { calculateBudget } from '../../services/createTrip.service'; // We will add this export next
import { toast } from 'react-toastify';

interface BudgetResult {
    transportation: string;
    food: string;
    activities: string;
    total: string;
    currency: string;
    note: string;
}

interface BudgetEstimatorDialogProps {
    open: boolean;
    onClose: () => void;
    tripData: any; // The trip object to calculate budget for
}
interface SanitizedRoutePoint {
    name: string;
    lat: number;
    lon: number;
    note: string;
}
const BudgetEstimatorDialog: React.FC<BudgetEstimatorDialogProps> = ({ open, onClose, tripData }) => {
    const { t } = useTranslation();
    const [origin, setOrigin] = useState('');
    const [travelers, setTravelers] = useState(1);
    const [style, setStyle] = useState('standard');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<BudgetResult | null>(null);

    const handleCalculate = async () => {
        if (!origin) {
            toast.error(t('budget.originRequired') || "Origin is required");
            return;
        }

        setLoading(true);
        try {
            const { instructions, ...restTrip } = tripData;

            const sanitizedTrip = {
                ordered_route: tripData.ordered_route.map(({ name, lat, lon, note }: SanitizedRoutePoint) => ({
                    name,
                    lat,
                    lon,
                    note
                })),
                mode: tripData.mode,
                directions: tripData.instructions
            };
            console.log(sanitizedTrip);

            const data = await calculateBudget({
                trip: sanitizedTrip,
                origin,
                travelers,
                style
            });

            if (data.success && data.budget) {
                setResult(data.budget);
            } else {
                toast.error("Failed to calculate budget");
            }
        } catch (error) {
            console.error("Budget calculation failed:", error);
            toast.error("Error calculating budget");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setResult(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={{ zIndex: 10002 }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ff9800' }}>
                <Wallet size={24} />
                {t('budget.title') || "Smart Budget Estimator"}
            </DialogTitle>

            <DialogContent>
                {!result ? (
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('budget.subtitle') || "Get a personalized cost estimate based on your location and travel style."}
                        </Typography>

                        <TextField
                            label={t('budget.origin') || "Where are you coming from?"}
                            fullWidth
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            placeholder="e.g. Tel Aviv, London, New York"
                        />

                        <Stack direction="row" spacing={2}>
                            <TextField
                                label={t('budget.travelers') || "Travelers"}
                                type="number"
                                fullWidth
                                value={travelers === 0 ? '' : travelers}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setTravelers(val === '' ? 0 : parseInt(val));
                                }}
                                onBlur={() => {
                                    if (travelers < 1) setTravelers(1); // enforce min only after leaving the field
                                }}
                                slotProps={{
                                    htmlInput: {
                                        min: 1
                                    }
                                }}
                            />


                            <TextField
                                select
                                label={t('budget.style') || "Travel Style"}
                                fullWidth
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                                SelectProps={{
                                    MenuProps: { sx: { zIndex: 10003 } }
                                }}
                            >
                                <MenuItem value="budget">{t('budget.style.budget') || "Budget / Backpacker"}</MenuItem>
                                <MenuItem value="standard">{t('budget.style.standard') || "Standard"}</MenuItem>
                                <MenuItem value="luxury">{t('budget.style.luxury') || "Luxury"}</MenuItem>
                            </TextField>
                        </Stack>
                    </Stack>
                ) : (
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fdf7f2', borderColor: '#ffe0b2' }}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                    <Typography variant="h4" color="#ff9800" fontWeight="bold">
                                        {result.total}
                                    </Typography>
                                </Box>
                                <Divider />

                                <Stack direction="row" alignItems="center" gap={2}>
                                    <Car size={20} color="#666" />
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">Transportation</Typography>
                                        <Typography variant="body2" color="text.secondary">{result.transportation}</Typography>
                                    </Box>
                                </Stack>

                                <Stack direction="row" alignItems="center" gap={2}>
                                    <Utensils size={20} color="#666" />
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">Food</Typography>
                                        <Typography variant="body2" color="text.secondary">{result.food}</Typography>
                                    </Box>
                                </Stack>

                                <Stack direction="row" alignItems="center" gap={2}>
                                    <Ticket size={20} color="#666" />
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">Activities</Typography>
                                        <Typography variant="body2" color="text.secondary">{result.activities}</Typography>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Paper>
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {result.note}
                        </Typography>
                        <Button onClick={() => setResult(null)} size="small" sx={{ alignSelf: 'center' }}>
                            {t('budget.recalculate') || "Recalculate"}
                        </Button>
                    </Stack>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="inherit">
                    {t('general.cancel') || "Close"}
                </Button>
                {!result && (
                    <Button
                        onClick={handleCalculate}
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Wallet size={18} />}
                        disabled={loading}
                        sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
                    >
                        {t('budget.calculate') || "Calculate Estimate"}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default BudgetEstimatorDialog;
