import TripPost from './TripPost';
import { type Trip } from './types';
import { useEffect } from 'react';
import { initializeSocket } from '../../services/socketService';
import { useUserStore } from '../../store/userStore';

interface TripPostWithRealtimeProps {
    trip: Trip;
}

/**
 * Wrapper component that initializes Socket.IO and renders TripPost
 * This ensures Socket.IO is connected before rendering trip posts
 */
export default function TripPostWithRealtime({ trip }: TripPostWithRealtimeProps) {
    const {token } = useUserStore();

    // Initialize Socket.IO connection once
    useEffect(() => {
        if (token) {
            initializeSocket(token);
        }
    }, [token]);

    return <TripPost trip={trip} />;
}
