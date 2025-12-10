import { useEffect, useState } from "react";
import { Box, Paper, Typography, Skeleton } from "@mui/material";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { getTopActiveUsers, type TopActiveUser } from "../../services/adminStatsService";

const WEIGHTS = {
    posts: 3,
    views: 0.1,
    likes: 1,
    comments: 2,
    replies: 1,
};

const STACK_COLORS = {
    posts: "#FF6B35",     
    views: "#1a9f02ff",     
    likes: "#F72585",
    comments: "#7209B7",  
    replies: "#3A86FF",   
};

export default function UsersAnalytics() {
    const [topActiveUsers, setTopActiveUsers] = useState<TopActiveUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredSegment, setHoveredSegment] = useState<any>(null); // State for the hovered segment data

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const users = await getTopActiveUsers();
            setTopActiveUsers(users);
        } catch (error) {
            console.error("Error fetching user analytics:", error);
        } finally { setLoading(false); }
    };

    if (loading) {
        return (
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: "white" }}>Users Analytics Dashboard</Typography>
                <Paper sx={{ p: 3, bgcolor: "#18181B", border: "1px solid #27272A", borderRadius: 2 }}>
                    <Skeleton variant="text" width={250} height={30} sx={{ bgcolor: "#27272A", mb: 2 }} />
                    <Skeleton variant="rectangular" width="100%" height={400} sx={{ bgcolor: "#27272A", borderRadius: 1 }} />
                </Paper>
            </Box>
        );
    }

    if (topActiveUsers.length === 0) {
        return <Typography textAlign="center" color="#71717A" sx={{ mt: 4 }}>No active users data available for last month</Typography>;
    }

    const chartData = topActiveUsers.map(user => {
        // Values rounded for the chart's display (weighted_X)
        const weightedPosts = Math.round(user.postsCount * WEIGHTS.posts);
        const weightedViews = Math.round(user.totalViews * WEIGHTS.views);
        const weightedLikes = Math.round(user.totalLikes * WEIGHTS.likes);
        const weightedComments = Math.round(user.totalComments * WEIGHTS.comments);
        const weightedReplies = Math.round(user.totalReplies * WEIGHTS.replies);

        return {
            name: `${user.firstName} ${user.lastName}`,
            weightedPosts, weightedViews, weightedLikes, weightedComments, weightedReplies,
            // Raw (Original) data
            rawViews: user.totalViews,
            rawPosts: user.postsCount,
            rawLikes: user.totalLikes,
            rawComments: user.totalComments,
            rawReplies: user.totalReplies,
            // Precise (Unrounded) weighted data for accurate tooltip calculation display
            preciseWeightedViews: user.totalViews * WEIGHTS.views,
            preciseWeightedLikes: user.totalLikes * WEIGHTS.likes,
            preciseWeightedComments: user.totalComments * WEIGHTS.comments,
            preciseWeightedReplies: user.totalReplies * WEIGHTS.replies,
            preciseWeightedPosts: user.postsCount * WEIGHTS.posts,
            activityScore: weightedPosts + weightedViews + weightedLikes + weightedComments + weightedReplies
        };
    });

    const CustomTooltip = ({ active, label }: any) => {
        if (!active || !hoveredSegment) return null;

        const seg = hoveredSegment;
        const data = seg.payload;
        const segmentName = seg.name;

        // Map for Raw Values
        const rawValueMap: any = {
            Posts: data.rawPosts,
            Replies: data.rawReplies,
            Comments: data.rawComments,
            Likes: data.rawLikes,
            Views: data.rawViews,
        };

        // Map for Precise Weighted Values
        const preciseValueMap: any = {
            Posts: data.preciseWeightedPosts,
            Replies: data.preciseWeightedReplies,
            Comments: data.preciseWeightedComments,
            Likes: data.preciseWeightedLikes,
            Views: data.preciseWeightedViews,
        };

        const rawValue = rawValueMap[segmentName] || 0;
        const preciseWeightedValue = preciseValueMap[segmentName] || 0;
        const weight = WEIGHTS[segmentName.toLowerCase() as keyof typeof WEIGHTS];

        return (
            <Paper sx={{
                p: 1.5,
                bgcolor: '#18181B',
                border: '1px solid #27272A',
                borderRadius: 2,
                color: 'white',
                minWidth: '180px'
            }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    {label}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: seg.fill, borderRadius: '2px' }} />
                    <Typography sx={{ fontWeight: 600, color: seg.fill }} >{segmentName} (x{weight})</Typography>
                </Box>

                <Typography sx={{ color: '#A1A1AA', ml: 2.5 }}>
                    Raw Value: {rawValue.toLocaleString()}
                </Typography>

                <Typography sx={{ color: '#A1A1AA', ml: 2.5 }}>
                    Weighted: {preciseWeightedValue.toLocaleString()}
                </Typography>

                <Typography variant="caption" sx={{ color: '#71717A', display: 'block', mt: 1, borderTop: '1px solid #27272A', pt: 1 }}>
                    Total Score: {data.activityScore.toLocaleString()}
                </Typography>
            </Paper>
        );
    };


    // Helper function to create Bar components with event handlers
    const renderBar = (dataKey: string, name: string, fill: string, radius: number[] = [0, 0, 0, 0]) => (
        <Bar
            dataKey={dataKey}
            stackId="stack"
            fill={fill}
            name={name}
            barSize={50}
            radius={radius}
            onMouseMove={(data) => setHoveredSegment({ ...data, name })} // Pass the 'name' explicitly
            onMouseLeave={() => setHoveredSegment(null)}
        />
    );


    return (
        <Box sx={{ mb: 4, position: 'relative' }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: "white" }}>Users Analytics Dashboard</Typography>

            <Paper sx={{ p: 3, bgcolor: "#18181B", border: "1px solid #27272A", borderRadius: 2, position: 'relative' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "white" }}>Top Active Users Breakdown</Typography>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={chartData}
                        margin={{ bottom: 50, left: 5, right: 5, top: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} stroke="#71717A" tick={{ fill: '#A1A1AA', fontSize: 12 }} />
                        <YAxis stroke="#71717A" tick={{ fill: '#A1A1AA' }} label={{ value: 'Weighted Score', angle: -90, position: 'insideLeft', fill: '#A1A1AA' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Legend wrapperStyle={{ paddingTop: 10 }} />
                        
                        {renderBar("weightedViews", "Views", STACK_COLORS.views)}
                        {renderBar("weightedLikes", "Likes", STACK_COLORS.likes)}
                        {renderBar("weightedComments", "Comments", STACK_COLORS.comments)}
                        {renderBar("weightedReplies", "Replies", STACK_COLORS.replies)}
                        {renderBar("weightedPosts", "Posts", STACK_COLORS.posts, [8, 8, 0, 0])}

                    </BarChart>
                </ResponsiveContainer>
            </Paper>
        </Box>
    );
}