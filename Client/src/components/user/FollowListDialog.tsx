import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, ListItemText, Avatar, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from 'react-i18next';

type SimpleFollow = { _id?: string; id?: string; firstName?: string; lastName?: string; avatar?: string; email?: string; username?: string;[k: string]: unknown };

interface FollowListDialogProps {
    open: boolean;
    onClose: () => void;
    type: "followers" | "following";
    list: SimpleFollow[];
}

export default function FollowListDialog({ open, onClose, type, list }: FollowListDialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' } }}>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', color: '#111', py: 2 }}>{type === "followers" ? t('profile.followers') : t('profile.following')}</DialogTitle>

            <DialogContent sx={{ pt: 0 }}>
                <List sx={{ py: 0 }}>
                    {list.map((f) => (
                        <ListItem key={f._id || f.id} sx={{ display: 'flex', alignItems: 'center', py: 1, borderRadius: 2, mb: 0.5, '&:hover': { bgcolor: '#fafafa' } }}>
                            <ListItemAvatar>
                                <Avatar src={f.avatar || undefined} alt="" sx={{ width: 42, height: 42, fontSize: '0.9rem', border: '1px solid #f97316' }}>{(f.firstName || f.lastName || "")[0]?.toUpperCase()}</Avatar>
                            </ListItemAvatar>

                            <ListItemText primary={<Link component={RouterLink} to={`/profile/${f._id || f.id}`} underline="none" onClick={onClose} sx={{ fontWeight: 600, color: '#222', fontSize: '0.95rem', '&:hover': { color: '#f97316' } }}>{String(`${f.firstName || ""} ${f.lastName || ""}`.trim() || f.email || f.username || f._id || "")}</Link>} sx={{ m: 0 }} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
}
