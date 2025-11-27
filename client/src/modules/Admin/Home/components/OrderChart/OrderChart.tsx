import { AreaChart, Area, XAxis, ResponsiveContainer } from "recharts";
import { Box, Typography } from "@mui/material";
import { COLORS } from "../../../../../constant/color";
import { useEffect, useState } from "react";
import { fetchOrderCount } from "../../../../../source/source";

const orderData = [
  { name: "M", value: 200 },
  { name: "T", value: 800 },
  { name: "W", value: 1000 },
  { name: "Th", value: 2500 },
  { name: "F", value: 2000 },
  { name: "S", value: 3000 },
  { name: "Su", value: 3300 },
];

// --- Chart Helper Component (Recharts logic remains the same) ---
const MinimalGradientAreaChart = ({
  data,
  colorId,
  colorStart,
  colorEnd,
  strokeColor,
}: any) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={colorId} x1="0" y1="0" x2="0" y2="1">
          {/* Defines the gradient fill for the area below the line */}
          <stop offset="0%" stopColor={colorStart} stopOpacity={0.6} />
          <stop offset="100%" stopColor={colorEnd} stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <XAxis
        dataKey="name"
        tickLine={false}
        axisLine={false}
        tick={{ stroke: "rgba(255,255,255,0.3)", fontSize: 10 }}
        // Hide actual text labels as per the original design (only showing subtle vertical ticks)
        tickFormatter={() => ""}
      />
      <Area
        type="monotone" // Creates the smooth curve
        dataKey="value"
        stroke={strokeColor} // The color of the line itself
        strokeWidth={3}
        fill={`url(#${colorId})`} // Apply the gradient fill
        dot={false}
      />
    </AreaChart>
  </ResponsiveContainer>
);

// --- Order Chart (Purple/Violet Gradient Card) ---
const OrderChart = () => {

  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const loadOrders = async () => {
      const count: any = await fetchOrderCount();
      setOrderCount(count);
    };
    loadOrders();
  }, []);

  return (
    <Box sx={{ flex: "1 1 300px", width: '100%' }}>
      <Box
        sx={{
          position: "relative",
          p: 3,
          color: "white",
          height: { md: 200, sm: 200, xs: 180 },
          boxShadow: 8,
          borderRadius: 4,
          mb: { md: 0, sm: 0, xs: 2 },
          background: `linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.primary} 100%)`,
          overflow: "hidden",
        }}
      >
        {/* The minimal chart positioned absolutely behind the text/data */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.7,
          }}
        >
          <MinimalGradientAreaChart
            data={orderData}
            colorId="colorOrder"
            colorStart="#ffffff"
            colorEnd="#ffffff"
            strokeColor="#ffffff"
          />
        </Box>

        {/* Data Content (relative Z-index) */}
        <Box sx={{ position: "relative", zIndex: 10 }}>
          <Typography
            variant="body1"
            fontWeight="medium"
            letterSpacing={1.5}
            sx={{ opacity: 0.9 }}
          >
            TOTAL ORDERS
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              width: "auto",
              mx: "auto",
              flexDirection: "column",
              mt: 3,
              color: COLORS.black,
            }}
          >
            <Typography
              variant="h2"
              fontWeight="bold"
              sx={{ my: 1, fontSize: "2rem" }}
            >
              0{orderCount.toLocaleString()}
            </Typography>
            <Typography
              variant="body2"
              fontWeight="semibold"
              sx={{ opacity: 0.8, color: COLORS.white }}
            >
              ALL TIMES ORDERS
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OrderChart;
