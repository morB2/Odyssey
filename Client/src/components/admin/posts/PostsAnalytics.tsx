import { useEffect, useState, useCallback } from "react";
import { Box, Paper, Typography, Skeleton } from "@mui/material";
import {BarChart,Bar,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,} from "recharts";
import {getTopViewedPosts,getTopLikedPosts,getCategoryDistribution,type TopPost,type CategoryData,} from "../../../services/adminStatsService";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

// Constants
const TITLE_MAX_LENGTH_VERTICAL = 20;
const TITLE_MAX_LENGTH_HORIZONTAL = 15;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF6B9D", "#C084FC", "#34D399"];

const PAPER_STYLE = {p: 3,height: "100%",backgroundColor: "#18181B",border: "1px solid #27272A",borderRadius: 2,boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",};

const TOOLTIP_CONTENT_STYLE = {backgroundColor: '#18181B',border: '1px solid #27272A',borderRadius: '8px',color: 'white'};

const TOOLTIP_ITEM_STYLE = { color: 'white' };

export default function PostsAnalytics() {
    const { t } = useTranslation();
    const [topViewed, setTopViewed] = useState<TopPost[]>([]);
    const [topLiked, setTopLiked] = useState<TopPost[]>([]);
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
                getCategoryDistribution(),
            ]);
            setTopViewed(viewed);
            setTopLiked(liked);
            setCategories(cats);
        } catch (error) {
            console.error("Error fetching analytics:", error);
            toast.error(t('postsAnalytics.errorLoading') || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    // Memoized helper functions
    const truncateTitle = useCallback((title: string, maxLength: number = TITLE_MAX_LENGTH_VERTICAL): string => {
        if (title.length <= maxLength) return title;
        return title.substring(0, maxLength) + '...';
    }, []);

    const renderCustomLabel = useCallback((props: any): string => {
        const { category, count } = props;
        return `${category} (${count})`;
    }, []);

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "white" }}>
                {t('postsAnalytics.title')}
            </Typography>

            {/* First Row Skeletons */}
            <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
                <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }}>
                    <Paper sx={PAPER_STYLE}>
                        <Skeleton variant="text" width={200} height={30} sx={{ bgcolor: "#27272A", mb: 2 }} />
                        <Skeleton variant="rectangular" width="100%" height={400} sx={{ bgcolor: "#27272A", borderRadius: 1 }} />
                    </Paper>
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }}>
                    <Paper sx={PAPER_STYLE}>
                        <Skeleton variant="text" width={200} height={30} sx={{ bgcolor: "#27272A", mb: 2 }} />
                        <Skeleton variant="rectangular" width="100%" height={400} sx={{ bgcolor: "#27272A", borderRadius: 1 }} />
                    </Paper>
                </Box>
            </Box>

            {/* Second Row Skeleton */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box sx={{ flex: "1 1 calc(37% - 12px)", minWidth: "300px" }}>
                    <Paper sx={PAPER_STYLE}>
                        <Skeleton variant="text" width={250} height={30} sx={{ bgcolor: "#27272A", mb: 2 }} />
                        <Skeleton variant="rectangular" width="100%" height={400} sx={{ bgcolor: "#27272A", borderRadius: 1 }} />
                    </Paper>
                </Box>
            </Box>
        </Box>
    );

    // Empty state component
    const EmptyState = ({ message }: { message: string }) => (
        <Box sx={{ textAlign: 'center', py: 4, color: '#71717A' }}>
            <Typography>{message}</Typography>
        </Box>
    );

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: 1 }}>
                {t('postsAnalytics.title')}
            </Typography>

            {/* First Row - Top Viewed and Top Liked */}
            <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
                {/* Top Viewed Posts */}
                <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }}>
                    <Paper sx={PAPER_STYLE}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: 1 }}>
                            {t('postsAnalytics.topViewedPosts')}
                        </Typography>
                        {topViewed.length === 0 ? (
                            <EmptyState message={t('postsAnalytics.noData') || 'No data available'} />
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={topViewed} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 0 }} style={{ direction: 'ltr' }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                                    <XAxis type="number" stroke="#71717A" tick={{ fill: '#A1A1AA' }} />
                                    <YAxis dataKey="_id" type="category" width={120} stroke="#71717A" tick={{ fontSize: 12, fill: '#A1A1AA' }}
                                        tickFormatter={(id: string) => {
                                            const post = topViewed.find(p => p._id === id);
                                            return post ? truncateTitle(post.title, TITLE_MAX_LENGTH_VERTICAL) : id;
                                        }}
                                    />
                                    <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelFormatter={() => ''}
                                        formatter={(value: number, _name: string, props: any) => {
                                            const post = props.payload as TopPost;
                                            return [`${post.title}: ${value} views`];
                                        }}
                                    />
                                    <Bar dataKey="views" fill="#0088FE" radius={[0, 8, 8, 0]} activeBar={{ fill: '#0088FE', stroke: 'transparent', strokeWidth: 0 }} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Box>

                {/* Top Liked Posts */}
                <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }}>
                    <Paper sx={PAPER_STYLE}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: 1 }}>
                            {t('postsAnalytics.topLikedPosts')}
                        </Typography>
                        {topLiked.length === 0 ? (
                            <EmptyState message={t('postsAnalytics.noData') || 'No data available'} />
                        ) : (
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={topLiked} margin={{ bottom: -20, left: 5, right: 5, top: 5 }} style={{ direction: 'ltr' }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                                    <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} stroke="#71717A" tick={{ fill: '#A1A1AA', fontSize: 11 }}
                                        tickFormatter={(id: string) => {
                                            const post = topLiked.find(p => p._id === id);
                                            return post ? truncateTitle(post.title, TITLE_MAX_LENGTH_HORIZONTAL) : id;
                                        }}
                                    />
                                    <YAxis stroke="#71717A" tick={{ fill: '#A1A1AA' }} />
                                    <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelFormatter={() => ''}
                                        formatter={(value: number, _name: string, props: any) => {
                                            const post = props.payload as TopPost;
                                            return [`${post.title}: ${value} likes`];
                                        }}
                                    />
                                    <Bar dataKey="likes" fill="#FF8042" radius={[8, 8, 0, 0]} activeBar={{ fill: '#FF8042', stroke: 'transparent' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Box>
            </Box>

            {/* Second Row - Category Distribution */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box sx={{ flex: "1 1 calc(37% - 12px)", minWidth: "300px" }}>
                    <Paper sx={PAPER_STYLE}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: 1 }}>
                            {t('postsAnalytics.categoryDistribution')}
                        </Typography>
                        {categories.length === 0 ? (
                            <EmptyState message={t('postsAnalytics.noData') || 'No data available'} />
                        ) : (
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie data={categories} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={renderCustomLabel} labelLine={{ stroke: '#71717A' }} style={{ direction: 'ltr' }}>
                                        {categories.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={TOOLTIP_CONTENT_STYLE}
                                        itemStyle={TOOLTIP_ITEM_STYLE}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}
