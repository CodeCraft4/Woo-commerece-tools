import { AreaChart, Area, XAxis, ResponsiveContainer } from "recharts";
import { Box, Typography } from "@mui/material";
import { COLORS } from "../../../../../constant/color";

// --- Mock Data ---
const productData = [
  { name: "M", value: 1500 },
  { name: "T", value: 3000 },
  { name: "W", value: 5000 },
  { name: "Th", value: 3500 },
  { name: "F", value: 4500 },
  { name: "S", value: 6500 },
  { name: "Su", value: 5500 },
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

// --- Total Product Chart (Pink/Red Gradient Card) ---
const TotalProductChart = () => {
  return (
    <Box
      sx={{
        flex: "1 1 300px",
        maxWidth: { md: 250, sm: 300, xs: "100%" },
        minWidth: 300,
        mb: { md: 0, sm: 0, xs: 1 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          p: 3,
          color: "white",
          height: { md: 160, sm: 200, xs: 180 },
          boxShadow: 8,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.seconday} 100%)`,
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
            data={productData}
            colorId="colorProduct"
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
            TOTAL PRODUCTS
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
              20,149
            </Typography>
            <Typography
              variant="body2"
              fontWeight="semibold"
              sx={{ opacity: 0.8, color: COLORS.white }}
            >
              +2% LAST WEEK
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TotalProductChart;
