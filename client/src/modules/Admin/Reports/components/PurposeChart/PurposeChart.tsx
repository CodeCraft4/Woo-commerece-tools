import { Box, Typography } from "@mui/material";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const salesGoal = [
    { name: "Achieved", value: 65 },
    { name: "Remaining", value: 35 },
];

const conversionRate = [
    { name: "Converted", value: 75 },
    { name: "Not Converted", value: 25 },
];

const avgOrderData = [
    { name: "4am", value: 20 },
    { name: "8am", value: 40 },
    { name: "12pm", value: 25 },
    { name: "4pm", value: 35 },
    { name: "8pm", value: 70 },
    { name: "Jun 12", value: 30 },
];

const COLORS = {
    yellow: "#FFC107",
    green: "#00C49F",
    gray: "#E5E7EB",
    blue: "#007BFF",
};

const PurposeChart = () => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "stretch",
                width: "100%",
                gap: 2,
                flexWrap: "wrap",
                mt: 3
            }}
        >
            {/* Sales Goal */}
            <Box
                sx={{
                    bgcolor: "#fff",
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    p: 3,
                    width: { xs: "100%", md: "20%" },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Sales Goal
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <ResponsiveContainer width="50%" height={120}>
                        <PieChart>
                            <Pie
                                data={salesGoal}
                                dataKey="value"
                                innerRadius={40}
                                outerRadius={55}
                                startAngle={90}
                                endAngle={-270}
                                animationDuration={1000}
                            >
                                <Cell key="Achieved" fill={COLORS.yellow} />
                                <Cell key="Remaining" fill={COLORS.gray} />
                            </Pie>
                            <text
                                x="50%"
                                y="50%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontWeight: 600, fontSize: "16px" }}
                            >
                                65%
                            </text>
                        </PieChart>
                    </ResponsiveContainer>

                    <Box>
                        <Typography>
                            Sold for: <b>$15,000</b>
                        </Typography>
                        <Typography>
                            Month goal: <b>$20,000</b>
                        </Typography>
                        <Typography>
                            Left: <b>$5,000</b>
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Conversion Rate */}
            <Box
                sx={{
                    bgcolor: "#fff",
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    p: 3,
                    width: { xs: "100%", md: "20%" },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Conversion Rate
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <ResponsiveContainer width="50%" height={120}>
                        <PieChart>
                            <Pie
                                data={conversionRate}
                                dataKey="value"
                                innerRadius={40}
                                outerRadius={55}
                                startAngle={90}
                                endAngle={-270}
                                animationDuration={1000}
                            >
                                <Cell key="Converted" fill={COLORS.green} />
                                <Cell key="Not Converted" fill={COLORS.gray} />
                            </Pie>
                            <text
                                x="50%"
                                y="50%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontWeight: 600, fontSize: "16px" }}
                            >
                                75%
                            </text>
                        </PieChart>
                    </ResponsiveContainer>

                    <Box>
                        <Typography>
                            Cart: <b>35%</b>
                        </Typography>
                        <Typography>
                            Checkout: <b>29%</b>
                        </Typography>
                        <Typography>
                            Purchase: <b>25%</b>
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Average Order Value */}
            <Box
                sx={{
                    bgcolor: "#fff",
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    p: 3,
                    width: { xs: "100%", md: "55%" },
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Header */}
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Average Order Value
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="body2">
                        This Month <b>$48.90</b>
                    </Typography>
                    <Typography variant="body2">
                        Previous Month <b>$48.90</b>
                    </Typography>
                </Box>

                {/* Chart */}
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                        data={avgOrderData}
                        margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray} vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: COLORS.blue }}
                            dy={6}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: COLORS.green }}
                            domain={[0, 80]}
                            ticks={[0, 20, 40, 60, 80]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #eee",
                                borderRadius: 10,
                                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                            }}
                            cursor={{ stroke: "#E0E0E0", strokeWidth: 1 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={COLORS.blue}
                            strokeWidth={3}
                            dot={{ r: 0 }} // hides all small dots
                            activeDot={{
                                r: 5,
                                fill: COLORS.blue,
                                stroke: "#fff",
                                strokeWidth: 2,
                            }}
                            animationDuration={1000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
};

export default PurposeChart;
