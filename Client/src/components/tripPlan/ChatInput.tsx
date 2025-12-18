import React, { type Dispatch, type FC, type SetStateAction } from 'react';
import { Box, Stack, TextField, Button, Typography } from '@mui/material';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
    inputMessage: string;
    setInputMessage: Dispatch<SetStateAction<string>>;
    handleSendMessage: (text?: string) => Promise<void>;
    isTyping: boolean;
}

const ChatInput = ({
    inputMessage,
    setInputMessage,
    handleSendMessage,
    isTyping,
}: ChatInputProps) => {

    const { t } = useTranslation();

    // Extracted the key press handler
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // Only send if not currently typing/waiting for response
            if (inputMessage.trim() && !isTyping) {
                handleSendMessage();
            }
        }
    };

    return (
        <Box sx={{ p: 3, borderTop: '1px solid #f5f5f5' }}>
            <Stack direction="row" spacing={2}>
                <TextField
                    fullWidth
                    placeholder={t("chat_input.placeholder")}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    size="small"
                />
                <Button
                    variant="contained"
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isTyping}
                    sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a25' } }}
                >
                    <Send size={18} />
                </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {t("chat_input.hint")}
            </Typography>
        </Box>
    );
}

export default ChatInput;