import { useEffect, useState } from "react";
import { Box, Paper, Typography, Skeleton } from "@mui/material";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import {
    getTopReportedPosts,
    getTopReportedUsers,
    getTopReporters,
    getReportReasonDistribution,
    getReportsTrend,
    type TopReportedPost,
    type TopReportedUser,
    type TopReporter,
    type ReportReasonData,
    type ReportsTrendData
} from "../../services/adminStatsService";
import { useTranslation } from 'react-i18next';

// Color palette matching admin theme
const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9"];

export default function ReportsAnalytics() {
    const { t } = useTranslation();
    const [topReportedPosts, setTopReportedPosts] = useState<TopReportedPost[]>([]);
    const [topReportedUsers, setTopReportedUsers] = useState<TopReportedUser[]>([]);
    const [topReporters, setTopReporters] = useState<TopReporter[]>([]);
    const [reasonDistribution, setReasonDistribution] = useState<ReportReasonData[]>([]);
    const [reportsTrend, setReportsTrend] = useState<ReportsTrendData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [posts, reported, reporters, reasons, trend] = await Promise.all([
                getTopReportedPosts(),
                getTopReportedUsers(),
                getTopReporters(),
                getReportReasonDistribution(),
                getReportsTrend(30)
            ]);
            setTopReportedPosts(posts);
            setTopReportedUsers(reported);
            setTopReporters(reporters);
            setReasonDistribution(reasons);
            setReportsTrend(trend);
        } catch (error) {
            console.error("Error fetching report analytics:", error);
        } finally { setLoading(false); }
    };

    if (loading) {
        return (
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "white" }}>
                    {t('reportsAnalytics.title')}
                </Typography>

                {/* Top Reported Posts Skeleton */}
                <Box sx={{ mb: 3 }}>
                    <Paper sx={{ p: 3, bgcolor: "#18181B", borderRadius: 2 }}>
                        <Skeleton variant="text" width={300} height={35} sx={{ bgcolor: "#27272A", mb: 2 }} />
                        <Skeleton variant="rectangular" width="100%" height={400} sx={{ bgcolor: "#27272A", borderRadius: 1 }} />
                    </Paper>
                </Box>

                {/* First Row Skeletons */}
                <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
                    <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }}>
                        <Paper sx={{ p: 3, bgcolor: "#18181B", border: "1px solid #27272A", borderRadius: 2 }}>
                            <Skeleton variant="text" width={250} height={30} sx={{ bgcolor: "#27272A", mb: 2 }} />
                            <Skeleton variant="rectangular" width="100%" height={350} sx={{ bgcolor: "#27272A", borderRadius: 1 }} />
                        </Paper>
                    </Box>
                    <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }}>
                        <Paper sx={{ p: 3, bgcolor: "#18181B", border: "1px solid #27272A", borderRadius: 2 }}>
                            <Skeleton variant="text" width={250} height={30} sx={{ bgcolor: "#27272A", mb: 2 }} />
                            <Skeleton variant="rectangular" width="100%" height={350} sx={{ bgcolor: "#27272A", borderRadius: 1 }} />
                        </Paper>
                    </Box>
                </Box>

                {/* Second Row Skeletons */}
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Box sx={{ flex: "1 1 calc(60% - 12px)", minWidth: "300px" }}>
                        <Paper sx={{ p: 3, bgcolor: "#18181B", border: "1px solid #27272A", borderRadius: 2 }}>
                            <Skeleton variant="text" width={250} height={30} sx={{ bgcolor: "#27272A", mb: 2 }} />
                            <Skeleton variant="rectangular" width="100%" height={350} sx={{ bgcolor: "#27272A", borderRadius: 1 }} />
                        </Paper>
                    </Box>
                    <Box sx={{ flex: "1 1 calc(40% - 12px)", minWidth: "300px" }}>
                        <Paper sx={{ p: 3, bgcolor: "#18181B", border: "1px solid #27272A", borderRadius: 2 }}>
                            <Skeleton variant="text" width={200} height={30} sx={{ bgcolor: "#27272A", mb: 2 }} />
                            <Skeleton variant="rectangular" width="100%" height={350} sx={{ bgcolor: "#27272A", borderRadius: 1 }} />
                        </Paper>
                    </Box>
                </Box>
            </Box>
        );
    }

    if (topReportedPosts.length === 0 && topReportedUsers.length === 0 && topReporters.length === 0 && reasonDistribution.length === 0 && reportsTrend.length === 0) {
        return <Typography textAlign="center" color="#71717A" sx={{ mt: 4 }}>{t('reportsAnalytics.noData')}</Typography>;
    }

    // Prepare data for top reported posts chart
    const reportedPostsData = topReportedPosts.map(post => ({
        title: post.title,
        reportCount: post.reportCount,
        author: post.author,
        views: post.views,
        likes: post.likes
    }));

    // Prepare data for charts
    const reportedUsersData = topReportedUsers.map(user => ({
        name: `${user.firstName} ${user.lastName}`,
        reportCount: user.reportCount,
        email: user.email
    }));

    const reportersData = topReporters.map(user => ({
        name: `${user.firstName} ${user.lastName}`,
        reportCount: user.reportCount,
        email: user.email
    }));

    // Custom label for pie chart
    const renderCustomLabel = (entry: any) => {
        return `${entry.reason} (${entry.count})`;
    };

    // Truncate long names
    const truncateName = (name: string, maxLength: number = 15) => {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength) + '...';
    };

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "white" }}>
                {t('reportsAnalytics.title')}
            </Typography>

            {/* Top Reported Posts - PROMINENT CHART */}
            <Box sx={{ mb: 4 }}>
                <Paper sx={{ p: 3, bgcolor: "#18181B", borderRadius: 2, boxShadow: "0 8px 16px -4px rgb(239 68 68 / 0.3)", direction: 'ltr' }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: 1 }}>
                        {t('reportsAnalytics.topReportedPosts')}
                    </Typography>
                    {reportedPostsData.length === 0 ? (
                        <Typography textAlign="center" color="#71717A" sx={{ py: 8 }}>{t('reportsAnalytics.noReportedPostsData')}</Typography>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={reportedPostsData} margin={{ left: 5, right: 5, top: 5 }} style={{ direction: 'ltr' }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                                <XAxis
                                    dataKey="title"
                                    angle={-45}
                                    textAnchor="end"
                                    height={120}
                                    stroke="#71717A"
                                    tick={{ fill: '#A1A1AA', fontSize: 15 }}
                                    tickFormatter={(title) => truncateName(title, 20)}
                                />
                                <YAxis stroke="#71717A" tick={{ fill: '#A1A1AA' }} label={{ value: t('reportsAnalytics.reportCount'), angle: -90, position: 'insideLeft', fill: '#A1A1AA' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181B', borderRadius: '8px', color: 'white', padding: '12px' }}
                                    labelStyle={{ color: '#ef4444', fontWeight: 700, marginBottom: '8px' }}
                                    formatter={(value: any, name: string, props: any) => {
                                        const payload = props.payload;
                                        return [
                                            <Box key="tooltip" sx={{ minWidth: 200 }}>
                                                <Typography sx={{ fontSize: '0.875rem', color: '#A1A1AA' }}>Author: <span style={{ color: 'white' }}>{payload.author}</span></Typography>
                                                <Typography sx={{ fontSize: '0.875rem', color: '#A1A1AA' }}>Reports: <span style={{ color: '#ef4444', fontWeight: 600 }}>{value}</span></Typography>
                                                <Typography sx={{ fontSize: '0.875rem', color: '#A1A1AA' }}>Views: <span style={{ color: 'white' }}>{payload.views?.toLocaleString()}</span></Typography>
                                                <Typography sx={{ fontSize: '0.875rem', color: '#A1A1AA' }}>Likes: <span style={{ color: 'white' }}>{payload.likes}</span></Typography>
                                            </Box>
                                        ];
                                    }}
                                />
                                <Bar dataKey="reportCount" fill="#ef4444" radius={[8, 8, 0, 0]} activeBar={{ fill: '#dc2626', stroke: 'transparent' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Paper>
            </Box>

            {/* First Row - Top Reported Users and Top Reporters */}
            <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
                {/* Top Reported Users */}
                <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }}>
                    <Paper sx={{ p: 3, height: "100%", bgcolor: "#18181B", border: "1px solid #27272A", borderRadius: 2, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", direction: 'ltr' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "white" }}>
                            {t('reportsAnalytics.topReportedUsers')}
                        </Typography>
                        {reportedUsersData.length === 0 ? (
                            <Typography textAlign="center" color="#71717A" sx={{ py: 8 }}>{t('reportsAnalytics.noDataAvailable')}</Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={reportedUsersData} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 0 }} style={{ direction: 'ltr' }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                                    <XAxis type="number" stroke="#71717A" tick={{ fill: '#A1A1AA' }} />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={120}
                                        stroke="#71717A"
                                        tick={{ fill: '#A1A1AA', fontSize: 12 }}
                                        tickFormatter={(name) => truncateName(name, 15)}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '8px', color: 'white' }}
                                        itemStyle={{ color: 'white' }}
                                        formatter={(value: any) => [value, 'Reports']}
                                    />
                                    <Bar dataKey="reportCount" fill="#ef4444" radius={[0, 8, 8, 0]} activeBar={{ fill: '#ef4444', stroke: 'transparent' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Box>

                {/* Top Reporters */}
                <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }}>
                    <Paper sx={{ p: 3, height: "100%", bgcolor: "#18181B", border: "1px solid #27272A", borderRadius: 2, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", direction: 'ltr' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "white" }}>
                            {t('reportsAnalytics.topReporters')}
                        </Typography>
                        {reportersData.length === 0 ? (
                            <Typography textAlign="center" color="#71717A" sx={{ py: 8 }}>{t('reportsAnalytics.noDataAvailable')}</Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={reportersData} margin={{ bottom: 0, left: 5, right: 5, top: 5 }} style={{ direction: 'ltr' }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                        stroke="#71717A"
                                        tick={{ fill: '#A1A1AA', fontSize: 11 }}
                                        tickFormatter={(name) => truncateName(name, 12)}
                                    />
                                    <YAxis stroke="#71717A" tick={{ fill: '#A1A1AA' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '8px', color: 'white' }}
                                        itemStyle={{ color: 'white' }}
                                        formatter={(value: any) => [value, 'Reports']}
                                    />
                                    <Bar dataKey="reportCount" fill="#f97316" radius={[8, 8, 0, 0]} activeBar={{ fill: '#f97316', stroke: 'transparent' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Box>
            </Box>

            {/* Second Row - Reports Trend and Reason Distribution */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {/* Reports Trend */}
                <Box sx={{ flex: "1 1 calc(100% - 12px)", minWidth: "300px" }}>
                    <Paper sx={{ p: 3, height: "100%", bgcolor: "#18181B", border: "1px solid #27272A", borderRadius: 2, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", direction: 'ltr' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "white" }}>
                            {t('reportsAnalytics.reportsTrend')}
                        </Typography>
                        {reportsTrend.length === 0 ? (
                            <Typography textAlign="center" color="#71717A" sx={{ py: 8 }}>{t('reportsAnalytics.noDataAvailable')}</Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={reportsTrend} margin={{ bottom: 35, left: 5, right: 5, top: 5 }} style={{ direction: 'ltr' }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                                    <XAxis
                                        dataKey="date"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        stroke="#71717A"
                                        tick={{ fill: '#A1A1AA', fontSize: 10 }}
                                    />
                                    <YAxis stroke="#71717A" tick={{ fill: '#A1A1AA' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '8px', color: 'white' }}
                                        itemStyle={{ color: 'white' }}
                                    />
                                    <Legend wrapperStyle={{ color: 'white' }} iconType="line" />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#ea580c"
                                        strokeWidth={3}
                                        name="Reports"
                                        dot={{ fill: '#ea580c', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Box>

                {/* Report Reason Distribution */}
                <Box sx={{ flex: "1 1 calc(40% - 12px)", minWidth: "300px" }}>
                    <Paper sx={{ p: 3, height: "100%", bgcolor: "#18181B", border: "1px solid #27272A", borderRadius: 2, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", direction: 'ltr' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "white" }}>
                            {t('reportsAnalytics.reasonDistribution')}
                        </Typography>
                        {reasonDistribution.length === 0 ? (
                            <Typography textAlign="center" color="#71717A" sx={{ py: 8 }}>{t('reportsAnalytics.noDataAvailable')}</Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={reasonDistribution as any}
                                        dataKey="count"
                                        nameKey="reason"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label={renderCustomLabel}
                                        labelLine={{ stroke: '#71717A' }}
                                        style={{ direction: 'ltr' }}
                                    >
                                        {reasonDistribution.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '8px' }}
                                        itemStyle={{ color: 'white' }}
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
