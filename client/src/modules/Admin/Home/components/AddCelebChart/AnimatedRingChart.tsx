import { useEffect, useState } from "react";
import { Box, Typography, Avatar } from "@mui/material";

export type AnimatedRingChartProps = {
  percentage: number;
  label: string;
  color?: string;
  icon?: string;
  bgcolor?: string;
};

const AnimatedRingChart = ({
  percentage,
  label,
  color = "#FF9800",
  icon,
  bgcolor = "#FFF3E0",
}: AnimatedRingChartProps) => {
  const [strokeDashoffset, setStrokeDashoffset] = useState(100);
  const strokeWidth = 10;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  const progress = 100 - percentage;
  const offset = circumference * (progress / 100);

  useEffect(() => {
    const timer = setTimeout(() => setStrokeDashoffset(offset), 100);
    return () => clearTimeout(timer);
  }, [offset]);

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Box
        position="relative"
        width={67}
        height={67}
        borderRadius="50%"
        sx={{ backgroundColor: bgcolor }}
      >
        {/* SVG Animated Ring */}
        <Box
          component="svg"
          viewBox="0 0 100 100"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transform: "rotate(-90deg)",
          }}
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{
              transition: "stroke-dashoffset 2s ease-out",
              strokeDashoffset,
            }}
          />
        </Box>

        {/* Inner icon circle */}
        <Avatar
          src={icon}
          alt="chart-icon"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 34,
            height: 34,
            backgroundColor: "#fff",
            boxShadow: "0 0 6px rgba(0,0,0,0.1)",
          }}
        />
      </Box>

      {/* Text Section */}
      <Box>
        <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
          +{percentage}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

export default AnimatedRingChart;
