import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
}

interface ChatContextType {
    activeChatUser: User | null;
    isChatOpen: boolean;
    openChat: (user: User) => void;
    closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const openChat = (user: User) => {
        setActiveChatUser(user);
        setIsChatOpen(true);
    };

    const closeChat = () => {
        setIsChatOpen(false);
        setActiveChatUser(null);
    };

    return (
        <ChatContext.Provider value={{ activeChatUser, isChatOpen, openChat, closeChat }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
