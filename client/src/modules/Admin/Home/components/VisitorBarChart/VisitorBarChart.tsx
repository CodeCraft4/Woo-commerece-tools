import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Box, FormControl, MenuItem, Select, Typography } from "@mui/material";
import { COLORS } from "../../../../../constant/color";
import { useEffect, useState } from "react";


export default function VisitorMiniChart() {
  const [visitorData, setVisitorData] = useState([]);
  const [loading, setLoading] = useState(true);


  const [filter, setFilter] = useState("weekly");

  useEffect(() => {
    async function loadVisitors() {
      try {
        const res = await fetch(`https://diypersonalisation.com/api/visitors?range=${filter}`);
        // const res = await fetch(`http://localhost:5000/visitors?range=${filter}`);
        const data = await res.json();
        setVisitorData(data);
      } catch (err) {
        console.error("Failed to load GA4 visitors:", err);
      } finally {
        setLoading(false);
      }
    }

    loadVisitors();
  }, [filter]);


  return (
    <Box
      sx={{
        width: { md: '35%', sm: '100%', xs: '100%' },
        height: 200,
        borderRadius: 3,
        boxShadow: 3,
        p: 2,
        background: `linear-gradient(135deg, ${COLORS.black} 0%, ${COLORS.seconday} 100%)`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="body2"
          sx={{ color: "#fff", textAlign: "center", letterSpacing: 0.5 }}
        >
          WEBSITE VISITORS
        </Typography>
        {/* Filter dropdown */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={filter}
              variant="standard"
              label=""
              onChange={(e) => setFilter(e.target.value)}
              sx={{
                color: "#fff",
                ".MuiOutlinedInput-notchedOutline": { borderColor: "#fff" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#fff" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#fff" },
                ".MuiSvgIcon-root": { color: "#fff" },
              }}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="live">Live</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      {loading ? (
        <Typography sx={{ color: "#fff", textAlign: "center" }}>
          Loading analytics...
        </Typography>
      ) : (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={visitorData}
              margin={{ right: 10, left: -15, bottom: 5 }}
            >
              <defs>
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
        </>
      )}
    </Box>
  );
}
