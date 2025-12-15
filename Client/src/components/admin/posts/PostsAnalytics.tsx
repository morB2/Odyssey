import { useEffect, useState } from "react";
import { Box, Paper, Typography, Skeleton } from "@mui/material";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    getTopViewedPosts,
    getTopLikedPosts,
    // getViewsTrend,
    getCategoryDistribution,
    type TopPost,
    type ViewsTrendData,
    type CategoryData,
} from "../../../services/adminStatsService";
import { useTranslation } from 'react-i18next';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF6B9D", "#C084FC", "#34D399"];

export default function PostsAnalytics() {
    const { t } = useTranslation();
    const [topViewed, setTopViewed] = useState<TopPost[]>([]);
    const [topLiked, setTopLiked] = useState<TopPost[]>([]);
    const [viewsTrend, setViewsTrend] = useState<ViewsTrendData[]>([]);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllStats();
    }, []);

    const fetchAllStats = async () => {
        try {
            setLoading(true);
            const [viewed, liked, cats] = await Promise.all([
                getTopViewedPosts(),
                getTopLikedPosts(),
                // getViewsTrend(30),
                getCategoryDistribution(),
            ]);
            setTopViewed(viewed);
            setTopLiked(liked);
            // setViewsTrend(trend);
            setCategories(cats);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "white" }}>
                    {t('postsAnalytics.title')}
                </Typography>

                {/* First Row Skeletons */}
                <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
                    <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }}>
                        <Paper sx={{ p: 3, bgcolor: "#18181B", border: "1px solid #27272A", borderRadius: 2 }}>
                            <Skeleton variant="text" width={200} height={30} sx={{ bgcolor: "#27272A", mb: 2 }} />
                            <Skeleton variant="rectangular" width="100%" height={350} sx={{ bgcolor: "#27272A", borderRadius: 1 }} />
                        </Paper>
                    </Box>
                    <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }}>
                        <Paper sx={{ p: 3, bgcolor: "#18181B", border: "1px solid #27272A", borderRadius: 2 }}>
                            <Skeleton variant="text" width={200} height={30} sx={{ bgcolor: "#27272A", mb: 2 }} />
                            <Skeleton variant="rectangular" width="100%" height={350} sx={{ bgcolor: "#27272A", borderRadius: 1 }} />
                        </Paper>
                    </Box>
                </Box>

                {/* Second Row Skeletons */}
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Box sx={{ flex: "2 1 calc(100% - 12px)", minWidth: "300px" }}>
                        <Paper sx={{ p: 3, bgcolor: "#18181B", border: "1px solid #27272A", borderRadius: 2 }}>
                            <Skeleton variant="text" width={250} height={30} sx={{ bgcolor: "#27272A", mb: 2 }} />
                            <Skeleton variant="rectangular" width="100%" height={350} sx={{ bgcolor: "#27272A", borderRadius: 1 }} />
                        </Paper>
                    </Box>
                    <Box sx={{ flex: "1 1 calc(37% - 12px)", minWidth: "300px" }}>
                        <Paper sx={{ p: 3, bgcolor: "#18181B", border: "1px solid #27272A", borderRadius: 2 }}>
                            <Skeleton variant="text" width={200} height={30} sx={{ bgcolor: "#27272A", mb: 2 }} />
                            <Skeleton variant="rectangular" width="100%" height={350} sx={{ bgcolor: "#27272A", borderRadius: 1 }} />
                        </Paper>
                    </Box>
                </Box>
            </Box>
        );
    }

    // Custom label for pie chart
    const renderCustomLabel = (entry: any) => {
        return `${entry.category} (${entry.count})`;
    };

    // Truncate long titles for better display
    const truncateTitle = (title: string, maxLength: number = 20) => {
        if (title.length <= maxLength) return title;
        return title.substring(0, maxLength) + '...';
    };

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: 1 }}>
                {t('postsAnalytics.title')}
            </Typography>

            {/* First Row - Top Viewed and Top Liked */}
            <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
                {/* Top Viewed Posts */}
                <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }} >
                    <Paper
                        sx={{
                            p: 3,
                            height: "100%",
                            bgcolor: "#18181B",
                            border: "1px solid #27272A",
                            borderRadius: 2,
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: 1 }}>
                            {t('postsAnalytics.topViewedPosts')}
                        </Typography>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={topViewed} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 0 }} style={{ direction: 'ltr' }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                                <XAxis type="number"
                                // stroke="#71717A"
                                />
                                <YAxis
                                    dataKey="_id"
                                    type="category"
                                    width={120}
                                    // stroke="#71717A"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(id) => {
                                        const post = topViewed.find(p => p._id === id);
                                        return post ? truncateTitle(post.title, 20) : id;
                                    }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#18181B',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                    itemStyle={{ color: 'white' }}
                                    labelFormatter={() => ''}
                                    formatter={(value: any, _name: string, props: any) => {
                                        return [
                                            [props.payload.title, '. ', '\nViews: ', value],
                                        ];
                                    }}
                                />
                                <Bar dataKey="views" fill="#0088FE" radius={[0, 8, 8, 0]} activeBar={{ fill: '#0088FE', stroke: 'transparent', strokeWidth: 0 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Box>

                {/* Top Liked Posts */}
                <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }}>
                    <Paper
                        sx={{
                            p: 3,
                            height: "100%",
                            bgcolor: "#18181B",
                            border: "1px solid #27272A",
                            borderRadius: 2,
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            direction: 'ltr'
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: 1 }}>
                            {t('postsAnalytics.topLikedPosts')}
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={topLiked} margin={{ bottom: 0, left: 5, right: 5, top: 5 }} style={{ direction: 'ltr' }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                                <XAxis
                                    dataKey="_id"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    stroke="#71717A"
                                    tick={{ fill: '#A1A1AA', fontSize: 11 }}
                                    tickFormatter={(id) => {
                                        const post = topLiked.find(p => p._id === id);
                                        return post ? truncateTitle(post.title, 15) : id;
                                    }}
                                />
                                <YAxis stroke="#71717A" tick={{ fill: '#A1A1AA' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#18181B',
                                        border: '1px solid #27272A',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                    itemStyle={{ color: 'white' }}
                                    labelFormatter={() => ''}
                                    formatter={(value: any, _name: string, props: any) => {
                                        return [value, props.payload.title];
                                    }}
                                />
                                <Bar dataKey="likes" fill="#FF8042" radius={[8, 8, 0, 0]} activeBar={{ fill: '#FF8042', stroke: 'transparent' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Box>
            </Box>

            {/* Second Row - Views Trend and Category Distribution */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {/* Category Distribution */}
                <Box sx={{ flex: "1 1 calc(37% - 12px)", minWidth: "300px" }}>
                    <Paper
                        sx={{
                            p: 3,
                            height: "100%",
                            bgcolor: "#18181B",
                            border: "1px solid #27272A",
                            borderRadius: 2,
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            direction: 'ltr'

                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: 1 }}>
                            {t('postsAnalytics.categoryDistribution')}
                        </Typography>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={categories}
                                    dataKey="count"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={renderCustomLabel}
                                    labelLine={{ stroke: '#71717A' }}
                                    style={{ direction: 'ltr' }}
                                >
                                    {categories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#18181B',
                                        border: '1px solid #27272A',
                                        borderRadius: '8px',
                                    }}
                                    itemStyle={{ color: 'white' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}
