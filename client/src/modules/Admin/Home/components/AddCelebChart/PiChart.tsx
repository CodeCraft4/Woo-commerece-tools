import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Box, Typography } from "@mui/material";

const PiChart = () => {
  const data = [
    { name: "Purple", value: 20 },
    { name: "Blue", value: 25 },
    { name: "Pink", value: 18 },
  ];
  const total = data.reduce((sum, v) => sum + v.value, 0);
  const colors = ["url(#gradPurple)", "url(#gradBlue)", "url(#gradPink)"];

  return (
    <Box
      sx={{
        position: "relative",
        width: 250,
        height: 250,
        borderRadius: "50%",
        background:
          "radial-gradient(60% 60% at 30% 20%, rgba(255,255,255,0.96), rgba(255,255,255,0.88) 30%, rgba(241,245,255,0.96) 60%), linear-gradient(135deg,#FAF8FF 0%, #EEF2FF 60%)",
        boxShadow: "0 20px 45px rgba(15,23,42,0.08)",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="gradPurple" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="gradBlue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="gradPink" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>
          </defs>

          {/* Outer background */}
          <Pie
            data={[{ name: "Track", value: 100 }]}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={92}
            outerRadius={104}
          >
            <Cell fill="#f0effb" />
          </Pie>

          {/* Gradient segments */}
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={117}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            animationDuration={1200}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center content */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 117,
          height: 117,
          borderRadius: "50%",
          background: "linear-gradient(180deg,#FFFFFF,#F9FAFB)",
          boxShadow:
            "0 16px 36px rgba(2,6,23,0.06), inset 0 6px 18px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 800,
            background: "linear-gradient(90deg,#6D28D9 0%,#2563EB 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {total}
        </Typography>
        <Typography variant="subtitle2" color="#2563EB" fontWeight={700}>
          Total
        </Typography>
      </Box>
    </Box>
  );
};

export default PiChart;
