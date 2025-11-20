import TripPost from './TripPost';
import { type Trip } from './types';

interface TripPostWithRealtimeProps {
    trip: Trip;
}

/**
 * Wrapper component for TripPost
 * Socket.IO is initialized at the app level in App.tsx
 */
export default function TripPostWithRealtime({ trip }: TripPostWithRealtimeProps) {
    return <TripPost trip={trip} />;
}
