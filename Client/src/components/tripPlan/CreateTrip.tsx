import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    IconButton,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Container,
    Grid,
    Paper
} from '@mui/material';
import { Plus, Trash2, Save, MapPin, List as ListIcon, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { toast } from 'react-toastify';
import { CloudinaryUploadWidget } from '../general/CloudinaryUploadWidget';
import { useTranslation } from 'react-i18next';
import { saveTrip, parseTrip } from '../../services/createTrip.service';


interface RouteStop {
    name: string;
    note: string;
    lat: number;
    lon: number;
}

export const CreateTrip: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const { t } = useTranslation();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mode, setMode] = useState('driving');
    const [stops, setStops] = useState<RouteStop[]>([{ name: '', note: '', lat: 0, lon: 0 }]);
    const [activities, setActivities] = useState<string[]>(['']);
    const [instructions, setInstructions] = useState<string[]>(['']);
    const [googleMapsUrl, setGoogleMapsUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [visibility, setVisibility] = useState<'private' | 'public'>('private');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiInput, setAiInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleStopChange = (index: number, field: keyof RouteStop, value: string) => {
        const newStops = [...stops];
        newStops[index] = { ...newStops[index], [field]: value };
        setStops(newStops);
    };

    const addStop = () => setStops([...stops, { name: '', note: '', lat: 0, lon: 0 }]);
    const removeStop = (i: number) => setStops(stops.filter((_, x) => x !== i));

    const handleActivityChange = (i: number, v: string) => {
        const x = [...activities];
        x[i] = v;
        setActivities(x);
    };

    const addActivity = () => setActivities([...activities, '']);
    const removeActivity = (i: number) => setActivities(activities.filter((_, x) => x !== i));

    const handleInstructionChange = (i: number, v: string) => {
        const x = [...instructions];
        x[i] = v;
        setInstructions(x);
    };

    const addInstruction = () => setInstructions([...instructions, '']);
    const removeInstruction = (i: number) => setInstructions(instructions.filter((_, x) => x !== i));

    // ✅ FIXED SAVE FUNCTION
    const handleSave = async () => {
        if (isSubmitting) return;

        if (!user || !user._id) return toast.error(t("createTrip.errors.login"));
        if (!title.trim()) return toast.error(t("createTrip.errors.noTitle"));

        const validStops = stops.filter(s => s.name.trim());
        const validActivities = activities.filter(a => a.trim());
        const validInstructions = instructions.filter(i => i.trim());

        if (!validStops.length) return toast.error(t("createTrip.errors.noStops"));

        setIsSubmitting(true);

        try {
            const payload = {
                userId: user._id,
                title,
                description,
                optimizedRoute: {
                    ordered_route: validStops,
                    mode,
                    instructions: validInstructions,
                    google_maps_url: googleMapsUrl,
                },
                activities: validActivities,
                visabilityStatus: visibility,
                image: imageUrl,
            };

            const result = await saveTrip(payload);

            if (result.success) {
                toast.success(t("createTrip.success"));
                navigate("/profile");
            } else {
                toast.error(t("createTrip.errors.fail"));
            }

        } catch (err) {
            console.error(err);
            toast.error(t("createTrip.errors.exception"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateFromAI = async () => {
        if (!aiInput.trim()) return;

        setIsGenerating(true);

        try {
            const data = await parseTrip(aiInput);

            if (!data.success) {
                toast.error(t("createTrip.errors.aiFailed"));
                return;
            }

            const trip = data.trip;

            setTitle(trip.title || "");
            setDescription(trip.description || "");
            setMode(trip.mode || "driving");
            setStops(trip.stops?.length ? trip.stops : [{ name: "", note: "", lat: 0, lon: 0 }]);
            setActivities(trip.activities || []);
            setInstructions(trip.instructions || []);
            setGoogleMapsUrl(trip.googleMapsUrl || "");
            setImageUrl(trip.image || "");

            toast.success(t("createTrip.aiSuccess"));

        } catch (err) {
            console.error(err);
            toast.error(t("createTrip.errors.exception"));
        } finally {
            setIsGenerating(false);
        }
    };



    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardHeader
                    title={t("createTrip.title")}
                    subheader={t("createTrip.subtitle")}
                />

                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Divider />

                    <Typography variant="h6">
                        {t("createTrip.aiImport")}
                    </Typography>

                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        placeholder={t("createTrip.aiPlaceholder")}
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                    />

                    <Button
                        variant="contained"
                        disabled={!aiInput || isGenerating}
                        onClick={handleGenerateFromAI}
                        sx={{ mt: 1 }}
                    >
                        {isGenerating ? t("general.generating") : t("createTrip.generateFromText")}
                    </Button>

                    <Divider />

                    {/* BASIC INFO */}
                    <Typography variant="h6"><ListIcon size={20} /> {t("createTrip.basic")}</Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t("createTrip.tripTitle")}
                                placeholder={t("createTrip.examples.trip")}
                                fullWidth value={title} onChange={e => setTitle(e.target.value)}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t("createTrip.description")}
                                placeholder={t("createTrip.examples.description")}
                                fullWidth multiline rows={3}
                                value={description} onChange={e => setDescription(e.target.value)}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>{t("createTrip.travelMode")}</InputLabel>
                                <Select value={mode} label={t("createTrip.travelMode")}
                                    onChange={e => setMode(e.target.value)}>
                                    <MenuItem value="driving">{t("createTrip.modes.driving")}</MenuItem>
                                    <MenuItem value="walking">{t("createTrip.modes.walking")}</MenuItem>
                                    <MenuItem value="bicycling">{t("createTrip.modes.biking")}</MenuItem>
                                    <MenuItem value="transit">{t("createTrip.modes.transit")}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>{t("createTrip.visibility")}</InputLabel>
                                <Select value={visibility} label={t("createTrip.visibility")}
                                    onChange={e => setVisibility(e.target.value as any)}>
                                    <MenuItem value="private">{t("createTrip.private")}</MenuItem>
                                    <MenuItem value="public">{t("createTrip.public")}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Divider />

                    {/* IMAGE */}
                    <Typography variant="h6"><ImageIcon size={20} /> {t("createTrip.image")}</Typography>
                    <CloudinaryUploadWidget onUpload={(url) => setImageUrl(url)} folder="odyssey/trips" buttonText={t("createTrip.uploadImage")} allowVideos={true} />

                    <Divider />

                    {/* ROUTE */}
                    <Typography variant="h6"><MapPin size={20} /> {t("createTrip.stops")}</Typography>
                    {stops.map((s, i) =>
                        <Paper key={i} sx={{ p: 2, display: "flex", gap: 2 }}>
                            <Box flex={1}>
                                <TextField placeholder={t("createTrip.examples.location")}
                                    label={t("createTrip.location")} size="small"
                                    value={s.name}
                                    onChange={e => handleStopChange(i, "name", e.target.value)} />
                                <TextField placeholder={t("createTrip.note")}
                                    label={t("createTrip.note")} size="small"
                                    value={s.note}
                                    onChange={e => handleStopChange(i, "note", e.target.value)} />
                            </Box>
                            <IconButton color="error" onClick={() => removeStop(i)}><Trash2 /></IconButton>
                        </Paper>
                    )}

                    <Button startIcon={<Plus />} onClick={addStop}>{t("createTrip.addStop")}</Button>

                    <Divider />

                    {/* ACTIVITIES */}
                    <Typography variant="h6">{t("createTrip.activities")}</Typography>
                    {activities.map((a, i) =>
                        <Box key={i} sx={{ display: "flex", gap: 1 }}>
                            <TextField fullWidth placeholder={t("createTrip.examples.activity")}
                                value={a} onChange={e => handleActivityChange(i, e.target.value)} />
                            <IconButton color="error" onClick={() => removeActivity(i)}><Trash2 /></IconButton>
                        </Box>
                    )}
                    <Button startIcon={<Plus />} onClick={addActivity}>{t("createTrip.addActivity")}</Button>

                    <Divider />

                    {/* INSTRUCTIONS */}
                    <Typography variant="h6">{t("createTrip.instructions")}</Typography>
                    {instructions.map((a, i) =>
                        <Box key={i} sx={{ display: "flex", gap: 1 }}>
                            <TextField fullWidth multiline placeholder={t("createTrip.examples.instruction")}
                                value={a} onChange={e => handleInstructionChange(i, e.target.value)} />
                            <IconButton color="error" onClick={() => removeInstruction(i)}><Trash2 /></IconButton>
                        </Box>
                    )}
                    <Button startIcon={<Plus />} onClick={addInstruction}>{t("createTrip.addInstruction")}</Button>

                    <Divider />

                    {/* MAP URL */}
                    <Typography variant="h6"><LinkIcon size={20} /> {t("createTrip.mapLink")}</Typography>
                    <TextField fullWidth placeholder={t("createTrip.examples.mapsUrl")}
                        value={googleMapsUrl}
                        onChange={e => setGoogleMapsUrl(e.target.value)} />

                    <Divider />

                    {/* ACTION BTNS */}
                    <Box sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
                        <Button variant="outlined" onClick={() => navigate(-1)}>{t("general.cancel")}</Button>
                        <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
                            {isSubmitting ? t("general.saving") : t("createTrip.create")}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};
