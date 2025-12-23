import React, { type FC } from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { Calendar, DollarSign, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuickActionsProps {
    onQuickAction: (action: string) => void;
}

const QuickActions: FC<QuickActionsProps> = ({ onQuickAction }: QuickActionsProps) => {
    const { t } = useTranslation();

    return (
        <Box sx={{ px: 3, py: 2, borderTop: '1px solid #f5f5f5', bgcolor: '#fffaf5' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                {t("quick_actions.quick_suggestions_title")}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
                <Chip
                    label={t("quick_actions.quick_beach_label")}
                    icon={<MapPin size={14} />}
                    variant="outlined"
                    onClick={() => onQuickAction(t("quick_actions.quick_beach_action"))}
                    sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }}
                />
                <Chip
                    label={t("quick_actions.quick_adventure_label")}
                    icon={<MapPin size={14} />}
                    variant="outlined"
                    onClick={() => onQuickAction(t("quick_actions.quick_adventure_action"))}
                    sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }}
                />
                <Chip
                    label={t("quick_actions.quick_culture_label")}
                    icon={<MapPin size={14} />}
                    variant="outlined"
                    onClick={() => onQuickAction(t("quick_actions.quick_culture_action"))}
                    sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }}
                />
                <Chip
                    label={t("quick_actions.quick_budget_label")}
                    icon={<DollarSign size={14} />}
                    variant="outlined"
                    onClick={() => onQuickAction(t("quick_actions.quick_budget_action"))}
                    sx={{ borderColor: '#ffccaa', '&:hover': { bgcolor: '#fff2e6' } }}
                />
            </Stack>
        </Box>
    );
}

export default QuickActions;