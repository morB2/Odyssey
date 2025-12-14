import type { Comment } from '../components/social/types';

/**
 * Adapts API comments to UI Comment format
 * @param apiComments - Raw comments from API
 * @param t - Optional translation function for localized strings
 * @returns Adapted comments for UI
 */
export function adaptCommentsForUI(apiComments: any[], t?: (key: string) => string): Comment[] {
    return apiComments.map((c) => {
        const date = new Date(c.timestamp);
        const time = date.toLocaleString([], {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        // Safety checks for user data with optional translation
        const firstName = c.user?.firstName || (t ? t('tripPost.unknown') : 'Unknown');
        const lastName = c.user?.lastName || (t ? t('tripPost.user') : 'User');

        return {
            id: c.id || c._id,
            userId: c.userId,
            user: {
                name: `${firstName} ${lastName}`,
                username: `@${firstName.toLowerCase()}${lastName.toLowerCase()}`,
                avatar: c.user?.avatar || "/default-avatar.png"
            },
            text: c.text,
            timestamp: time,
            reactionsAggregated: c.reactionsAggregated || {},
            replies: c.replies ? adaptCommentsForUI(c.replies, t) : [],
        };
    });
}
