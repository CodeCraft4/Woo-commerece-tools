import {
    Box,
    Typography,
    Select,
    MenuItem,
} from "@mui/material";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const data = [
    { name: "Dec", returning: 530, new: 100 },
    { name: "Nov", returning: 420, new: 140 },
    { name: "Oct", returning: 410, new: 250 },
    { name: "Sep", returning: 430, new: 190 },
    { name: "Aug", returning: 420, new: 120 },
    { name: "Jul", returning: 400, new: 180 },
    { name: "Jun", returning: 350, new: 260 },
    { name: "May", returning: 460, new: 200 },
    { name: "Apr", returning: 430, new: 270 },
    { name: "Mar", returning: 340, new: 150 },
    { name: "Feb", returning: 380, new: 260 },
    { name: "Jan", returning: 450, new: 320 },
];

const UsersChart = () => {
    return (
        <Box
            sx={{
                bgcolor: "#eeeeee96",
                borderRadius: 3,
                p: 3,
                width: "100%",
                height: 420,
                boxShadow:9
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Customer Growth
                </Typography>

                <Select
                    size="small"
                    defaultValue="12"
                    sx={{
                        fontSize: 14,
                        bgcolor: "#fff",
                        borderRadius: 2,
                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    }}
                >
                    <MenuItem value="6">Last 6 Months</MenuItem>
                    <MenuItem value="12">Last 12 Months</MenuItem>
                </Select>
            </Box>

            {/* Chart */}
            <ResponsiveContainer width="100%" height="90%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#555", fontSize: 12, dy: 8 }}
                        interval={0}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#555", fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.03)" }}
                        contentStyle={{
                            borderRadius: 10,
                            backgroundColor: "#fff",
                            border: "1px solid #eee",
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="left"
                        iconType="circle"
                        iconSize={10}
                        wrapperStyle={{ top: -5, fontWeight: 500 }}
                    />
                    <Bar
                        dataKey="returning"
                        name="Returning customers"
                        fill="#d8e0edff"
                        barSize={18}
                    />
                    <Bar
                        dataKey="new"
                        name="New customers"
                        fill="#c66beaff"
                        barSize={18}
                        radius={[10, 10, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default UsersChart;
