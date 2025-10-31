// src/components/analytics/VisitorMiniChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Box, Typography } from "@mui/material";
import { COLORS } from "../../../../../constant/color";

const visitorData = [
  { day: "Sun", visitors: 0 },
  { day: "Mon", visitors: 100 },
  { day: "Tue", visitors: 300 },
  { day: "Wed", visitors: 500 },
  { day: "Thu", visitors: 310 },
  { day: "Fri", visitors: 1150 },
  { day: "Sat", visitors: 350 },
  { day: "Sun", visitors: 800 },
];

export default function VisitorMiniChart() {
  return (
    <Box
      sx={{
        width: 350,
        height: 160,
        borderRadius: 3,
        boxShadow: 3,
        p: 2,
        background: `linear-gradient(135deg, ${COLORS.black} 0%, ${COLORS.seconday} 100%)`,
      }}
    >
      <Typography
        variant="body2"
        sx={{ mb: 1, color: "#fff", textAlign: "center", letterSpacing: 0.5 }}
      >
        WEBSITE VISITORS
      </Typography>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={visitorData}
          margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
        >
          <defs>
            {/* Smooth gradient line */}
            <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff00c8" />
              <stop offset="50%" stopColor="#b400ff" />
              <stop offset="100%" stopColor="#00e5ff" />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="day" stroke="#dbdbdbff" tick={{ fontSize: 10 }} />
          <YAxis stroke="#e9e9e9ff" tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e1e1e",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Line
            type="monotone"
            dataKey="visitors"
            stroke="url(#lineColor)"
            strokeWidth={2.5}
            dot={{ r: 3, stroke: "#ffffffff", strokeWidth: 1 }}
            activeDot={{ r: 5 }}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
