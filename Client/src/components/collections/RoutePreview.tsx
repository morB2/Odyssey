import { Box, Typography, styled, IconButton } from '@mui/material';
import { ChevronDown, MapPin, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../store/userStore';

interface RoutePreviewProps {
    userId: string;
    title: string;
    description: string;
    tripCount: number;
    firstTripImage: string;
    onClick: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

const RootBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    boxShadow: theme.shadows[10],
    cursor: 'pointer',
    transition: theme.transitions.create(['box-shadow', 'transform']),
    maxWidth: theme.breakpoints.values.md,
    margin: 'auto',
    '&:hover': {
        boxShadow: theme.shadows[18],
    },
}));

const ImageContainer = styled(Box)({
    height: 256,
    overflow: 'hidden',
    position: 'relative',
});

const BottomBar = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    background: 'linear-gradient(to bottom, #fff7ed, white)',
}));

export default function RoutePreview({userId, title, description, tripCount, firstTripImage, onClick, onEdit, onDelete }: RoutePreviewProps) {
    const { t } = useTranslation();
    const {user} = useUserStore();
    const isOwner = user?._id === userId;
    return (
        <RootBox onClick={onClick}>
            <ImageContainer>
                <Box
                    component="img"
                    src={firstTripImage}
                    alt={title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent)',
                    }}
                />

                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1, zIndex: 5 }}>
                    {(onEdit && isOwner) && (
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}
                        >
                            <Edit size={16} />
                        </IconButton>
                    )}
                    {(onDelete && isOwner) && (
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}
                        >
                            <Trash2 size={16} />
                        </IconButton>
                    )}
                </Box>

                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 3, color: 'white' }}>
                    <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
                        {title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255, 255, 255, 0.9)' }}>
                        <MapPin size={20} />
                        <Typography variant="body1">
                            {t("route.tripsCount", { count: tripCount })}
                        </Typography>
                    </Box>

                {description && <Typography
                        variant="body1"
                        sx={{
                            backgroundColor: 'rgba(128, 128, 128, 0.86)',
                            borderRadius: 2,
                            padding: 1,
                            display: 'inline-block',
                        }}
                    >
                        {description}
                    </Typography>}
                </Box>
            </ImageContainer>

            <BottomBar>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#ea580c' }}>
                    <Typography variant="subtitle1" component="span" fontWeight="medium">
                        {t("route.clickToView")}
                    </Typography>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            '@keyframes bounce': {
                                '0%, 100%': { transform: 'translateY(-25%)' },
                                '50%': { transform: 'translateY(0)' },
                            },
                            animation: 'bounce 1s infinite',
                        }}
                    >
                        <ChevronDown size={20} />
                    </Box>
                </Box>
            </BottomBar>
        </RootBox>
    );
}
